import { DEFAULT_DATASET } from "@/lib/datasets";
import type { Point2D } from "@/lib/ml/types";

/**
 * Learning-trail dataset view: Attempt (X) × Score (Y).
 * A stratified sample keeps the scatter readable while preserving the trend.
 */
export const LINEAR_REGRESSION_LEARNING = {
  title: "Regressão Linear",
  xLabel: "Número da tentativa (Attempt)",
  yLabel: "Pontuação (Score)",
  xKey: "attempt" as const,
  yKey: "score" as const,
  sampleSize: 220,
};

export type LearningDataSummary = {
  totalRecords: number;
  sampleSize: number;
  careers: string[];
  points: Point2D[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  previewRows: Array<{
    attempt: number;
    score: number;
    career: string;
    student: string;
  }>;
};

export function getLinearRegressionLearningData(): LearningDataSummary {
  const { records } = DEFAULT_DATASET;
  const allPoints = records.map((record) => ({
    x: record.attempt,
    y: record.score,
  }));

  const points = samplePointsEvenly(allPoints, LINEAR_REGRESSION_LEARNING.sampleSize);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const previewRows = records.slice(0, 6).map((record) => ({
    attempt: record.attempt,
    score: record.score,
    career: record.career,
    student: record.student,
  }));

  const careers = Array.from(
    new Set(records.map((record) => record.career)),
  ).sort();

  return {
    totalRecords: records.length,
    sampleSize: points.length,
    careers,
    points,
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
    previewRows,
  };
}

function samplePointsEvenly(points: Point2D[], size: number): Point2D[] {
  if (points.length <= size) return points;

  const step = points.length / size;
  const sampled: Point2D[] = [];

  for (let i = 0; i < size; i += 1) {
    sampled.push(points[Math.floor(i * step)]!);
  }

  return sampled;
}
