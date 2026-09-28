import type { Point2D } from "@/lib/ml/types";

export type TrainTestSplit = {
  train: Point2D[];
  test: Point2D[];
  trainIndices: number[];
  testIndices: number[];
};

/**
 * Deterministic shuffle via mulberry32 so splits are stable across renders.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleIndices(length: number, seed: number): number[] {
  const indices = Array.from({ length }, (_, index) => index);
  const random = createRng(seed);

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }

  return indices;
}

export function trainTestSplit(
  points: Point2D[],
  trainRatio = 0.8,
  seed = 42,
): TrainTestSplit {
  const clamped = Math.min(0.95, Math.max(0.5, trainRatio));
  const indices = shuffleIndices(points.length, seed);
  const trainSize = Math.max(
    2,
    Math.min(points.length - 1, Math.floor(points.length * clamped)),
  );

  const trainIndices = indices.slice(0, trainSize);
  const testIndices = indices.slice(trainSize);

  return {
    train: trainIndices.map((index) => points[index]!),
    test: testIndices.map((index) => points[index]!),
    trainIndices,
    testIndices,
  };
}

export type FoldResult = {
  fold: number;
  trainSize: number;
  validationSize: number;
  mae: number;
  mse: number;
};

/**
 * K-fold cross-validation helper. Caller supplies the evaluation function.
 */
export function kFoldIndices(
  length: number,
  k = 5,
  seed = 42,
): Array<{ train: number[]; validation: number[] }> {
  const folds = Math.min(k, length);
  const indices = shuffleIndices(length, seed);
  const foldSize = Math.floor(length / folds);
  const result: Array<{ train: number[]; validation: number[] }> = [];

  for (let fold = 0; fold < folds; fold += 1) {
    const start = fold * foldSize;
    const end = fold === folds - 1 ? length : start + foldSize;
    const validation = indices.slice(start, end);
    const validationSet = new Set(validation);
    const train = indices.filter((index) => !validationSet.has(index));
    result.push({ train, validation });
  }

  return result;
}

export function trainValTestSplit(
  points: Point2D[],
  trainRatio = 0.6,
  validationRatio = 0.2,
  seed = 42,
): {
  train: Point2D[];
  validation: Point2D[];
  test: Point2D[];
  trainIndices: number[];
  validationIndices: number[];
  testIndices: number[];
} {
  const indices = shuffleIndices(points.length, seed);
  const trainSize = Math.max(
    2,
    Math.floor(points.length * Math.min(0.9, Math.max(0.4, trainRatio))),
  );
  const validationSize = Math.max(
    1,
    Math.floor(points.length * Math.min(0.4, Math.max(0.05, validationRatio))),
  );
  const remaining = points.length - trainSize;
  const safeVal = Math.min(validationSize, Math.max(1, remaining - 1));

  const trainIndices = indices.slice(0, trainSize);
  const validationIndices = indices.slice(trainSize, trainSize + safeVal);
  const testIndices = indices.slice(trainSize + safeVal);

  return {
    train: trainIndices.map((index) => points[index]!),
    validation: validationIndices.map((index) => points[index]!),
    test: testIndices.map((index) => points[index]!),
    trainIndices,
    validationIndices,
    testIndices,
  };
}
