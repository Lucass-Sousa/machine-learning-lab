"use client";

import { cn } from "@/lib/utils/cn";

type SliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
  hint?: string;
};

/**
 * Accessible range control prepared for future lab parameters.
 * Touch-friendly thumb and track sizing for mobile.
 */
export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 0.1,
  unit,
  disabled = false,
  onChange,
  hint,
}: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-muted">
          {value}
          {unit ? ` ${unit}` : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange?.(Number(event.target.value))}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-surface-muted",
          "[&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-soft",
          "[&::-webkit-slider-thumb]:transition-colors hover:[&::-webkit-slider-thumb]:bg-accent-hover",
          "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-surface-muted",
          "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent",
        )}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
