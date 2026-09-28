import { sigmoid } from "@/lib/ml/classification/activations";

export type RegularizationKind = "none" | "l1" | "l2";

export type LogisticFitOptions = {
  learningRate?: number;
  epochs?: number;
  /** Inverse regularization strength (sklearn-style). Smaller C → stronger regularization. */
  C?: number;
  regularization?: RegularizationKind;
  /** Include bias as θ₀. */
  fitIntercept?: boolean;
};

export type LogisticModel = {
  /** θ = [θ₀, θ₁, …] when fitIntercept, else [θ₁, …] */
  theta: number[];
  fitIntercept: boolean;
  C: number;
  regularization: RegularizationKind;
  history: { epoch: number; logLoss: number }[];
  featureMeans: number[];
  featureStds: number[];
};

export type BinaryExample = {
  features: number[];
  label: 0 | 1;
};

function standardizeColumns(X: number[][]): {
  scaled: number[][];
  means: number[];
  stds: number[];
} {
  if (X.length === 0) return { scaled: [], means: [], stds: [] };
  const dims = X[0]!.length;
  const means = Array.from({ length: dims }, (_, j) => {
    const sum = X.reduce((total, row) => total + row[j]!, 0);
    return sum / X.length;
  });
  const stds = Array.from({ length: dims }, (_, j) => {
    const variance =
      X.reduce((total, row) => {
        const delta = row[j]! - means[j]!;
        return total + delta * delta;
      }, 0) / X.length;
    const std = Math.sqrt(variance);
    return std < 1e-12 ? 1 : std;
  });
  const scaled = X.map((row) =>
    row.map((value, j) => (value - means[j]!) / stds[j]!),
  );
  return { scaled, means, stds };
}

function linearScore(theta: number[], features: number[], fitIntercept: boolean): number {
  let z = fitIntercept ? theta[0]! : 0;
  const offset = fitIntercept ? 1 : 0;
  for (let i = 0; i < features.length; i += 1) {
    z += theta[offset + i]! * features[i]!;
  }
  return z;
}

/** Binary cross-entropy / log loss averaged over examples. */
export function binaryLogLoss(
  examples: BinaryExample[],
  theta: number[],
  fitIntercept: boolean,
): number {
  if (examples.length === 0) return 0;
  const eps = 1e-12;
  let total = 0;
  for (const example of examples) {
    const p = Math.min(
      1 - eps,
      Math.max(eps, sigmoid(linearScore(theta, example.features, fitIntercept))),
    );
    total +=
      example.label === 1 ? -Math.log(p) : -Math.log(1 - p);
  }
  return total / examples.length;
}

export function predictProbability(
  model: LogisticModel,
  features: number[],
): number {
  const scaled = features.map(
    (value, i) => (value - model.featureMeans[i]!) / model.featureStds[i]!,
  );
  return sigmoid(linearScore(model.theta, scaled, model.fitIntercept));
}

export function predictClass(
  model: LogisticModel,
  features: number[],
  threshold = 0.5,
): 0 | 1 {
  return predictProbability(model, features) >= threshold ? 1 : 0;
}

/**
 * Fit binary logistic regression with gradient descent.
 * Regularization follows sklearn convention: minimize
 *   (1/2)||w||² + C * Σ log_loss   (L2)
 *   ||w||₁ + C * Σ log_loss        (L1)
 * Bias term is not regularized.
 */
export function fitLogisticRegression(
  examples: BinaryExample[],
  options: LogisticFitOptions = {},
): LogisticModel {
  const learningRate = options.learningRate ?? 0.35;
  const epochs = options.epochs ?? 120;
  const C = options.C ?? 1;
  const regularization = options.regularization ?? "l2";
  const fitIntercept = options.fitIntercept ?? true;

  if (examples.length === 0) {
    return {
      theta: fitIntercept ? [0] : [],
      fitIntercept,
      C,
      regularization,
      history: [],
      featureMeans: [],
      featureStds: [],
    };
  }

  const rawX = examples.map((example) => example.features);
  const { scaled, means, stds } = standardizeColumns(rawX);
  const y = examples.map((example) => example.label);
  const n = examples.length;
  const d = scaled[0]!.length;
  const thetaLen = fitIntercept ? d + 1 : d;
  const theta = Array.from({ length: thetaLen }, () => 0);
  const history: { epoch: number; logLoss: number }[] = [];

  const scaledExamples: BinaryExample[] = scaled.map((features, i) => ({
    features,
    label: y[i]!,
  }));

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const grad = Array.from({ length: thetaLen }, () => 0);

    for (let i = 0; i < n; i += 1) {
      const features = scaled[i]!;
      const p = sigmoid(linearScore(theta, features, fitIntercept));
      const error = p - y[i]!;
      if (fitIntercept) grad[0]! += error;
      for (let j = 0; j < d; j += 1) {
        grad[(fitIntercept ? 1 : 0) + j]! += error * features[j]!;
      }
    }

    // Data term: C * mean(log_loss) → gradient uses C/n
    for (let k = 0; k < thetaLen; k += 1) {
      grad[k]! = (C / n) * grad[k]!;
    }

    // Regularize weights only (not bias)
    const wStart = fitIntercept ? 1 : 0;
    for (let k = wStart; k < thetaLen; k += 1) {
      if (regularization === "l2") {
        grad[k]! += theta[k]!;
      } else if (regularization === "l1") {
        grad[k]! += Math.sign(theta[k]!);
      }
    }

    for (let k = 0; k < thetaLen; k += 1) {
      theta[k]! -= learningRate * grad[k]!;
    }

    if (epoch % 5 === 0 || epoch === epochs - 1) {
      history.push({
        epoch: epoch + 1,
        logLoss: binaryLogLoss(scaledExamples, theta, fitIntercept),
      });
    }
  }

  return {
    theta: [...theta],
    fitIntercept,
    C,
    regularization,
    history,
    featureMeans: means,
    featureStds: stds,
  };
}

/** Decision boundary: θ·x_scaled = logit(threshold). Returns line in original feature space (2D). */
export function decisionBoundaryLine2D(
  model: LogisticModel,
  threshold: number,
  x0Range: [number, number],
): { x0: number; x1: number }[] | null {
  if (model.theta.length < (model.fitIntercept ? 3 : 2)) return null;

  const targetZ = Math.log(
    Math.min(1 - 1e-9, Math.max(1e-9, threshold)) /
      (1 - Math.min(1 - 1e-9, Math.max(1e-9, threshold))),
  );

  const theta0 = model.fitIntercept ? model.theta[0]! : 0;
  const theta1 = model.theta[model.fitIntercept ? 1 : 0]!;
  const theta2 = model.theta[model.fitIntercept ? 2 : 1]!;
  const [m0, m1] = model.featureMeans;
  const [s0, s1] = model.featureStds;
  if (m0 === undefined || m1 === undefined || s0 === undefined || s1 === undefined) {
    return null;
  }

  // θ0 + θ1*(x0-m0)/s0 + θ2*(x1-m1)/s1 = targetZ
  // Solve for x1 in terms of x0
  if (Math.abs(theta2) < 1e-10) {
    // Vertical-ish boundary in x0
    if (Math.abs(theta1) < 1e-10) return null;
    const x0Scaled = (targetZ - theta0) / theta1;
    const x0 = x0Scaled * s0 + m0;
    return [
      { x0, x1: -1e6 },
      { x0, x1: 1e6 },
    ];
  }

  const points: { x0: number; x1: number }[] = [];
  for (const x0 of [x0Range[0], x0Range[1]]) {
    const x0s = (x0 - m0) / s0;
    const x1s = (targetZ - theta0 - theta1 * x0s) / theta2;
    const x1 = x1s * s1 + m1;
    points.push({ x0, x1 });
  }
  return points;
}
