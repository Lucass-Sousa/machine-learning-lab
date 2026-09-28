"use client";

import { useMemo } from "react";

import type { LearningCurvePoint } from "@/lib/ml";
import { cn } from "@/lib/utils/cn";

type LearningCurveChartProps = {
  points: LearningCurvePoint[];
  className?: string;
  title?: string;
};

export function LearningCurveChart({
  points,
  className,
  title = "Curvas de aprendizado",
}: LearningCurveChartProps) {
  const width = 640;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 44, left: 56 };

  const geometry = useMemo(() => {
    if (points.length === 0) return null;
    const xs = points.map((point) => point.trainSize);
    const ys = [
      ...points.map((point) => point.trainMse),
      ...points.map((point) => point.validationMse),
    ].filter((value) => Number.isFinite(value));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const toX = (x: number) =>
      padding.left + ((x - minX) / rangeX) * plotW;
    const toY = (y: number) =>
      height - padding.bottom - ((y - minY) / rangeY) * plotH;

    const trainPath = points
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${toX(point.trainSize)} ${toY(point.trainMse)}`;
      })
      .join(" ");
    const valPath = points
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${toX(point.trainSize)} ${toY(point.validationMse)}`;
      })
      .join(" ");

    return { trainPath, valPath };
  }, [points]);

  if (!geometry) {
    return (
      <div
        className={cn(
          "flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-lab-grid text-sm text-muted",
          className,
        )}
      >
        Sem dados suficientes para a curva de aprendizado.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-lab-grid",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-full min-h-[240px] w-full sm:min-h-[300px]"
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
        <text
          x={(padding.left + width - padding.right) / 2}
          y={height - 10}
          textAnchor="middle"
          className="fill-muted text-[11px]"
        >
          Quantidade de exemplos no treino
        </text>
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${height / 2})`}
          className="fill-muted text-[11px]"
        >
          Erro (MSE)
        </text>
        <path
          d={geometry.trainPath}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.5"
        />
        <path
          d={geometry.valPath}
          fill="none"
          className="stroke-data"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />
      </svg>
      <div className="flex flex-wrap gap-4 border-t border-border px-4 py-2 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 bg-accent" /> Treino
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-data" />{" "}
          Validação
        </span>
      </div>
    </div>
  );
}
