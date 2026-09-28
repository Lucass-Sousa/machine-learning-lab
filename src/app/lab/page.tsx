import type { Metadata } from "next";

import { LabWorkspace } from "@/components/lab/LabWorkspace";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Laboratório",
  description:
    "Área experimental do ML Lab para visualizar e manipular conceitos de Machine Learning.",
};

export default function LabPage() {
  return (
    <SiteShell showFooter={false}>
      <main className="flex min-h-0 flex-1 flex-col">
        <LabWorkspace />
      </main>
    </SiteShell>
  );
}
