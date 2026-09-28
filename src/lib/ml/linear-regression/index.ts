import type { Point2D } from "@/lib/ml/types";
import { meanAbsoluteError, meanSquaredError } from "@/lib/ml/metrics";
import { fitLinearRegression } from "@/lib/ml/linear-regression/ols";
import { computeResiduals } from "@/lib/ml/linear-regression/ols";
import type { LinearParameters } from "@/lib/ml/linear-regression/types";
import { kFoldIndices, type FoldResult } from "@/lib/ml/split";

export function evaluateLinearModel(
  points: Point2D[],
  parameters: LinearParameters,
) {
  const residuals = computeResiduals(points, parameters);
  return {
    residuals,
    mae: meanAbsoluteError(residuals),
    mse: meanSquaredError(residuals),
  };
}

export function crossValidateLinearRegression(
  points: Point2D[],
  k = 5,
  seed = 42,
): FoldResult[] {
  const folds = kFoldIndices(points.length, k, seed);

  return folds.map((fold, index) => {
    const train = fold.train.map((i) => points[i]!);
    const validation = fold.validation.map((i) => points[i]!);
    const model = fitLinearRegression(train);
    const evaluation = evaluateLinearModel(validation, model);

    return {
      fold: index + 1,
      trainSize: train.length,
      validationSize: validation.length,
      mae: evaluation.mae,
      mse: evaluation.mse,
    };
  });
}

export {
  fitLinearRegression,
  computeResiduals,
} from "@/lib/ml/linear-regression/ols";
export { predictLinear } from "@/lib/ml/linear-regression/predict";
export {
  runGradientDescent,
  type GradientDescentFrame,
  type GradientDescentOptions,
  type GradientDescentResult,
} from "@/lib/ml/linear-regression/gradient-descent";
export type {
  LinearFitResult,
  LinearParameters,
  Residual,
} from "@/lib/ml/linear-regression/types";
