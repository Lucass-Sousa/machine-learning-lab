"use client";

import Link from "next/link";

import type { FreeLabState } from "@/components/laboratory/useFreeLab";
import { LabSidebar } from "@/components/lab/LabSidebar";
import { LabToolbar } from "@/components/lab/LabToolbar";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import type { NumericVariableKey } from "@/lib/data/credit/observations";
import { cn } from "@/lib/utils/cn";

type FreeLabControlsProps = {
  lab: FreeLabState;
};

const MODEL_OPTIONS = [
  {
    id: "linear-regression" as const,
    label: "Regressão Linear",
    hint: "Reta · base de crédito",
  },
  {
    id: "polynomial-regression" as const,
    label: "Regressão Polinomial",
    hint: "Curva · base de crédito",
  },
  {
    id: "logistic-regression" as const,
    label: "Regressão Logística",
    hint: "Classes · base de classificação",
  },
];

export function FreeLabControls({ lab }: FreeLabControlsProps) {
  return (
    <LabSidebar title="Controles" className="order-2 border-t lg:border-t-0">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Modelo</p>
          <div className="flex flex-col gap-2">
            {MODEL_OPTIONS.map((option) => {
              const active = lab.modelKind === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => lab.setModel(option.id)}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-left transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    active
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Base de dados</p>
          <div className="rounded-md border border-border bg-surface px-3 py-3">
            <p className="text-sm font-medium text-foreground">
              {lab.datasetMeta.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {lab.datasetMeta.description}
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted">
              {lab.datasetMeta.source} · sessão {lab.pointCount} pts
              {" · "}treino {lab.trainCount} / teste {lab.testCount}
            </p>
          </div>
        </section>

        {!lab.isClassification ? (
          <section className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Variáveis</p>
            <VariableSelect
              id="free-lab-x"
              label="Eixo X (entrada)"
              value={lab.xKey}
              options={lab.selectableVariables.map((v) => ({
                key: v.key as NumericVariableKey,
                label: v.label,
              }))}
              exclude={lab.yKey}
              onChange={(key) => lab.setVariables(key, lab.yKey)}
            />
            <VariableSelect
              id="free-lab-y"
              label="Eixo Y (alvo)"
              value={lab.yKey}
              options={lab.selectableVariables.map((v) => ({
                key: v.key as NumericVariableKey,
                label: v.label,
              }))}
              exclude={lab.xKey}
              onChange={(key) => lab.setVariables(lab.xKey, key)}
            />
          </section>
        ) : (
          <section className="rounded-md border border-border bg-surface-muted/50 px-3 py-3 text-sm text-muted">
            <p className="font-medium text-foreground">Features fixas (binário)</p>
            <p className="mt-1">
              {lab.featureLabelsBinary[0]} × {lab.featureLabelsBinary[1]}
            </p>
            <p className="mt-1 text-xs">
              Alvo nativo: <span className="font-mono">aprovado</span>
            </p>
          </section>
        )}

        {lab.modelKind === "polynomial-regression" ? (
          <Slider
            id="degree"
            label="Grau do polinômio"
            value={lab.degree}
            min={1}
            max={8}
            step={1}
            onChange={lab.setDegree}
            hint="Graus altos podem overfitar — observe o MSE de teste."
          />
        ) : null}

        {lab.isClassification ? (
          <>
            <Slider
              id="threshold"
              label="Limiar τ"
              value={lab.threshold}
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={lab.setThreshold}
              displayValue={lab.threshold.toFixed(2)}
            />
            <Slider
              id="C"
              label="Regularização C"
              value={lab.C}
              min={0.05}
              max={10}
              step={0.05}
              onChange={lab.setC}
              displayValue={lab.C.toFixed(2)}
              hint="C pequeno → regularização forte; C grande → fraca."
            />
          </>
        ) : null}

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Exibição</p>
          <Toggle
            id="show-test"
            label="Mostrar dados de teste"
            checked={lab.showTest}
            onChange={lab.setShowTest}
          />
          {!lab.isClassification ? (
            <Toggle
              id="show-residuals"
              label="Mostrar resíduos"
              checked={lab.showResiduals}
              onChange={lab.setShowResiduals}
            />
          ) : null}
        </section>

        {lab.metricsSummary.length > 0 ? (
          <section>
            <p className="text-sm font-medium text-foreground">Métricas</p>
            <dl className="mt-2 grid grid-cols-2 gap-2">
              {lab.metricsSummary.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-border bg-surface px-2.5 py-2"
                >
                  <dt className="text-[11px] text-muted">{metric.label}</dt>
                  <dd className="font-mono text-sm text-foreground">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={lab.reset}>
            Resetar
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            ← Voltar para a Home
          </Link>
        </div>
      </div>
    </LabSidebar>
  );
}

function VariableSelect({
  id,
  label,
  value,
  options,
  exclude,
  onChange,
}: {
  id: string;
  label: string;
  value: NumericVariableKey;
  options: Array<{ key: NumericVariableKey; label: string }>;
  exclude: NumericVariableKey;
  onChange: (key: NumericVariableKey) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as NumericVariableKey)
        }
        className="min-h-11 rounded-md border border-border bg-surface px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {options.map((option) => (
          <option
            key={option.key}
            value={option.key}
            disabled={option.key === exclude}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-surface px-3"
    >
      <span className="text-sm text-foreground">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
    </label>
  );
}
