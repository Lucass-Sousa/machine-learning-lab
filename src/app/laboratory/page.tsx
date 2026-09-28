import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Laboratório Livre",
};

export default function LaboratoryPage() {
  return (
    <RoutePlaceholder
      eyebrow="Experimentação"
      title="Laboratório Livre"
      description="O espaço de experimentação livre ainda está sendo estruturado. Em breve você poderá escolher dados, variáveis e modelos sem uma trilha guiada."
    />
  );
}
