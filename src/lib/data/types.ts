import type { Point2D } from "@/lib/ml/types";

export type VariableType = "numeric" | "categorical" | "identifier" | "datetime";

export type VariableDefinition = {
  key: string;
  label: string;
  description: string;
  type: VariableType;
  selectable: boolean;
};

export type DatasetId = "base-credito";

/**
 * Catalog entry — prepared for multiple datasets later.
 * Only the primary MVP dataset is registered for now.
 */
export type DatasetCatalogEntry = {
  id: DatasetId;
  name: string;
  description: string;
  source: string;
  totalRecords: number;
};

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
