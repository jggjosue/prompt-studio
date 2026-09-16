export interface EvaluationJobLike {
  promptVersionId?: string | null;
  promptVersionNumber?: number | null;
  status?: string | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  actualDurationMs?: number | null;
  outputQuality?: string | null;
  result?: unknown;
}

export interface EvaluationFeedbackLike {
  promptVersionNumber?: number | null;
  promptVersionId?: string | null;
  useful?: boolean | null;
  rating?: number | null;
  reason?: string | null;
}

export interface VersionSignals {
  jobCount: number;
  completedCount: number;
  quality: number | null;
  fidelity: number | null;
  costUsd: number | null;
  latencyMs: number | null;
  feedback: {
    count: number;
    useful: number;
    ratingAvg: number | null;
    reasons: Record<string, number>;
  };
}

export interface AxisComparison {
  axis: string;
  label: string;
  higherBetter: boolean;
  aValue: number | null;
  bValue: number | null;
  winner: 'a' | 'b' | 'equal' | null;
}

export interface VersionComparison {
  axes: AxisComparison[];
  judgedAxes: number;
}

export function boundedScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function evaluationScores(result: unknown): { quality: number | null; fidelity: number | null } {
  const evaluation = result && typeof result === 'object' ? (result as Record<string, unknown>).evaluation : null;
  const scores = evaluation && typeof evaluation === 'object' ? (evaluation as Record<string, unknown>) : {};
  return { quality: boundedScore(scores.quality), fidelity: boundedScore(scores.fidelity) };
}

export function signalsByVersion(
  jobs: readonly EvaluationJobLike[],
  feedbacks: readonly EvaluationFeedbackLike[],
  versionNumber: number
): VersionSignals | null {
  const jobRows = jobs.filter((job) => job.promptVersionNumber === versionNumber);
  const feedbackRows = feedbacks.filter((feedback) => feedback.promptVersionNumber === versionNumber);
  if (jobRows.length === 0 && feedbackRows.length === 0) return null;

  const completed = jobRows.filter((job) => job.status === 'completed');
  const qualities = [];
  const fidelities = [];
  const costs: number[] = [];
  const latencies: number[] = [];
  for (const job of completed) {
    const { quality, fidelity } = evaluationScores(job.result);
    if (quality != null) qualities.push(quality);
    if (fidelity != null) fidelities.push(fidelity);
    const cost = job.actualCostUsd ?? job.estimatedCostUsd;
    if (typeof cost === 'number' && Number.isFinite(cost) && cost >= 0) costs.push(cost);
    if (typeof job.actualDurationMs === 'number' && Number.isFinite(job.actualDurationMs) && job.actualDurationMs >= 0) latencies.push(job.actualDurationMs);
  }
  const ratings = feedbackRows
    .map((feedback) => feedback.rating)
    .filter((rating): rating is number => typeof rating === 'number' && rating >= 1 && rating <= 5);
  const reasons: Record<string, number> = {};
  for (const feedback of feedbackRows) {
    if (feedback.reason) reasons[feedback.reason] = (reasons[feedback.reason] ?? 0) + 1;
  }
  const average = (values: number[]) => (values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

  return {
    jobCount: jobRows.length,
    completedCount: completed.length,
    quality: average(qualities),
    fidelity: average(fidelities),
    costUsd: costs.length > 0 ? Math.round(costs.reduce((sum, value) => sum + value, 0) * 10_000) / 10_000 : null,
    latencyMs: average(latencies),
    feedback: {
      count: feedbackRows.length,
      useful: feedbackRows.filter((feedback) => feedback.useful === true).length,
      ratingAvg: average(ratings),
      reasons,
    },
  };
}

function axis(
  name: string,
  label: string,
  higherBetter: boolean,
  a: VersionSignals,
  b: VersionSignals,
  pick: (signals: VersionSignals) => number | null
): AxisComparison | null {
  const aValue = pick(a);
  const bValue = pick(b);
  if (aValue == null || bValue == null) return null;
  const winner = aValue === bValue ? 'equal' : higherBetter ? (aValue > bValue ? 'a' : 'b') : aValue < bValue ? 'a' : 'b';
  return { axis: name, label, higherBetter, aValue, bValue, winner };
}

/**
 * Compara dos versiones usando únicamente los ejes donde ambas tienen señal
 * registrada: entradas inconsistentes no se comparan.
 */
export function compareVersions(a: VersionSignals, b: VersionSignals): VersionComparison {
  const axes = [
    axis('quality', 'Calidad', true, a, b, (signals) => signals.quality),
    axis('fidelity', 'Fidelidad', true, a, b, (signals) => signals.fidelity),
    axis('costUsd', 'Coste medio', false, a, b, (signals) => signals.costUsd),
    axis('latencyMs', 'Latencia media', false, a, b, (signals) => signals.latencyMs),
    axis('rating', 'Valoración media', true, a, b, (signals) => signals.feedback.ratingAvg),
  ].filter((entry): entry is AxisComparison => entry !== null);
  const judgedAxes = axes.length;
  return { axes, judgedAxes };
}