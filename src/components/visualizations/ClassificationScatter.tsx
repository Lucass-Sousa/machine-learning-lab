"use client";

import { useMemo } from "react";

import {
  formatAxisTick,
  inferAxisFormat,
  niceTicks,
} from "@/lib/visualization/axis";
import { cn } from "@/lib/utils/cn";

export type ClassPoint = {
  id?: string;
  x0: number;
  x1: number;
  label: number;
  group?: "train" | "test" | "all";
  correct?: boolean | null;
};

type ClassificationScatterProps = {
  points: ClassPoint[];
  classNames?: string[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
  className?: string;
  /** Line segments for decision boundary in data coords */
  boundary?: { x0: number; x1: number }[] | null;
  showTest?: boolean;
  dimTest?: boolean;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
  /** Optional probability field opacity hint via predictedProb */
  predictedProbs?: number[] | null;
};

const COLORS = [
  "var(--color-accent)",
  "var(--color-data)",
  "var(--color-foreground)",
  "#c45c26",
  "#5b7c99",
];

const PLOT = {
  width: 640,
  height: 400,
  padding: { top: 20, right: 20, bottom: 58, left: 72 },
} as const;

export function ClassificationScatter({
  points,
  classNames = ["Classe 0", "Classe 1"],
  xLabel = "x₀",
  yLabel = "x₁",
  title = "Distribuição das classes",
  className,
  boundary = null,
  showTest = true,
  dimTest = false,
  selectedIndex = null,
  onSelectIndex,
  predictedProbs = null,
}: ClassificationScatterProps) {
  const { width, height, padding } = PLOT;
  const xFormat = inferAxisFormat(xLabel);
  const yFormat = inferAxisFormat(yLabel);

  const visible = useMemo(() => {
    if (showTest) return points;
    return points.filter((point) => point.group !== "test");
  }, [points, showTest]);

  const scale = useMemo(
    () => createScale(visible.length ? visible : points, width, height, padding, boundary),
    [visible, points, width, height, padding, boundary],
  );

  const xTicks = useMemo(
    () => niceTicks(scale.xMin, scale.xMax, 5),
    [scale.xMin, scale.xMax],
  );
  const yTicks = useMemo(
    () => niceTicks(scale.yMin, scale.yMax, 5),
    [scale.yMin, scale.yMax],
  );

  const uniqueLabels = useMemo(() => {
    const set = new Set(points.map((p) => p.label));
    return [...set].sort((a, b) => a - b);
  }, [points]);

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <figcaption className="text-sm font-medium text-foreground">{title}</figcaption>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[280px]"
          role="img"
          aria-label={title}
        >
          <rect
            x={padding.left}
            y={padding.top}
            width={width - padding.left - padding.right}
            height={height - padding.top - padding.bottom}
            fill="var(--color-surface-muted)"
            opacity={0.35}
          />

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={scale.y(tick)}
                y2={scale.y(tick)}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={scale.y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted text-[10px]"
              >
                {formatAxisTick(tick, yFormat)}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                y1={padding.top}
                y2={height - padding.bottom}
                x1={scale.x(tick)}
                x2={scale.x(tick)}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={scale.x(tick)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-muted text-[10px]"
              >
                {formatAxisTick(tick, xFormat)}
              </text>
            </g>
          ))}

          {boundary && boundary.length >= 2 ? (
            <polyline
              fill="none"
              stroke="var(--color-foreground)"
              strokeWidth={2}
              strokeDasharray="6 4"
              points={boundary
                .map((p) => `${scale.x(p.x0)},${scale.y(p.x1)}`)
                .join(" ")}
            />
          ) : null}

          {visible.map((point, index) => {
            const isTest = point.group === "test";
            const isSelected = selectedIndex === index;
            const color = COLORS[point.label % COLORS.length]!;
            const opacity =
              dimTest && isTest
                ? 0.25
                : predictedProbs != null && predictedProbs[index] != null
                  ? 0.35 + 0.65 * predictedProbs[index]!
                  : 0.85;
            const wrong = point.correct === false;
            return (
              <circle
                key={point.id ?? `${point.x0}-${point.x1}-${index}`}
                cx={scale.x(point.x0)}
                cy={scale.y(point.x1)}
                r={isSelected ? 6 : wrong ? 5 : 3.5}
                fill={color}
                fillOpacity={opacity}
                stroke={wrong ? "var(--color-danger, #b33)" : isSelected ? "var(--color-foreground)" : "none"}
                strokeWidth={wrong || isSelected ? 1.5 : 0}
                className={onSelectIndex ? "cursor-pointer" : undefined}
                onClick={() => onSelectIndex?.(index)}
              />
            );
          })}

          <text
            x={(padding.left + width - padding.right) / 2}
            y={height - 12}
            textAnchor="middle"
            className="fill-muted text-[11px]"
          >
            {xLabel}
          </text>
          <text
            x={16}
            y={(padding.top + height - padding.bottom) / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${(padding.top + height - padding.bottom) / 2})`}
            className="fill-muted text-[11px]"
          >
            {yLabel}
          </text>
        </svg>
      </div>
      <ul className="flex flex-wrap gap-3 text-xs text-muted">
        {uniqueLabels.map((label) => (
          <li key={label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: COLORS[label % COLORS.length] }}
            />
            {classNames[label] ?? `Classe ${label}`}
          </li>
        ))}
        {boundary ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed border-foreground" />
            Fronteira de decisão
          </li>
        ) : null}
      </ul>
    </figure>
  );
}

function createScale(
  points: ClassPoint[],
  width: number,
  height: number,
  padding: typeof PLOT.padding,
  boundary: { x0: number; x1: number }[] | null,
) {
  const xs = [
    ...points.map((p) => p.x0),
    ...(boundary?.map((p) => p.x0) ?? []),
  ];
  const ys = [
    ...points.map((p) => p.x1),
    ...(boundary?.map((p) => p.x1) ?? []),
  ];
  let xMin = Math.min(...xs);
  let xMax = Math.max(...xs);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (!Number.isFinite(xMin)) {
    xMin = 0;
    xMax = 1;
    yMin = 0;
    yMax = 1;
  }
  const xPad = (xMax - xMin) * 0.08 || 1;
  const yPad = (yMax - yMin) * 0.08 || 1;
  xMin -= xPad;
  xMax += xPad;
  yMin -= yPad;
  yMax += yPad;

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    x: (v: number) => padding.left + ((v - xMin) / (xMax - xMin)) * innerW,
    y: (v: number) => padding.top + ((yMax - v) / (yMax - yMin)) * innerH,
  };
}
