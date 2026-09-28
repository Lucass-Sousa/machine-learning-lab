"use client";

import { useMemo } from "react";

import type { LinearParameters } from "@/lib/ml";
import type { Point2D } from "@/lib/ml/types";
import { cn } from "@/lib/utils/cn";

type ScatterPlotProps = {
  points: Point2D[];
  className?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  parameters?: LinearParameters | null;
  showResiduals?: boolean;
  residualSampleSize?: number;
  highlightX?: number | null;
  interactive?: boolean;
  onExplore?: () => void;
};

type Scale = {
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const PLOT = {
  width: 640,
  height: 400,
  padding: { top: 24, right: 24, bottom: 44, left: 52 },
} as const;

/**
 * Visualization-only scatter plot. Receives parameters/residuals from outside —
 * no ML math lives here.
 */
export function ScatterPlot({
  points,
  className,
  title = "Scatter plot",
  xLabel,
  yLabel,
  parameters = null,
  showResiduals = false,
  residualSampleSize = 48,
  highlightX = null,
  interactive = false,
  onExplore,
}: ScatterPlotProps) {
  const { width, height, padding } = PLOT;

  const scale = useMemo(
    () => createScale(points, width, height, padding),
    [points, width, height, padding],
  );

  const radius = points.length > 180 ? 2.6 : 4;

  const residualPoints = useMemo(() => {
    if (!showResiduals || !parameters) return [];
    return sampleEvenly(points, residualSampleSize);
  }, [points, showResiduals, parameters, residualSampleSize]);

  if (points.length === 0 || !scale) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center bg-lab-grid text-sm text-muted sm:min-h-[360px]",
          className,
        )}
      >
        Sem pontos para exibir.
      </div>
    );
  }

  const lineStart = parameters
    ? {
        x: scale.toSvgX(scale.minX),
        y: scale.toSvgY(
          parameters.slope * scale.minX + parameters.intercept,
        ),
      }
    : null;
  const lineEnd = parameters
    ? {
        x: scale.toSvgX(scale.maxX),
        y: scale.toSvgY(
          parameters.slope * scale.maxX + parameters.intercept,
        ),
      }
    : null;

  const prediction =
    parameters && highlightX != null
      ? {
          x: scale.toSvgX(highlightX),
          y: scale.toSvgY(parameters.slope * highlightX + parameters.intercept),
          value: parameters.slope * highlightX + parameters.intercept,
        }
      : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-lab-grid",
        interactive && "touch-pan-y",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-full min-h-[280px] w-full sm:min-h-[360px]"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={interactive ? () => onExplore?.() : undefined}
        onPointerDown={interactive ? () => onExplore?.() : undefined}
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

        {xLabel ? (
          <text
            x={(padding.left + width - padding.right) / 2}
            y={height - 10}
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

        {showResiduals && parameters
          ? residualPoints.map((point, index) => {
              const predicted = parameters.slope * point.x + parameters.intercept;
              return (
                <line
                  key={`residual-${index}`}
                  x1={scale.toSvgX(point.x)}
                  y1={scale.toSvgY(point.y)}
                  x2={scale.toSvgX(point.x)}
                  y2={scale.toSvgY(predicted)}
                  className="stroke-data/45"
                  strokeWidth="1.25"
                />
              );
            })
          : null}

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

        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={scale.toSvgX(point.x)}
            cy={scale.toSvgY(point.y)}
            r={radius}
            className="fill-data/75"
          />
        ))}

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
): Scale | null {
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

  // Small padding inside data domain so points don't sit on axes
  const xPad = rangeX * 0.04;
  const yPad = rangeY * 0.08;
  const domainMinX = minX - xPad;
  const domainMaxX = maxX + xPad;
  const domainMinY = Math.max(0, minY - yPad);
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

function sampleEvenly(points: Point2D[], size: number): Point2D[] {
  if (points.length <= size) return points;
  const step = points.length / size;
  const sampled: Point2D[] = [];
  for (let i = 0; i < size; i += 1) {
    sampled.push(points[Math.floor(i * step)]!);
  }
  return sampled;
}
