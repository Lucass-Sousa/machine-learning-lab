"use client";

import { FreeLabCanvas } from "@/components/laboratory/FreeLabCanvas";
import { FreeLabControls } from "@/components/laboratory/FreeLabControls";
import { useFreeLab } from "@/components/laboratory/useFreeLab";
import { LabToolbar } from "@/components/lab/LabToolbar";

/**
 * Free laboratory: pick model, data axes, and watch real fits update.
 * Chart stays the protagonist; sidebar holds configuration.
 */
export function FreeLabExperience() {
  const lab = useFreeLab();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LabToolbar
        title="Laboratório Livre"
        subtitle="Escolha o modelo, as variáveis e observe o ajuste em tempo real — sem trilha guiada."
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <FreeLabCanvas lab={lab} className="order-1 lg:min-h-0" />
        <FreeLabControls lab={lab} />
      </div>
    </div>
  );
}
