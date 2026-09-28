import type { Point2D } from "@/lib/ml/types";

export type LinearParameters = {
  slope: number;
  intercept: number;
};

export type Residual = {
  x: number;
  observed: number;
  predicted: number;
  error: number;
};

export type LinearFitResult = LinearParameters & {
  predictions: Point2D[];
  residuals: Residual[];
};
