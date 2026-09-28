export const LINEAR_REGRESSION_STEPS = [
  {
    id: "problem",
    index: 1,
    label: "Problema",
  },
  {
    id: "data",
    index: 2,
    label: "Dados",
  },
  {
    id: "visualize",
    index: 3,
    label: "Visualize",
  },
  {
    id: "line",
    index: 4,
    label: "A linha",
  },
  {
    id: "error",
    index: 5,
    label: "O erro",
  },
  {
    id: "train",
    index: 6,
    label: "Treinar",
  },
  {
    id: "predict",
    index: 7,
    label: "Previsão",
  },
] as const;

export type LinearRegressionStepId =
  (typeof LINEAR_REGRESSION_STEPS)[number]["id"];
