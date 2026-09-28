export type {
  ExperimentState,
  FitResult,
  MetricName,
  MetricValue,
  ModelKind,
  ModelParameters,
  Point2D,
} from "./types";

export {
  computeResiduals,
  crossValidateLinearRegression,
  evaluateLinearModel,
  fitLinearRegression,
  predictLinear,
  runGradientDescent,
  type GradientDescentFrame,
  type GradientDescentOptions,
  type GradientDescentResult,
  type LinearFitResult,
  type LinearParameters,
  type Residual,
} from "./linear-regression";

export { meanAbsoluteError, meanSquaredError } from "./metrics";

export {
  buildNormalization,
  computeScaleStats,
  inverseZScore,
  zScore,
  type NormalizationTransform,
  type ScaleStats,
} from "./normalize";

export {
  createRng,
  kFoldIndices,
  shuffleIndices,
  trainTestSplit,
  trainValTestSplit,
  type FoldResult,
  type TrainTestSplit,
} from "./split";

export {
  computeLearningCurve,
  computePolynomialResiduals,
  describeFeatures,
  diagnoseGeneralization,
  evaluatePolynomialModel,
  fitPolynomialRegression,
  formatPolynomialFormula,
  polynomialFeatures,
  predictPolynomial,
  samplePolynomialCurve,
  scaleFeature,
  type LearningCurvePoint,
  type PolynomialFitResult,
  type PolynomialModel,
} from "./polynomial-regression";
