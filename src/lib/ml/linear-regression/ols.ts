import type { Point2D } from "@/lib/ml/types";
import type {
  LinearFitResult,
  LinearParameters,
  Residual,
} from "@/lib/ml/linear-regression/types";
import { predictLinear } from "@/lib/ml/linear-regression/predict";

/**
 * Closed-form ordinary least squares / Normal Equation for simple linear regression.
 * θ = (XᵀX)⁻¹ Xᵀy with X = [1, x]
 */
export function fitLinearRegression(points: Point2D[]): LinearFitResult {
  if (points.length < 2) {
    throw new Error("Linear regression requires at least 2 points.");
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXX += point.x * point.x;
    sumXY += point.x * point.y;
  }

  // Normal equation pieces:
  // | n    sumX | | θ0 |   | sumY  |
  // | sumX sumXX| | θ1 | = | sumXY |
  const det = n * sumXX - sumX * sumX;
  if (det === 0) {
    throw new Error("Linear regression requires variation in X.");
  }

  const intercept = (sumY * sumXX - sumX * sumXY) / det;
  const slope = (n * sumXY - sumX * sumY) / det;
  const parameters: LinearParameters = { slope, intercept };
  const residuals = computeResiduals(points, parameters);

  return {
    ...parameters,
    predictions: residuals.map((residual) => ({
      x: residual.x,
      y: residual.predicted,
    })),
    residuals,
  };
}

export function computeResiduals(
  points: Point2D[],
  parameters: LinearParameters,
): Residual[] {
  return points.map((point) => {
    const predicted = predictLinear(point.x, parameters);
    return {
      x: point.x,
      observed: point.y,
      predicted,
      error: point.y - predicted,
    };
  });
}
