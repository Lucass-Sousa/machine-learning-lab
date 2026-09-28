import type { DatasetCatalogEntry, DatasetId } from "@/lib/data/types";

/**
 * Future-ready catalog. MVP exposes a single primary dataset.
 * Do not wire a multi-dataset selector yet.
 */
export const PRIMARY_DATASET_ID: DatasetId = "base-credito";

export const DATASET_CATALOG: Record<DatasetId, DatasetCatalogEntry> = {
  "base-credito": {
    id: "base-credito",
    name: "Base de crédito",
    description:
      "Observações reais de perfil de crédito: idade, renda, score, histórico de pagamentos e valor de empréstimo.",
    source: "database/base_credito.csv",
    totalRecords: 50_000,
  },
};

export function getPrimaryDatasetMeta(): DatasetCatalogEntry {
  return DATASET_CATALOG[PRIMARY_DATASET_ID];
}
