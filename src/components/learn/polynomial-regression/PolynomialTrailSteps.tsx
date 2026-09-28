"use client";

import Link from "next/link";

import {
  StepActions,
  StepHeader,
  StepShell,
} from "@/components/learn/linear-regression/StepChrome";
import { PolynomialUnderTheHood } from "@/components/learn/polynomial-regression/PolynomialUnderTheHood";
import type { PolynomialTrailState } from "@/components/learn/polynomial-regression/usePolynomialRegressionTrail";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { LearningCurveChart } from "@/components/visualizations/LearningCurveChart";
import { ScatterPlot } from "@/components/visualizations/ScatterPlot";
import { SELECTABLE_VARIABLES } from "@/lib/data/credit/schema";
import type { NumericVariableKey } from "@/lib/data/credit/observations";
import { formatCompact } from "@/lib/learning/linear-regression/format";
import { predictPolynomial } from "@/lib/ml";
import { cn } from "@/lib/utils/cn";

type Props = { trail: PolynomialTrailState };

export function PolynomialTrailSteps({ trail }: Props) {
  switch (trail.stepId) {
    case "intro":
      return <IntroStep trail={trail} />;
    case "concept":
      return <ConceptStep trail={trail} />;
    case "degree":
      return <DegreeStep trail={trail} />;
    case "underfit":
      return <UnderfitStep trail={trail} />;
    case "adequate":
      return <AdequateStep trail={trail} />;
    case "overfit":
      return <OverfitStep trail={trail} />;
    case "learning":
      return <LearningStep trail={trail} />;
    case "lab":
      return <LabStep trail={trail} />;
    case "challenge":
      return <ChallengeStep trail={trail} />;
    default:
      return null;
  }
}

function MetricPair({
  trainMse,
  validationMse,
  trainMae,
  validationMae,
  holdoutLabel = "validação",
}: {
  trainMse?: number | null;
  validationMse?: number | null;
  trainMae?: number | null;
  validationMae?: number | null;
  holdoutLabel?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <Metric label="MSE treino" value={trainMse} />
      <Metric label={`MSE ${holdoutLabel}`} value={validationMse} />
      <Metric label="MAE treino" value={trainMae} />
      <Metric label={`MAE ${holdoutLabel}`} value={validationMae} />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums">
        {value != null && Number.isFinite(value) ? formatCompact(value) : "—"}
      </p>
    </div>
  );
}

function DegreeSlider({
  value,
  onChange,
  min = 1,
  max = 15,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Slider
      id="poly-degree"
      label="Grau do polinômio"
      value={value}
      min={min}
      max={max}
      step={1}
      onChange={onChange}
      hint="Ao mudar o grau, curva e métricas são recalculadas de verdade."
    />
  );
}

function VariablePickers({ trail }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <VariablePicker
        title="X"
        value={trail.xKey}
        exclude={trail.yKey}
        onChange={(next) => trail.setVariables(next, trail.yKey)}
      />
      <VariablePicker
        title="Y"
        value={trail.yKey}
        exclude={trail.xKey}
        onChange={(next) => trail.setVariables(trail.xKey, next)}
      />
    </div>
  );
}

function VariablePicker({
  title,
  value,
  exclude,
  onChange,
}: {
  title: string;
  value: NumericVariableKey;
  exclude?: NumericVariableKey;
  onChange: (value: NumericVariableKey) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="grid gap-2">
        {SELECTABLE_VARIABLES.map((variable) => {
          const key = variable.key as NumericVariableKey;
          const disabled = key === exclude;
          const selected = key === value;
          return (
            <button
              key={variable.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={cn(
                "min-h-11 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              {variable.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntroStep({ trail }: Props) {
  const {
    trainScatter,
    linearModel,
    xLabel,
    yLabel,
    goNext,
  } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="① Quando uma reta não é suficiente?"
        title="Comece olhando os dados e uma regressão linear"
        description={
          <p>
            Pontos reais, reta ajustada e resíduos. Alguns relacionamentos não
            cabem bem em uma reta — a próxima etapa mostra como transformar as
            características.
          </p>
        }
      />

      <ScatterPlot
        points={trainScatter}
        parameters={linearModel}
        showResiduals
        xLabel={xLabel}
        yLabel={yLabel}
        title="Regressão linear sobre os dados"
      />

      <StepActions onNext={goNext} nextLabel="O que é regressão polinomial? →" />
    </StepShell>
  );
}

function ConceptStep({ trail }: Props) {
  const { goBack, goNext, setDegree } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="② O que é Regressão Polinomial?"
        title="Transformamos x em novas características"
        description={
          <>
            <p>
              A partir de <span className="font-mono">x</span> geramos{" "}
              <span className="font-mono">z, z², z³, …, z^d</span> (com escala)
              e ajustamos um modelo linear nessas características.
            </p>
            <p>
              Grau 1 ≈ reta. Graus maiores permitem curvas mais flexíveis.
            </p>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((degree) => (
          <button
            key={degree}
            type="button"
            onClick={() => {
              setDegree(degree);
              goNext();
            }}
            className="rounded-lg border border-border bg-surface px-4 py-5 text-left transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <p className="font-display text-lg font-semibold">Grau {degree}</p>
            <p className="mt-2 text-sm text-muted">
              {degree === 1
                ? "Reta"
                : degree === 2
                  ? "Parábola / curvatura suave"
                  : "Mais flexível"}
            </p>
          </button>
        ))}
      </div>

      <StepActions
        onBack={goBack}
        onNext={() => {
          setDegree(2);
          goNext();
        }}
        nextLabel="Controlar o grau →"
      />
    </StepShell>
  );
}

function DegreeStep({ trail }: Props) {
  const {
    degree,
    setDegree,
    trainScatter,
    polyModel,
    polyEval,
    curveFor,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const curve = curveFor(polyModel);
  const predictedYs = polyModel
    ? trainScatter.map((point) => predictPolynomial(point.x, polyModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="③ Controle o grau"
        title="Altere o grau e observe a curva"
        description={
          <p>
            Cada mudança recalcula o modelo real, as previsões e os erros de
            treino e validação.
          </p>
        }
      />

      <DegreeSlider value={degree} onChange={setDegree} max={12} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={trainScatter}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <MetricPair
          trainMse={polyEval.train?.mse}
          validationMse={polyEval.validation?.mse}
          trainMae={polyEval.train?.mae}
          validationMae={polyEval.validation?.mae}
        />
      </div>

      <PolynomialUnderTheHood
        model={polyModel}
        trainMse={polyEval.train?.mse}
        validationMse={polyEval.validation?.mse}
        trainMae={polyEval.train?.mae}
        validationMae={polyEval.validation?.mae}
      />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Ver underfitting →" />
    </StepShell>
  );
}

function UnderfitStep({ trail }: Props) {
  const {
    trainScatter,
    underfitModel,
    underfitEval,
    curveFor,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const curve = curveFor(underfitModel);
  const predictedYs = underfitModel
    ? trainScatter.map((point) => predictPolynomial(point.x, underfitModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="④ Underfitting"
        title="Grau baixo demais"
        description={
          <p>
            O modelo é simples demais para representar adequadamente o padrão
            dos dados. Observe a curva e os erros — eles não são escondidos.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={trainScatter}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Grau fixo nesta etapa:{" "}
            <span className="font-mono text-foreground">1</span>
          </p>
          <MetricPair
            trainMse={underfitEval.train?.mse}
            validationMse={underfitEval.validation?.mse}
            trainMae={underfitEval.train?.mae}
            validationMae={underfitEval.validation?.mae}
          />
        </div>
      </div>

      <PolynomialUnderTheHood
        model={underfitModel}
        trainMse={underfitEval.train?.mse}
        validationMse={underfitEval.validation?.mse}
      />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Buscar um ajuste →" />
    </StepShell>
  );
}

function AdequateStep({ trail }: Props) {
  const {
    degree,
    setDegree,
    trainScatter,
    polyModel,
    polyEval,
    curveFor,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const curve = curveFor(polyModel);
  const predictedYs = polyModel
    ? trainScatter.map((point) => predictPolynomial(point.x, polyModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑤ Ajuste adequado"
        title="Experimente graus intermediários"
        description={
          <p>
            Não existe um grau universalmente correto. O laboratório calcula os
            resultados reais para os dados e métricas escolhidos — sem declarar
            automaticamente “o melhor”.
          </p>
        }
      />

      <DegreeSlider value={degree} onChange={setDegree} min={1} max={8} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={trainScatter}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Grau atual:{" "}
            <span className="font-mono text-foreground">{degree}</span>
          </p>
          <MetricPair
            trainMse={polyEval.train?.mse}
            validationMse={polyEval.validation?.mse}
            trainMae={polyEval.train?.mae}
            validationMae={polyEval.validation?.mae}
          />
        </div>
      </div>

      <PolynomialUnderTheHood
        model={polyModel}
        trainMse={polyEval.train?.mse}
        validationMse={polyEval.validation?.mse}
        trainMae={polyEval.train?.mae}
        validationMae={polyEval.validation?.mae}
      />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Ver overfitting →" />
    </StepShell>
  );
}

function OverfitStep({ trail }: Props) {
  const {
    trainScatter,
    overfitModel,
    overfitEval,
    curveFor,
    xLabel,
    yLabel,
    setDegree,
    goBack,
    goNext,
  } = trail;

  const curve = curveFor(overfitModel);
  const predictedYs = overfitModel
    ? trainScatter.map((point) => predictPolynomial(point.x, overfitModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑥ Overfitting"
        title="Complexidade excessiva"
        description={
          <p>
            Com grau elevado a curva pode se colar demais ao treino. Observe se
            o erro de treino fica baixo enquanto o de validação sobe — quando
            isso ocorrer nos dados.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={trainScatter}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Grau desta demonstração:{" "}
            <span className="font-mono text-foreground">
              {overfitModel?.degree ?? "—"}
            </span>
          </p>
          <MetricPair
            trainMse={overfitEval.train?.mse}
            validationMse={overfitEval.validation?.mse}
            trainMae={overfitEval.train?.mae}
            validationMae={overfitEval.validation?.mae}
          />
          {overfitEval.train &&
          overfitEval.validation &&
          overfitEval.validation.mse > overfitEval.train.mse * 1.5 ? (
            <p className="rounded-md border border-data/30 bg-data-soft px-3 py-2 text-sm text-data">
              Padrão observado: erro de treino relativamente baixo com validação
              maior.
            </p>
          ) : (
            <p className="text-sm text-muted">
              Se a diferença não for grande nestes dados, isso também é um
              resultado real — não forçamos overfitting.
            </p>
          )}
        </div>
      </div>

      <PolynomialUnderTheHood
        model={overfitModel}
        trainMse={overfitEval.train?.mse}
        validationMse={overfitEval.validation?.mse}
      />

      <StepActions
        onBack={goBack}
        onNext={() => {
          if (overfitModel) setDegree(overfitModel.degree);
          goNext();
        }}
        nextLabel="Curvas de aprendizado →"
      />
    </StepShell>
  );
}

function LearningStep({ trail }: Props) {
  const { degree, setDegree, learningCurve, goBack, goNext } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑦ Curvas de aprendizado"
        title="Erro × quantidade de exemplos"
        description={
          <p>
            Eixo X: tamanho do treino. Eixo Y: MSE. Compare treino e validação
            conforme mais dados entram — ligação visual com underfit, overfit e
            generalização.
          </p>
        }
      />

      <DegreeSlider value={degree} onChange={setDegree} max={10} />
      <LearningCurveChart points={learningCurve} />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Experimentar livremente →" />
    </StepShell>
  );
}

function LabStep({ trail }: Props) {
  const {
    degree,
    setDegree,
    trainRatio,
    setTrainRatio,
    validationRatio,
    setValidationRatio,
    trainScatter,
    polyModel,
    polyEval,
    curveFor,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const curve = curveFor(polyModel);
  const predictedYs = polyModel
    ? trainScatter.map((point) => predictPolynomial(point.x, polyModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑧ Experimente livremente"
        title="Grau, variáveis e divisão"
        description={
          <p>
            O gráfico permanece no centro. Mude o grau, X/Y e as proporções —
            tudo recalcula de verdade.
          </p>
        }
      />

      <VariablePickers trail={trail} />
      <DegreeSlider value={degree} onChange={setDegree} max={15} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          id="train-ratio"
          label="Proporção de treino"
          value={Number((trainRatio * 100).toFixed(0))}
          min={40}
          max={80}
          step={5}
          unit="%"
          onChange={(value) => setTrainRatio(value / 100)}
        />
        <Slider
          id="val-ratio"
          label="Proporção de validação"
          value={Number((validationRatio * 100).toFixed(0))}
          min={10}
          max={30}
          step={5}
          unit="%"
          onChange={(value) => setValidationRatio(value / 100)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={trainScatter}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <MetricPair
          trainMse={polyEval.train?.mse}
          validationMse={polyEval.validation?.mse}
          trainMae={polyEval.train?.mae}
          validationMae={polyEval.validation?.mae}
        />
      </div>

      <PolynomialUnderTheHood
        model={polyModel}
        trainMse={polyEval.train?.mse}
        validationMse={polyEval.validation?.mse}
        trainMae={polyEval.train?.mae}
        validationMae={polyEval.validation?.mae}
      />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Desafio de generalização →" />
    </StepShell>
  );
}

function ChallengeStep({ trail }: Props) {
  const {
    challengeDegree,
    setChallengeDegree,
    scatterPoints,
    challengeModel,
    challengeEval,
    curveFor,
    revealTest,
    setRevealTest,
    hasTested,
    setHasTested,
    diagnosis,
    xLabel,
    yLabel,
    split,
    goBack,
  } = trail;

  const visiblePoints = revealTest
    ? scatterPoints
    : scatterPoints.filter((point) => point.group !== "test");

  const curve = curveFor(challengeModel);
  const predictedYs = challengeModel
    ? visiblePoints.map((point) => predictPolynomial(point.x, challengeModel))
    : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑨ Desafio — Generalização"
        title="Escolha o grau. Depois teste."
        description={
          <p>
            Os dados de teste ficam ocultos até você clicar em TESTAR MODELO.
            Não há resposta antecipada.
          </p>
        }
      />

      <DegreeSlider
        value={challengeDegree}
        onChange={(value) => {
          setChallengeDegree(value);
          setRevealTest(false);
          setHasTested(false);
        }}
        max={15}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints}
          curve={curve}
          predictedYs={predictedYs}
          showResiduals={revealTest}
          showTest={revealTest}
          dimTest={!revealTest}
          xLabel={xLabel}
          yLabel={yLabel}
          title="Desafio de generalização"
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Treino: {split.train.length} · Validação: {split.validation.length}{" "}
            · Teste: {split.test.length}
          </p>
          <Button
            onClick={() => {
              setRevealTest(true);
              setHasTested(true);
            }}
          >
            TESTAR MODELO
          </Button>

          {hasTested ? (
            <>
              <MetricPair
                trainMse={challengeEval.train?.mse}
                validationMse={challengeEval.test?.mse}
                trainMae={challengeEval.train?.mae}
                validationMae={challengeEval.test?.mae}
                holdoutLabel="teste"
              />
              <p className="text-xs text-muted">
                Conjunto de teste revelado após o clique.
              </p>
              {diagnosis ? (
                <p className="rounded-md border border-border bg-surface px-3 py-3 text-sm text-foreground">
                  Interpretação sugerida pelos números:{" "}
                  <span className="font-medium">
                    {diagnosis === "overfitting"
                      ? "possível overfitting"
                      : diagnosis === "underfitting"
                        ? "possível underfitting"
                        : diagnosis === "adequate"
                          ? "ajuste razoável / generalização estável"
                          : "inconclusivo com estes limiares"}
                  </span>
                  . Use o gráfico e as métricas para discordar se fizer sentido.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">
              Teste oculto. Escolha o grau e treine observando só treino/validação
              no gráfico.
            </p>
          )}
        </div>
      </div>

      <PolynomialUnderTheHood
        model={challengeModel}
        trainMse={challengeEval.train?.mse}
        validationMse={
          hasTested ? challengeEval.test?.mse : challengeEval.validation?.mse
        }
      />

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={goBack}>
          Voltar
        </Button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-surface-muted"
        >
          Voltar às trilhas
        </Link>
      </div>
    </StepShell>
  );
}
