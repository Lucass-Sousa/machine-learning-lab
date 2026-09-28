"use client";

import { useMemo } from "react";

import { sigmoid } from "@/lib/ml/classification/activations";
import { cn } from "@/lib/utils/cn";

type SigmoidPlotProps = {
  /** Highlight a z value on the curve */
  zHighlight?: number | null;
  threshold?: number;
  className?: string;
  title?: string;
};

const PLOT = { width: 520, height: 280, pad: { t: 16, r: 16, b: 40, l: 48 } };

export function SigmoidPlot({
  zHighlight = null,
  threshold = 0.5,
  className,
  title = "Função sigmoide σ(z)",
}: SigmoidPlotProps) {
  const { width, height, pad } = PLOT;
  const zMin = -8;
  const zMax = 8;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const z = zMin + ((zMax - zMin) * i) / 80;
      const p = sigmoid(z);
      const x = pad.l + ((z - zMin) / (zMax - zMin)) * (width - pad.l - pad.r);
      const y = pad.t + (1 - p) * (height - pad.t - pad.b);
      pts.push(`${i === 0 ? "M" : "L"}${x},${y}`);
    }
    return pts.join(" ");
  }, [height, pad.b, pad.l, pad.r, pad.t, width]);

  const xOf = (z: number) =>
    pad.l + ((z - zMin) / (zMax - zMin)) * (width - pad.l - pad.r);
  const yOf = (p: number) => pad.t + (1 - p) * (height - pad.t - pad.b);

  const pHighlight =
    zHighlight != null ? sigmoid(zHighlight) : null;

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <figcaption className="text-sm font-medium text-foreground">{title}</figcaption>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[260px]">
          <line
            x1={pad.l}
            x2={width - pad.r}
            y1={yOf(threshold)}
            y2={yOf(threshold)}
            stroke="var(--color-border-strong)"
            strokeDasharray="4 3"
          />
          <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
          {zHighlight != null && pHighlight != null ? (
            <>
              <circle
                cx={xOf(zHighlight)}
                cy={yOf(pHighlight)}
                r={5}
                fill="var(--color-data)"
              />
              <text
                x={xOf(zHighlight) + 8}
                y={yOf(pHighlight) - 8}
                className="fill-foreground text-[11px] font-mono"
              >
                p={pHighlight.toFixed(2)}
              </text>
            </>
          ) : null}
          <text x={width / 2} y={height - 10} textAnchor="middle" className="fill-muted text-[11px]">
            z = θᵀx
          </text>
          <text
            x={14}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${height / 2})`}
            className="fill-muted text-[11px]"
          >
            p = σ(z)
          </text>
        </svg>
      </div>
      <p className="text-xs text-muted">
        Saída no intervalo 0 ≤ p ≤ 1. Linha tracejada: limiar atual ({threshold.toFixed(2)}).
      </p>
    </figure>
  );
}
