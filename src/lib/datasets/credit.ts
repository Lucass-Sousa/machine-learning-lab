import type { Dataset, DatasetId } from "@/lib/data/types";
import {
  getBaseObservations,
  getDatasetInfo,
  observationsToPoints,
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
} from "@/lib/data/credit/observations";
import { getVariableLabel } from "@/lib/data/credit/observations";

/**
 * Compatibility view used by the legacy /lab scaffold.
 * Primary source of truth lives in `src/lib/data`.
 */
export function getDefaultDataset(): Dataset {
  const info = getDatasetInfo();
  const observations = getBaseObservations();
  const points = observationsToPoints(
    observations,
    DEFAULT_X_KEY,
    DEFAULT_Y_KEY,
  );

  return {
    id: info.id as DatasetId,
    name: info.name,
    description: info.description,
    source: info.source,
    xLabel: getVariableLabel(DEFAULT_X_KEY),
    yLabel: getVariableLabel(DEFAULT_Y_KEY),
    recordCount: info.totalRecords,
    points,
  };
}

export const DEFAULT_DATASET = getDefaultDataset();

export function sampleDatasetPoints(
  dataset: Dataset = DEFAULT_DATASET,
  size = 140,
) {
  const { points } = dataset;
  if (points.length <= size) return points;
  const step = points.length / size;
  const sampled = [];
  for (let i = 0; i < size; i += 1) {
    sampled.push(points[Math.floor(i * step)]!);
  }
  return sampled;
}
