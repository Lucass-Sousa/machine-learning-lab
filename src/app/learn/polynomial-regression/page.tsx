import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Regressão Polinomial",
};

export default function PolynomialRegressionPage() {
  return (
    <RoutePlaceholder
      eyebrow="Trilha · Regressão"
      title="Regressão Polinomial"
      description="Esta experiência guiada ainda está sendo preparada. Em breve você poderá explorar curvas e relações mais complexas entre os dados."
    />
  );
}
