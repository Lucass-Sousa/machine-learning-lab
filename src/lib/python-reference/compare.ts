export type NumericComparison = {
  name: string;
  lab: number | boolean | string | null | undefined;
  python: number | boolean | string | null | undefined;
  leftLabel?: string;
  rightLabel?: string;
  delta?: number | null;
  consistent: boolean;
};

export type ValidationReport = {
  ok: boolean;
  available?: boolean;
  algorithm?: string;
  consistent?: boolean;
  tolerance?: number;
  comparisons?: NumericComparison[];
  python?: Record<string, unknown>;
  sklearn?: Record<string, unknown> | null;
  error?: string;
  message?: string;
};

export function nearlyEqual(
  a: number,
  b: number,
  tolerance = 1e-6,
): boolean {
  if (!Number.isFinite(a) && !Number.isFinite(b)) {
    return true;
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }
  return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
}

export type ValidationRequest = {
  algorithm:
    | "normal_equation"
    | "metrics"
    | "gradient_descent"
    | "normalize"
    | "split";
  points: Array<{ x: number; y: number }>;
  options?: Record<string, number | boolean | number[]>;
  lab: Record<string, number | boolean | number[] | undefined>;
  tolerance?: number;
};
