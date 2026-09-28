"""Normal Equation for simple linear regression — educational reference."""

from __future__ import annotations

import numpy as np

from .metrics import mean_absolute_error, mean_squared_error, residuals


def fit_normal_equation(x: np.ndarray, y: np.ndarray) -> dict:
    """
    Fit ŷ = θ₀ + θ₁x using the Normal Equation:

        θ = (XᵀX)⁻¹ Xᵀy

    where X = [1, x].
    """
    x = np.asarray(x, dtype=float).reshape(-1)
    y = np.asarray(y, dtype=float).reshape(-1)

    if x.size < 2:
        raise ValueError("Need at least 2 observations.")

    # Design matrix with intercept column
    X = np.column_stack([np.ones(x.size), x])

    # θ = (XᵀX)⁻¹ Xᵀy
    theta = np.linalg.solve(X.T @ X, X.T @ y)
    intercept = float(theta[0])
    slope = float(theta[1])

    y_hat = intercept + slope * x
    return {
        "intercept": intercept,
        "slope": slope,
        "predictions": y_hat.tolist(),
        "residuals": residuals(y, y_hat).tolist(),
        "mae": mean_absolute_error(y, y_hat),
        "mse": mean_squared_error(y, y_hat),
    }


def predict(x: np.ndarray | float, intercept: float, slope: float) -> np.ndarray | float:
    """ŷ = θ₀ + θ₁x"""
    return intercept + slope * np.asarray(x, dtype=float)
