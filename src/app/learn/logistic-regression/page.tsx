import type { Metadata } from "next";

import { ClassificationExperience } from "@/components/learn/classification/ClassificationExperience";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Regressão Logística",
  description:
    "Experiência guiada de classificação: Regressão Logística, limiar, Log Loss, regularização e Softmax.",
};

export default function LogisticRegressionPage() {
  return (
    <SiteShell showFooter={false}>
      <main>
        <ClassificationExperience />
      </main>
    </SiteShell>
  );
}
