import type { Point2D } from "@/lib/ml/types";
import type { Residual } from "@/lib/ml/linear-regression/types";
import { meanAbsoluteError, meanSquaredError } from "@/lib/ml/metrics";

export type PolynomialModel = {
  degree: number;
  /** θ₀ … θ_d in scaled feature space: ŷ = Σ θ_k · z^k */
  coefficients: number[];
  xMin: number;
  xMax: number;
};

export type PolynomialFitResult = PolynomialModel & {
  trainMae: number;
  trainMse: number;
  residuals: Residual[];
};

/**
 * Maps x into [-1, 1] using training bounds — improves conditioning for high degrees.
 */
export function scaleFeature(x: number, xMin: number, xMax: number): number {
  const mid = (xMin + xMax) / 2;
  const half = (xMax - xMin) / 2 || 1;
  return (x - mid) / half;
}

/**
 * Polynomial feature map: x → [1, z, z², …, z^d] with z scaled.
 */
export function polynomialFeatures(
  x: number,
  degree: number,
  xMin: number,
  xMax: number,
): number[] {
  const z = scaleFeature(x, xMin, xMax);
  const features = [1];
  let power = 1;
  for (let d = 1; d <= degree; d += 1) {
    power *= z;
    features.push(power);
  }
  return features;
}

export function describeFeatures(degree: number): string[] {
  const names = ["1 (intercepto)"];
  for (let d = 1; d <= degree; d += 1) {
    names.push(d === 1 ? "z" : `z^${d}`);
  }
  return names;
}

export function predictPolynomial(x: number, model: PolynomialModel): number {
  const features = polynomialFeatures(x, model.degree, model.xMin, model.xMax);
  let prediction = 0;
  for (let i = 0; i < features.length; i += 1) {
    prediction += (model.coefficients[i] ?? 0) * features[i]!;
  }
  return prediction;
}

export function computePolynomialResiduals(
  points: Point2D[],
  model: PolynomialModel,
): Residual[] {
  return points.map((point) => {
    const predicted = predictPolynomial(point.x, model);
    return {
      x: point.x,
      observed: point.y,
      predicted,
      error: point.y - predicted,
    };
  });
}

export function evaluatePolynomialModel(
  points: Point2D[],
  model: PolynomialModel,
) {
  const residuals = computePolynomialResiduals(points, model);
  return {
    residuals,
    mae: meanAbsoluteError(residuals),
    mse: meanSquaredError(residuals),
  };
}

/**
 * Fit polynomial regression via Normal Equation on expanded features.
 * θ = (ΦᵀΦ)⁻¹ Φᵀy
 */
export function fitPolynomialRegression(
  points: Point2D[],
  degree: number,
): PolynomialFitResult {
  if (points.length < 2) {
    throw new Error("Polynomial regression requires at least 2 points.");
  }
  const safeDegree = Math.max(1, Math.min(degree, points.length - 1, 20));
  const xs = points.map((point) => point.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const phi = points.map((point) =>
    polynomialFeatures(point.x, safeDegree, xMin, xMax),
  );
  const y = points.map((point) => point.y);
  const coefficients = solveNormalEquation(phi, y);

  const model: PolynomialModel = {
    degree: safeDegree,
    coefficients,
    xMin,
    xMax,
  };
  const residuals = computePolynomialResiduals(points, model);

  return {
    ...model,
    residuals,
    trainMae: meanAbsoluteError(residuals),
    trainMse: meanSquaredError(residuals),
  };
}

/**
 * Dense curve samples in original x-space for visualization.
 */
export function samplePolynomialCurve(
  model: PolynomialModel,
  sampleCount = 120,
): Point2D[] {
  const curve: Point2D[] = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / (sampleCount - 1);
    const x = model.xMin + t * (model.xMax - model.xMin);
    curve.push({ x, y: predictPolynomial(x, model) });
  }
  return curve;
}

export type LearningCurvePoint = {
  trainSize: number;
  trainMse: number;
  validationMse: number;
};

/**
 * Learning curve: fit on growing prefixes of the shuffled training set.
 */
export function computeLearningCurve(
  train: Point2D[],
  validation: Point2D[],
  degree: number,
  steps = 12,
): LearningCurvePoint[] {
  if (train.length < 2 || validation.length < 1) return [];

  const minSize = Math.max(degree + 1, 5);
  const sizes: number[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const size = Math.round(minSize + t * (train.length - minSize));
    sizes.push(Math.min(train.length, Math.max(minSize, size)));
  }
  const uniqueSizes = Array.from(new Set(sizes));

  return uniqueSizes.map((trainSize) => {
    const subset = train.slice(0, trainSize);
    const model = fitPolynomialRegression(subset, degree);
    const trainEval = evaluatePolynomialModel(subset, model);
    const valEval = evaluatePolynomialModel(validation, model);
    return {
      trainSize,
      trainMse: trainEval.mse,
      validationMse: valEval.mse,
    };
  });
}

export function formatPolynomialFormula(model: PolynomialModel): string {
  const parts = model.coefficients.map((coef, index) => {
    const value = Number.isFinite(coef) ? coef.toPrecision(3) : "NaN";
    if (index === 0) return value;
    if (index === 1) return `${value}·z`;
    return `${value}·z^${index}`;
  });
  return `ŷ = ${parts.join(" + ")}`;
}

/**
 * Suggestive diagnosis from train vs holdout MSE — never forced.
 */
export function diagnoseGeneralization(
  trainMse: number,
  holdoutMse: number,
): "underfitting" | "overfitting" | "adequate" | "inconclusive" {
  if (!Number.isFinite(trainMse) || !Number.isFinite(holdoutMse)) {
    return "inconclusive";
  }

  const ratio = holdoutMse / Math.max(trainMse, 1e-12);

  // Holdout much worse than train → classic overfit signal.
  if (ratio >= 2.2 && holdoutMse > trainMse) {
    return "overfitting";
  }

  // Both errors high and close — often under-capacity, but scale-dependent.
  if (ratio < 1.25 && trainMse > 0 && holdoutMse > 0) {
    // Without a baseline we cannot assert underfit strongly.
    return "adequate";
  }

  if (ratio >= 1.6 && holdoutMse > trainMse) {
    return "overfitting";
  }

  if (ratio < 1.45) {
    return "adequate";
  }

  return "inconclusive";
}

function solveNormalEquation(phi: number[][], y: number[]): number[] {
  const n = phi.length;
  const p = phi[0]?.length ?? 0;
  if (p === 0) return [];

  // A = ΦᵀΦ , b = Φᵀy
  const A = Array.from({ length: p }, () => Array.from({ length: p }, () => 0));
  const b = Array.from({ length: p }, () => 0);

  for (let i = 0; i < n; i += 1) {
    const row = phi[i]!;
    for (let j = 0; j < p; j += 1) {
      b[j]! += row[j]! * y[i]!;
      for (let k = 0; k < p; k += 1) {
        A[j]![k]! += row[j]! * row[k]!;
      }
    }
  }

  // Tiny diagonal jitter for numerical stability (not learning regularization).
  const jitter = 1e-10;
  for (let j = 0; j < p; j += 1) {
    A[j]![j]! += jitter;
  }

  return gaussianElimination(A, b);
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]!]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(M[row]![col]!) > Math.abs(M[pivot]![col]!)) {
        pivot = row;
      }
    }
    if (Math.abs(M[pivot]![col]!) < 1e-14) {
      continue;
    }
    if (pivot !== col) {
      const tmp = M[col]!;
      M[col] = M[pivot]!;
      M[pivot] = tmp;
    }

    const pivotValue = M[col]![col]!;
    for (let j = col; j <= n; j += 1) {
      M[col]![j]! /= pivotValue;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = M[row]![col]!;
      for (let j = col; j <= n; j += 1) {
        M[row]![j]! -= factor * M[col]![j]!;
      }
    }
  }

  return M.map((row) => row[n]!);
}
