/**
 * Shared Machine Learning types.
 * Algorithms will live alongside these contracts in future iterations.
 */

export type Point2D = {
  x: number;
  y: number;
};

export type ModelKind =
  | "linear-regression"
  | "polynomial-regression";

export type ModelParameters = {
  slope?: number;
  intercept?: number;
  degree?: number;
  coefficients?: number[];
};

export type FitResult = {
  kind: ModelKind;
  parameters: ModelParameters;
  predictions: Point2D[];
};

export type MetricName = "mse" | "rmse" | "mae" | "r2";

export type MetricValue = {
  name: MetricName;
  value: number | null;
  label: string;
};

export type ExperimentState = {
  model: ModelKind;
  parameters: ModelParameters;
  metrics: MetricValue[];
  isReady: boolean;
};
