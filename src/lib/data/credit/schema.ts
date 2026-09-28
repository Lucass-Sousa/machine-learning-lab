import type { VariableDefinition } from "@/lib/data/types";
import { DATASET_CATALOG } from "@/lib/data/catalog";

export const CREDIT_VARIABLES: VariableDefinition[] = [
  {
    key: "idade",
    label: "Idade",
    description: "Idade do solicitante, em anos.",
    type: "numeric",
    selectable: true,
  },
  {
    key: "renda_mensal",
    label: "Renda mensal",
    description: "Renda mensal declarada.",
    type: "numeric",
    selectable: true,
  },
  {
    key: "score_credito",
    label: "Score de crédito",
    description: "Pontuação de crédito do solicitante.",
    type: "numeric",
    selectable: true,
  },
  {
    key: "historico_pagamentos",
    label: "Histórico de pagamentos",
    description: "Indicador numérico do histórico de pagamentos.",
    type: "numeric",
    selectable: true,
  },
  {
    key: "valor_emprestimo",
    label: "Valor do empréstimo",
    description: "Valor solicitado/concedido do empréstimo.",
    type: "numeric",
    selectable: true,
  },
];

export const SELECTABLE_VARIABLES = CREDIT_VARIABLES.filter(
  (variable) => variable.selectable,
);

export const CREDIT_DATASET_META = DATASET_CATALOG["base-credito"];

export const DEFAULT_X_KEY = "renda_mensal" as const;
export const DEFAULT_Y_KEY = "valor_emprestimo" as const;
