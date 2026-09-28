/** Sigmoid σ(z) = 1 / (1 + e^(−z)) with basic overflow guards. */
export function sigmoid(z: number): number {
  if (z >= 35) return 1;
  if (z <= -35) return 0;
  return 1 / (1 + Math.exp(-z));
}

export function logit(p: number): number {
  const clipped = Math.min(1 - 1e-12, Math.max(1e-12, p));
  return Math.log(clipped / (1 - clipped));
}

/** Softmax over a score vector. */
export function softmax(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const max = Math.max(...scores);
  const exps = scores.map((score) => Math.exp(score - max));
  const sum = exps.reduce((total, value) => total + value, 0) || 1;
  return exps.map((value) => value / sum);
}
