"use client";

import type { FreeLabState } from "@/components/laboratory/useFreeLab";
import { ClassificationScatter } from "@/components/visualizations/ClassificationScatter";
import { ScatterPlot } from "@/components/visualizations/ScatterPlot";
import { cn } from "@/lib/utils/cn";

type FreeLabCanvasProps = {
  lab: FreeLabState;
  className?: string;
};

export function FreeLabCanvas({ lab, className }: FreeLabCanvasProps) {
  const title = lab.isClassification
    ? "Classificação · fronteira de decisão"
    : lab.modelKind === "polynomial-regression"
      ? `Polinomial · grau ${lab.degree}`
      : "Regressão linear · reta ajustada";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:p-5",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Visualização
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{title}</p>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted">
            {lab.pointCount} pontos · {lab.datasetMeta.name}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-2 sm:p-3">
          {lab.isClassification ? (
            <ClassificationScatter
              points={lab.classPlotPoints}
              classNames={lab.classNames}
              xLabel={lab.featureLabelsBinary[0]}
              yLabel={lab.featureLabelsBinary[1]}
              boundary={lab.classBoundary}
              showTest={lab.showTest}
              title="Aprovado vs Negado"
            />
          ) : (
            <ScatterPlot
              points={lab.scatterPoints}
              xLabel={lab.getVariableLabel(lab.xKey)}
              yLabel={lab.getVariableLabel(lab.yKey)}
              parameters={
                lab.modelKind === "linear-regression"
                  ? lab.linearParameters
                  : null
              }
              curve={
                lab.modelKind === "polynomial-regression"
                  ? lab.polynomialCurve
                  : null
              }
              showResiduals={lab.showResiduals}
              showTest={lab.showTest}
              title={`${lab.getVariableLabel(lab.xKey)} → ${lab.getVariableLabel(lab.yKey)}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
