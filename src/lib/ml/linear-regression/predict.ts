import type { LinearParameters } from "@/lib/ml/linear-regression/types";

export function predictLinear(
  x: number,
  parameters: LinearParameters,
): number {
  return parameters.intercept + parameters.slope * x;
}
