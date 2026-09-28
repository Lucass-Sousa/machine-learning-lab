"use client";

import { useCallback, useMemo, useState } from "react";

import {
  getBaseObservations,
  getDatasetInfo,
  getVariableLabel,
  observationsToPoints,
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
  type NumericVariableKey,
  type Observation,
} from "@/lib/data/credit/observations";
import { POLYNOMIAL_TRAIL_STEPS } from "@/lib/learning/polynomial-regression/steps";
import {
  computeLearningCurve,
  diagnoseGeneralization,
  evaluatePolynomialModel,
  fitLinearRegression,
  fitPolynomialRegression,
  predictPolynomial,
  samplePolynomialCurve,
  trainValTestSplit,
  type PolynomialModel,
} from "@/lib/ml";

export type PolynomialTrailState = ReturnType<typeof usePolynomialRegressionTrail>;

export function usePolynomialRegressionTrail() {
  const dataset = useMemo(() => getDatasetInfo(), []);
  const [observations] = useState<Observation[]>(() => getBaseObservations());
  const [stepIndex, setStepIndex] = useState(0);
  const [xKey, setXKey] = useState<NumericVariableKey>(DEFAULT_X_KEY);
  const [yKey, setYKey] = useState<NumericVariableKey>(DEFAULT_Y_KEY);
  const [degree, setDegree] = useState(2);
  const [trainRatio, setTrainRatio] = useState(0.6);
  const [validationRatio, setValidationRatio] = useState(0.2);
  const [seed] = useState(42);
  const [revealTest, setRevealTest] = useState(false);
  const [hasTested, setHasTested] = useState(false);
  const [challengeDegree, setChallengeDegree] = useState(3);

  const stepId = POLYNOMIAL_TRAIL_STEPS[stepIndex]!.id;

  const points = useMemo(
    () => observationsToPoints(observations, xKey, yKey),
    [observations, xKey, yKey],
  );

  const split = useMemo(
    () => trainValTestSplit(points, trainRatio, validationRatio, seed),
    [points, trainRatio, validationRatio, seed],
  );

  const linearModel = useMemo(() => {
    try {
      return fitLinearRegression(split.train);
    } catch {
      return null;
    }
  }, [split.train]);

  const polyModel = useMemo(() => {
    try {
      return fitPolynomialRegression(split.train, degree);
    } catch {
      return null;
    }
  }, [split.train, degree]);

  const underfitModel = useMemo(() => {
    try {
      return fitPolynomialRegression(split.train, 1);
    } catch {
      return null;
    }
  }, [split.train]);

  const overfitModel = useMemo(() => {
    try {
      return fitPolynomialRegression(split.train, Math.min(15, Math.floor(split.train.length / 4)));
    } catch {
      return null;
    }
  }, [split.train]);

  const challengeModel = useMemo(() => {
    try {
      return fitPolynomialRegression(split.train, challengeDegree);
    } catch {
      return null;
    }
  }, [split.train, challengeDegree]);

  const evaluate = useCallback((model: PolynomialModel | null) => {
    if (!model) {
      return { train: null, validation: null, test: null };
    }
    return {
      train: evaluatePolynomialModel(split.train, model),
      validation: evaluatePolynomialModel(split.validation, model),
      test: evaluatePolynomialModel(split.test, model),
    };
  }, [split]);

  const polyEval = useMemo(() => evaluate(polyModel), [evaluate, polyModel]);
  const underfitEval = useMemo(
    () => evaluate(underfitModel),
    [evaluate, underfitModel],
  );
  const overfitEval = useMemo(
    () => evaluate(overfitModel),
    [evaluate, overfitModel],
  );
  const challengeEval = useMemo(
    () => evaluate(challengeModel),
    [evaluate, challengeModel],
  );

  const curveFor = useCallback((model: PolynomialModel | null) => {
    if (!model) return [];
    return samplePolynomialCurve(model, 160);
  }, []);

  const learningCurve = useMemo(() => {
    if (!polyModel) return [];
    try {
      return computeLearningCurve(split.train, split.validation, degree, 10);
    } catch {
      return [];
    }
  }, [split.train, split.validation, degree, polyModel]);

  const scatterPoints = useMemo(() => {
    const validationSet = new Set(split.validationIndices);
    const testSet = new Set(split.testIndices);
    return points.map((point, index) => ({
      ...point,
      id: observations[index]?.id ?? `p-${index}`,
      group: testSet.has(index)
        ? ("test" as const)
        : validationSet.has(index)
          ? ("all" as const)
          : ("train" as const),
    }));
  }, [points, observations, split.validationIndices, split.testIndices]);

  const trainScatter = useMemo(
    () =>
      scatterPoints.filter(
        (point) => point.group === "train" || point.group === "all",
      ),
    [scatterPoints],
  );

  const diagnosis = useMemo(() => {
    if (!challengeEval.train || !challengeEval.test) return null;
    return diagnoseGeneralization(
      challengeEval.train.mse,
      challengeEval.test.mse,
    );
  }, [challengeEval]);

  const setVariables = useCallback(
    (nextX: NumericVariableKey, nextY: NumericVariableKey) => {
      if (nextX === nextY) return;
      setXKey(nextX);
      setYKey(nextY);
      setRevealTest(false);
      setHasTested(false);
    },
    [],
  );

  const goNext = useCallback(() => {
    setStepIndex((current) =>
      Math.min(current + 1, POLYNOMIAL_TRAIL_STEPS.length - 1),
    );
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setStepIndex(
      Math.max(0, Math.min(index, POLYNOMIAL_TRAIL_STEPS.length - 1)),
    );
  }, []);

  return {
    dataset,
    stepIndex,
    stepId,
    xKey,
    yKey,
    xLabel: getVariableLabel(xKey),
    yLabel: getVariableLabel(yKey),
    degree,
    setDegree,
    trainRatio,
    setTrainRatio,
    validationRatio,
    setValidationRatio,
    revealTest,
    setRevealTest,
    hasTested,
    setHasTested,
    challengeDegree,
    setChallengeDegree,
    points,
    split,
    scatterPoints,
    trainScatter,
    linearModel,
    polyModel,
    underfitModel,
    overfitModel,
    challengeModel,
    polyEval,
    underfitEval,
    overfitEval,
    challengeEval,
    curveFor,
    learningCurve,
    diagnosis,
    predictPolynomial,
    setVariables,
    goNext,
    goBack,
    goTo,
  };
}
