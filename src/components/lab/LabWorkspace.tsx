"use client";

import { useState } from "react";

import { ExperimentCanvas } from "@/components/lab/ExperimentCanvas";
import { LabControls } from "@/components/lab/LabControls";
import { LabSidebar } from "@/components/lab/LabSidebar";
import { LabToolbar } from "@/components/lab/LabToolbar";
import { Button } from "@/components/ui/Button";
import { DEFAULT_DATASET } from "@/lib/datasets";

/**
 * Main laboratory shell: chart is the protagonist; controls support it.
 * Layout stacks on mobile (canvas first) and splits on large screens.
 */
export function LabWorkspace() {
  const dataset = DEFAULT_DATASET;
  const [slope, setSlope] = useState(1.6);
  const [intercept, setIntercept] = useState(0.4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LabToolbar
        title="Laboratório"
        subtitle="Explore conceitos visualmente — começando por regressão linear."
        actions={
          <>
            <Button variant="secondary" disabled>
              Resetar
            </Button>
            <Button disabled>Ajustar modelo</Button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ExperimentCanvas
          className="order-1 min-h-[52vh] lg:min-h-0"
          points={dataset.points}
          datasetName={dataset.name}
          xLabel={dataset.xLabel}
          yLabel={dataset.yLabel}
        />
        <LabSidebar className="order-2 border-t lg:border-t-0">
          <LabControls
            dataset={dataset}
            slope={slope}
            intercept={intercept}
            onSlopeChange={setSlope}
            onInterceptChange={setIntercept}
          />
        </LabSidebar>
      </div>
    </div>
  );
}
