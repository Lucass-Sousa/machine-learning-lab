import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Regressão Logística",
};

export default function LogisticRegressionPage() {
  return (
    <RoutePlaceholder
      eyebrow="Trilha · Classificação"
      title="Regressão Logística"
      description="Esta experiência guiada ainda está sendo preparada. Em breve você poderá explorar probabilidades e classificação de forma interativa."
    />
  );
}
