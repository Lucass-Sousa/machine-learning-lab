# ML Lab — Machine Learning Laboratory

Laboratório interativo de Machine Learning para aprendizado visual e experimental.

Stack: **Next.js** (App Router) · **TypeScript** · **Tailwind CSS** · Python (validação de referência).

## Começar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Datasets

### Regressão (`base_credito`)

- Fonte: `database/base_credito.csv` (50 000 registros)
- Amostra embutida: `src/lib/datasets/data/base-credito.sample.json` (2 500 linhas)
- Variáveis numéricas: `idade`, `renda_mensal`, `score_credito`, `historico_pagamentos`, `valor_emprestimo`
- Usado pelas trilhas de Regressão Linear e Polinomial

### Classificação (`base_classificacao`)

- Fonte: `database/base_classificacao.csv` (4 000 registros)
- Amostra embutida: `src/lib/datasets/data/base-classificacao.sample.json` (2 500 linhas)
- Features: `renda_mensal`, `tempo_cliente_anos`, `score_comportamento`, `uso_credito_pct`
- Alvos nativos: `aprovado` (0/1) e `perfil_risco` (Baixo / Médio / Alto)
- Usado pela trilha de Regressão Logística / Softmax

Catálogo em `src/lib/data/catalog.ts`.

## Estrutura

```text
src/lib/data/          # Camada de dados (schema, observações, catálogo)
src/lib/datasets/      # Compatibilidade + JSON embutido
src/lib/ml/            # Algoritmos TypeScript
python/                # Referência e validação Python
database/              # CSV fonte
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home / trilhas |
| `/learn/linear-regression` | Trilha de Regressão Linear |
| `/learn/polynomial-regression` | Trilha de Regressão Polinomial |
| `/learn/logistic-regression` | Trilha de Classificação (Logística + Softmax) |
| `/laboratory` | Laboratório livre (stub) |
