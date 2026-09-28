export type ConfusionCounts = {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
};

export function confusionBinary(
  yTrue: Array<0 | 1>,
  yPred: Array<0 | 1>,
): ConfusionCounts {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  for (let i = 0; i < yTrue.length; i += 1) {
    const t = yTrue[i]!;
    const p = yPred[i]!;
    if (t === 1 && p === 1) tp += 1;
    else if (t === 0 && p === 0) tn += 1;
    else if (t === 0 && p === 1) fp += 1;
    else fn += 1;
  }
  return { tp, tn, fp, fn };
}

export function accuracyFromPredictions(
  yTrue: number[],
  yPred: number[],
): number {
  if (yTrue.length === 0) return 0;
  let correct = 0;
  for (let i = 0; i < yTrue.length; i += 1) {
    if (yTrue[i] === yPred[i]) correct += 1;
  }
  return correct / yTrue.length;
}

export function binaryAccuracy(counts: ConfusionCounts): number {
  const total = counts.tp + counts.tn + counts.fp + counts.fn;
  if (total === 0) return 0;
  return (counts.tp + counts.tn) / total;
}

/** Extension metrics — not required by the course core path. */
export function binaryPrecision(counts: ConfusionCounts): number {
  const denom = counts.tp + counts.fp;
  return denom === 0 ? 0 : counts.tp / denom;
}

export function binaryRecall(counts: ConfusionCounts): number {
  const denom = counts.tp + counts.fn;
  return denom === 0 ? 0 : counts.tp / denom;
}
