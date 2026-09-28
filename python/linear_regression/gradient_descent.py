"""Batch Gradient Descent for simple linear regression — educational reference."""

from __future__ import annotations

import numpy as np

from .metrics import mean_squared_error


def run_gradient_descent(
    x: np.ndarray,
    y: np.ndarray,
    *,
    learning_rate: float = 1e-8,
    iterations: int = 40,
    initial_intercept: float = 0.0,
    initial_slope: float = 0.0,
) -> dict:
    """
    Minimize MSE with batch gradient descent.

    Update rule (MSE loss):
        θ₀ ← θ₀ − η · (2/n) Σ (ŷᵢ − yᵢ)
        θ₁ ← θ₁ − η · (2/n) Σ (ŷᵢ − yᵢ) · xᵢ
    """
    x = np.asarray(x, dtype=float).reshape(-1)
    y = np.asarray(y, dtype=float).reshape(-1)
    n = x.size

    theta0 = float(initial_intercept)
    theta1 = float(initial_slope)
    history: list[dict] = []
    diverged = False

    for iteration in range(iterations + 1):
        # 1) predictions
        y_hat = theta0 + theta1 * x
        # 2) error (ŷ − y) used for gradients of MSE
        error = y_hat - y
        mse = float(np.mean(error ** 2))
        frame_diverged = not np.isfinite(mse) or mse > 1e20

        history.append(
            {
                "iteration": iteration,
                "intercept": theta0,
                "slope": theta1,
                "mse": float("inf") if frame_diverged else mse,
                "diverged": frame_diverged,
            }
        )

        if frame_diverged:
            diverged = True
            break

        if iteration == iterations:
            break

        # 3) gradients
        grad0 = (2.0 / n) * float(np.sum(error))
        grad1 = (2.0 / n) * float(np.sum(error * x))

        # 4) parameter update
        theta0 -= learning_rate * grad0
        theta1 -= learning_rate * grad1

        if not np.isfinite(theta0) or not np.isfinite(theta1):
            diverged = True
            history.append(
                {
                    "iteration": iteration + 1,
                    "intercept": theta0,
                    "slope": theta1,
                    "mse": float("inf"),
                    "diverged": True,
                }
            )
            break

    last = history[-1]
    return {
        "intercept": last["intercept"],
        "slope": last["slope"],
        "mse": last["mse"],
        "diverged": diverged,
        "history": history,
    }
