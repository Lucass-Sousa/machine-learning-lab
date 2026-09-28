"use client";

import Link from "next/link";

import {
  StepActions,
  StepHeader,
  StepShell,
} from "@/components/learn/linear-regression/StepChrome";
import type { TrailState } from "@/components/learn/linear-regression/useLinearRegressionTrail";
import { PythonDepthSection } from "@/components/learn/python/PythonDepthSection";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { UnderTheHood } from "@/components/ui/UnderTheHood";
import { ScatterPlot } from "@/components/visualizations/ScatterPlot";
import { SELECTABLE_VARIABLES } from "@/lib/data/credit/schema";
import type { NumericVariableKey } from "@/lib/data/credit/observations";
import { EXPLORATION_OPTIONS } from "@/lib/learning/linear-regression/steps";
import { formatCompact, formatNumber } from "@/lib/learning/linear-regression/format";
import { buildValidationRequestForStep } from "@/lib/python-reference/linear-regression/build-request";
import type { ValidationRequest } from "@/lib/python-reference/compare";
import { cn } from "@/lib/utils/cn";

type Props = { trail: TrailState };

function DepthTools({
  trail,
  algorithm,
  contextNote,
}: {
  trail: TrailState;
  algorithm?: ValidationRequest["algorithm"];
  contextNote?: string;
}) {
  return (
    <PythonDepthSection
      stepId={trail.stepId}
      contextNote={contextNote}
      buildRequest={() => buildValidationRequestForStep(trail, algorithm)}
    />
  );
}

export function TrailStepContent({ trail }: Props) {
  switch (trail.stepId) {
    case "dataset":
      return <DatasetStep trail={trail} />;
    case "target":
      return <TargetStep trail={trail} />;
    case "observe":
      return <ObserveStep trail={trail} />;
    case "line":
      return <LineStep trail={trail} />;
    case "predict":
      return <PredictStep trail={trail} />;
    case "errors":
      return <ErrorsStep trail={trail} />;
    case "metrics":
      return <MetricsStep trail={trail} />;
    case "train":
      return <TrainStep trail={trail} />;
    case "gradient":
      return <GradientStep trail={trail} />;
    case "split":
      return <SplitStep trail={trail} />;
    case "validation":
      return <ValidationStep trail={trail} />;
    case "diagnosis":
      return <DiagnosisStep trail={trail} />;
    case "next-model":
      return <NextModelStep trail={trail} />;
    case "lab":
      return <FreeLabStep trail={trail} />;
    default:
      return null;
  }
}

function DatasetStep({ trail }: Props) {
  const { dataset, goNext } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="① Escolha os dados"
        title={dataset.name}
        description={
          <p>
            Nesta trilha trabalhamos com o dataset principal do MVP. Explore as
            variáveis numéricas antes de decidir o que prever.
          </p>
        }
      />

      <dl className="grid gap-3 sm:grid-cols-3">
        <InfoStat
          label="Registros (fonte)"
          value={String(dataset.totalRecords)}
        />
        <InfoStat
          label="Em uso no lab"
          value={String(dataset.workingRecords)}
        />
        <InfoStat label="Variáveis" value={String(dataset.variableCount)} />
      </dl>

      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        {dataset.description} Fonte:{" "}
        <span className="font-mono text-foreground">{dataset.source}</span>.
        O laboratório usa uma amostra real e uniforme da base completa para
        manter a interação responsiva.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted/70 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Variável</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {dataset.variables.map((variable) => (
              <tr key={variable.key} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">
                  {variable.label}
                </td>
                <td className="px-4 py-3 text-muted">{variable.type}</td>
                <td className="px-4 py-3 text-muted">{variable.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StepActions onNext={goNext} nextLabel="O que você quer prever? →" />
    </StepShell>
  );
}

function TargetStep({ trail }: Props) {
  const { xKey, yKey, setVariables, goBack, goNext } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="② O que você quer prever?"
        title="Escolha Y e, em seguida, X"
        description={
          <>
            <p>X é aquilo que usamos para fazer a previsão.</p>
            <p>Y é aquilo que queremos prever.</p>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <VariablePicker
          title="Y — variável alvo"
          value={yKey}
          exclude={xKey}
          onChange={(nextY) => setVariables(xKey, nextY)}
        />
        <VariablePicker
          title="X — variável de entrada"
          value={xKey}
          exclude={yKey}
          onChange={(nextX) => setVariables(nextX, yKey)}
        />
      </div>

      <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-muted/40 px-4 py-6 font-display text-lg font-semibold text-foreground sm:text-xl">
        <span>{trail.xLabel}</span>
        <span className="text-accent">→ modelo →</span>
        <span>{trail.yLabel}</span>
      </div>

      <p className="text-sm text-muted">
        Para visualizar bem a reta, comece com uma variável X e uma variável Y.
        Sugestão inicial: renda mensal → valor do empréstimo.
      </p>

      <StepActions
        onBack={goBack}
        onNext={goNext}
        nextLabel="Observar a relação →"
      />
    </StepShell>
  );
}

function ObserveStep({ trail }: Props) {
  const {
    scatterPoints,
    xLabel,
    yLabel,
    explorationChoice,
    setExplorationChoice,
    goBack,
    goNext,
  } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="③ Observe a relação"
        title="Antes do modelo, olhe para os dados"
        description={
          <p>
            Cada ponto é uma observação real. Procure tendência, dispersão,
            concentração, outliers — ou a ausência de uma relação clara.
          </p>
        }
      />

      <ScatterPlot
        points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
        xLabel={xLabel}
        yLabel={yLabel}
        title="Scatter das observações"
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          O que você acha que está acontecendo?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXPLORATION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setExplorationChoice(option.id)}
              className={cn(
                "min-h-12 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                explorationChoice === option.id
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          Sua resposta é só para reflexão — não há julgamento agora.
        </p>
      </fieldset>

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Tentar uma reta →" />
    </StepShell>
  );
}

function LineStep({ trail }: Props) {
  const {
    scatterPoints,
    displayParameters,
    xLabel,
    yLabel,
    setMethod,
    goBack,
    goNext,
  } = trail;

  // Ensure OLS on all visible data for this intro step
  const params = trail.olsAll;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="④ Tente uma reta"
        title="Vamos tentar representar esses dados com uma reta"
        description={
          <p>
            A reta abaixo foi estimada a partir dos dados selecionados. Os
            segmentos verticais mostram a distância entre o valor observado e a
            previsão.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
          parameters={params}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
          title="Reta de regressão linear"
        />
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="font-mono text-sm text-foreground">
              ŷ = θ₀ + θ₁x
            </p>
            {params ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">θ₀ (intercepto)</dt>
                  <dd className="font-mono">{formatNumber(params.intercept)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">θ₁ (inclinação)</dt>
                  <dd className="font-mono">{formatNumber(params.slope)}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <UnderTheHood>
            <p>
              θ₀ é onde a reta cruza o eixo Y quando x = 0. θ₁ é o peso de x: o
              quanto ŷ muda quando x aumenta em uma unidade. x é a entrada; ŷ é
              a previsão do modelo.
            </p>
          </UnderTheHood>
        </div>
      </div>

      <DepthTools trail={trail} algorithm="normal_equation" />

      <StepActions
        onBack={goBack}
        onNext={() => {
          setMethod("normal");
          goNext();
        }}
        nextLabel="Fazer uma previsão →"
        nextDisabled={!displayParameters && !params}
      />
    </StepShell>
  );
}

function PredictStep({ trail }: Props) {
  const {
    scatterPoints,
    olsAll,
    predictX,
    setPredictX,
    denormalizeY,
    useNormalization,
    normalization,
    xLabel,
    yLabel,
    rawPoints,
    goBack,
    goNext,
  } = trail;

  const params = olsAll;
  const xMin = Math.min(...rawPoints.map((point) => point.x));
  const xMax = Math.max(...rawPoints.map((point) => point.x));
  const xForModel = useNormalization
    ? (predictX - normalization.x.mean) / normalization.x.std
    : predictX;
  const predictionNormalized =
    params != null ? params.intercept + params.slope * xForModel : null;
  const displayPrediction =
    predictionNormalized != null ? denormalizeY(predictionNormalized) : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑤ Faça previsões"
        title="Se X muda, qual seria a previsão?"
        description={
          <p>
            Informe um valor de {xLabel} e veja o ponto correspondente na reta.
            Essa é a previsão do modelo.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
          parameters={params}
          highlightX={xForModel}
          xLabel={xLabel}
          yLabel={yLabel}
          title="Previsão na reta"
        />
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
          <Slider
            id="predict-x"
            label={xLabel}
            value={predictX}
            min={xMin}
            max={xMax}
            step={xMax - xMin > 20 ? 1 : 0.1}
            onChange={setPredictX}
          />
          <div className="rounded-md bg-accent-soft px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Previsão (ŷ)
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {displayPrediction != null
                ? formatCompact(displayPrediction)
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <DepthTools trail={trail} algorithm="normal_equation" />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Onde o modelo erra? →" />
    </StepShell>
  );
}

function ErrorsStep({ trail }: Props) {
  const {
    scatterPoints,
    olsAll,
    allEval,
    selectedIndex,
    setSelectedIndex,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const residual =
    selectedIndex != null && allEval
      ? allEval.residuals[selectedIndex]
      : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑥ Entenda os erros"
        title="Onde o modelo erra?"
        description={
          <p>
            Quanto mais distante o ponto estiver da reta, maior será o erro
            daquela previsão. Toque em um ponto para inspecionar.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
          parameters={olsAll}
          showResiduals
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          xLabel={xLabel}
          yLabel={yLabel}
          title="Resíduos"
        />
        <div className="rounded-lg border border-border bg-surface p-4 text-sm">
          {residual ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-muted">Valor real (Y)</dt>
                <dd className="font-mono text-lg">
                  {formatCompact(residual.observed)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Valor previsto (Ŷ)</dt>
                <dd className="font-mono text-lg">
                  {formatCompact(residual.predicted)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Erro (Y − Ŷ)</dt>
                <dd className="font-mono text-lg text-data">
                  {formatCompact(residual.error)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted">
              Selecione uma observação no gráfico para ver o erro detalhado.
            </p>
          )}
        </div>
      </div>

      <DepthTools trail={trail} algorithm="metrics" />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Como medir o erro? →" />
    </StepShell>
  );
}

function MetricsStep({ trail }: Props) {
  const {
    scatterPoints,
    olsAll,
    allEval,
    selectedIndex,
    setSelectedIndex,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  const residual =
    selectedIndex != null && allEval
      ? allEval.residuals[selectedIndex]
      : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑦ MSE e MAE"
        title="Temos vários erros. Precisamos resumir esses erros em um número."
        description={
          <p>
            MAE resume o tamanho médio dos erros em valor absoluto. MSE
            penaliza mais os erros grandes ao elevá-los ao quadrado.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
          parameters={olsAll}
          showResiduals
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <div className="flex flex-col gap-4">
          <MetricCards mae={allEval?.mae} mse={allEval?.mse} />
          {residual ? (
            <p className="text-xs text-muted">
              Erro da observação selecionada:{" "}
              <span className="font-mono text-foreground">
                {formatCompact(residual.error)}
              </span>
              . Ele entra no MAE como valor absoluto e no MSE ao quadrado.
            </p>
          ) : null}
        </div>
      </div>

      <UnderTheHood>
        <div className="space-y-3 font-mono text-xs sm:text-sm">
          <p>MAE = (1/n) Σ |yᵢ − ŷᵢ|</p>
          <p>MSE = (1/n) Σ (yᵢ − ŷᵢ)²</p>
          {allEval ? (
            <>
              <p>n = {allEval.residuals.length}</p>
              <p>MAE = {formatNumber(allEval.mae)}</p>
              <p>MSE = {formatNumber(allEval.mse)}</p>
            </>
          ) : null}
        </div>
      </UnderTheHood>

      <DepthTools trail={trail} algorithm="metrics" />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Treinar o modelo →" />
    </StepShell>
  );
}

function TrainStep({ trail }: Props) {
  const { olsTrain, trainEval, setMethod, goBack, goNext } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑧ Treine o modelo"
        title="Como encontramos a melhor reta?"
        description={
          <p>
            O modelo tenta encontrar os parâmetros que produzem a menor
            quantidade possível de erro. Aqui usamos a solução fechada
            (Normal Equation) sobre os dados de treino.
          </p>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted">θ₀</p>
          <p className="mt-1 font-mono text-2xl">
            {olsTrain ? formatNumber(olsTrain.intercept) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted">θ₁</p>
          <p className="mt-1 font-mono text-2xl">
            {olsTrain ? formatNumber(olsTrain.slope) : "—"}
          </p>
        </div>
      </div>

      <MetricCards mae={trainEval?.mae} mse={trainEval?.mse} />

      <UnderTheHood title="Under the Hood · Normal Equation">
        <div className="space-y-2">
          <p>
            Queremos θ que minimize o MSE. Para regressão linear simples, a
            Normal Equation resolve:
          </p>
          <p className="font-mono text-foreground">θ = (XᵀX)⁻¹ Xᵀy</p>
          <p>
            com X contendo uma coluna de 1s (intercepto) e a coluna de x. O
            resultado é determinístico: mesmos dados → mesmos parâmetros.
          </p>
        </div>
      </UnderTheHood>

      <DepthTools trail={trail} algorithm="normal_equation" />

      <StepActions
        onBack={goBack}
        onNext={() => {
          setMethod("normal");
          goNext();
        }}
        nextLabel="Ver Gradient Descent →"
      />
    </StepShell>
  );
}

function GradientStep({ trail }: Props) {
  const {
    scatterPoints,
    displayParameters,
    method,
    setMethod,
    learningRate,
    setLearningRate,
    gdIterations,
    setGdIterations,
    gdFrame,
    setGdFrame,
    gdHistory,
    currentGd,
    gdResult,
    useNormalization,
    setUseNormalization,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑨ Gradient Descent"
        title="Ajuste iterativo da reta"
        description={
          <p>
            Em cada iteração os parâmetros mudam um pouco na direção que reduz
            o erro. O learning rate (η) controla o tamanho desse passo.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
        <ScatterPlot
          points={scatterPoints.filter((point) => point.group === "train")}
          parameters={method === "gd" ? displayParameters : trail.olsTrain}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
          title="Gradient Descent"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={method === "gd" ? "primary" : "secondary"}
              onClick={() => setMethod("gd")}
            >
              Usar GD
            </Button>
            <Button
              variant={useNormalization ? "primary" : "secondary"}
              onClick={() => setUseNormalization(!useNormalization)}
            >
              {useNormalization ? "Normalizado" : "Dados originais"}
            </Button>
          </div>

          <Slider
            id="lr"
            label="Learning rate (η)"
            value={Math.log10(learningRate)}
            min={useNormalization ? -3 : -12}
            max={useNormalization ? 0 : -5}
            step={0.5}
            displayValue={learningRate.toExponential(1)}
            onChange={(logValue) => {
              setLearningRate(10 ** logValue);
              setGdFrame(0);
              setMethod("gd");
            }}
            hint={
              useNormalization
                ? "Com dados normalizados, η típico fica em torno de 0.01–0.1."
                : "Sem normalização, η precisa ser muito pequeno (escalas diferentes)."
            }
          />

          <Slider
            id="gd-iters"
            label="Iterações"
            value={gdIterations}
            min={5}
            max={120}
            step={1}
            onChange={(value) => {
              setGdIterations(value);
              setGdFrame(0);
              setMethod("gd");
            }}
          />

          <Slider
            id="gd-frame"
            label="Iteração atual"
            value={gdFrame}
            min={0}
            max={Math.max(gdHistory.length - 1, 0)}
            step={1}
            onChange={(value) => {
              setGdFrame(value);
              setMethod("gd");
            }}
          />

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border p-3">
              <dt className="text-muted">θ₀</dt>
              <dd className="font-mono">
                {currentGd ? formatNumber(currentGd.intercept) : "—"}
              </dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="text-muted">θ₁</dt>
              <dd className="font-mono">
                {currentGd ? formatNumber(currentGd.slope) : "—"}
              </dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="text-muted">MSE</dt>
              <dd className="font-mono">
                {currentGd ? formatCompact(currentGd.mse) : "—"}
              </dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="text-muted">Iteração</dt>
              <dd className="font-mono">{gdFrame}</dd>
            </div>
          </dl>

          {gdResult?.diverged || currentGd?.diverged ? (
            <p className="rounded-md border border-data/40 bg-data-soft px-3 py-2 text-sm text-data">
              O treinamento divergiu com esta configuração. Isso também ensina:
              η grande demais pode fazer o erro explodir.
            </p>
          ) : null}
        </div>
      </div>

      <UnderTheHood title="Under the Hood · escala e normalização">
        <p>
          Normalização (z-score) transforma cada variável para média 0 e
          desvio 1: z = (x − μ) / σ. Isso não muda a informação, mas coloca X e
          Y em escalas comparáveis — especialmente útil para Gradient Descent.
        </p>
      </UnderTheHood>

      <DepthTools
        trail={trail}
        algorithm={useNormalization ? "normalize" : "gradient_descent"}
        contextNote={`Iteração ${gdFrame}: neste momento o algoritmo executa uma nova atualização de θ₀ e θ₁.`}
      />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Treino vs teste →" />
    </StepShell>
  );
}

function SplitStep({ trail }: Props) {
  const {
    scatterPoints,
    displayParameters,
    trainRatio,
    setTrainRatio,
    revealTest,
    setRevealTest,
    hasTested,
    setHasTested,
    trainEval,
    testEval,
    setMethod,
    xLabel,
    yLabel,
    split,
    goBack,
    goNext,
  } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑩ Treino vs Teste"
        title="Generalização: o modelo não deve só decorar"
        description={
          <p>
            Treinamos com uma parte dos dados. Os dados de teste ficam ocultos
            até você pedir para avaliar.
          </p>
        }
      />

      <Slider
        id="train-ratio"
        label="Proporção de treino"
        value={Number((trainRatio * 100).toFixed(0))}
        min={50}
        max={90}
        step={5}
        unit="%"
        onChange={(value) => {
          setTrainRatio(value / 100);
          setRevealTest(false);
          setHasTested(false);
        }}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.8fr)]">
        <ScatterPlot
          points={scatterPoints}
          parameters={displayParameters}
          showResiduals={revealTest}
          showTest={revealTest}
          dimTest={!revealTest}
          xLabel={xLabel}
          yLabel={yLabel}
          title="Treino e teste"
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Treino: {split.train.length} · Teste: {split.test.length}
          </p>
          <Button
            onClick={() => {
              setMethod("normal");
              setRevealTest(false);
              setHasTested(false);
            }}
          >
            TREINAR MODELO
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRevealTest(true);
              setHasTested(true);
            }}
          >
            TESTAR MODELO
          </Button>
          {hasTested ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Treino
              </p>
              <MetricCards mae={trainEval?.mae} mse={trainEval?.mse} />
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Teste
              </p>
              <MetricCards mae={testEval?.mae} mse={testEval?.mse} />
            </div>
          ) : (
            <p className="text-sm text-muted">
              Os pontos de teste permanecem ocultos até você testar.
            </p>
          )}
        </div>
      </div>

      <DepthTools trail={trail} algorithm="split" />

      <StepActions
        onBack={goBack}
        onNext={goNext}
        nextDisabled={!hasTested}
        nextLabel="Validação →"
      />
    </StepShell>
  );
}

function ValidationStep({ trail }: Props) {
  const { cvResults, goBack, goNext } = trail;
  const avgMse =
    cvResults.length > 0
      ? cvResults.reduce((sum, fold) => sum + fold.mse, 0) / cvResults.length
      : null;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑪ Validação"
        title="Treinar → validar → repetir"
        description={
          <p>
            Em vez de uma única divisão, a validação cruzada repete o ciclo em
            diferentes pedaços dos dados para observar o desempenho com mais
            estabilidade.
          </p>
        }
      />

      <div className="grid gap-3 sm:grid-cols-5">
        {cvResults.map((fold) => (
          <div
            key={fold.fold}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <p className="text-xs text-muted">Fold {fold.fold}</p>
            <p className="mt-2 font-mono text-sm">
              MSE {formatCompact(fold.mse)}
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              MAE {formatCompact(fold.mae)}
            </p>
          </div>
        ))}
      </div>

      {avgMse != null ? (
        <p className="text-sm text-foreground">
          MSE médio nos folds:{" "}
          <span className="font-mono">{formatCompact(avgMse)}</span>
        </p>
      ) : null}

      <UnderTheHood>
        <p>
          Em k-fold, os dados são divididos em k partes. Em cada rodada, uma
          parte valida e as demais treinam. O desempenho final resume os k
          resultados. Assim reduzimos o acaso de uma divisão “sorte” ou
          “azarada”.
        </p>
      </UnderTheHood>

      <DepthTools trail={trail} algorithm="split" />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="Diagnóstico visual →" />
    </StepShell>
  );
}

function DiagnosisStep({ trail }: Props) {
  const {
    scatterPoints,
    olsAll,
    allEval,
    xKey,
    yKey,
    setVariables,
    xLabel,
    yLabel,
    goBack,
    goNext,
  } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑫ Diagnóstico visual"
        title="A reta consegue representar bem esses dados?"
        description={
          <p>
            Troque X e Y e observe a reta e os erros. Algumas combinações
            parecem mais alinhadas; outras deixam a reta claramente insuficiente.
            Não há substituição automática de modelo aqui.
          </p>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <VariablePicker
          title="X"
          value={xKey}
          exclude={yKey}
          onChange={(nextX) => setVariables(nextX, yKey)}
        />
        <VariablePicker
          title="Y"
          value={yKey}
          exclude={xKey}
          onChange={(nextY) => setVariables(xKey, nextY)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(14rem,0.7fr)]">
        <ScatterPlot
          points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
          parameters={olsAll}
          showResiduals
          xLabel={xLabel}
          yLabel={yLabel}
        />
        <MetricCards mae={allEval?.mae} mse={allEval?.mse} />
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Talvez exista outro tipo de relação entre X e Y — mas isso é uma
        pergunta para você, olhando o gráfico, não uma resposta pronta da
        interface.
      </p>

      <DepthTools trail={trail} algorithm="normal_equation" />

      <StepActions onBack={goBack} onNext={goNext} nextLabel="E quando a reta não basta? →" />
    </StepShell>
  );
}

function NextModelStep({ trail }: Props) {
  const { scatterPoints, olsAll, xLabel, yLabel, goBack, goNext } = trail;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑬ E quando uma reta não basta?"
        title="Nem todo relacionamento entre variáveis forma uma reta."
        description={
          <p>
            Se os pontos sugerem curvatura ou um padrão que a reta corta mal, a
            regressão linear ainda pode ser calculada — mas pode não ser a
            representação mais fiel.
          </p>
        }
      />

      <ScatterPlot
        points={scatterPoints.map((point) => ({ ...point, group: "all" }))}
        parameters={olsAll}
        showResiduals
        xLabel={xLabel}
        yLabel={yLabel}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Regressão Linear
          </p>
          <p className="mt-2 text-sm text-muted">
            Uma reta tentando representar os dados.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-border-strong bg-surface-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Regressão Polinomial
          </p>
          <p className="mt-2 text-sm text-muted">
            Modelo capaz de representar relações curvas — próxima trilha.
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-base text-foreground">
        Se os dados não formam uma reta, como podemos permitir que o modelo
        represente uma curva?
      </p>

      <StepActions
        onBack={goBack}
        onNext={goNext}
        nextLabel="Agora é sua vez →"
      />
    </StepShell>
  );
}

function FreeLabStep({ trail }: Props) {
  const {
    scatterPoints,
    displayParameters,
    allEval,
    xKey,
    yKey,
    setVariables,
    xLabel,
    yLabel,
    trainRatio,
    setTrainRatio,
    method,
    setMethod,
    learningRate,
    setLearningRate,
    useNormalization,
    setUseNormalization,
    customX,
    setCustomX,
    customY,
    setCustomY,
    addCustomPoint,
    resetObservations,
    gdFrame,
    setGdFrame,
    gdHistory,
    rawPoints,
    goBack,
  } = trail;

  const xValues = rawPoints.map((point) => point.x);
  const yValues = rawPoints.map((point) => point.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="⑭ Experimente livremente"
        title="Agora é sua vez."
        description={
          <p>
            Escolha variáveis, proporções, método e até adicione uma observação
            extrema. Resultados ruins também ensinam — o laboratório não esconde
            o efeito.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.9fr)]">
        <ScatterPlot
          points={scatterPoints}
          parameters={displayParameters}
          showResiduals
          showTest
          xLabel={xLabel}
          yLabel={yLabel}
          title="Laboratório livre"
        />

        <div className="flex flex-col gap-4">
          <VariablePicker
            title="X"
            value={xKey}
            exclude={yKey}
            onChange={(nextX) => setVariables(nextX, yKey)}
          />
          <VariablePicker
            title="Y"
            value={yKey}
            exclude={xKey}
            onChange={(nextY) => setVariables(xKey, nextY)}
          />

          <Slider
            id="lab-ratio"
            label="Treino %"
            value={Number((trainRatio * 100).toFixed(0))}
            min={50}
            max={90}
            step={5}
            onChange={(value) => setTrainRatio(value / 100)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={method === "normal" ? "primary" : "secondary"}
              onClick={() => setMethod("normal")}
            >
              Normal Equation
            </Button>
            <Button
              variant={method === "gd" ? "primary" : "secondary"}
              onClick={() => setMethod("gd")}
            >
              Gradient Descent
            </Button>
            <Button
              variant={useNormalization ? "primary" : "secondary"}
              onClick={() => setUseNormalization(!useNormalization)}
            >
              Normalizar
            </Button>
          </div>

          {method === "gd" ? (
            <>
              <Slider
                id="lab-lr"
                label="Learning rate"
                value={Math.log10(learningRate)}
                min={useNormalization ? -3 : -12}
                max={useNormalization ? 0 : -5}
                step={0.5}
                displayValue={learningRate.toExponential(1)}
                onChange={(logValue) => setLearningRate(10 ** logValue)}
              />
              <Slider
                id="lab-gd-frame"
                label="Iteração GD"
                value={gdFrame}
                min={0}
                max={Math.max(gdHistory.length - 1, 0)}
                step={1}
                onChange={setGdFrame}
              />
            </>
          ) : null}

          <MetricCards mae={allEval?.mae} mse={allEval?.mse} />

          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              Adicionar observação
            </p>
            <div className="mt-3 space-y-3">
              <Slider
                id="custom-x"
                label={`Novo X (${xLabel})`}
                value={customX}
                min={xMin - xSpan * 0.2}
                max={xMax + xSpan * 0.5}
                step={xSpan > 100 ? 10 : 0.1}
                onChange={setCustomX}
              />
              <Slider
                id="custom-y"
                label={`Novo Y (${yLabel})`}
                value={customY}
                min={Math.max(0, yMin - ySpan * 0.2)}
                max={yMax + ySpan * 0.8}
                step={ySpan > 1000 ? 100 : 1}
                onChange={setCustomY}
              />
              <Button onClick={addCustomPoint} className="w-full">
                Adicionar e retreinar
              </Button>
              <Button
                variant="ghost"
                onClick={resetObservations}
                className="w-full"
              >
                Restaurar dataset original
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DepthTools
        trail={trail}
        algorithm={method === "gd" ? "gradient_descent" : "normal_equation"}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={goBack}>
          Voltar
        </Button>
        <Link
          href="/learn/polynomial-regression"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Próxima trilha: Regressão Polinomial →
        </Link>
      </div>
    </StepShell>
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
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <span className="font-medium text-foreground">{variable.label}</span>
              <span className="mt-0.5 block text-xs text-muted">
                {variable.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCards({
  mae,
  mse,
}: {
  mae?: number;
  mse?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-border bg-surface px-3 py-3">
        <p className="text-xs uppercase tracking-wide text-muted">MAE</p>
        <p className="mt-1 font-mono text-lg tabular-nums">
          {mae != null ? formatCompact(mae) : "—"}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface px-3 py-3">
        <p className="text-xs uppercase tracking-wide text-muted">MSE</p>
        <p className="mt-1 font-mono text-lg tabular-nums">
          {mse != null ? formatCompact(mse) : "—"}
        </p>
      </div>
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
