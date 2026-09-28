import type { Metadata } from "next";

import { PolynomialRegressionExperience } from "@/components/learn/polynomial-regression/PolynomialRegressionExperience";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Regressão Polinomial",
  description:
    "Experiência guiada de regressão polinomial: grau, underfitting, overfitting e generalização.",
};

export default function PolynomialRegressionPage() {
  return (
    <SiteShell showFooter={false}>
      <main>
        <PolynomialRegressionExperience />
      </main>
    </SiteShell>
  );
}
