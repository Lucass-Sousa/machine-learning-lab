import type {
  Dataset,
  GamificationAssessmentRecord,
} from "./types";
import rawRecords from "./data/gamification-assessments.json";

/**
 * Fixed initial database for the lab.
 * Import by the user is intentionally not supported in this stage.
 *
 * Source: Data Assessment Results — avaliações gamificadas em faculdades
 * (Attempt × Score por tentativa de estudante).
 */
const records = rawRecords as GamificationAssessmentRecord[];

export const DEFAULT_DATASET: Dataset = {
  id: "gamification-assessments",
  name: "Avaliações gamificadas",
  description:
    "Base fixa do laboratório: tentativas e pontuações em avaliações gamificadas em cursos universitários (Direito, Medicina, Psicologia, Arquitetura e Enfermagem).",
  source: "database/Data Assessment Results final.xlsx",
  xLabel: "Tentativa",
  yLabel: "Pontuação",
  records,
  points: records.map((record) => ({
    x: record.attempt,
    y: record.score,
  })),
};

/** Sparse sample for decorative surfaces (home hero). */
export function sampleDatasetPoints(
  dataset: Dataset = DEFAULT_DATASET,
  size = 140,
): Dataset["points"] {
  const { points } = dataset;
  if (points.length <= size) return points;

  const step = points.length / size;
  const sampled: Dataset["points"] = [];

  for (let i = 0; i < size; i += 1) {
    sampled.push(points[Math.floor(i * step)]!);
  }

  return sampled;
}

export function getDefaultDataset(): Dataset {
  return DEFAULT_DATASET;
}
