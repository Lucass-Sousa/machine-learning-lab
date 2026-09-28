"use client";

import { Slider } from "@/components/ui/Slider";
import type { Dataset } from "@/lib/datasets";
import { cn } from "@/lib/utils/cn";

type LabControlsProps = {
  dataset: Dataset;
  slope: number;
  intercept: number;
  onSlopeChange: (value: number) => void;
  onInterceptChange: (value: number) => void;
  className?: string;
};

/**
 * Control panel scaffold.
 * Dataset is fixed for now — user import is intentionally unavailable.
 */
export function LabControls({
  dataset,
  slope,
  intercept,
  onSlopeChange,
  onInterceptChange,
  className,
}: LabControlsProps) {
  const careers = Array.from(
    new Set(dataset.records.map((record) => record.career)),
  ).sort();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Base de dados</p>
        <div className="rounded-md border border-border bg-surface px-3 py-3">
          <p className="text-sm font-medium text-foreground">{dataset.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {dataset.description}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <dt className="text-muted">Registros</dt>
              <dd className="font-mono tabular-nums text-foreground">
                {dataset.records.length}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Eixos</dt>
              <dd className="text-foreground">
                {dataset.xLabel} × {dataset.yLabel}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Cursos</dt>
              <dd className="mt-0.5 text-foreground">{careers.join(", ")}</dd>
            </div>
          </dl>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Nesta etapa a base é fixa. Importação pelo usuário virá depois.
        </p>
      </div>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 text-sm font-medium text-foreground">
          Parâmetros do modelo
        </legend>
        <Slider
          id="slope"
          label="Inclinação (m)"
          value={slope}
          min={-5}
          max={5}
          step={0.1}
          onChange={onSlopeChange}
          hint="Controle preparado para regressão linear."
        />
        <Slider
          id="intercept"
          label="Intercepto (b)"
          value={intercept}
          min={-10}
          max={10}
          step={0.1}
          onChange={onInterceptChange}
          hint="Ajuste visual — o fit automático virá depois."
        />
      </fieldset>

      <div className="rounded-md bg-surface-muted/70 px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Status
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          Dataset de gamificação carregado. Algoritmos de ML ainda não
          conectados.
        </p>
      </div>
    </div>
  );
}
