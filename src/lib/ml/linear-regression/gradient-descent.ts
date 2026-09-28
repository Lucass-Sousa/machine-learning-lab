import type { Point2D } from "@/lib/ml/types";
import type { LinearParameters } from "@/lib/ml/linear-regression/types";
import { predictLinear } from "@/lib/ml/linear-regression/predict";

export type GradientDescentOptions = {
  learningRate: number;
  iterations: number;
  initial?: LinearParameters;
};

export type GradientDescentFrame = LinearParameters & {
  iteration: number;
  mse: number;
  diverged: boolean;
};

export type GradientDescentResult = {
  parameters: LinearParameters;
  history: GradientDescentFrame[];
  diverged: boolean;
};

function mseFor(points: Point2D[], parameters: LinearParameters): number {
  if (points.length === 0) return 0;
  let total = 0;
  for (const point of points) {
    const error = predictLinear(point.x, parameters) - point.y;
    total += error ** 2;
  }
  return total / points.length;
}

/**
 * Batch gradient descent on MSE for y = θ₀ + θ₁x.
 * Returns full history so the UI can animate real iterates (not faked paths).
 */
export function runGradientDescent(
  points: Point2D[],
  options: GradientDescentOptions,
): GradientDescentResult {
  if (points.length < 2) {
    throw new Error("Gradient descent requires at least 2 points.");
  }

  const { learningRate, iterations } = options;
  let theta0 = options.initial?.intercept ?? 0;
  let theta1 = options.initial?.slope ?? 0;
  const history: GradientDescentFrame[] = [];
  let diverged = false;
  const n = points.length;

  for (let iteration = 0; iteration <= iterations; iteration += 1) {
    const parameters = { intercept: theta0, slope: theta1 };
    const mse = mseFor(points, parameters);
    const frameDiverged = !Number.isFinite(mse) || mse > 1e20;

    history.push({
      ...parameters,
      iteration,
      mse: frameDiverged ? Number.POSITIVE_INFINITY : mse,
      diverged: frameDiverged,
    });

    if (frameDiverged) {
      diverged = true;
      break;
    }

    if (iteration === iterations) break;

    let grad0 = 0;
    let grad1 = 0;

    for (const point of points) {
      const error = predictLinear(point.x, parameters) - point.y;
      grad0 += error;
      grad1 += error * point.x;
    }

    grad0 = (2 / n) * grad0;
    grad1 = (2 / n) * grad1;

    theta0 -= learningRate * grad0;
    theta1 -= learningRate * grad1;

    if (!Number.isFinite(theta0) || !Number.isFinite(theta1)) {
      diverged = true;
      history.push({
        intercept: theta0,
        slope: theta1,
        iteration: iteration + 1,
        mse: Number.POSITIVE_INFINITY,
        diverged: true,
      });
      break;
    }
  }

  const last = history[history.length - 1]!;
  return {
    parameters: { intercept: last.intercept, slope: last.slope },
    history,
    diverged,
  };
}
