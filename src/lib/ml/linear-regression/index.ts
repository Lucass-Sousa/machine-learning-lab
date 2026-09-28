import type { Point2D } from "@/lib/ml/types";
import type {
  LinearFitResult,
  LinearParameters,
  Residual,
} from "@/lib/ml/linear-regression/types";

/**
 * Ordinary least squares for y = slope * x + intercept.
 */
export function fitLinearRegression(points: Point2D[]): LinearFitResult {
  if (points.length < 2) {
    throw new Error("Linear regression requires at least 2 points.");
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    const dx = point.x - meanX;
    numerator += dx * (point.y - meanY);
    denominator += dx * dx;
  }

  if (denominator === 0) {
    throw new Error("Linear regression requires variation in X.");
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;
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

export function predictLinear(
  x: number,
  parameters: LinearParameters,
): number {
  return parameters.slope * x + parameters.intercept;
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

export function meanAbsoluteError(residuals: Residual[]): number {
  if (residuals.length === 0) return 0;
  const total = residuals.reduce(
    (sum, residual) => sum + Math.abs(residual.error),
    0,
  );
  return total / residuals.length;
}

export function meanSquaredError(residuals: Residual[]): number {
  if (residuals.length === 0) return 0;
  const total = residuals.reduce(
    (sum, residual) => sum + residual.error ** 2,
    0,
  );
  return total / residuals.length;
}

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

/**
 * Pedagogical training path: interpolate from a starting guess toward OLS.
 * Not a real optimizer — used only to visualize "training" convergence.
 */
export function createTrainingFrames(
  start: LinearParameters,
  target: LinearParameters,
  frameCount = 36,
): LinearParameters[] {
  const frames: LinearParameters[] = [];
  const steps = Math.max(frameCount, 2);

  for (let i = 0; i < steps; i += 1) {
    const t = easeOutCubic(i / (steps - 1));
    frames.push({
      slope: lerp(start.slope, target.slope, t),
      intercept: lerp(start.intercept, target.intercept, t),
    });
  }

  return frames;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
