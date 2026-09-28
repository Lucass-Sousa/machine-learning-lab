"""MSE and MAE — educational reference implementations."""

from __future__ import annotations

import numpy as np


def mean_absolute_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """MAE = (1/n) Σ |y − ŷ|"""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.mean(np.abs(y_true - y_pred)))


def mean_squared_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """MSE = (1/n) Σ (y − ŷ)²"""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.mean((y_true - y_pred) ** 2))


def residuals(y_true: np.ndarray, y_pred: np.ndarray) -> np.ndarray:
    """error = y − ŷ"""
    return np.asarray(y_true, dtype=float) - np.asarray(y_pred, dtype=float)
