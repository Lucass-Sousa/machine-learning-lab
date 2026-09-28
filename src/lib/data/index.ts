export type {
  Dataset,
  DatasetCatalogEntry,
  DatasetId,
  VariableDefinition,
  VariableType,
} from "@/lib/data/types";

export {
  DATASET_CATALOG,
  PRIMARY_DATASET_ID,
  getPrimaryDatasetMeta,
} from "@/lib/data/catalog";

export {
  createCustomObservation,
  getBaseObservations,
  getDatasetInfo,
  getVariableDomain,
  getVariableLabel,
  observationsToPoints,
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
  SELECTABLE_VARIABLES,
  type NumericVariableKey,
  type Observation,
} from "@/lib/data/credit/observations";

export { CREDIT_VARIABLES, CREDIT_DATASET_META } from "@/lib/data/credit/schema";

export {
  getBinaryClassificationRows,
  getClassificationDatasetInfo,
  getClassificationObservations,
  getMulticlassClassificationRows,
  type BinaryClassificationRow,
  type ClassificationObservation,
  type MulticlassClassificationRow,
} from "@/lib/data/classification/observations";

export {
  BINARY_TARGET,
  CLASSIFICATION_DATASET,
  CLASSIFICATION_VARIABLES,
  MULTICLASS_TARGET,
} from "@/lib/data/classification/schema";
