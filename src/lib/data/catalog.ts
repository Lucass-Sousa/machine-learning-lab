import type { DatasetCatalogEntry, DatasetId } from "@/lib/data/types";

/**
 * Catalog — regression uses credit; classification uses its own labeled CSV.
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
  "base-classificacao": {
    id: "base-classificacao",
    name: "Base de classificação",
    description:
      "Pedidos de crédito com rótulos nativos de aprovação (binário) e perfil de risco (multiclasse).",
    source: "database/base_classificacao.csv",
    totalRecords: 4_000,
  },
};

export function getPrimaryDatasetMeta(): DatasetCatalogEntry {
  return DATASET_CATALOG[PRIMARY_DATASET_ID];
}
