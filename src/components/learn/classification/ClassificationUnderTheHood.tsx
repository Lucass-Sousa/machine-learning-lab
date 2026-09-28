"use client";

import { UnderTheHood } from "@/components/ui/UnderTheHood";
import { formatNumber } from "@/lib/learning/linear-regression/format";
import type { LogisticModel } from "@/lib/ml/classification/logistic-regression";
import type { SoftmaxModel } from "@/lib/ml/classification/softmax";

type Props = {
  variant:
    | "sigmoid"
    | "threshold"
    | "train"
    | "logloss"
    | "regularization"
    | "softmax";
  model?: LogisticModel | null;
  softmaxModel?: SoftmaxModel | null;
  threshold?: number;
  exampleProb?: number | null;
  exampleLabel?: 0 | 1 | null;
};

export function ClassificationUnderTheHood({
  variant,
  model = null,
  softmaxModel = null,
  threshold = 0.5,
  exampleProb = null,
  exampleLabel = null,
}: Props) {
  return (
    <UnderTheHood title="Por baixo do capô">
      {variant === "sigmoid" ? (
        <div className="space-y-2">
          <p className="font-mono text-xs text-foreground sm:text-sm">
            p = hθ(x) = σ(θᵀx) = 1 / (1 + e^(−θᵀx))
          </p>
          <p>
            A combinação linear θᵀx pode ser qualquer número real. A sigmoide
            comprime esse valor para o intervalo [0, 1], interpretado como
            probabilidade da classe positiva.
          </p>
        </div>
      ) : null}

      {variant === "threshold" ? (
        <div className="space-y-2">
          <p>
            Regra de decisão (material / projeto): se p ≥ {formatNumber(threshold, 2)} →
            classe 1; se p &lt; {formatNumber(threshold, 2)} → classe 0.
            Empate em exatamente p = limiar cai na classe 1.
          </p>
          <p className="font-mono text-xs text-foreground">
            ŷ = 1[p ≥ τ]
          </p>
        </div>
      ) : null}

      {variant === "train" && model ? (
        <div className="space-y-2">
          <p>Parâmetros ajustados (features padronizadas internamente):</p>
          <ul className="font-mono text-xs text-foreground">
            {model.theta.map((t, i) => (
              <li key={i}>
                θ{i} = {formatNumber(t, 4)}
              </li>
            ))}
          </ul>
          <p>
            Regularização: {model.regularization.toUpperCase()} · C ={" "}
            {formatNumber(model.C, 2)}
          </p>
        </div>
      ) : null}

      {variant === "logloss" ? (
        <div className="space-y-2">
          <p className="font-mono text-xs text-foreground sm:text-sm">
            J = −(1/m) Σ [ y log(p) + (1−y) log(1−p) ]
          </p>
          <p>
            MSE da regressão linear não é a função de custo adequada aqui.
            Log Loss / entropia cruzada penaliza fortemente previsões erradas
            feitas com alta confiança.
          </p>
          {exampleProb != null && exampleLabel != null ? (
            <p className="font-mono text-xs text-foreground">
              Exemplo: y = {exampleLabel}, p = {formatNumber(exampleProb, 4)},
              contribuição ≈{" "}
              {formatNumber(
                exampleLabel === 1
                  ? -Math.log(Math.max(1e-12, exampleProb))
                  : -Math.log(Math.max(1e-12, 1 - exampleProb)),
                4,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {variant === "regularization" && model ? (
        <div className="space-y-2">
          <p>
            C pequeno → regularização forte; C grande → regularização fraca
            (convenção do material / sklearn).
          </p>
          <p>
            Atual: C = {formatNumber(model.C, 2)}, tipo ={" "}
            {model.regularization.toUpperCase()}.
          </p>
          <ul className="font-mono text-xs text-foreground">
            {model.theta.map((t, i) => (
              <li key={i}>
                θ{i} = {formatNumber(t, 4)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {variant === "softmax" && softmaxModel ? (
        <div className="space-y-2">
          <p>
            Cada classe tem um score linear. Softmax converte scores em
            probabilidades que somam 1. A classe predita é argmax(p).
          </p>
          <p className="font-mono text-xs text-foreground">
            p_k = e^(s_k) / Σⱼ e^(s_j)
          </p>
        </div>
      ) : null}
    </UnderTheHood>
  );
}
