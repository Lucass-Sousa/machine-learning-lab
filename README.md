# ML Lab — Machine Learning Laboratory

Laboratório interativo de Machine Learning para aprendizado visual e experimental.

Stack: **Next.js** (App Router) · **TypeScript** · **Tailwind CSS** · 100% client-side na fundação.

## Começar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```text
src/
  app/                  # Rotas (Home, /lab)
  components/
    ui/                 # Botões, container, slider…
    layout/             # Header, Footer, shell
    lab/                # Workspace do laboratório
    visualizations/     # Placeholders de gráficos
    home/               # Peças da landing
  lib/
    ml/                 # Tipos e futura lógica de ML
    datasets/           # Base fixa do laboratório (+ JSON derivado)
    utils/              # Utilitários (ex.: cn)
  database/             # Fonte original (Excel)
```

## Dataset inicial

Base fixa (sem importação pelo usuário nesta etapa):

- Fonte: `database/Data Assessment Results final.xlsx`
- JSON: `src/lib/datasets/data/gamification-assessments.json`
- Experimento atual: **Tentativa × Pontuação** em avaliações gamificadas

## Rotas

| Rota   | Descrição                          |
|--------|------------------------------------|
| `/`    | Apresentação do ML Lab             |
| `/lab` | Área principal de experimentação   |

## Próximos passos

- Implementar regressão linear e métricas
- Tornar o scatter plot interativo
- Conectar controles aos algoritmos
