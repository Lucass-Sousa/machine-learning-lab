import type { Metadata } from "next";

import { LinearRegressionExperience } from "@/components/learn/linear-regression/LinearRegressionExperience";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Regressão Linear",
  description:
    "Experiência guiada para descobrir regressão linear de forma visual e interativa.",
};

export default function LinearRegressionPage() {
  return (
    <SiteShell showFooter={false}>
      <main>
        <LinearRegressionExperience />
      </main>
    </SiteShell>
  );
}
