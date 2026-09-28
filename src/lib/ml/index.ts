export type {
  ExperimentState,
  FitResult,
  MetricName,
  MetricValue,
  ModelKind,
  ModelParameters,
  Point2D,
} from "./types";

export type {
  LinearFitResult,
  LinearParameters,
  Residual,
} from "./linear-regression/types";

export {
  computeResiduals,
  createTrainingFrames,
  evaluateLinearModel,
  fitLinearRegression,
  meanAbsoluteError,
  meanSquaredError,
  predictLinear,
} from "./linear-regression";

export const ML_MODULE_STATUS = "linear-regression" as const;
