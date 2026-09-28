export type ScaleStats = {
  mean: number;
  std: number;
};

export type NormalizationTransform = {
  x: ScaleStats;
  y: ScaleStats;
};

export function computeScaleStats(values: number[]): ScaleStats {
  if (values.length === 0) {
    return { mean: 0, std: 1 };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance) || 1;

  return { mean, std };
}

export function zScore(value: number, stats: ScaleStats): number {
  return (value - stats.mean) / stats.std;
}

export function inverseZScore(value: number, stats: ScaleStats): number {
  return value * stats.std + stats.mean;
}

/**
 * Builds z-score transforms for X and Y from a point cloud.
 */
export function buildNormalization(
  xs: number[],
  ys: number[],
): NormalizationTransform {
  return {
    x: computeScaleStats(xs),
    y: computeScaleStats(ys),
  };
}
