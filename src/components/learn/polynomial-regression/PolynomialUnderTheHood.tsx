"use client";

import { UnderTheHood } from "@/components/ui/UnderTheHood";
import {
  describeFeatures,
  formatPolynomialFormula,
  type PolynomialModel,
} from "@/lib/ml";
import { formatCompact, formatNumber } from "@/lib/learning/linear-regression/format";

type Props = {
  model: PolynomialModel | null;
  trainMse?: number | null;
  validationMse?: number | null;
  trainMae?: number | null;
  validationMae?: number | null;
};

export function PolynomialUnderTheHood({
  model,
  trainMse,
  validationMse,
  trainMae,
  validationMae,
}: Props) {
  if (!model) return null;

  return (
    <UnderTheHood title="Por baixo do capô">
      <div className="space-y-3">
        <p>
          Grau <span className="font-mono text-foreground">{model.degree}</span>.
          Características geradas (com z = x escalado para [-1, 1]):
        </p>
        <p className="font-mono text-xs text-foreground sm:text-sm">
          {describeFeatures(model.degree).join(", ")}
        </p>
        <p className="font-mono text-xs text-foreground sm:text-sm">
          {formatPolynomialFormula(model)}
        </p>
        <p>
          O ajuste usa a Normal Equation sobre a matriz de características
          polinomiais Φ.
        </p>
        <ul className="space-y-1 font-mono text-xs">
          {model.coefficients.map((coef, index) => (
            <li key={index}>
              θ{index} = {formatNumber(coef, 4)}
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          {trainMse != null ? (
            <div>
              <dt className="text-muted">MSE treino</dt>
              <dd className="font-mono text-foreground">
                {formatCompact(trainMse)}
              </dd>
            </div>
          ) : null}
          {validationMse != null ? (
            <div>
              <dt className="text-muted">MSE validação</dt>
              <dd className="font-mono text-foreground">
                {formatCompact(validationMse)}
              </dd>
            </div>
          ) : null}
          {trainMae != null ? (
            <div>
              <dt className="text-muted">MAE treino</dt>
              <dd className="font-mono text-foreground">
                {formatCompact(trainMae)}
              </dd>
            </div>
          ) : null}
          {validationMae != null ? (
            <div>
              <dt className="text-muted">MAE validação</dt>
              <dd className="font-mono text-foreground">
                {formatCompact(validationMae)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </UnderTheHood>
  );
}
