"use client";

import { useCallback, useMemo, useState } from "react";

import {
  createCustomObservation,
  getBaseObservations,
  getDatasetInfo,
  getVariableDomain,
  getVariableLabel,
  observationsToPoints,
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
  type NumericVariableKey,
  type Observation,
} from "@/lib/data/credit/observations";
import {
  buildNormalization,
  crossValidateLinearRegression,
  evaluateLinearModel,
  fitLinearRegression,
  predictLinear,
  runGradientDescent,
  trainTestSplit,
  zScore,
  type GradientDescentFrame,
  type LinearParameters,
} from "@/lib/ml";
import type { Point2D } from "@/lib/ml/types";
import type { LinearTrailStepId } from "@/lib/learning/linear-regression/steps";
import { LINEAR_TRAIL_STEPS } from "@/lib/learning/linear-regression/steps";

export type TrailState = ReturnType<typeof useLinearRegressionTrail>;

export function useLinearRegressionTrail() {
  const dataset = useMemo(() => getDatasetInfo(), []);
  const [observations, setObservations] = useState<Observation[]>(() =>
    getBaseObservations(),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [xKey, setXKey] = useState<NumericVariableKey>(DEFAULT_X_KEY);
  const [yKey, setYKey] = useState<NumericVariableKey>(DEFAULT_Y_KEY);
  const [explorationChoice, setExplorationChoice] = useState<string | null>(
    null,
  );

  const initialDomain = useMemo(() => {
    const base = getBaseObservations();
    return {
      x: getVariableDomain(base, DEFAULT_X_KEY),
      y: getVariableDomain(base, DEFAULT_Y_KEY),
    };
  }, []);

  const [predictX, setPredictX] = useState(
    () => (initialDomain.x.min + initialDomain.x.max) / 2,
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [trainRatio, setTrainRatio] = useState(0.8);
  const [splitSeed] = useState(42);
  const [revealTest, setRevealTest] = useState(false);
  const [hasTested, setHasTested] = useState(false);
  const [learningRate, setLearningRate] = useState(1e-10);
  const [gdIterations, setGdIterations] = useState(40);
  const [gdFrame, setGdFrame] = useState(0);
  const [useNormalization, setUseNormalization] = useState(false);
  const [method, setMethod] = useState<"normal" | "gd">("normal");
  const [customX, setCustomX] = useState(
    () => (initialDomain.x.min + initialDomain.x.max) / 2,
  );
  const [customY, setCustomY] = useState(
    () => (initialDomain.y.min + initialDomain.y.max) / 2,
  );

  const stepId = LINEAR_TRAIL_STEPS[stepIndex]!.id as LinearTrailStepId;

  const points = useMemo(
    () => observationsToPoints(observations, xKey, yKey),
    [observations, xKey, yKey],
  );

  const normalization = useMemo(
    () =>
      buildNormalization(
        points.map((point) => point.x),
        points.map((point) => point.y),
      ),
    [points],
  );

  const workingPoints = useMemo(() => {
    if (!useNormalization) return points;
    return points.map((point) => ({
      x: zScore(point.x, normalization.x),
      y: zScore(point.y, normalization.y),
    }));
  }, [points, useNormalization, normalization]);

  const split = useMemo(
    () => trainTestSplit(workingPoints, trainRatio, splitSeed),
    [workingPoints, trainRatio, splitSeed],
  );

  const olsTrain = useMemo(() => {
    try {
      return fitLinearRegression(split.train);
    } catch {
      return null;
    }
  }, [split.train]);

  const olsAll = useMemo(() => {
    try {
      return fitLinearRegression(workingPoints);
    } catch {
      return null;
    }
  }, [workingPoints]);

  const gdResult = useMemo(() => {
    try {
      return runGradientDescent(split.train, {
        learningRate,
        iterations: gdIterations,
        initial: { slope: 0, intercept: 0 },
      });
    } catch {
      return null;
    }
  }, [split.train, learningRate, gdIterations]);

  const gdHistory = gdResult?.history ?? [];
  const safeGdFrame = Math.min(gdFrame, Math.max(gdHistory.length - 1, 0));
  const currentGd: GradientDescentFrame | null =
    gdHistory[safeGdFrame] ?? null;

  const activeParameters: LinearParameters | null = useMemo(() => {
    if (method === "gd" && currentGd) {
      return { slope: currentGd.slope, intercept: currentGd.intercept };
    }
    return olsTrain ?? olsAll;
  }, [method, currentGd, olsTrain, olsAll]);

  const displayParameters = activeParameters;

  const trainEval = useMemo(() => {
    if (!displayParameters) return null;
    return evaluateLinearModel(split.train, displayParameters);
  }, [split.train, displayParameters]);

  const testEval = useMemo(() => {
    if (!displayParameters || split.test.length === 0) return null;
    return evaluateLinearModel(split.test, displayParameters);
  }, [split.test, displayParameters]);

  const allEval = useMemo(() => {
    if (!displayParameters) return null;
    return evaluateLinearModel(workingPoints, displayParameters);
  }, [workingPoints, displayParameters]);

  const cvResults = useMemo(() => {
    try {
      return crossValidateLinearRegression(workingPoints, 5, splitSeed);
    } catch {
      return [];
    }
  }, [workingPoints, splitSeed]);

  const scatterPoints = useMemo(() => {
    const testSet = new Set(split.testIndices);
    return workingPoints.map((point, index) => ({
      ...point,
      id: observations[index]?.id ?? `p-${index}`,
      group: testSet.has(index) ? ("test" as const) : ("train" as const),
    }));
  }, [workingPoints, split.testIndices, observations]);

  const xLabel = getVariableLabel(xKey);
  const yLabel = getVariableLabel(yKey);

  const predictedForX = displayParameters
    ? predictLinear(predictXNormalized(), displayParameters)
    : null;

  function predictXNormalized(): number {
    if (!useNormalization) return predictX;
    return zScore(predictX, normalization.x);
  }

  function denormalizeY(value: number): number {
    if (!useNormalization) return value;
    return value * normalization.y.std + normalization.y.mean;
  }

  const goNext = useCallback(() => {
    setStepIndex((current) =>
      Math.min(current + 1, LINEAR_TRAIL_STEPS.length - 1),
    );
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setStepIndex(Math.max(0, Math.min(index, LINEAR_TRAIL_STEPS.length - 1)));
  }, []);

  const setVariables = useCallback(
    (nextX: NumericVariableKey, nextY: NumericVariableKey) => {
      if (nextX === nextY) return;
      setXKey(nextX);
      setYKey(nextY);
      setSelectedIndex(null);
      setRevealTest(false);
      setHasTested(false);
      setGdFrame(0);
      setMethod("normal");

      const xDomain = getVariableDomain(observations, nextX);
      const yDomain = getVariableDomain(observations, nextY);
      setPredictX((xDomain.min + xDomain.max) / 2);
      setCustomX((xDomain.min + xDomain.max) / 2);
      setCustomY((yDomain.min + yDomain.max) / 2);
    },
    [observations],
  );

  const addCustomPoint = useCallback(() => {
    const observation = createCustomObservation(
      xKey,
      yKey,
      customX,
      customY,
      String(Date.now()),
    );
    setObservations((current) => [...current, observation]);
    setRevealTest(false);
    setHasTested(false);
    setGdFrame(0);
  }, [xKey, yKey, customX, customY]);

  const resetObservations = useCallback(() => {
    setObservations(getBaseObservations());
    setGdFrame(0);
    setRevealTest(false);
    setHasTested(false);
  }, []);

  return {
    dataset,
    observations,
    stepIndex,
    stepId,
    xKey,
    yKey,
    xLabel,
    yLabel,
    explorationChoice,
    setExplorationChoice,
    predictX,
    setPredictX,
    selectedIndex,
    setSelectedIndex,
    trainRatio,
    setTrainRatio,
    revealTest,
    setRevealTest,
    hasTested,
    setHasTested,
    learningRate,
    setLearningRate,
    gdIterations,
    setGdIterations,
    gdFrame: safeGdFrame,
    setGdFrame,
    useNormalization,
    setUseNormalization,
    method,
    setMethod,
    customX,
    setCustomX,
    customY,
    setCustomY,
    points: workingPoints as Point2D[],
    rawPoints: points,
    scatterPoints,
    split,
    olsTrain,
    olsAll,
    displayParameters,
    trainEval,
    testEval,
    allEval,
    cvResults,
    gdResult,
    gdHistory,
    currentGd,
    normalization,
    predictedForX,
    denormalizeY,
    predictXNormalized,
    goNext,
    goBack,
    goTo,
    setVariables,
    addCustomPoint,
    resetObservations,
  };
}
