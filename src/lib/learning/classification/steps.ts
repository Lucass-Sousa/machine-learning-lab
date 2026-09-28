export type ClassificationStepId =
  | "what-is"
  | "data-classes"
  | "class-viz"
  | "logistic-sigmoid"
  | "probability-threshold"
  | "decision-boundary"
  | "train"
  | "log-loss"
  | "evaluate"
  | "regularization"
  | "softmax-intro"
  | "softmax-explore"
  | "challenge";

export type ClassificationStepDef = {
  id: ClassificationStepId;
  index: number;
  label: string;
};

export const CLASSIFICATION_TRAIL_STEPS: ClassificationStepDef[] = [
  { id: "what-is", index: 1, label: "O que é" },
  { id: "data-classes", index: 2, label: "Dados" },
  { id: "class-viz", index: 3, label: "Classes" },
  { id: "logistic-sigmoid", index: 4, label: "Sigmoide" },
  { id: "probability-threshold", index: 5, label: "Limiar" },
  { id: "decision-boundary", index: 6, label: "Fronteira" },
  { id: "train", index: 7, label: "Treinar" },
  { id: "log-loss", index: 8, label: "Log Loss" },
  { id: "evaluate", index: 9, label: "Testar" },
  { id: "regularization", index: 10, label: "Regularização" },
  { id: "softmax-intro", index: 11, label: "Softmax" },
  { id: "softmax-explore", index: 12, label: "Explorar" },
  { id: "challenge", index: 13, label: "Desafio" },
];
