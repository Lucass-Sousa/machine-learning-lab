import type { TrailState } from "@/components/learn/linear-regression/useLinearRegressionTrail";
import type { ValidationRequest } from "@/lib/python-reference/compare";

export function buildValidationRequestForStep(
  trail: TrailState,
  preferredAlgorithm?: ValidationRequest["algorithm"],
): ValidationRequest | null {
  const points = trail.points.map((point) => ({ x: point.x, y: point.y }));
  if (points.length < 2) return null;

  const algorithm =
    preferredAlgorithm ??
    defaultAlgorithmForStep(trail.stepId);

  if (algorithm === "normal_equation") {
    const model = trail.olsAll ?? trail.olsTrain;
    const evaluation = trail.allEval ?? trail.trainEval;
    if (!model || !evaluation) return null;
    return {
      algorithm,
      points,
      lab: {
        intercept: model.intercept,
        slope: model.slope,
        mae: evaluation.mae,
        mse: evaluation.mse,
      },
    };
  }

  if (algorithm === "metrics") {
    const model = trail.displayParameters ?? trail.olsAll;
    const evaluation = trail.allEval ?? trail.trainEval;
    if (!model || !evaluation) return null;
    return {
      algorithm,
      points,
      lab: {
        intercept: model.intercept,
        slope: model.slope,
        mae: evaluation.mae,
        mse: evaluation.mse,
      },
    };
  }

  if (algorithm === "gradient_descent") {
    const frame = trail.currentGd;
    if (!frame) return null;
    return {
      algorithm,
      points: trail.split.train.map((point) => ({ x: point.x, y: point.y })),
      options: {
        learningRate: trail.learningRate,
        iterations: trail.gdFrame,
        initialIntercept: 0,
        initialSlope: 0,
      },
      lab: {
        intercept: frame.intercept,
        slope: frame.slope,
        mse: frame.mse,
        diverged: frame.diverged,
      },
    };
  }

  if (algorithm === "normalize") {
    return {
      algorithm,
      points: trail.rawPoints.map((point) => ({ x: point.x, y: point.y })),
      lab: {
        xMean: trail.normalization.x.mean,
        xStd: trail.normalization.x.std,
        yMean: trail.normalization.y.mean,
        yStd: trail.normalization.y.std,
      },
    };
  }

  if (algorithm === "split") {
    return {
      algorithm,
      points: trail.rawPoints.map((point) => ({ x: point.x, y: point.y })),
      options: {
        trainRatio: trail.trainRatio,
        seed: 42,
      },
      lab: {
        trainSize: trail.split.train.length,
        testSize: trail.split.test.length,
        trainIndices: trail.split.trainIndices,
      },
    };
  }

  return null;
}

function defaultAlgorithmForStep(
  stepId: string,
): ValidationRequest["algorithm"] {
  switch (stepId) {
    case "metrics":
    case "errors":
      return "metrics";
    case "gradient":
      return "gradient_descent";
    case "split":
    case "validation":
      return "split";
    case "lab":
      return "normal_equation";
    default:
      return "normal_equation";
  }
}
