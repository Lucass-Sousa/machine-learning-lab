import type { Metadata } from "next";

import { FreeLabExperience } from "@/components/laboratory/FreeLabExperience";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Laboratório Livre",
  description:
    "Experimente regressão linear, polinomial e logística escolhendo dados e variáveis livremente.",
};

export default function LaboratoryPage() {
  return (
    <SiteShell showFooter={false}>
      <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <FreeLabExperience />
      </main>
    </SiteShell>
  );
}
