/**
 * Native classification dataset schema.
 * Separate from `base_credito` (regression). Labels live in the CSV.
 */

export const CLASSIFICATION_DATASET = {
  id: "base-classificacao" as const,
  name: "Base de classificação",
  description:
    "Pedidos de crédito com rótulos nativos: aprovação binária e perfil de risco multiclasse.",
  source: "database/base_classificacao.csv",
};

export const BINARY_TARGET = {
  key: "aprovado" as const,
  name: "Aprovação",
  positiveLabel: "Aprovado",
  negativeLabel: "Negado",
  description:
    "Variável alvo binária nativa: 1 = crédito aprovado, 0 = crédito negado.",
  /** Features used by the binary logistic model (not the label itself). */
  featureKeys: ["renda_mensal", "score_comportamento"] as const,
  featureLabels: ["Renda mensal", "Score de comportamento"] as const,
};

export const MULTICLASS_TARGET = {
  key: "perfil_risco" as const,
  name: "Perfil de risco",
  classNames: ["Baixo", "Médio", "Alto"] as const,
  description:
    "Variável alvo multiclasse nativa: perfil de risco do cliente (Baixo, Médio ou Alto).",
  featureKeys: ["uso_credito_pct", "tempo_cliente_anos"] as const,
  featureLabels: ["Uso do crédito (%)", "Tempo como cliente (anos)"] as const,
};

export const CLASSIFICATION_VARIABLES = [
  {
    key: "renda_mensal",
    label: "Renda mensal",
    description: "Renda mensal declarada (R$).",
    type: "numeric" as const,
    selectable: true,
  },
  {
    key: "tempo_cliente_anos",
    label: "Tempo como cliente",
    description: "Anos de relacionamento com a instituição.",
    type: "numeric" as const,
    selectable: true,
  },
  {
    key: "score_comportamento",
    label: "Score de comportamento",
    description: "Pontuação comportamental (300–900).",
    type: "numeric" as const,
    selectable: true,
  },
  {
    key: "uso_credito_pct",
    label: "Uso do crédito (%)",
    description: "Percentual de utilização do limite de crédito.",
    type: "numeric" as const,
    selectable: true,
  },
  {
    key: "aprovado",
    label: "Aprovado",
    description: "Classe binária nativa (0 ou 1).",
    type: "categorical" as const,
    selectable: false,
  },
  {
    key: "perfil_risco",
    label: "Perfil de risco",
    description: "Classe multiclasse nativa (Baixo, Médio, Alto).",
    type: "categorical" as const,
    selectable: false,
  },
] as const;
