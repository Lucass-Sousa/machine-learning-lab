"""Train/test split — educational reference (deterministic shuffle)."""

from __future__ import annotations

import numpy as np


def mulberry32(seed: int):
    """Same PRNG used by the ML Lab TypeScript split helper."""

    state = seed & 0xFFFFFFFF

    def random() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        t = state

        # Math.imul-compatible 32-bit multiplications
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t = (t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return float((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return random


def shuffle_indices(length: int, seed: int = 42) -> list[int]:
    indices = list(range(length))
    random = mulberry32(seed)
    for i in range(length - 1, 0, -1):
        j = int(random() * (i + 1))
        indices[i], indices[j] = indices[j], indices[i]
    return indices


def train_test_split(
    x: np.ndarray,
    y: np.ndarray,
    train_ratio: float = 0.8,
    seed: int = 42,
) -> dict:
    x = np.asarray(x, dtype=float).reshape(-1)
    y = np.asarray(y, dtype=float).reshape(-1)
    n = x.size

    clamped = min(0.95, max(0.5, float(train_ratio)))
    indices = shuffle_indices(n, seed)
    train_size = max(2, min(n - 1, int(n * clamped)))

    train_idx = indices[:train_size]
    test_idx = indices[train_size:]

    return {
        "train_indices": train_idx,
        "test_indices": test_idx,
        "x_train": x[train_idx].tolist(),
        "y_train": y[train_idx].tolist(),
        "x_test": x[test_idx].tolist(),
        "y_test": y[test_idx].tolist(),
    }
