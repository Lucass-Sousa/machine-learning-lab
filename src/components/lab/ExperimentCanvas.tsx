import { ChartPlaceholder } from "@/components/visualizations/ChartPlaceholder";
import { ScatterPlaceholder } from "@/components/visualizations/ScatterPlaceholder";
import type { Point2D } from "@/lib/ml/types";
import { cn } from "@/lib/utils/cn";

type ExperimentCanvasProps = {
  points: Point2D[];
  datasetName?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
};

export function ExperimentCanvas({
  points,
  datasetName = "Dataset",
  xLabel,
  yLabel,
  className,
}: ExperimentCanvasProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-5",
        className,
      )}
    >
      <ChartPlaceholder>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Visualização
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {datasetName}
            </p>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted">
            {points.length} pontos
          </p>
        </div>
        <ScatterPlaceholder
          points={points}
          xLabel={xLabel}
          yLabel={yLabel}
          title={`Scatter plot — ${datasetName}`}
          className="flex-1"
        />
      </ChartPlaceholder>
    </div>
  );
}
