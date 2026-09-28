"""Feature scaling helpers — educational reference."""

from __future__ import annotations

import numpy as np


def zscore_stats(values: np.ndarray) -> dict:
    values = np.asarray(values, dtype=float).reshape(-1)
    mean = float(np.mean(values))
    std = float(np.std(values))  # population std (ddof=0), matches ML Lab
    if std == 0:
        std = 1.0
    return {"mean": mean, "std": std}


def zscore(values: np.ndarray, mean: float, std: float) -> np.ndarray:
    """z = (x − μ) / σ"""
    return (np.asarray(values, dtype=float) - mean) / std


def inverse_zscore(values: np.ndarray, mean: float, std: float) -> np.ndarray:
    """x = z · σ + μ"""
    return np.asarray(values, dtype=float) * std + mean


def normalize_xy(x: np.ndarray, y: np.ndarray) -> dict:
    x_stats = zscore_stats(x)
    y_stats = zscore_stats(y)
    return {
        "x": x_stats,
        "y": y_stats,
        "x_normalized": zscore(x, x_stats["mean"], x_stats["std"]).tolist(),
        "y_normalized": zscore(y, y_stats["mean"], y_stats["std"]).tolist(),
    }
