"use client";

import { useMemo } from "react";

import type { LinearParameters } from "@/lib/ml";
import type { Point2D } from "@/lib/ml/types";
import {
  formatAxisTick,
  inferAxisFormat,
  niceTicks,
  type AxisValueFormat,
} from "@/lib/visualization/axis";
import { cn } from "@/lib/utils/cn";

export type ScatterPoint = Point2D & {
  id?: string;
  group?: "train" | "test" | "all";
};

type ScatterPlotProps = {
  points: ScatterPoint[];
  className?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Override tick formatting; defaults are inferred from axis labels */
  xFormat?: AxisValueFormat;
  yFormat?: AxisValueFormat;
  parameters?: LinearParameters | null;
  /** Dense model curve in data coordinates (polynomial / arbitrary) */
  curve?: Point2D[] | null;
  /** Predicted ŷ aligned with `points` order (for residuals when not using linear params) */
  predictedYs?: number[] | null;
  showResiduals?: boolean;
  residualLimit?: number;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
  highlightX?: number | null;
  highlightY?: number | null;
  showTest?: boolean;
  dimTest?: boolean;
  /** Extra points included only for axis scaling (e.g. curve extrema) */
  scalePoints?: Point2D[];
};

const PLOT = {
  width: 640,
  height: 400,
  padding: { top: 20, right: 20, bottom: 58, left: 72 },
} as const;

/**
 * Visualization-only scatter. All geometry inputs come from outside.
 */
export function ScatterPlot({
  points,
  className,
  title = "Scatter plot",
  xLabel,
  yLabel,
  xFormat,
  yFormat,
  parameters = null,
  curve = null,
  predictedYs = null,
  showResiduals = false,
  residualLimit = 60,
  selectedIndex = null,
  onSelectIndex,
  highlightX = null,
  highlightY = null,
  showTest = true,
  dimTest = false,
  scalePoints = [],
}: ScatterPlotProps) {
  const { width, height, padding } = PLOT;
  const resolvedXFormat = xFormat ?? inferAxisFormat(xLabel);
  const resolvedYFormat = yFormat ?? inferAxisFormat(yLabel);

  const visiblePoints = useMemo(() => {
    if (showTest) return points;
    return points.filter((point) => point.group !== "test");
  }, [points, showTest]);

  const scale = useMemo(
    () =>
      createScale(
        [
          ...(visiblePoints.length ? visiblePoints : points),
          ...(curve ?? []),
          ...scalePoints,
        ],
        width,
        height,
        padding,
      ),
    [visiblePoints, points, curve, scalePoints, width, height, padding],
  );

  const ticks = useMemo(() => {
    if (!scale) return { x: [] as number[], y: [] as number[] };
    return {
      x: niceTicks(scale.minX, scale.maxX, 5),
      y: niceTicks(scale.minY, scale.maxY, 5),
    };
  }, [scale]);

  const residualIndexes = useMemo(() => {
    const canShow =
      showResiduals && (parameters != null || predictedYs != null);
    if (!canShow) return [];
    const source = visiblePoints.length ? visiblePoints : points;
    const step = Math.max(1, Math.floor(source.length / residualLimit));
    const indexes: number[] = [];
    for (let i = 0; i < source.length; i += step) {
      indexes.push(i);
    }
    if (selectedIndex != null && selectedIndex < source.length) {
      indexes.push(selectedIndex);
    }
    return Array.from(new Set(indexes));
  }, [
    showResiduals,
    parameters,
    predictedYs,
    visiblePoints,
    points,
    residualLimit,
    selectedIndex,
  ]);

  if (points.length === 0 || !scale) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-lg border border-border bg-lab-grid text-sm text-muted sm:min-h-[360px]",
          className,
        )}
      >
        Sem pontos para exibir.
      </div>
    );
  }

  const radius = visiblePoints.length > 200 ? 2.4 : 3.8;

  const lineStart = parameters
    ? {
        x: scale.toSvgX(scale.minX),
        y: scale.toSvgY(parameters.slope * scale.minX + parameters.intercept),
      }
    : null;
  const lineEnd = parameters
    ? {
        x: scale.toSvgX(scale.maxX),
        y: scale.toSvgY(parameters.slope * scale.maxX + parameters.intercept),
      }
    : null;

  const prediction =
    highlightX != null && highlightY != null
      ? { x: scale.toSvgX(highlightX), y: scale.toSvgY(highlightY) }
      : parameters && highlightX != null
        ? {
            x: scale.toSvgX(highlightX),
            y: scale.toSvgY(
              parameters.slope * highlightX + parameters.intercept,
            ),
          }
        : null;

  const curvePath =
    curve && curve.length > 1
      ? curve
          .map((point, index) => {
            const command = index === 0 ? "M" : "L";
            return `${command} ${scale.toSvgX(point.x)} ${scale.toSvgY(point.y)}`;
          })
          .join(" ")
      : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-lab-grid",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-full min-h-[280px] w-full sm:min-h-[360px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>{title}</title>

        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className="stroke-border-strong"
          strokeWidth="1.5"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className="stroke-border-strong"
          strokeWidth="1.5"
        />

        {ticks.x.map((tick) => {
          const x = scale.toSvgX(tick);
          if (x < padding.left - 1 || x > width - padding.right + 1) {
            return null;
          }
          return (
            <g key={`x-${tick}`}>
              <line
                x1={x}
                y1={height - padding.bottom}
                x2={x}
                y2={height - padding.bottom + 5}
                className="stroke-border-strong"
                strokeWidth="1"
              />
              <text
                x={x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-muted text-[10px]"
              >
                {formatAxisTick(tick, resolvedXFormat)}
              </text>
            </g>
          );
        })}

        {ticks.y.map((tick) => {
          const y = scale.toSvgY(tick);
          if (y < padding.top - 1 || y > height - padding.bottom + 1) {
            return null;
          }
          return (
            <g key={`y-${tick}`}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                className="stroke-border-strong"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-muted text-[10px]"
              >
                {formatAxisTick(tick, resolvedYFormat)}
              </text>
            </g>
          );
        })}

        {xLabel ? (
          <text
            x={(padding.left + width - padding.right) / 2}
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
            y={(padding.top + height - padding.bottom) / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${(padding.top + height - padding.bottom) / 2})`}
            className="fill-muted text-[11px]"
          >
            {yLabel}
          </text>
        ) : null}

        {residualIndexes.map((index) => {
          const point = visiblePoints[index];
          if (!point) return null;
          const predicted = parameters
            ? parameters.slope * point.x + parameters.intercept
            : predictedYs?.[
                points.findIndex(
                  (candidate) =>
                    candidate.id === point.id &&
                    candidate.x === point.x &&
                    candidate.y === point.y,
                ) ?? index
              ];
          const predictedValue =
            predictedYs && predictedYs.length === visiblePoints.length
              ? predictedYs[index]
              : predicted;
          if (predictedValue == null || !Number.isFinite(predictedValue)) {
            return null;
          }
          const isSelected = index === selectedIndex;
          return (
            <line
              key={`res-${index}`}
              x1={scale.toSvgX(point.x)}
              y1={scale.toSvgY(point.y)}
              x2={scale.toSvgX(point.x)}
              y2={scale.toSvgY(predictedValue)}
              className={isSelected ? "stroke-data" : "stroke-data/40"}
              strokeWidth={isSelected ? 2 : 1.2}
            />
          );
        })}

        {lineStart && lineEnd ? (
          <line
            x1={lineStart.x}
            y1={lineStart.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
            className="stroke-accent"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
        ) : null}

        {curvePath ? (
          <path
            d={curvePath}
            fill="none"
            className="stroke-accent"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {visiblePoints.map((point, index) => {
          const isTest = point.group === "test";
          const isSelected = index === selectedIndex;
          const opacityClass =
            dimTest && isTest
              ? "fill-border-strong/70"
              : isTest
                ? "fill-muted"
                : "fill-data/80";

          return (
            <circle
              key={point.id ?? `${point.x}-${point.y}-${index}`}
              cx={scale.toSvgX(point.x)}
              cy={scale.toSvgY(point.y)}
              r={isSelected ? radius + 2.2 : radius}
              className={cn(
                opacityClass,
                onSelectIndex && "cursor-pointer",
                isSelected && "stroke-foreground stroke-2",
              )}
              onClick={() => onSelectIndex?.(index)}
            />
          );
        })}

        {prediction ? (
          <>
            <line
              x1={prediction.x}
              y1={height - padding.bottom}
              x2={prediction.x}
              y2={prediction.y}
              className="stroke-accent/50"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle
              cx={prediction.x}
              cy={prediction.y}
              r="6"
              className="fill-accent stroke-surface"
              strokeWidth="2"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

function createScale(
  points: Point2D[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
) {
  if (points.length === 0) return null;

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xPad = rangeX * 0.05;
  const yPad = rangeY * 0.08;
  const domainMinX = minX - xPad;
  const domainMaxX = maxX + xPad;
  const domainMinY = minY - yPad;
  const domainMaxY = maxY + yPad;
  const domainRangeX = domainMaxX - domainMinX || 1;
  const domainRangeY = domainMaxY - domainMinY || 1;

  return {
    minX: domainMinX,
    maxX: domainMaxX,
    minY: domainMinY,
    maxY: domainMaxY,
    toSvgX: (x: number) =>
      padding.left + ((x - domainMinX) / domainRangeX) * plotWidth,
    toSvgY: (y: number) =>
      height -
      padding.bottom -
      ((y - domainMinY) / domainRangeY) * plotHeight,
  };
}
