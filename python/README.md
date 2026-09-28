# Python reference layer — ML Lab

Implementações de referência em Python para **validar** e **ensinar** os algoritmos do laboratório.

## Papel nesta arquitetura

| Camada | Função |
|--------|--------|
| Frontend | interação, gráficos, animações |
| ML (TypeScript) | cálculos em tempo real no lab |
| Python | referência, validação, código educacional |

Python **não** é obrigatório a cada interação da UI.

## Instalar

```bash
python3 -m pip install --user -r python/requirements.txt
# ou, se o pip reclamar de ambiente gerenciado pelo sistema:
python3 -m pip install --user --break-system-packages -r python/requirements.txt
```

## Validar um payload

O comando espera um arquivo JSON com `algorithm`, `points` e `lab`.

Exemplo pronto:

```bash
npm run validate:ml -- --file python/examples/payload.normal_equation.json
```

Ou:

```bash
PYTHONPATH=. python3 -m python.linear_regression.validation --file python/examples/payload.normal_equation.json
```

`payload.json` na raiz **não** existe por padrão — use o exemplo acima ou crie o seu.
## Módulos (Regressão Linear)

- `metrics.py` — MAE / MSE
- `normal_equation.py` — Normal Equation
- `gradient_descent.py` — Gradient Descent didático
- `normalize.py` — z-score
- `split.py` — train/test split
- `validation.py` — comparação numérica com tolerância

Pastas futuras (`polynomial_regression/`, etc.) seguirão o mesmo padrão.
