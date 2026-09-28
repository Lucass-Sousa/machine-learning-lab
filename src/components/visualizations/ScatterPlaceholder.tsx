import type { Point2D } from "@/lib/ml/types";
import { cn } from "@/lib/utils/cn";

type ScatterPlaceholderProps = {
  points: Point2D[];
  className?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Smaller markers help dense real-world datasets remain readable */
  pointRadius?: number;
};

/**
 * SVG scaffold for future interactive scatter plots.
 * Maps points into a viewBox so the lab canvas already feels visual.
 */
export function ScatterPlaceholder({
  points,
  className,
  title = "Área de visualização",
  xLabel,
  yLabel,
  pointRadius,
}: ScatterPlaceholderProps) {
  const padding = 36;
  const width = 640;
  const height = 400;

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden bg-lab-grid text-sm text-muted sm:min-h-[360px]",
          className,
        )}
      >
        Sem pontos para exibir.
      </div>
    );
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const radius = pointRadius ?? (points.length > 200 ? 2.4 : 4.5);

  const mapped = points.map((point) => {
    const x =
      padding + ((point.x - minX) / rangeX) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.y - minY) / rangeY) * (height - padding * 2);
    return { x, y };
  });

  return (
    <div
      className={cn(
        "relative h-full min-h-[280px] w-full overflow-hidden bg-lab-grid sm:min-h-[360px]",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>{title}</title>

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border-strong"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border-strong"
        />

        {xLabel ? (
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted text-[11px]"
          >
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text
            x={14}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${height / 2})`}
            className="fill-muted text-[11px]"
          >
            {yLabel}
          </text>
        ) : null}

        {mapped.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={point.x}
            cy={point.y}
            r={radius}
            className="fill-data/80"
          />
        ))}
      </svg>
    </div>
  );
}
