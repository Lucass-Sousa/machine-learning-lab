"use client";

import { useCallback, useMemo, useState } from "react";

import {
  getBinaryClassificationRows,
  getClassificationDatasetInfo,
  getMulticlassClassificationRows,
  type BinaryClassificationRow,
  type MulticlassClassificationRow,
} from "@/lib/data/classification/observations";
import {
  BINARY_TARGET,
  MULTICLASS_TARGET,
} from "@/lib/data/classification/schema";
import {
  CLASSIFICATION_TRAIL_STEPS,
  type ClassificationStepId,
} from "@/lib/learning/classification/steps";
import {
  decisionBoundaryLine2D,
  fitLogisticRegression,
  predictClass,
  predictProbability,
  type LogisticModel,
  type RegularizationKind,
} from "@/lib/ml/classification/logistic-regression";
import {
  accuracyFromPredictions,
  binaryAccuracy,
  binaryPrecision,
  binaryRecall,
  confusionBinary,
} from "@/lib/ml/classification/metrics";
import {
  fitSoftmaxRegression,
  predictSoftmaxClass,
  type SoftmaxModel,
} from "@/lib/ml/classification/softmax";
import { shuffleIndices } from "@/lib/ml/split";

const VIZ_SAMPLE = 420;
const TRAIN_RATIO = 0.8;
const SEED = 42;

function subsample<T>(rows: T[], size: number, seed: number): T[] {
  const indices = shuffleIndices(rows.length, seed);
  return indices.slice(0, Math.min(size, rows.length)).map((i) => rows[i]!);
}

function splitRows<T>(rows: T[], trainRatio: number, seed: number) {
  const indices = shuffleIndices(rows.length, seed);
  const trainSize = Math.max(
    2,
    Math.min(rows.length - 1, Math.floor(rows.length * trainRatio)),
  );
  const trainIndices = indices.slice(0, trainSize);
  const testIndices = indices.slice(trainSize);
  return {
    train: trainIndices.map((i) => rows[i]!),
    test: testIndices.map((i) => rows[i]!),
    trainIndices,
    testIndices,
  };
}

export function useClassificationTrail() {
  const datasetInfo = useMemo(() => getClassificationDatasetInfo(), []);

  const binaryAll = useMemo(
    () => subsample(getBinaryClassificationRows(), VIZ_SAMPLE, SEED),
    [],
  );
  const multiclassAll = useMemo(
    () => subsample(getMulticlassClassificationRows(), VIZ_SAMPLE, SEED + 7),
    [],
  );

  const binarySplit = useMemo(
    () => splitRows(binaryAll, TRAIN_RATIO, SEED + 1),
    [binaryAll],
  );
  const multiclassSplit = useMemo(
    () => splitRows(multiclassAll, TRAIN_RATIO, SEED + 2),
    [multiclassAll],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [C, setC] = useState(1);
  const [regularization, setRegularization] =
    useState<RegularizationKind>("l2");
  const [model, setModel] = useState<LogisticModel | null>(null);
  const [softmaxModel, setSoftmaxModel] = useState<SoftmaxModel | null>(null);
  const [trained, setTrained] = useState(false);
  const [tested, setTested] = useState(false);
  const [selectedSoftmaxIndex, setSelectedSoftmaxIndex] = useState(0);
  const [demoZ, setDemoZ] = useState(0);
  const [challengeThreshold, setChallengeThreshold] = useState(0.5);
  const [challengeTested, setChallengeTested] = useState(false);

  const step = CLASSIFICATION_TRAIL_STEPS[stepIndex]!;

  const goTo = useCallback((index: number) => {
    setStepIndex(
      Math.max(0, Math.min(CLASSIFICATION_TRAIL_STEPS.length - 1, index)),
    );
  }, []);

  const next = useCallback(() => {
    setStepIndex((value) =>
      Math.min(CLASSIFICATION_TRAIL_STEPS.length - 1, value + 1),
    );
  }, []);

  const back = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
  }, []);

  const trainExamples = useMemo(
    () =>
      binarySplit.train.map((row) => ({
        features: [row.x0, row.x1],
        label: row.label,
      })),
    [binarySplit.train],
  );

  const trainModel = useCallback(() => {
    const fitted = fitLogisticRegression(trainExamples, {
      C,
      regularization,
      epochs: 140,
      learningRate: 0.4,
    });
    setModel(fitted);
    setTrained(true);
    setTested(false);
  }, [trainExamples, C, regularization]);

  const trainSoftmax = useCallback(() => {
    const examples = multiclassSplit.train.map((row) => ({
      features: [row.x0, row.x1],
      label: row.label,
    }));
    const fitted = fitSoftmaxRegression(
      examples,
      [...MULTICLASS_TARGET.classNames],
      { C: 1, epochs: 160, learningRate: 0.35 },
    );
    setSoftmaxModel(fitted);
  }, [multiclassSplit.train]);

  const revealTest = useCallback(() => {
    setTested(true);
  }, []);

  const boundary = useMemo(() => {
    if (!model) return null;
    const xs = binaryAll.map((r) => r.x0);
    const x0Min = Math.min(...xs);
    const x0Max = Math.max(...xs);
    return decisionBoundaryLine2D(model, threshold, [x0Min, x0Max]);
  }, [model, threshold, binaryAll]);

  const challengeBoundary = useMemo(() => {
    if (!model) return null;
    const xs = binaryAll.map((r) => r.x0);
    return decisionBoundaryLine2D(model, challengeThreshold, [
      Math.min(...xs),
      Math.max(...xs),
    ]);
  }, [model, challengeThreshold, binaryAll]);

  const trainPredictions = useMemo(() => {
    if (!model) return null;
    return binarySplit.train.map((row) => {
      const p = predictProbability(model, [row.x0, row.x1]);
      const pred = predictClass(model, [row.x0, row.x1], threshold);
      return { row, p, pred, correct: pred === row.label };
    });
  }, [model, binarySplit.train, threshold]);

  const testPredictions = useMemo(() => {
    if (!model || !tested) return null;
    return binarySplit.test.map((row) => {
      const p = predictProbability(model, [row.x0, row.x1]);
      const pred = predictClass(model, [row.x0, row.x1], threshold);
      return { row, p, pred, correct: pred === row.label };
    });
  }, [model, tested, binarySplit.test, threshold]);

  const trainMetrics = useMemo(() => {
    if (!trainPredictions) return null;
    const yTrue = trainPredictions.map((r) => r.row.label);
    const yPred = trainPredictions.map((r) => r.pred);
    const counts = confusionBinary(yTrue, yPred);
    return {
      accuracy: binaryAccuracy(counts),
      precision: binaryPrecision(counts),
      recall: binaryRecall(counts),
      counts,
    };
  }, [trainPredictions]);

  const testMetrics = useMemo(() => {
    if (!testPredictions) return null;
    const yTrue = testPredictions.map((r) => r.row.label);
    const yPred = testPredictions.map((r) => r.pred);
    const counts = confusionBinary(yTrue, yPred);
    return {
      accuracy: binaryAccuracy(counts),
      precision: binaryPrecision(counts),
      recall: binaryRecall(counts),
      counts,
    };
  }, [testPredictions]);

  const challengeTestPredictions = useMemo(() => {
    if (!model || !challengeTested) return null;
    return binarySplit.test.map((row) => {
      const p = predictProbability(model, [row.x0, row.x1]);
      const pred = predictClass(model, [row.x0, row.x1], challengeThreshold);
      return { row, p, pred, correct: pred === row.label };
    });
  }, [model, challengeTested, binarySplit.test, challengeThreshold]);

  const challengeAccuracy = useMemo(() => {
    if (!challengeTestPredictions) return null;
    return accuracyFromPredictions(
      challengeTestPredictions.map((r) => r.row.label),
      challengeTestPredictions.map((r) => r.pred),
    );
  }, [challengeTestPredictions]);

  const selectedSoftmaxRow: MulticlassClassificationRow | null =
    multiclassAll[selectedSoftmaxIndex] ?? null;

  const selectedSoftmaxResult = useMemo(() => {
    if (!softmaxModel || !selectedSoftmaxRow) return null;
    return predictSoftmaxClass(softmaxModel, [
      selectedSoftmaxRow.x0,
      selectedSoftmaxRow.x1,
    ]);
  }, [softmaxModel, selectedSoftmaxRow]);

  const binaryPlotPoints = useMemo(() => {
    const trainPts = binarySplit.train.map((row) => ({
      id: row.id,
      x0: row.x0,
      x1: row.x1,
      label: row.label,
      group: "train" as const,
    }));
    const testPts = binarySplit.test.map((row) => ({
      id: row.id,
      x0: row.x0,
      x1: row.x1,
      label: row.label,
      group: "test" as const,
      correct:
        tested && model
          ? predictClass(model, [row.x0, row.x1], threshold) === row.label
          : null,
    }));
    return [...trainPts, ...testPts];
  }, [binarySplit, tested, model, threshold]);

  const multiclassPlotPoints = useMemo(
    () =>
      multiclassAll.map((row) => ({
        id: row.id,
        x0: row.x0,
        x1: row.x1,
        label: row.label,
        group: "all" as const,
      })),
    [multiclassAll],
  );

  return {
    step,
    stepId: step.id as ClassificationStepId,
    stepIndex,
    goTo,
    next,
    back,
    datasetInfo,
    binaryRule: BINARY_TARGET,
    multiclassRule: MULTICLASS_TARGET,
    binaryAll,
    multiclassAll,
    binarySplit,
    multiclassSplit,
    threshold,
    setThreshold,
    C,
    setC,
    regularization,
    setRegularization,
    model,
    trained,
    trainModel,
    tested,
    revealTest,
    boundary,
    trainPredictions,
    testPredictions,
    trainMetrics,
    testMetrics,
    binaryPlotPoints,
    multiclassPlotPoints,
    demoZ,
    setDemoZ,
    softmaxModel,
    trainSoftmax,
    selectedSoftmaxIndex,
    setSelectedSoftmaxIndex,
    selectedSoftmaxRow,
    selectedSoftmaxResult,
    challengeThreshold,
    setChallengeThreshold,
    challengeBoundary,
    challengeTested,
    setChallengeTested,
    challengeTestPredictions,
    challengeAccuracy,
    classNamesBinary: [
      BINARY_TARGET.negativeLabel,
      BINARY_TARGET.positiveLabel,
    ],
    featureLabels: datasetInfo.featureLabels,
  };
}

export type ClassificationTrailState = ReturnType<typeof useClassificationTrail>;

export type { BinaryClassificationRow, MulticlassClassificationRow };
