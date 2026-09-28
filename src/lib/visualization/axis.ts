export type AxisValueFormat = "number" | "currency" | "compact";

/**
 * Choose a readable format from the axis label (pt-BR credit lab labels).
 */
export function inferAxisFormat(label?: string): AxisValueFormat {
  if (!label) return "number";
  const normalized = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (
    normalized.includes("renda") ||
    normalized.includes("emprestimo") ||
    normalized.includes("valor")
  ) {
    return "currency";
  }

  return "number";
}

export function formatAxisTick(
  value: number,
  format: AxisValueFormat = "number",
): string {
  if (!Number.isFinite(value)) return "—";

  if (format === "currency") {
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (format === "compact") {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  const abs = Math.abs(value);
  if (abs >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (Number.isInteger(value) || abs >= 100) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: abs >= 10 ? 1 : 2,
  }).format(value);
}

/**
 * Generate "nice" tick values across [min, max].
 */
export function niceTicks(min: number, max: number, targetCount = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) {
    const pad = Math.abs(min) || 1;
    return niceTicks(min - pad, max + pad, targetCount);
  }

  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const span = high - low;
  const step = niceStep(span / Math.max(targetCount - 1, 1));
  const start = Math.ceil(low / step) * step;
  const end = Math.floor(high / step) * step;
  const ticks: number[] = [];

  for (let value = start; value <= end + step * 0.5; value += step) {
    const rounded = roundToStep(value, step);
    if (rounded >= low - step * 1e-6 && rounded <= high + step * 1e-6) {
      ticks.push(rounded);
    }
  }

  if (ticks.length === 0) {
    return [low, high];
  }

  return ticks;
}

function niceStep(rough: number): number {
  const exponent = Math.floor(Math.log10(Math.abs(rough) || 1));
  const fraction = rough / 10 ** exponent;
  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

function roundToStep(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(Math.abs(step) || 1)) + 2);
  return Number(value.toFixed(Math.min(decimals, 8)));
}
