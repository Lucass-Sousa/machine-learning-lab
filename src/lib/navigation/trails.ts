/**
 * Navigation catalog for learning trails.
 * Content/routing only — no ML algorithms or calculations.
 */

export type TrailCategory =
  | "Regressão"
  | "Classificação"
  | "Aprendizado não supervisionado";

export type TrailAccent = "teal" | "amber" | "slate";

export type Trail = {
  id: string;
  href: `/learn/${string}`;
  title: string;
  description: string;
  category: TrailCategory;
  accent: TrailAccent;
};

export const LEARNING_TRAILS: Trail[] = [
  {
    id: "linear-regression",
    href: "/learn/linear-regression",
    title: "Regressão Linear",
    description:
      "Entenda como uma reta pode representar relações entre dados e gerar previsões.",
    category: "Regressão",
    accent: "teal",
  },
  {
    id: "polynomial-regression",
    href: "/learn/polynomial-regression",
    title: "Regressão Polinomial",
    description:
      "Descubra como curvas podem representar relações mais complexas entre os dados.",
    category: "Regressão",
    accent: "teal",
  },
  {
    id: "logistic-regression",
    href: "/learn/logistic-regression",
    title: "Regressão Logística",
    description:
      "Aprenda como modelos podem estimar probabilidades e classificar dados.",
    category: "Classificação",
    accent: "amber",
  },
  {
    id: "clustering",
    href: "/learn/clustering",
    title: "Clustering",
    description:
      "Descubra como algoritmos podem encontrar grupos em dados sem categorias previamente definidas.",
    category: "Aprendizado não supervisionado",
    accent: "slate",
  },
];

export const FREE_LAB = {
  href: "/laboratory" as const,
  title: "Laboratório Livre",
  description:
    "Já sabe o que quer experimentar? Escolha seus dados, variáveis e modelo.",
};
