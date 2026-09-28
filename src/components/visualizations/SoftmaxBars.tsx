"use client";

import { cn } from "@/lib/utils/cn";

type SoftmaxBarsProps = {
  classNames: string[];
  probs: number[];
  scores?: number[];
  predictedIndex?: number;
  className?: string;
  title?: string;
};

export function SoftmaxBars({
  classNames,
  probs,
  scores,
  predictedIndex,
  className,
  title = "Probabilidades Softmax",
}: SoftmaxBarsProps) {
  const sum = probs.reduce((a, b) => a + b, 0);

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <figcaption className="text-sm font-medium text-foreground">{title}</figcaption>
      <ul className="flex flex-col gap-3">
        {classNames.map((name, index) => {
          const p = probs[index] ?? 0;
          const isBest = predictedIndex === index;
          return (
            <li key={name} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className={cn("font-medium", isBest && "text-accent")}>
                  {name}
                  {isBest ? " ← predição" : ""}
                </span>
                <span className="font-mono text-xs text-muted">
                  {scores ? `score ${scores[index]?.toFixed(2)} → ` : ""}
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300",
                    isBest ? "bg-accent" : "bg-data/70",
                  )}
                  style={{ width: `${Math.max(2, p * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="font-mono text-xs text-muted">
        Σ p ≈ {sum.toFixed(4)} (deve ser ≈ 1)
      </p>
    </figure>
  );
}
