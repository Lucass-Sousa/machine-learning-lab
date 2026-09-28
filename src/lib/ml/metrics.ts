import type { Residual } from "@/lib/ml/linear-regression/types";

export function meanAbsoluteError(residuals: Residual[]): number {
  if (residuals.length === 0) return 0;
  const total = residuals.reduce(
    (sum, residual) => sum + Math.abs(residual.error),
    0,
  );
  return total / residuals.length;
}

export function meanSquaredError(residuals: Residual[]): number {
  if (residuals.length === 0) return 0;
  const total = residuals.reduce(
    (sum, residual) => sum + residual.error ** 2,
    0,
  );
  return total / residuals.length;
}
