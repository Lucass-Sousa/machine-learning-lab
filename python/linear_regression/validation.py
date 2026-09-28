"""
Validate ML Lab numeric outputs against Python reference implementations.

Usage:
  python -m python.linear_regression.validation < payload.json

Or:
  python -m python.linear_regression.validation --file payload.json

Payload shape:
{
  "algorithm": "normal_equation" | "gradient_descent" | "metrics" | "normalize" | "split",
  "points": [{"x": 1, "y": 2}, ...],
  "options": { ... },
  "lab": { ... results from ML Lab ... },
  "tolerance": 1e-6
}
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from typing import Any

import numpy as np

from .gradient_descent import run_gradient_descent
from .metrics import mean_absolute_error, mean_squared_error
from .normal_equation import fit_normal_equation
from .normalize import normalize_xy
from .split import train_test_split


def nearly_equal(a: float, b: float, tol: float) -> bool:
    if a is None or b is None:
        return False
    if math.isinf(a) and math.isinf(b):
        return True
    if math.isnan(a) and math.isnan(b):
        return True
    return abs(float(a) - float(b)) <= tol * max(1.0, abs(float(a)), abs(float(b)))


def compare_number(
    name: str,
    lab: float,
    ref: float,
    tol: float,
    *,
    left_label: str = "ML Lab",
    right_label: str = "Python",
) -> dict[str, Any]:
    ok = nearly_equal(lab, ref, tol)
    return {
        "name": name,
        "lab": lab,
        "python": ref,
        "leftLabel": left_label,
        "rightLabel": right_label,
        "delta": None if lab is None or ref is None else abs(float(lab) - float(ref)),
        "consistent": ok,
    }


def points_to_xy(points: list[dict]) -> tuple[np.ndarray, np.ndarray]:
    x = np.array([p["x"] for p in points], dtype=float)
    y = np.array([p["y"] for p in points], dtype=float)
    return x, y


def validate_payload(payload: dict[str, Any]) -> dict[str, Any]:
    algorithm = payload.get("algorithm")
    points = payload.get("points") or []
    options = payload.get("options") or {}
    lab = payload.get("lab") or {}
    tol = float(payload.get("tolerance", 1e-6))

    comparisons: list[dict[str, Any]] = []
    python_result: dict[str, Any] = {}
    sklearn_result: dict[str, Any] | None = None

    x, y = points_to_xy(points) if points else (np.array([]), np.array([]))

    if algorithm == "normal_equation":
        python_result = fit_normal_equation(x, y)
        comparisons.extend(
            [
                compare_number("θ₀ (intercept)", lab.get("intercept"), python_result["intercept"], tol),
                compare_number("θ₁ (slope)", lab.get("slope"), python_result["slope"], tol),
                compare_number("MSE", lab.get("mse"), python_result["mse"], tol),
                compare_number("MAE", lab.get("mae"), python_result["mae"], tol),
            ]
        )
        try:
            from sklearn.linear_model import LinearRegression

            model = LinearRegression()
            model.fit(x.reshape(-1, 1), y)
            sklearn_result = {
                "intercept": float(model.intercept_),
                "slope": float(model.coef_[0]),
            }
            comparisons.extend(
                [
                    compare_number(
                        "θ₀ (Python vs sklearn)",
                        python_result["intercept"],
                        sklearn_result["intercept"],
                        tol,
                        left_label="Python",
                        right_label="sklearn",
                    ),
                    compare_number(
                        "θ₁ (Python vs sklearn)",
                        python_result["slope"],
                        sklearn_result["slope"],
                        tol,
                        left_label="Python",
                        right_label="sklearn",
                    ),
                ]
            )
        except Exception as exc:  # noqa: BLE001 - optional dependency path
            sklearn_result = {"available": False, "error": str(exc)}

    elif algorithm == "gradient_descent":
        python_result = run_gradient_descent(
            x,
            y,
            learning_rate=float(options.get("learningRate", 1e-8)),
            iterations=int(options.get("iterations", 40)),
            initial_intercept=float(options.get("initialIntercept", 0.0)),
            initial_slope=float(options.get("initialSlope", 0.0)),
        )
        comparisons.extend(
            [
                compare_number("θ₀ (intercept)", lab.get("intercept"), python_result["intercept"], tol),
                compare_number("θ₁ (slope)", lab.get("slope"), python_result["slope"], tol),
                compare_number("MSE", lab.get("mse"), python_result["mse"], tol),
            ]
        )
        if "diverged" in lab:
            comparisons.append(
                {
                    "name": "diverged",
                    "lab": lab.get("diverged"),
                    "python": python_result["diverged"],
                    "delta": None,
                    "consistent": bool(lab.get("diverged")) == bool(python_result["diverged"]),
                }
            )

    elif algorithm == "metrics":
        intercept = float(lab.get("intercept", options.get("intercept", 0)))
        slope = float(lab.get("slope", options.get("slope", 0)))
        y_hat = intercept + slope * x
        python_result = {
            "mae": mean_absolute_error(y, y_hat),
            "mse": mean_squared_error(y, y_hat),
        }
        comparisons.extend(
            [
                compare_number("MAE", lab.get("mae"), python_result["mae"], tol),
                compare_number("MSE", lab.get("mse"), python_result["mse"], tol),
            ]
        )

    elif algorithm == "normalize":
        python_result = normalize_xy(x, y)
        comparisons.extend(
            [
                compare_number("μₓ", lab.get("xMean"), python_result["x"]["mean"], tol),
                compare_number("σₓ", lab.get("xStd"), python_result["x"]["std"], tol),
                compare_number("μᵧ", lab.get("yMean"), python_result["y"]["mean"], tol),
                compare_number("σᵧ", lab.get("yStd"), python_result["y"]["std"], tol),
            ]
        )

    elif algorithm == "split":
        ratio = float(options.get("trainRatio", 0.8))
        seed = int(options.get("seed", 42))
        python_result = train_test_split(x, y, train_ratio=ratio, seed=seed)
        # Prefer validating sizes; index equality depends on PRNG parity.
        comparisons.append(
            {
                "name": "train_size",
                "lab": lab.get("trainSize"),
                "python": len(python_result["train_indices"]),
                "delta": None
                if lab.get("trainSize") is None
                else abs(int(lab["trainSize"]) - len(python_result["train_indices"])),
                "consistent": lab.get("trainSize") == len(python_result["train_indices"]),
            }
        )
        comparisons.append(
            {
                "name": "test_size",
                "lab": lab.get("testSize"),
                "python": len(python_result["test_indices"]),
                "delta": None
                if lab.get("testSize") is None
                else abs(int(lab["testSize"]) - len(python_result["test_indices"])),
                "consistent": lab.get("testSize") == len(python_result["test_indices"]),
            }
        )
        # If lab sends indices, verify exact match when PRNG aligns.
        if lab.get("trainIndices") is not None:
            same = list(lab["trainIndices"]) == list(python_result["train_indices"])
            comparisons.append(
                {
                    "name": "train_indices",
                    "lab": "provided",
                    "python": "computed",
                    "delta": None,
                    "consistent": same,
                }
            )

    else:
        return {
            "ok": False,
            "error": f"Unknown algorithm: {algorithm}",
            "comparisons": [],
        }

    consistent = all(item["consistent"] for item in comparisons) if comparisons else False

    return {
        "ok": True,
        "algorithm": algorithm,
        "consistent": consistent,
        "tolerance": tol,
        "comparisons": comparisons,
        "python": {
            k: v
            for k, v in python_result.items()
            if k not in {"predictions", "residuals", "history", "x_normalized", "y_normalized"}
        },
        "sklearn": sklearn_result,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate ML Lab results against Python.")
    parser.add_argument("--file", "-f", help="JSON payload file (default: stdin)")
    args = parser.parse_args()

    raw = open(args.file, encoding="utf-8").read() if args.file else sys.stdin.read()
    payload = json.loads(raw)
    result = validate_payload(payload)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0 if result.get("consistent") else 1


if __name__ == "__main__":
    raise SystemExit(main())
