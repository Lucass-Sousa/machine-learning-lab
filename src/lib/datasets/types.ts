import type { Point2D } from "@/lib/ml/types";

export type DatasetId = "gamification-assessments";

export type GamificationAssessmentRecord = {
  attempt: number;
  date: string | null;
  student: string;
  sex: string;
  academicPeriod: string;
  section: number;
  career: string;
  score: number;
};

export type Dataset = {
  id: DatasetId;
  name: string;
  description: string;
  source: string;
  xLabel: string;
  yLabel: string;
  /** Full tabular records from the fixed lab database */
  records: GamificationAssessmentRecord[];
  /** Derived 2D points for the current experiment view */
  points: Point2D[];
};
