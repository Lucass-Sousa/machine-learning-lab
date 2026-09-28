import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Clustering",
};

export default function ClusteringPage() {
  return (
    <RoutePlaceholder
      eyebrow="Trilha · Aprendizado não supervisionado"
      title="Clustering"
      description="Esta experiência guiada ainda está sendo preparada. Em breve você poderá explorar agrupamentos em dados sem categorias prévias."
    />
  );
}
