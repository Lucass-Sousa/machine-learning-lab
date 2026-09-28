"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  StepActions,
  StepHeader,
  StepShell,
} from "@/components/learn/linear-regression/StepChrome";
import { StepProgress } from "@/components/learn/linear-regression/StepProgress";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Slider } from "@/components/ui/Slider";
import { ScatterPlot } from "@/components/visualizations/ScatterPlot";
import {
  formatMetric,
  formatParameter,
  formatScore,
} from "@/lib/learning/linear-regression/format";
import {
  getLinearRegressionLearningData,
  LINEAR_REGRESSION_LEARNING,
} from "@/lib/learning/linear-regression/data";
import { LINEAR_REGRESSION_STEPS } from "@/lib/learning/linear-regression/steps";
import {
  createTrainingFrames,
  evaluateLinearModel,
  fitLinearRegression,
  predictLinear,
  type LinearParameters,
} from "@/lib/ml";
import { cn } from "@/lib/utils/cn";

const INITIAL_GUESS: LinearParameters = {
  slope: 400,
  intercept: 2000,
};

export function LinearRegressionExperience() {
  const data = useMemo(() => getLinearRegressionLearningData(), []);
  const ols = useMemo(() => fitLinearRegression(data.points), [data.points]);

  const [stepIndex, setStepIndex] = useState(0);
  const stepId = LINEAR_REGRESSION_STEPS[stepIndex]!.id;

  const [parameters, setParameters] = useState<LinearParameters>(INITIAL_GUESS);
  const [exploredChart, setExploredChart] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [predictX, setPredictX] = useState(5);

  const trainingRef = useRef<number | null>(null);

  const evaluation = useMemo(
    () => evaluateLinearModel(data.points, parameters),
    [data.points, parameters],
  );

  const predictedY = predictLinear(predictX, parameters);

  useEffect(() => {
    return () => {
      if (trainingRef.current != null) {
        window.clearInterval(trainingRef.current);
      }
    };
  }, []);

  function goNext() {
    setStepIndex((current) =>
      Math.min(current + 1, LINEAR_REGRESSION_STEPS.length - 1),
    );
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function updateSlope(slope: number) {
    setParameters((current) => ({ ...current, slope }));
  }

  function updateIntercept(intercept: number) {
    setParameters((current) => ({ ...current, intercept }));
  }

  function runTrainingAnimation() {
    if (isTraining) return;

    setIsTraining(true);
    const frames = createTrainingFrames(parameters, {
      slope: ols.slope,
      intercept: ols.intercept,
    }, 40);
    let frame = 0;

    if (trainingRef.current != null) {
      window.clearInterval(trainingRef.current);
    }

    trainingRef.current = window.setInterval(() => {
      const next = frames[frame];
      if (!next) {
        if (trainingRef.current != null) {
          window.clearInterval(trainingRef.current);
          trainingRef.current = null;
        }
        setParameters({ slope: ols.slope, intercept: ols.intercept });
        setIsTraining(false);
        setHasTrained(true);
        return;
      }

      setParameters(next);
      frame += 1;
    }, 45);
  }

  return (
    <div className="overflow-x-hidden">
      <div className="border-b border-border bg-surface/80">
        <Container className="flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Trilha · Regressão
              </p>
              <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Regressão Linear
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ← Home
            </Link>
          </div>
          <StepProgress currentIndex={stepIndex} />
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        {stepId === "problem" ? (
          <ProblemStep onNext={goNext} />
        ) : null}
        {stepId === "data" ? (
          <DataStep data={data} onBack={goBack} onNext={goNext} />
        ) : null}
        {stepId === "visualize" ? (
          <VisualizeStep
            points={data.points}
            explored={exploredChart}
            onExplore={() => setExploredChart(true)}
            onBack={goBack}
            onNext={goNext}
          />
        ) : null}
        {stepId === "line" ? (
          <LineStep
            points={data.points}
            parameters={parameters}
            onSlopeChange={updateSlope}
            onInterceptChange={updateIntercept}
            onBack={goBack}
            onNext={goNext}
          />
        ) : null}
        {stepId === "error" ? (
          <ErrorStep
            points={data.points}
            parameters={parameters}
            mae={evaluation.mae}
            mse={evaluation.mse}
            onSlopeChange={updateSlope}
            onInterceptChange={updateIntercept}
            onBack={goBack}
            onNext={goNext}
          />
        ) : null}
        {stepId === "train" ? (
          <TrainStep
            points={data.points}
            parameters={parameters}
            mae={evaluation.mae}
            mse={evaluation.mse}
            isTraining={isTraining}
            hasTrained={hasTrained}
            onTrain={runTrainingAnimation}
            onBack={goBack}
            onNext={goNext}
          />
        ) : null}
        {stepId === "predict" ? (
          <PredictStep
            points={data.points}
            parameters={parameters}
            predictX={predictX}
            predictedY={predictedY}
            xMin={data.xMin}
            xMax={data.xMax}
            onPredictXChange={setPredictX}
            onBack={goBack}
          />
        ) : null}
      </Container>
    </div>
  );
}

function ProblemStep({ onNext }: { onNext: () => void }) {
  return (
    <StepShell className="animate-fade-up max-w-2xl">
      <StepHeader
        eyebrow="Etapa 1 · O problema"
        title="Será que podemos usar dados para fazer previsões?"
        description={
          <>
            <p>
              Temos dados de avaliações gamificadas de estudantes em cursos
              universitários. Cada registro mostra quantas vezes a pessoa
              tentou e qual pontuação obteve.
            </p>
            <p>
              A pergunta desta trilha é simples: existe alguma relação entre o
              número de tentativas e a pontuação — e podemos usá-la para
              prever?
            </p>
          </>
        }
      />
      <StepActions onNext={onNext} nextLabel="Explorar os dados →" />
    </StepShell>
  );
}

function DataStep({
  data,
  onBack,
  onNext,
}: {
  data: ReturnType<typeof getLinearRegressionLearningData>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 2 · Conheça os dados"
        title="O que vamos observar?"
        description={
          <>
            <p>
              Para começar, usamos duas variáveis numéricas da base de
              avaliações gamificadas:
            </p>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            X · entrada
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">
            {LINEAR_REGRESSION_LEARNING.xLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            X é a variável que usamos como entrada.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-data">
            Y · o que queremos prever
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">
            {LINEAR_REGRESSION_LEARNING.yLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Y é o valor que queremos compreender ou prever.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <caption className="border-b border-border px-4 py-3 text-left text-xs text-muted">
            Preview da base · {data.totalRecords} registros no total · amostra
            de {data.sampleSize} pontos no gráfico
          </caption>
          <thead className="bg-surface-muted/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Estudante</th>
              <th className="px-4 py-3 font-medium">Curso</th>
              <th className="px-4 py-3 font-medium">Tentativa (X)</th>
              <th className="px-4 py-3 font-medium">Pontuação (Y)</th>
            </tr>
          </thead>
          <tbody>
            {data.previewRows.map((row) => (
              <tr key={`${row.student}-${row.attempt}-${row.score}`} className="border-t border-border">
                <td className="px-4 py-3 text-foreground">{row.student}</td>
                <td className="px-4 py-3 text-muted">{row.career}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{row.attempt}</td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatScore(row.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextLabel="Visualizar relação →"
      />
    </StepShell>
  );
}

function VisualizeStep({
  points,
  explored,
  onExplore,
  onBack,
  onNext,
}: {
  points: ReturnType<typeof getLinearRegressionLearningData>["points"];
  explored: boolean;
  onExplore: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 3 · Visualize"
        title="Você consegue perceber alguma tendência?"
        description={
          <p>
            Cada ponto é uma tentativa real. Observe a nuvem antes de pensar em
            qualquer linha — toque ou mova o ponteiro sobre o gráfico para
            explorar.
          </p>
        }
      />

      <ScatterPlot
        points={points}
        interactive
        onExplore={onExplore}
        xLabel="Tentativa (X)"
        yLabel="Pontuação (Y)"
        title="Relação entre tentativa e pontuação"
      />

      {explored ? (
        <div className="animate-fade-up rounded-lg border border-border bg-accent-soft/50 px-4 py-4 text-sm leading-relaxed text-foreground sm:text-base">
          Quando tentamos encontrar uma relação entre duas variáveis numéricas,
          podemos procurar uma função que represente essa relação.
        </div>
      ) : (
        <p className="text-sm text-muted">
          Explore o gráfico para liberar o próximo passo.
        </p>
      )}

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!explored}
        nextLabel="Vamos tentar encontrar essa linha →"
      />
    </StepShell>
  );
}

function ParameterControls({
  parameters,
  onSlopeChange,
  onInterceptChange,
  disabled = false,
}: {
  parameters: LinearParameters;
  onSlopeChange: (value: number) => void;
  onInterceptChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <Slider
        id="slope"
        label="Inclinação"
        value={Number(parameters.slope.toFixed(1))}
        min={-2000}
        max={8000}
        step={10}
        disabled={disabled}
        onChange={onSlopeChange}
        hint={`Atual: ${formatParameter(parameters.slope)}`}
      />
      <Slider
        id="intercept"
        label="Intercepto"
        value={Number(parameters.intercept.toFixed(0))}
        min={-5000}
        max={30000}
        step={50}
        disabled={disabled}
        onChange={onInterceptChange}
        hint={`Atual: ${formatParameter(parameters.intercept)}`}
      />
    </div>
  );
}

function MetricsPanel({ mae, mse }: { mae: number; mse: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          MAE
        </p>
        <p className="mt-1 font-mono text-lg tabular-nums text-foreground">
          {formatMetric(mae)}
        </p>
        <p className="mt-1 text-xs text-muted">Erro absoluto médio</p>
      </div>
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          MSE
        </p>
        <p className="mt-1 font-mono text-lg tabular-nums text-foreground">
          {formatMetric(mse)}
        </p>
        <p className="mt-1 text-xs text-muted">Erro quadrático médio</p>
      </div>
    </div>
  );
}

function LineStep({
  points,
  parameters,
  onSlopeChange,
  onInterceptChange,
  onBack,
  onNext,
}: {
  points: ReturnType<typeof getLinearRegressionLearningData>["points"];
  parameters: LinearParameters;
  onSlopeChange: (value: number) => void;
  onInterceptChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 4 · A linha"
        title="Uma linha que tenta representar os dados"
        description={
          <>
            <p>A linha produz uma previsão para cada ponto.</p>
            <p>
              A distância entre o valor observado e a previsão representa um
              erro.
            </p>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <ScatterPlot
          points={points}
          parameters={parameters}
          showResiduals
          xLabel="Tentativa (X)"
          yLabel="Pontuação (Y)"
          title="Linha de regressão e resíduos"
        />
        <ParameterControls
          parameters={parameters}
          onSlopeChange={onSlopeChange}
          onInterceptChange={onInterceptChange}
        />
      </div>

      <StepActions onBack={onBack} onNext={onNext} nextLabel="Olhar o erro →" />
    </StepShell>
  );
}

function ErrorStep({
  points,
  parameters,
  mae,
  mse,
  onSlopeChange,
  onInterceptChange,
  onBack,
  onNext,
}: {
  points: ReturnType<typeof getLinearRegressionLearningData>["points"];
  parameters: LinearParameters;
  mae: number;
  mse: number;
  onSlopeChange: (value: number) => void;
  onInterceptChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 5 · O erro"
        title="Algumas linhas erram mais. Outras erram menos."
        description={
          <p>
            MAE e MSE resumem o tamanho dos erros. Mexa na linha e observe como
            os números mudam — a regressão procura parâmetros que produzam um
            ajuste adequado aos dados.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <ScatterPlot
          points={points}
          parameters={parameters}
          showResiduals
          xLabel="Tentativa (X)"
          yLabel="Pontuação (Y)"
          title="Erros da linha atual"
        />
        <div className="flex flex-col gap-4">
          <MetricsPanel mae={mae} mse={mse} />
          <ParameterControls
            parameters={parameters}
            onSlopeChange={onSlopeChange}
            onInterceptChange={onInterceptChange}
          />
        </div>
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextLabel="Deixe o modelo tentar →"
      />
    </StepShell>
  );
}

function TrainStep({
  points,
  parameters,
  mae,
  mse,
  isTraining,
  hasTrained,
  onTrain,
  onBack,
  onNext,
}: {
  points: ReturnType<typeof getLinearRegressionLearningData>["points"];
  parameters: LinearParameters;
  mae: number;
  mse: number;
  isTraining: boolean;
  hasTrained: boolean;
  onTrain: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 6 · Treinar"
        title="Deixe o modelo tentar"
        description={
          <p>
            Ao treinar, o modelo busca uma combinação de inclinação e intercepto
            que reduza o erro. Observe a linha e as métricas convergirem.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <ScatterPlot
          points={points}
          parameters={parameters}
          showResiduals
          xLabel="Tentativa (X)"
          yLabel="Pontuação (Y)"
          title="Animação de treinamento"
        />
        <div className="flex flex-col gap-4">
          <MetricsPanel mae={mae} mse={mse} />
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            <p>
              Inclinação:{" "}
              <span className="font-mono text-foreground">
                {formatParameter(parameters.slope)}
              </span>
            </p>
            <p className="mt-1">
              Intercepto:{" "}
              <span className="font-mono text-foreground">
                {formatParameter(parameters.intercept)}
              </span>
            </p>
          </div>
          <Button
            size="lg"
            onClick={onTrain}
            disabled={isTraining}
            className="w-full"
          >
            {isTraining ? "Treinando…" : "▶ Treinar modelo"}
          </Button>
          {hasTrained ? (
            <p className="text-sm text-accent">
              Treinamento concluído. O modelo encontrou um ajuste melhor para
              estes dados.
            </p>
          ) : null}
        </div>
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!hasTrained}
        nextLabel="Fazer uma previsão →"
      />
    </StepShell>
  );
}

function PredictStep({
  points,
  parameters,
  predictX,
  predictedY,
  xMin,
  xMax,
  onPredictXChange,
  onBack,
}: {
  points: ReturnType<typeof getLinearRegressionLearningData>["points"];
  parameters: LinearParameters;
  predictX: number;
  predictedY: number;
  xMin: number;
  xMax: number;
  onPredictXChange: (value: number) => void;
  onBack: () => void;
}) {
  return (
    <StepShell className="animate-fade-up">
      <StepHeader
        eyebrow="Etapa 7 · Previsão"
        title="Use o modelo para prever"
        description={
          <p>
            O modelo encontrou uma relação nos dados e agora pode utilizá-la
            para gerar uma previsão.
          </p>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <ScatterPlot
          points={points}
          parameters={parameters}
          highlightX={predictX}
          xLabel="Tentativa (X)"
          yLabel="Pontuação (Y)"
          title="Previsão do modelo"
        />

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:p-5">
          <Slider
            id="predict-x"
            label="Número de tentativas"
            value={predictX}
            min={xMin}
            max={xMax}
            step={1}
            onChange={onPredictXChange}
          />

          <div className="rounded-md bg-accent-soft px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Previsão
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
              {formatScore(predictedY)}
              <span className="ml-2 text-base font-medium text-muted">
                pontos
              </span>
            </p>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            ŷ = {formatParameter(parameters.slope)} · x +{" "}
            {formatParameter(parameters.intercept)}
          </p>

          <Link
            href="/"
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium",
              "transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            Voltar às trilhas
          </Link>
        </div>
      </div>

      <StepActions onBack={onBack} />
    </StepShell>
  );
}
