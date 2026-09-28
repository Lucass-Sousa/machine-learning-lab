# ML Lab — Machine Learning Laboratory

Laboratório interativo de Machine Learning para aprendizado visual e experimental.

Stack: **Next.js** (App Router) · **TypeScript** · **Tailwind CSS** · Python (validação de referência).

## Começar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Dataset principal (MVP)

- Fonte: `database/base_credito.csv` (50 000 registros)
- Amostra real embutida para o lab: `src/lib/datasets/data/base-credito.sample.json` (2 500 linhas uniformes)
- Variáveis numéricas: `idade`, `renda_mensal`, `score_credito`, `historico_pagamentos`, `valor_emprestimo`
- Padrão da trilha: **renda mensal → valor do empréstimo**

Catálogo preparado em `src/lib/data/catalog.ts` para datasets futuros (sem seletor múltiplo ainda).

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
| `/laboratory` | Laboratório livre (stub) |
