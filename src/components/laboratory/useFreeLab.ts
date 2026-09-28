"use client";

import { useCallback, useMemo, useState } from "react";

import {
  BINARY_TARGET,
  DATASET_CATALOG,
  getBinaryClassificationRows,
  getClassificationDatasetInfo,
  type BinaryClassificationRow,
  type DatasetId,
} from "@/lib/data";
import {
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
  getBaseObservations,
  getDatasetInfo,
  getVariableLabel,
  observationsToPoints,
  SELECTABLE_VARIABLES,
  type NumericVariableKey,
} from "@/lib/data/credit/observations";
import {
  evaluateLinearModel,
  evaluatePolynomialModel,
  fitLinearRegression,
  fitPolynomialRegression,
  samplePolynomialCurve,
  trainTestSplit,
  type LinearParameters,
  type PolynomialModel,
} from "@/lib/ml";
import {
  decisionBoundaryLine2D,
  fitLogisticRegression,
  predictClass,
  type LogisticModel,
} from "@/lib/ml/classification/logistic-regression";
import {
  accuracyFromPredictions,
  binaryAccuracy,
  confusionBinary,
} from "@/lib/ml/classification/metrics";
import { shuffleIndices } from "@/lib/ml/split";
import type { Point2D } from "@/lib/ml/types";
import { formatCompact, formatNumber } from "@/lib/learning/linear-regression/format";

export type FreeLabModelKind =
  | "linear-regression"
  | "polynomial-regression"
  | "logistic-regression";

const REGRESSION_SAMPLE = 800;
const CLASSIFICATION_SAMPLE = 500;
const SEED = 21;

function subsamplePoints(points: Point2D[], size: number, seed: number): Point2D[] {
  if (points.length <= size) return points;
  const indices = shuffleIndices(points.length, seed);
  return indices.slice(0, size).map((i) => points[i]!);
}

function subsampleRows<T>(rows: T[], size: number, seed: number): T[] {
  if (rows.length <= size) return rows;
  const indices = shuffleIndices(rows.length, seed);
  return indices.slice(0, size).map((i) => rows[i]!);
}

export function useFreeLab() {
  const [modelKind, setModelKind] = useState<FreeLabModelKind>("linear-regression");
  const [xKey, setXKey] = useState<NumericVariableKey>(DEFAULT_X_KEY);
  const [yKey, setYKey] = useState<NumericVariableKey>(DEFAULT_Y_KEY);
  const [degree, setDegree] = useState(3);
  const [threshold, setThreshold] = useState(0.5);
  const [C, setC] = useState(1);
  const [showTest, setShowTest] = useState(true);
  const [showResiduals, setShowResiduals] = useState(false);

  const isClassification = modelKind === "logistic-regression";
  const datasetId: DatasetId = isClassification
    ? "base-classificacao"
    : "base-credito";

  const creditInfo = useMemo(() => getDatasetInfo(), []);
  const classInfo = useMemo(() => getClassificationDatasetInfo(), []);
  const datasetMeta = DATASET_CATALOG[datasetId];

  const setModel = useCallback((kind: FreeLabModelKind) => {
    setModelKind(kind);
    if (kind === "logistic-regression") {
      setShowResiduals(false);
    }
  }, []);

  const setVariables = useCallback(
    (nextX: NumericVariableKey, nextY: NumericVariableKey) => {
      if (nextX === nextY) return;
      setXKey(nextX);
      setYKey(nextY);
    },
    [],
  );

  const reset = useCallback(() => {
    setModelKind("linear-regression");
    setXKey(DEFAULT_X_KEY);
    setYKey(DEFAULT_Y_KEY);
    setDegree(3);
    setThreshold(0.5);
    setC(1);
    setShowTest(true);
    setShowResiduals(false);
  }, []);

  // —— Regression ——
  const regressionPoints = useMemo(() => {
    if (isClassification) return [] as Point2D[];
    const all = observationsToPoints(getBaseObservations(), xKey, yKey);
    return subsamplePoints(all, REGRESSION_SAMPLE, SEED);
  }, [isClassification, xKey, yKey]);

  const regressionSplit = useMemo(
    () => trainTestSplit(regressionPoints, 0.8, SEED + 1),
    [regressionPoints],
  );

  const linearFit = useMemo(() => {
    if (modelKind !== "linear-regression" || regressionSplit.train.length < 2) {
      return null;
    }
    return fitLinearRegression(regressionSplit.train);
  }, [modelKind, regressionSplit.train]);

  const polynomialFit = useMemo(() => {
    if (
      modelKind !== "polynomial-regression" ||
      regressionSplit.train.length < 2
    ) {
      return null;
    }
    return fitPolynomialRegression(regressionSplit.train, degree);
  }, [modelKind, regressionSplit.train, degree]);

  const linearParameters: LinearParameters | null = linearFit
    ? { slope: linearFit.slope, intercept: linearFit.intercept }
    : null;

  const polynomialModel: PolynomialModel | null = polynomialFit
    ? {
        degree: polynomialFit.degree,
        coefficients: polynomialFit.coefficients,
        xMin: polynomialFit.xMin,
        xMax: polynomialFit.xMax,
      }
    : null;

  const polynomialCurve = useMemo(() => {
    if (!polynomialModel) return null;
    return samplePolynomialCurve(polynomialModel, 120);
  }, [polynomialModel]);

  const regressionMetrics = useMemo(() => {
    if (modelKind === "linear-regression" && linearParameters) {
      const train = evaluateLinearModel(regressionSplit.train, linearParameters);
      const test = evaluateLinearModel(regressionSplit.test, linearParameters);
      return {
        trainMae: train.mae,
        trainMse: train.mse,
        testMae: test.mae,
        testMse: test.mse,
      };
    }
    if (modelKind === "polynomial-regression" && polynomialModel) {
      const train = evaluatePolynomialModel(regressionSplit.train, polynomialModel);
      const test = evaluatePolynomialModel(regressionSplit.test, polynomialModel);
      return {
        trainMae: train.mae,
        trainMse: train.mse,
        testMae: test.mae,
        testMse: test.mse,
      };
    }
    return null;
  }, [
    modelKind,
    linearParameters,
    polynomialModel,
    regressionSplit.train,
    regressionSplit.test,
  ]);

  const scatterPoints = useMemo(() => {
    return [
      ...regressionSplit.train.map((p) => ({ ...p, group: "train" as const })),
      ...regressionSplit.test.map((p) => ({ ...p, group: "test" as const })),
    ];
  }, [regressionSplit]);

  // —— Classification ——
  const binaryRows = useMemo(() => {
    if (!isClassification) return [] as BinaryClassificationRow[];
    return subsampleRows(getBinaryClassificationRows(), CLASSIFICATION_SAMPLE, SEED + 3);
  }, [isClassification]);

  const binarySplit = useMemo(() => {
    if (binaryRows.length === 0) {
      return { train: [] as BinaryClassificationRow[], test: [] as BinaryClassificationRow[] };
    }
    const indices = shuffleIndices(binaryRows.length, SEED + 4);
    const trainSize = Math.max(
      2,
      Math.min(binaryRows.length - 1, Math.floor(binaryRows.length * 0.8)),
    );
    return {
      train: indices.slice(0, trainSize).map((i) => binaryRows[i]!),
      test: indices.slice(trainSize).map((i) => binaryRows[i]!),
    };
  }, [binaryRows]);

  const logisticModel: LogisticModel | null = useMemo(() => {
    if (!isClassification || binarySplit.train.length < 2) return null;
    return fitLogisticRegression(
      binarySplit.train.map((row) => ({
        features: [row.x0, row.x1],
        label: row.label,
      })),
      { C, regularization: "l2", epochs: 120, learningRate: 0.4 },
    );
  }, [isClassification, binarySplit.train, C]);

  const classBoundary = useMemo(() => {
    if (!logisticModel || binaryRows.length === 0) return null;
    const xs = binaryRows.map((r) => r.x0);
    return decisionBoundaryLine2D(logisticModel, threshold, [
      Math.min(...xs),
      Math.max(...xs),
    ]);
  }, [logisticModel, threshold, binaryRows]);

  const classPlotPoints = useMemo(() => {
    if (!logisticModel) {
      return [
        ...binarySplit.train.map((row) => ({
          id: row.id,
          x0: row.x0,
          x1: row.x1,
          label: row.label,
          group: "train" as const,
        })),
        ...binarySplit.test.map((row) => ({
          id: row.id,
          x0: row.x0,
          x1: row.x1,
          label: row.label,
          group: "test" as const,
        })),
      ];
    }
    return [
      ...binarySplit.train.map((row) => ({
        id: row.id,
        x0: row.x0,
        x1: row.x1,
        label: row.label,
        group: "train" as const,
        correct:
          predictClass(logisticModel, [row.x0, row.x1], threshold) === row.label,
      })),
      ...binarySplit.test.map((row) => ({
        id: row.id,
        x0: row.x0,
        x1: row.x1,
        label: row.label,
        group: "test" as const,
        correct:
          predictClass(logisticModel, [row.x0, row.x1], threshold) === row.label,
      })),
    ];
  }, [binarySplit, logisticModel, threshold]);

  const classMetrics = useMemo(() => {
    if (!logisticModel) return null;
    const evalSplit = (rows: BinaryClassificationRow[]) => {
      const yTrue = rows.map((r) => r.label);
      const yPred = rows.map((r) =>
        predictClass(logisticModel, [r.x0, r.x1], threshold),
      );
      const counts = confusionBinary(yTrue, yPred);
      return {
        accuracy: binaryAccuracy(counts),
        counts,
        accuracyAlt: accuracyFromPredictions(yTrue, yPred),
      };
    };
    return {
      train: evalSplit(binarySplit.train),
      test: evalSplit(binarySplit.test),
    };
  }, [logisticModel, binarySplit, threshold]);

  const metricsSummary = useMemo(() => {
    if (isClassification && classMetrics) {
      return [
        {
          label: "Acurácia treino",
          value: `${formatNumber(classMetrics.train.accuracy * 100, 1)}%`,
        },
        {
          label: "Acurácia teste",
          value: `${formatNumber(classMetrics.test.accuracy * 100, 1)}%`,
        },
        {
          label: "C",
          value: formatNumber(C, 2),
        },
        {
          label: "Limiar τ",
          value: formatNumber(threshold, 2),
        },
      ];
    }
    if (regressionMetrics) {
      return [
        {
          label: "MAE treino",
          value: formatCompact(regressionMetrics.trainMae),
        },
        {
          label: "MSE treino",
          value: formatCompact(regressionMetrics.trainMse),
        },
        {
          label: "MAE teste",
          value: formatCompact(regressionMetrics.testMae),
        },
        {
          label: "MSE teste",
          value: formatCompact(regressionMetrics.testMse),
        },
      ];
    }
    return [];
  }, [isClassification, classMetrics, regressionMetrics, C, threshold]);

  return {
    modelKind,
    setModel: setModel,
    isClassification,
    datasetId,
    datasetMeta,
    creditInfo,
    classInfo,
    xKey,
    yKey,
    setVariables,
    selectableVariables: SELECTABLE_VARIABLES,
    getVariableLabel,
    degree,
    setDegree,
    threshold,
    setThreshold,
    C,
    setC,
    showTest,
    setShowTest,
    showResiduals,
    setShowResiduals,
    reset,
    scatterPoints,
    linearParameters,
    polynomialCurve,
    polynomialModel,
    classPlotPoints,
    classBoundary,
    classNames: [BINARY_TARGET.negativeLabel, BINARY_TARGET.positiveLabel],
    featureLabelsBinary: BINARY_TARGET.featureLabels,
    metricsSummary,
    pointCount: isClassification ? binaryRows.length : regressionPoints.length,
    trainCount: isClassification
      ? binarySplit.train.length
      : regressionSplit.train.length,
    testCount: isClassification
      ? binarySplit.test.length
      : regressionSplit.test.length,
  };
}

export type FreeLabState = ReturnType<typeof useFreeLab>;
