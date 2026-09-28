export const LINEAR_TRAIL_STEPS = [
  { id: "dataset", index: 1, label: "Dados" },
  { id: "target", index: 2, label: "X e Y" },
  { id: "observe", index: 3, label: "Observe" },
  { id: "line", index: 4, label: "Reta" },
  { id: "predict", index: 5, label: "Previsão" },
  { id: "errors", index: 6, label: "Erros" },
  { id: "metrics", index: 7, label: "Métricas" },
  { id: "train", index: 8, label: "Treinar" },
  { id: "gradient", index: 9, label: "GD" },
  { id: "split", index: 10, label: "Treino/Teste" },
  { id: "validation", index: 11, label: "Validação" },
  { id: "diagnosis", index: 12, label: "Diagnóstico" },
  { id: "next-model", index: 13, label: "E agora?" },
  { id: "lab", index: 14, label: "Lab livre" },
] as const;

export type LinearTrailStepId = (typeof LINEAR_TRAIL_STEPS)[number]["id"];

export const EXPLORATION_OPTIONS = [
  { id: "relation", label: "Parece existir uma relação" },
  { id: "no-relation", label: "Parece não existir uma relação clara" },
  { id: "linear", label: "Parece uma relação linear" },
  { id: "curve", label: "Parece que existe uma curva" },
  { id: "unsure", label: "Não tenho certeza" },
] as const;
