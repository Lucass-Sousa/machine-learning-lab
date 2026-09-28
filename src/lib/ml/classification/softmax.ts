import { softmax } from "@/lib/ml/classification/activations";

export type SoftmaxFitOptions = {
  learningRate?: number;
  epochs?: number;
  C?: number;
  fitIntercept?: boolean;
};

export type SoftmaxModel = {
  /** weights[class][featureOrBias] */
  weights: number[][];
  classNames: string[];
  fitIntercept: boolean;
  C: number;
  history: { epoch: number; logLoss: number }[];
  featureMeans: number[];
  featureStds: number[];
};

export type MulticlassExample = {
  features: number[];
  label: number;
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

function scoresFor(
  weights: number[][],
  features: number[],
  fitIntercept: boolean,
): number[] {
  return weights.map((row) => {
    let z = fitIntercept ? row[0]! : 0;
    const offset = fitIntercept ? 1 : 0;
    for (let i = 0; i < features.length; i += 1) {
      z += row[offset + i]! * features[i]!;
    }
    return z;
  });
}

export function multiclassLogLoss(
  examples: MulticlassExample[],
  weights: number[][],
  fitIntercept: boolean,
): number {
  if (examples.length === 0) return 0;
  const eps = 1e-12;
  let total = 0;
  for (const example of examples) {
    const probs = softmax(scoresFor(weights, example.features, fitIntercept));
    const p = Math.min(1 - eps, Math.max(eps, probs[example.label] ?? eps));
    total += -Math.log(p);
  }
  return total / examples.length;
}

export function predictSoftmaxProbs(
  model: SoftmaxModel,
  features: number[],
): number[] {
  const scaled = features.map(
    (value, i) => (value - model.featureMeans[i]!) / model.featureStds[i]!,
  );
  return softmax(scoresFor(model.weights, scaled, model.fitIntercept));
}

export function predictSoftmaxClass(
  model: SoftmaxModel,
  features: number[],
): { classIndex: number; className: string; probs: number[] } {
  const probs = predictSoftmaxProbs(model, features);
  let best = 0;
  for (let i = 1; i < probs.length; i += 1) {
    if (probs[i]! > probs[best]!) best = i;
  }
  return {
    classIndex: best,
    className: model.classNames[best] ?? String(best),
    probs,
  };
}

/** Softmax regression with L2 (sklearn-style C). */
export function fitSoftmaxRegression(
  examples: MulticlassExample[],
  classNames: string[],
  options: SoftmaxFitOptions = {},
): SoftmaxModel {
  const learningRate = options.learningRate ?? 0.35;
  const epochs = options.epochs ?? 140;
  const C = options.C ?? 1;
  const fitIntercept = options.fitIntercept ?? true;
  const k = classNames.length;

  if (examples.length === 0 || k === 0) {
    return {
      weights: [],
      classNames,
      fitIntercept,
      C,
      history: [],
      featureMeans: [],
      featureStds: [],
    };
  }

  const rawX = examples.map((example) => example.features);
  const { scaled, means, stds } = standardizeColumns(rawX);
  const n = examples.length;
  const d = scaled[0]!.length;
  const rowLen = fitIntercept ? d + 1 : d;
  const weights = Array.from({ length: k }, () =>
    Array.from({ length: rowLen }, () => 0),
  );
  const history: { epoch: number; logLoss: number }[] = [];

  const scaledExamples: MulticlassExample[] = scaled.map((features, i) => ({
    features,
    label: examples[i]!.label,
  }));

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const grad = Array.from({ length: k }, () =>
      Array.from({ length: rowLen }, () => 0),
    );

    for (let i = 0; i < n; i += 1) {
      const features = scaled[i]!;
      const label = examples[i]!.label;
      const probs = softmax(scoresFor(weights, features, fitIntercept));
      for (let c = 0; c < k; c += 1) {
        const error = probs[c]! - (c === label ? 1 : 0);
        if (fitIntercept) grad[c]![0]! += error;
        for (let j = 0; j < d; j += 1) {
          grad[c]![(fitIntercept ? 1 : 0) + j]! += error * features[j]!;
        }
      }
    }

    for (let c = 0; c < k; c += 1) {
      for (let j = 0; j < rowLen; j += 1) {
        let g = (C / n) * grad[c]![j]!;
        if (!(fitIntercept && j === 0)) {
          g += weights[c]![j]!; // L2
        }
        weights[c]![j]! -= learningRate * g;
      }
    }

    if (epoch % 5 === 0 || epoch === epochs - 1) {
      history.push({
        epoch: epoch + 1,
        logLoss: multiclassLogLoss(scaledExamples, weights, fitIntercept),
      });
    }
  }

  return {
    weights: weights.map((row) => [...row]),
    classNames: [...classNames],
    fitIntercept,
    C,
    history,
    featureMeans: means,
    featureStds: stds,
  };
}
