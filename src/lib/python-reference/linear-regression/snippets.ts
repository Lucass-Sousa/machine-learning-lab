export type PythonSnippetId =
  | "normal-equation"
  | "metrics"
  | "gradient-descent"
  | "normalize"
  | "split"
  | "predict";

export type PythonSnippet = {
  id: PythonSnippetId;
  title: string;
  description: string;
  algorithm:
    | "normal_equation"
    | "metrics"
    | "gradient_descent"
    | "normalize"
    | "split";
  code: string;
};

/**
 * Educational Python excerpts shown in "Ver código Python".
 * Kept small and concept-focused — not internal infrastructure.
 */
export const LINEAR_REGRESSION_SNIPPETS: Record<PythonSnippetId, PythonSnippet> = {
  "normal-equation": {
    id: "normal-equation",
    title: "Normal Equation",
    description:
      "Este código ajusta ŷ = θ₀ + θ₁x resolvendo a Normal Equation com NumPy.",
    algorithm: "normal_equation",
    code: `import numpy as np

def fit_normal_equation(x, y):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)

    # X = [1, x]
    X = np.column_stack([np.ones(len(x)), x])

    # θ = (XᵀX)⁻¹ Xᵀy
    theta = np.linalg.solve(X.T @ X, X.T @ y)

    intercept, slope = theta[0], theta[1]
    return intercept, slope
`,
  },
  predict: {
    id: "predict",
    title: "Previsão linear",
    description:
      "Depois de encontrar θ₀ e θ₁, a previsão para um novo x é uma reta.",
    algorithm: "normal_equation",
    code: `def predict(x, intercept, slope):
    # ŷ = θ₀ + θ₁x
    return intercept + slope * x
`,
  },
  metrics: {
    id: "metrics",
    title: "MAE e MSE",
    description:
      "Este código resume os erros da reta em dois números: MAE e MSE.",
    algorithm: "metrics",
    code: `import numpy as np

def mean_absolute_error(y_true, y_pred):
    # MAE = (1/n) Σ |y − ŷ|
    return float(np.mean(np.abs(y_true - y_pred)))

def mean_squared_error(y_true, y_pred):
    # MSE = (1/n) Σ (y − ŷ)²
    return float(np.mean((y_true - y_pred) ** 2))
`,
  },
  "gradient-descent": {
    id: "gradient-descent",
    title: "Gradient Descent",
    description:
      "Este código atualiza θ₀ e θ₁ iterativamente para reduzir o MSE. Observe previsão → erro → gradiente → atualização.",
    algorithm: "gradient_descent",
    code: `import numpy as np

def run_gradient_descent(x, y, learning_rate=1e-8, iterations=40):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    n = len(x)

    # parâmetros iniciais
    theta0, theta1 = 0.0, 0.0

    for _ in range(iterations):
        # 1) previsões
        y_hat = theta0 + theta1 * x

        # 2) erro (ŷ − y)
        error = y_hat - y

        # 3) gradientes do MSE
        grad0 = (2 / n) * np.sum(error)
        grad1 = (2 / n) * np.sum(error * x)

        # 4) atualização dos parâmetros
        theta0 -= learning_rate * grad0
        theta1 -= learning_rate * grad1

    return theta0, theta1
`,
  },
  normalize: {
    id: "normalize",
    title: "Normalização (z-score)",
    description:
      "Coloca variáveis em escala comparável: média 0 e desvio 1.",
    algorithm: "normalize",
    code: `import numpy as np

def zscore(values):
    values = np.asarray(values, dtype=float)
    mean = values.mean()
    std = values.std() or 1.0
    # z = (x − μ) / σ
    return (values - mean) / std, mean, std
`,
  },
  split: {
    id: "split",
    title: "Train / Test split",
    description:
      "Separa observações em treino e teste para avaliar generalização.",
    algorithm: "split",
    code: `import numpy as np

def train_test_split(x, y, train_ratio=0.8, seed=42):
    rng = np.random.default_rng(seed)
    indices = np.arange(len(x))
    rng.shuffle(indices)

    train_size = int(len(x) * train_ratio)
    train_idx = indices[:train_size]
    test_idx = indices[train_size:]

    return (
        x[train_idx], y[train_idx],
        x[test_idx], y[test_idx],
    )
`,
  },
};

export const STEP_PYTHON_SNIPPETS: Partial<
  Record<string, PythonSnippetId[]>
> = {
  line: ["normal-equation"],
  predict: ["predict", "normal-equation"],
  errors: ["metrics"],
  metrics: ["metrics"],
  train: ["normal-equation"],
  gradient: ["gradient-descent", "normalize"],
  split: ["split", "metrics"],
  validation: ["split", "metrics"],
  diagnosis: ["normal-equation", "metrics"],
  lab: ["normal-equation", "gradient-descent", "normalize", "metrics"],
};
