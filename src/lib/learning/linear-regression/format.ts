export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "∞";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }
  return formatNumber(value, 2);
}
