import type { Point2D } from "@/lib/ml/types";
import type { DatasetId } from "@/lib/data/types";

export type { DatasetId };

export type Dataset = {
  id: DatasetId;
  name: string;
  description: string;
  source: string;
  xLabel: string;
  yLabel: string;
  recordCount: number;
  points: Point2D[];
};
