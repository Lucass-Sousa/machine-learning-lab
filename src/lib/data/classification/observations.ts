import rawPayload from "@/lib/datasets/data/base-classificacao.sample.json";
import { DATASET_CATALOG } from "@/lib/data/catalog";
import {
  BINARY_TARGET,
  CLASSIFICATION_DATASET,
  MULTICLASS_TARGET,
} from "@/lib/data/classification/schema";

export type ClassificationObservation = {
  id: string;
  renda_mensal: number;
  tempo_cliente_anos: number;
  score_comportamento: number;
  uso_credito_pct: number;
  aprovado: 0 | 1;
  perfil_risco: "Baixo" | "Médio" | "Alto";
};

export type BinaryClassificationRow = {
  id: string;
  x0: number;
  x1: number;
  label: 0 | 1;
};

export type MulticlassClassificationRow = {
  id: string;
  x0: number;
  x1: number;
  label: number;
  className: string;
};

type ClassificationPayload = {
  columns: string[];
  source: string;
  totalRecords: number;
  rows: Array<[number, number, number, number, number, string]>;
};

const payload = rawPayload as ClassificationPayload;

const CLASS_INDEX: Record<string, number> = {
  Baixo: 0,
  Médio: 1,
  Alto: 2,
};

function rowToObservation(
  row: ClassificationPayload["rows"][number],
  index: number,
): ClassificationObservation {
  const perfil = row[5] as ClassificationObservation["perfil_risco"];
  return {
    id: `clf-${index}`,
    renda_mensal: row[0],
    tempo_cliente_anos: row[1],
    score_comportamento: row[2],
    uso_credito_pct: row[3],
    aprovado: row[4] === 1 ? 1 : 0,
    perfil_risco: perfil,
  };
}

const BASE_OBSERVATIONS: ClassificationObservation[] =
  payload.rows.map(rowToObservation);

export function getClassificationObservations(): ClassificationObservation[] {
  return BASE_OBSERVATIONS.map((observation) => ({ ...observation }));
}

export function getClassificationDatasetInfo() {
  const meta = DATASET_CATALOG["base-classificacao"];
  const rows = getBinaryClassificationRows();
  const positives = rows.filter((row) => row.label === 1).length;
  const multiclass = getMulticlassClassificationRows();
  const classCounts = MULTICLASS_TARGET.classNames.map(
    (name) => multiclass.filter((row) => row.className === name).length,
  );

  return {
    ...meta,
    hasNativeClassColumn: true,
    usesPedagogicalLabels: false,
    binaryTarget: BINARY_TARGET,
    multiclassTarget: MULTICLASS_TARGET,
    totalRecords: payload.totalRecords,
    workingRecords: BASE_OBSERVATIONS.length,
    binaryPositiveCount: positives,
    binaryNegativeCount: rows.length - positives,
    multiclassCounts: Object.fromEntries(
      MULTICLASS_TARGET.classNames.map((name, i) => [name, classCounts[i]!]),
    ),
    featureLabels: {
      binary: BINARY_TARGET.featureLabels,
      multiclass: MULTICLASS_TARGET.featureLabels,
    },
    variables: CLASSIFICATION_DATASET,
  };
}

export function getBinaryClassificationRows(): BinaryClassificationRow[] {
  const [f0, f1] = BINARY_TARGET.featureKeys;
  return getClassificationObservations().map((observation) => ({
    id: observation.id,
    x0: observation[f0],
    x1: observation[f1],
    label: observation.aprovado,
  }));
}

export function getMulticlassClassificationRows(): MulticlassClassificationRow[] {
  const [f0, f1] = MULTICLASS_TARGET.featureKeys;
  return getClassificationObservations().map((observation) => {
    const label = CLASS_INDEX[observation.perfil_risco] ?? 0;
    return {
      id: observation.id,
      x0: observation[f0],
      x1: observation[f1],
      label,
      className: observation.perfil_risco,
    };
  });
}
