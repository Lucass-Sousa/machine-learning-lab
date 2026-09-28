"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import type {
  ValidationReport,
  ValidationRequest,
} from "@/lib/python-reference/compare";
import { formatCompact, formatNumber } from "@/lib/learning/linear-regression/format";
import { cn } from "@/lib/utils/cn";

type PythonValidationPanelProps = {
  buildRequest: () => ValidationRequest | null;
  className?: string;
};

export function PythonValidationPanel({
  buildRequest,
  className,
}: PythonValidationPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const panelId = useId();

  async function runValidation() {
    const payload = buildRequest();
    if (!payload) {
      setReport({
        ok: false,
        available: false,
        message: "Não há dados suficientes para validar neste momento.",
      });
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/validate/linear-regression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as ValidationReport;
      setReport(json);
    } catch (error) {
      setReport({
        ok: false,
        available: false,
        error: error instanceof Error ? error.message : "Erro de rede",
        message:
          "Não foi possível contactar o validador. O lab continua funcionando sem Python.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span>✓ Validação Python</span>
        <span className="font-mono text-xs text-muted">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-border px-4 py-4">
          <p className="text-sm leading-relaxed text-muted">
            Compara os resultados do ML Lab com a implementação de referência em
            Python (NumPy). Só roda quando você pedir — a interface principal
            não depende disso.
          </p>

          <div className="mt-4">
            <Button onClick={runValidation} disabled={loading}>
              {loading ? "Validando…" : "Validar com Python"}
            </Button>
          </div>

          {report ? <ValidationResult report={report} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ValidationResult({ report }: { report: ValidationReport }) {
  if (report.available === false) {
    return (
      <div className="mt-4 rounded-md border border-border bg-surface-muted/50 px-3 py-3 text-sm text-muted">
        <p>{report.message ?? "Python indisponível neste ambiente."}</p>
        {report.error ? (
          <p className="mt-2 font-mono text-xs">{report.error}</p>
        ) : null}
      </div>
    );
  }

  const consistent = Boolean(report.consistent);

  return (
    <div className="mt-4 space-y-3">
      <div
        className={cn(
          "rounded-md px-3 py-3 text-sm font-medium",
          consistent
            ? "border border-accent/30 bg-accent-soft text-accent"
            : "border border-data/40 bg-data-soft text-data",
        )}
      >
        {consistent
          ? "✓ Resultados consistentes dentro da tolerância"
          : "⚠ Diferença encontrada — resultados fora da tolerância esperada"}
      </div>

      <ul className="space-y-2">
        {(report.comparisons ?? []).map((item) => (
          <li
            key={item.name}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground">{item.name}</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  item.consistent ? "text-accent" : "text-data",
                )}
              >
                {item.consistent ? "ok" : "diff"}
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted">
              <div>
                <dt>{item.leftLabel ?? "ML Lab"}</dt>
                <dd className="font-mono text-foreground">
                  {formatValue(item.lab)}
                </dd>
              </div>
              <div>
                <dt>{item.rightLabel ?? "Python"}</dt>
                <dd className="font-mono text-foreground">
                  {formatValue(item.python)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {report.tolerance != null ? (
        <p className="text-xs text-muted">
          Tolerância relativa: {formatNumber(report.tolerance, 8)}
        </p>
      ) : null}
    </div>
  );
}

function formatValue(value: number | boolean | string | null | undefined): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    return Number.isFinite(value) ? formatCompact(value) : String(value);
  }
  if (value == null) return "—";
  return String(value);
}
