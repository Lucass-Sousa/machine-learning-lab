export const POLYNOMIAL_TRAIL_STEPS = [
  { id: "intro", index: 1, label: "Reta" },
  { id: "concept", index: 2, label: "Polinomial" },
  { id: "degree", index: 3, label: "Grau" },
  { id: "underfit", index: 4, label: "Underfit" },
  { id: "adequate", index: 5, label: "Ajuste" },
  { id: "overfit", index: 6, label: "Overfit" },
  { id: "learning", index: 7, label: "Curvas" },
  { id: "lab", index: 8, label: "Lab" },
  { id: "challenge", index: 9, label: "Desafio" },
] as const;

export type PolynomialTrailStepId =
  (typeof POLYNOMIAL_TRAIL_STEPS)[number]["id"];
