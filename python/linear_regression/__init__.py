"""Linear regression educational reference package."""

from .gradient_descent import run_gradient_descent
from .metrics import mean_absolute_error, mean_squared_error
from .normal_equation import fit_normal_equation, predict
from .normalize import normalize_xy
from .split import train_test_split

__all__ = [
    "fit_normal_equation",
    "predict",
    "mean_absolute_error",
    "mean_squared_error",
    "run_gradient_descent",
    "normalize_xy",
    "train_test_split",
]
