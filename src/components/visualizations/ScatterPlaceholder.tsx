import { ScatterPlot } from "@/components/visualizations/ScatterPlot";
import type { Point2D } from "@/lib/ml/types";

/** Compatibility wrapper for earlier lab scaffolding. */
export function ScatterPlaceholder({
  points,
  className,
  title,
  xLabel,
  yLabel,
}: {
  points: Point2D[];
  className?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  pointRadius?: number;
}) {
  return (
    <ScatterPlot
      points={points}
      className={className}
      title={title}
      xLabel={xLabel}
      yLabel={yLabel}
    />
  );
}
