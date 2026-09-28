import rawPayload from "@/lib/datasets/data/base-credito.sample.json";
import {
  CREDIT_DATASET_META,
  CREDIT_VARIABLES,
  DEFAULT_X_KEY,
  DEFAULT_Y_KEY,
  SELECTABLE_VARIABLES,
} from "@/lib/data/credit/schema";
import type { Point2D } from "@/lib/ml/types";

export type NumericVariableKey =
  | "idade"
  | "renda_mensal"
  | "score_credito"
  | "historico_pagamentos"
  | "valor_emprestimo";

export type Observation = {
  id: string;
  idade: number;
  renda_mensal: number;
  score_credito: number;
  historico_pagamentos: number;
  valor_emprestimo: number;
  isCustom?: boolean;
};

type CreditPayload = {
  columns: NumericVariableKey[];
  source: string;
  totalRecords: number;
  rows: number[][];
};

const payload = rawPayload as CreditPayload;
const COLUMN_INDEX: Record<NumericVariableKey, number> = {
  idade: 0,
  renda_mensal: 1,
  score_credito: 2,
  historico_pagamentos: 3,
  valor_emprestimo: 4,
};

function rowToObservation(row: number[], index: number): Observation {
  return {
    id: `obs-${index}`,
    idade: row[COLUMN_INDEX.idade]!,
    renda_mensal: row[COLUMN_INDEX.renda_mensal]!,
    score_credito: row[COLUMN_INDEX.score_credito]!,
    historico_pagamentos: row[COLUMN_INDEX.historico_pagamentos]!,
    valor_emprestimo: row[COLUMN_INDEX.valor_emprestimo]!,
  };
}

const BASE_OBSERVATIONS: Observation[] = payload.rows.map(rowToObservation);

export function getDatasetInfo() {
  return {
    id: CREDIT_DATASET_META.id,
    name: CREDIT_DATASET_META.name,
    description: CREDIT_DATASET_META.description,
    source: CREDIT_DATASET_META.source,
    /** Full CSV size */
    totalRecords: payload.totalRecords,
    /** Real rows loaded for the interactive MVP session */
    workingRecords: BASE_OBSERVATIONS.length,
    recordCount: BASE_OBSERVATIONS.length,
    variableCount: CREDIT_VARIABLES.length,
    variables: CREDIT_VARIABLES,
    selectableVariables: SELECTABLE_VARIABLES,
  };
}

export function getBaseObservations(): Observation[] {
  return BASE_OBSERVATIONS.map((observation) => ({ ...observation }));
}

export function getNumericValue(
  observation: Observation,
  key: NumericVariableKey,
): number {
  return observation[key];
}

export function observationsToPoints(
  observations: Observation[],
  xKey: NumericVariableKey,
  yKey: NumericVariableKey,
): Point2D[] {
  return observations.map((observation) => ({
    x: getNumericValue(observation, xKey),
    y: getNumericValue(observation, yKey),
  }));
}

export function getVariableLabel(key: string): string {
  return (
    CREDIT_VARIABLES.find((variable) => variable.key === key)?.label ?? key
  );
}

export function getVariableDomain(
  observations: Observation[],
  key: NumericVariableKey,
): { min: number; max: number } {
  const values = observations.map((observation) => observation[key]);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function createCustomObservation(
  xKey: NumericVariableKey,
  yKey: NumericVariableKey,
  x: number,
  y: number,
  idSuffix: string,
): Observation {
  const base: Observation = {
    id: `custom-${idSuffix}`,
    idade: 40,
    renda_mensal: 8000,
    score_credito: 650,
    historico_pagamentos: 80,
    valor_emprestimo: 30000,
    isCustom: true,
  };

  return {
    ...base,
    [xKey]: x,
    [yKey]: y,
  };
}

export { DEFAULT_X_KEY, DEFAULT_Y_KEY, SELECTABLE_VARIABLES };
