"use client";

import { useEffect } from "react";

import { ClassificationUnderTheHood } from "@/components/learn/classification/ClassificationUnderTheHood";
import type { ClassificationTrailState } from "@/components/learn/classification/useClassificationTrail";
import {
  StepActions,
  StepHeader,
  StepShell,
} from "@/components/learn/linear-regression/StepChrome";
import { Button } from "@/components/ui/Button";
import { ClassificationScatter } from "@/components/visualizations/ClassificationScatter";
import { SigmoidPlot } from "@/components/visualizations/SigmoidPlot";
import { SoftmaxBars } from "@/components/visualizations/SoftmaxBars";
import { formatNumber } from "@/lib/learning/linear-regression/format";
import { sigmoid } from "@/lib/ml/classification/activations";

type Props = {
  trail: ClassificationTrailState;
};

export function ClassificationTrailSteps({ trail }: Props) {
  switch (trail.stepId) {
    case "what-is":
      return <WhatIsStep trail={trail} />;
    case "data-classes":
      return <DataStep trail={trail} />;
    case "class-viz":
      return <ClassVizStep trail={trail} />;
    case "logistic-sigmoid":
      return <SigmoidStep trail={trail} />;
    case "probability-threshold":
      return <ThresholdStep trail={trail} />;
    case "decision-boundary":
      return <BoundaryStep trail={trail} />;
    case "train":
      return <TrainStep trail={trail} />;
    case "log-loss":
      return <LogLossStep trail={trail} />;
    case "evaluate":
      return <EvaluateStep trail={trail} />;
    case "regularization":
      return <RegularizationStep trail={trail} />;
    case "softmax-intro":
      return <SoftmaxIntroStep trail={trail} />;
    case "softmax-explore":
      return <SoftmaxExploreStep trail={trail} />;
    case "challenge":
      return <ChallengeStep trail={trail} />;
    default:
      return null;
  }
}

function WhatIsStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 1 · Conceito"
        title="O que é classificação?"
        description={
          <>
            <p>
              Em <strong className="font-medium text-foreground">regressão</strong>, o
              modelo prevê um valor numérico — por exemplo{" "}
              <span className="font-mono text-foreground">R$ 8.500</span>.
            </p>
            <p>
              Em <strong className="font-medium text-foreground">classificação</strong>, o
              modelo prevê uma <em>classe</em>:{" "}
              <span className="font-mono text-foreground">Aprovado / Negado</span> ou{" "}
              <span className="font-mono text-foreground">0 / 1</span>.
            </p>
            <p>
              A Regressão Logística resolve classificação{" "}
              <strong className="font-medium text-foreground">binária</strong>{" "}
              (duas classes), estimando a probabilidade de pertencer à classe
              positiva.
            </p>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Regressão
          </p>
          <p className="mt-2 font-display text-2xl text-foreground">R$ 8.500</p>
          <p className="mt-1 text-sm text-muted">Valor contínuo</p>
        </div>
        <div className="rounded-lg border border-data/40 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-data">
            Classificação
          </p>
          <p className="mt-2 font-display text-2xl text-foreground">Classe 1</p>
          <p className="mt-1 text-sm text-muted">Rótulo discreto</p>
        </div>
      </div>
      <StepActions onNext={trail.next} />
    </StepShell>
  );
}

function DataStep({ trail }: Props) {
  const info = trail.datasetInfo;
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 2 · Dados"
        title="Dados e classes"
        description={
          <>
            <p>
              Classificação precisa de uma variável de <em>classe</em>. A base de
              crédito das trilhas de regressão não serve aqui — esta trilha usa a{" "}
              <strong className="font-medium text-foreground">
                {info.name}
              </strong>
              , com rótulos nativos no CSV.
            </p>
            <p className="rounded-md border border-border bg-surface-muted/60 px-3 py-2 text-sm">
              Fonte: <span className="font-mono text-foreground">{info.source}</span>
              {" · "}
              {info.totalRecords.toLocaleString("pt-BR")} registros (
              {info.workingRecords.toLocaleString("pt-BR")} na sessão).
            </p>
          </>
        }
      />
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs text-muted">Alvo binário · coluna `aprovado`</dt>
          <dd className="mt-1 text-sm text-foreground">
            {trail.binaryRule.description}
          </dd>
          <dd className="mt-2 font-mono text-xs text-muted">
            Features: {trail.featureLabels.binary.join(" · ")}
          </dd>
          <dd className="mt-2 font-mono text-sm text-foreground">
            {info.binaryPositiveCount} aprovados · {info.binaryNegativeCount}{" "}
            negados
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs text-muted">
            Alvo multiclasse · coluna `perfil_risco`
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {trail.multiclassRule.description}
          </dd>
          <dd className="mt-2 font-mono text-xs text-muted">
            Features: {trail.featureLabels.multiclass.join(" · ")}
          </dd>
          <dd className="mt-2 font-mono text-sm text-foreground">
            {Object.entries(info.multiclassCounts)
              .map(([name, count]) => `${name}: ${count}`)
              .join(" · ")}
          </dd>
        </div>
      </dl>
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function ClassVizStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 3 · Visualizar"
        title="Como as classes se distribuem?"
        description={
          <p>
            Cada ponto é uma observação. A cor indica a classe. Observe
            sobreposições e regiões próximas da futura fronteira — a separação
            não precisa ser perfeita.
          </p>
        }
      />
      <ClassificationScatter
        points={trail.binaryPlotPoints}
        classNames={trail.classNamesBinary}
        xLabel={trail.featureLabels.binary[0]}
        yLabel={trail.featureLabels.binary[1]}
        showTest={false}
        title="Classes no plano das features"
      />
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function SigmoidStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 4 · Modelo"
        title="Regressão Logística e a sigmoide"
        description={
          <p>
            Começamos com uma combinação linear θᵀx, mas a saída passa pela
            sigmoide: <span className="font-mono text-foreground">p = σ(θᵀx)</span>.
            Arraste z e veja a probabilidade.
          </p>
        }
      />
      <SigmoidPlot zHighlight={trail.demoZ} threshold={0.5} />
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">
          z = θᵀx · <span className="font-mono text-foreground">{formatNumber(trail.demoZ, 2)}</span>
          {" → "}
          p = {formatNumber(sigmoid(trail.demoZ), 3)}
        </span>
        <input
          type="range"
          min={-8}
          max={8}
          step={0.1}
          value={trail.demoZ}
          onChange={(e) => trail.setDemoZ(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
      <ClassificationUnderTheHood variant="sigmoid" />
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function ThresholdStep({ trail }: Props) {
  useEffect(() => {
    if (!trail.trained) trail.trainModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- train once when entering
  }, []);

  const sample = trail.trainPredictions?.slice(0, 8) ?? [];

  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 5 · Decisão"
        title="Probabilidade → classe"
        description={
          <p>
            Fluxo: entrada → modelo → probabilidade → classe. Com limiar 0,5:
            p &lt; 0,5 → classe 0; p ≥ 0,5 → classe 1. Altere o limiar e observe
            quais decisões mudam.
          </p>
        }
      />
      <label className="flex flex-col gap-2 text-sm">
        <span>
          Limiar τ ={" "}
          <span className="font-mono text-foreground">
            {formatNumber(trail.threshold, 2)}
          </span>
        </span>
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={trail.threshold}
          onChange={(e) => trail.setThreshold(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead className="bg-surface-muted text-xs text-muted">
            <tr>
              <th className="px-3 py-2">p</th>
              <th className="px-3 py-2">ŷ</th>
              <th className="px-3 py-2">y</th>
              <th className="px-3 py-2">OK?</th>
            </tr>
          </thead>
          <tbody>
            {sample.map(({ row, p, pred, correct }) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{formatNumber(p, 3)}</td>
                <td className="px-3 py-2 font-mono">{pred}</td>
                <td className="px-3 py-2 font-mono">{row.label}</td>
                <td className="px-3 py-2">{correct ? "✓" : "✗"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ClassificationUnderTheHood variant="threshold" threshold={trail.threshold} />
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function BoundaryStep({ trail }: Props) {
  useEffect(() => {
    if (!trail.trained) trail.trainModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 6 · Fronteira"
        title="Fronteira de decisão"
        description={
          <p>
            Onde p = τ, o modelo traça uma fronteira. Pontos de cada lado
            recebem classes diferentes. Ela não precisa separar os dados de
            forma perfeita.
          </p>
        }
      />
      <ClassificationScatter
        points={trail.binaryPlotPoints}
        classNames={trail.classNamesBinary}
        xLabel={trail.featureLabels.binary[0]}
        yLabel={trail.featureLabels.binary[1]}
        boundary={trail.boundary}
        showTest={false}
        title="Pontos + fronteira (treino)"
      />
      <label className="flex flex-col gap-2 text-sm">
        <span>
          Limiar na fronteira τ ={" "}
          <span className="font-mono">{formatNumber(trail.threshold, 2)}</span>
        </span>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.01}
          value={trail.threshold}
          onChange={(e) => trail.setThreshold(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function TrainStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 7 · Treinamento"
        title="Treinar o classificador"
        description={
          <p>
            Ajuste os parâmetros nos dados de treino. Os dados de teste
            permanecem ocultos até a etapa de avaliação.
          </p>
        }
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={trail.trainModel} size="lg">
          {trail.trained ? "Retreinar modelo" : "Treinar modelo"}
        </Button>
      </div>
      {trail.model ? (
        <>
          <ClassificationScatter
            points={trail.binaryPlotPoints}
            classNames={trail.classNamesBinary}
            xLabel={trail.featureLabels.binary[0]}
            yLabel={trail.featureLabels.binary[1]}
            boundary={trail.boundary}
            showTest={false}
            title="Treino (teste oculto)"
          />
          {trail.trainMetrics ? (
            <p className="text-sm text-muted">
              Acurácia no treino:{" "}
              <span className="font-mono text-foreground">
                {formatNumber(trail.trainMetrics.accuracy * 100, 1)}%
              </span>
              {" · "}
              Log loss (última época):{" "}
              <span className="font-mono text-foreground">
                {formatNumber(
                  trail.model.history.at(-1)?.logLoss ?? 0,
                  4,
                )}
              </span>
            </p>
          ) : null}
          <ClassificationUnderTheHood variant="train" model={trail.model} />
        </>
      ) : (
        <p className="text-sm text-muted">Treine para ver parâmetros e fronteira.</p>
      )}
      <StepActions
        onBack={trail.back}
        onNext={trail.next}
        nextDisabled={!trail.trained}
      />
    </StepShell>
  );
}

function LogLossStep({ trail }: Props) {
  const example = trail.trainPredictions?.[0] ?? null;
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 8 · Custo"
        title="Log Loss (entropia cruzada)"
        description={
          <p>
            O MSE da regressão não é a função de custo adequada para Regressão
            Logística. Usamos Log Loss: erros com alta confiança são fortemente
            penalizados.
          </p>
        }
      />
      <div className="rounded-lg border border-border bg-surface p-4 text-sm">
        <p>
          Último log loss no treino:{" "}
          <span className="font-mono text-foreground">
            {formatNumber(trail.model?.history.at(-1)?.logLoss ?? NaN, 4)}
          </span>
        </p>
        {trail.model?.history.length ? (
          <p className="mt-2 text-xs text-muted">
            Evolução (épocas amostradas):{" "}
            {trail.model.history
              .filter((_, i) => i % 3 === 0)
              .map((h) => `${h.epoch}:${h.logLoss.toFixed(3)}`)
              .join(" → ")}
          </p>
        ) : null}
      </div>
      <ClassificationUnderTheHood
        variant="logloss"
        exampleProb={example?.p ?? null}
        exampleLabel={example?.row.label ?? null}
      />
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function EvaluateStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 9 · Avaliação"
        title="Testar o modelo"
        description={
          <p>
            Os dados de teste ficaram ocultos durante o treino. Ao testar,
            revelamos previsões, classes reais e acertos/erros.
          </p>
        }
      />
      {!trail.tested ? (
        <Button onClick={trail.revealTest} size="lg">
          TESTAR MODELO
        </Button>
      ) : (
        <>
          <ClassificationScatter
            points={trail.binaryPlotPoints}
            classNames={trail.classNamesBinary}
            xLabel={trail.featureLabels.binary[0]}
            yLabel={trail.featureLabels.binary[1]}
            boundary={trail.boundary}
            showTest
            title="Treino + teste (✗ = erro)"
          />
          {trail.testMetrics ? (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                label="Acurácia"
                value={`${formatNumber(trail.testMetrics.accuracy * 100, 1)}%`}
              />
              <Metric
                label="TP / TN"
                value={`${trail.testMetrics.counts.tp} / ${trail.testMetrics.counts.tn}`}
              />
              <Metric
                label="FP / FN"
                value={`${trail.testMetrics.counts.fp} / ${trail.testMetrics.counts.fn}`}
              />
              <Metric
                label="Precisão*"
                value={`${formatNumber(trail.testMetrics.precision * 100, 1)}%`}
              />
            </dl>
          ) : null}
          <p className="text-xs text-muted">
            * Precisão/recall são extensões da experiência — não conteúdo
            obrigatório da trilha do material.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead className="bg-surface-muted text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">p</th>
                  <th className="px-3 py-2">ŷ</th>
                  <th className="px-3 py-2">y</th>
                  <th className="px-3 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {(trail.testPredictions ?? []).slice(0, 12).map((item) => (
                  <tr key={item.row.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">
                      {formatNumber(item.p, 3)}
                    </td>
                    <td className="px-3 py-2 font-mono">{item.pred}</td>
                    <td className="px-3 py-2 font-mono">{item.row.label}</td>
                    <td className="px-3 py-2">
                      {item.correct ? "Correto" : "Incorreto"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <StepActions
        onBack={trail.back}
        onNext={trail.next}
        nextDisabled={!trail.tested}
      />
    </StepShell>
  );
}

function RegularizationStep({ trail }: Props) {
  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 10 · Regularização"
        title="L1, L2 e o hiperparâmetro C"
        description={
          <p>
            C pequeno → regularização forte; C grande → regularização fraca.
            Retreine e observe o efeito real nos parâmetros e na acurácia — sem
            garantir melhoria.
          </p>
        }
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm">
          <span>
            C = <span className="font-mono">{formatNumber(trail.C, 2)}</span>
          </span>
          <input
            type="range"
            min={0.05}
            max={10}
            step={0.05}
            value={trail.C}
            onChange={(e) => trail.setC(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </label>
        <div className="flex gap-2">
          {(["l2", "l1", "none"] as const).map((kind) => (
            <Button
              key={kind}
              variant={trail.regularization === kind ? "primary" : "ghost"}
              onClick={() => trail.setRegularization(kind)}
            >
              {kind.toUpperCase()}
            </Button>
          ))}
        </div>
        <Button onClick={trail.trainModel}>Retreinar</Button>
      </div>
      {trail.model ? (
        <>
          <ClassificationScatter
            points={trail.binaryPlotPoints}
            classNames={trail.classNamesBinary}
            xLabel={trail.featureLabels.binary[0]}
            yLabel={trail.featureLabels.binary[1]}
            boundary={trail.boundary}
            showTest={trail.tested}
            title="Modelo com regularização atual"
          />
          {trail.trainMetrics ? (
            <p className="text-sm text-muted">
              Acurácia treino:{" "}
              <span className="font-mono text-foreground">
                {formatNumber(trail.trainMetrics.accuracy * 100, 1)}%
              </span>
              {trail.testMetrics ? (
                <>
                  {" · "}teste:{" "}
                  <span className="font-mono text-foreground">
                    {formatNumber(trail.testMetrics.accuracy * 100, 1)}%
                  </span>
                </>
              ) : null}
            </p>
          ) : null}
          <ClassificationUnderTheHood
            variant="regularization"
            model={trail.model}
          />
        </>
      ) : null}
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function SoftmaxIntroStep({ trail }: Props) {
  useEffect(() => {
    if (!trail.softmaxModel) trail.trainSoftmax();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 11 · Multiclasse"
        title="E quando existem mais de duas classes?"
        description={
          <p>
            Softmax Regression estende a ideia: um score por classe, convertidos
            em probabilidades que somam 1. A predição é a classe de maior
            probabilidade.
          </p>
        }
      />
      <p className="rounded-md border border-border bg-surface-muted/60 px-3 py-2 text-sm">
        {trail.multiclassRule.description}
      </p>
      <ClassificationScatter
        points={trail.multiclassPlotPoints}
        classNames={[...trail.multiclassRule.classNames]}
        xLabel={trail.featureLabels.multiclass[0]}
        yLabel={trail.featureLabels.multiclass[1]}
        title="Perfis de risco no plano das features"
      />
      <ClassificationUnderTheHood
        variant="softmax"
        softmaxModel={trail.softmaxModel}
      />
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function SoftmaxExploreStep({ trail }: Props) {
  useEffect(() => {
    if (!trail.softmaxModel) trail.trainSoftmax();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = trail.selectedSoftmaxResult;
  const row = trail.selectedSoftmaxRow;

  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 12 · Experimento"
        title="Explore uma observação"
        description={
          <p>
            Selecione um ponto e compare scores → probabilidades → classe
            escolhida. Troque a observação e veja como a distribuição muda.
          </p>
        }
      />
      <ClassificationScatter
        points={trail.multiclassPlotPoints}
        classNames={[...trail.multiclassRule.classNames]}
        xLabel={trail.featureLabels.multiclass[0]}
        yLabel={trail.featureLabels.multiclass[1]}
        selectedIndex={trail.selectedSoftmaxIndex}
        onSelectIndex={trail.setSelectedSoftmaxIndex}
        title="Clique em um ponto"
      />
      {result && row ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SoftmaxBars
            classNames={[...trail.multiclassRule.classNames]}
            probs={result.probs}
            predictedIndex={result.classIndex}
          />
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p>
              Classe real:{" "}
              <span className="font-medium text-foreground">{row.className}</span>
            </p>
            <p className="mt-2">
              Predição:{" "}
              <span className="font-medium text-accent">{result.className}</span>
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              {[...trail.multiclassRule.classNames]
                .map(
                  (name, i) =>
                    `${name} → ${formatNumber(result.probs[i] ?? 0, 2)}`,
                )
                .join("\n")}
            </p>
          </div>
        </div>
      ) : (
        <Button onClick={trail.trainSoftmax}>Treinar Softmax</Button>
      )}
      <StepActions onBack={trail.back} onNext={trail.next} />
    </StepShell>
  );
}

function ChallengeStep({ trail }: Props) {
  useEffect(() => {
    if (!trail.trained) trail.trainModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepShell>
      <StepHeader
        eyebrow="Etapa 13 · Desafio"
        title="Desafio final de classificação"
        description={
          <p>
            Observe os dados, ajuste o limiar, teste e analise os erros. Não há
            “resposta pronta” — experimente o comportamento do classificador.
          </p>
        }
      />
      <ClassificationScatter
        points={trail.binaryPlotPoints.map((p) => {
          if (!trail.challengeTested || p.group !== "test" || !trail.model) {
            return { ...p, correct: null };
          }
          const pred =
            trail.challengeTestPredictions?.find((t) => t.row.id === p.id)
              ?.correct ?? null;
          return { ...p, correct: pred };
        })}
        classNames={trail.classNamesBinary}
        xLabel={trail.featureLabels.binary[0]}
        yLabel={trail.featureLabels.binary[1]}
        boundary={trail.challengeBoundary}
        showTest={trail.challengeTested}
        dimTest={!trail.challengeTested}
        title="Seu experimento"
      />
      <label className="flex flex-col gap-2 text-sm">
        <span>
          Limiar do desafio τ ={" "}
          <span className="font-mono">
            {formatNumber(trail.challengeThreshold, 2)}
          </span>
        </span>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.01}
          value={trail.challengeThreshold}
          onChange={(e) =>
            trail.setChallengeThreshold(Number(e.target.value))
          }
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button onClick={trail.trainModel}>Retreinar</Button>
        <Button
          onClick={() => trail.setChallengeTested(true)}
          variant={trail.challengeTested ? "ghost" : "primary"}
        >
          TESTAR MODELO
        </Button>
      </div>
      {trail.challengeTested && trail.challengeAccuracy != null ? (
        <p className="text-sm text-muted">
          Acurácia no teste:{" "}
          <span className="font-mono text-foreground">
            {formatNumber(trail.challengeAccuracy * 100, 1)}%
          </span>
          {" · "}
          erros:{" "}
          {(trail.challengeTestPredictions ?? []).filter((r) => !r.correct)
            .length}
        </p>
      ) : null}

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Bônus Softmax</p>
        <p className="mt-1 text-sm text-muted">
          Volte à etapa anterior e compare várias observações multiclasse —
          qual classe domina? As probabilidades somam ≈ 1?
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">
          🐍 Ver código Python
        </p>
        <p className="mt-1 text-sm text-muted">
          A validação Python equivalente para Regressão Logística / Softmax pode
          ser adicionada numa etapa posterior — a trilha já funciona no
          navegador com TypeScript.
        </p>
      </div>
      <StepActions onBack={trail.back} nextLabel="Concluir trilha" onNext={() => trail.goTo(0)} />
    </StepShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}
