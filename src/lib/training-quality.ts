import type { DatasetName } from '@/lib/dataset-object-contract';

/**
 * quality-v2: adds `selected` (the output the user kept after regenerating) and
 * takes feedback from the user's latest verdict. A successful generation alone
 * (0.30) is below every default threshold: success is not evidence of quality.
 */
export const TRAINING_QUALITY_VERSION = 'quality-v2';

export type TrainingQualitySignals = {
  generationSucceeded: boolean;
  saved: boolean;
  downloaded: boolean;
  positiveFeedback: boolean;
  negativeFeedback: boolean;
  regenerated: boolean;
  edited: boolean;
  selected: boolean;
};

export type TrainingQualityResult = {
  version: typeof TRAINING_QUALITY_VERSION;
  score: number;
  threshold: number;
  passes: boolean;
  signals: TrainingQualitySignals;
  contributions: Record<keyof TrainingQualitySignals, number>;
};

export const DEFAULT_QUALITY_THRESHOLDS: Record<DatasetName, number> = {
  'prompt-enhancement': 0.45,
  preference: 0.35,
  'image-generation': 0.5,
  'video-generation': 0.5,
  'web-generation': 0.5,
};

const WEIGHTS: Record<keyof TrainingQualitySignals, number> = {
  generationSucceeded: 0.30,
  saved: 0.20,
  downloaded: 0.15,
  positiveFeedback: 0.25,
  negativeFeedback: -0.35,
  regenerated: -0.10,
  edited: 0.05,
  selected: 0.10,
};

export function qualityThreshold(dataset: DatasetName, env: NodeJS.ProcessEnv = process.env) {
  const key = `TRAINING_QUALITY_THRESHOLD_${dataset.toUpperCase().replace(/-/g, '_')}`;
  const raw = env[key];
  if (raw == null || raw.trim() === '') return DEFAULT_QUALITY_THRESHOLDS[dataset];
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`INVALID_TRAINING_QUALITY_THRESHOLD:${key}`);
  return value;
}

export function calculateTrainingQuality(dataset: DatasetName, signals: TrainingQualitySignals, env: NodeJS.ProcessEnv = process.env): TrainingQualityResult {
  const contributions = Object.fromEntries(
    Object.entries(WEIGHTS).map(([key, weight]) => [key, signals[key as keyof TrainingQualitySignals] ? weight : 0]),
  ) as Record<keyof TrainingQualitySignals, number>;
  const raw = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  const score = Math.max(0, Math.min(1, Math.round(raw * 1000) / 1000));
  const threshold = qualityThreshold(dataset, env);
  return { version: TRAINING_QUALITY_VERSION, score, threshold, passes: score >= threshold, signals, contributions };
}

export function qualitySignalsFromEventNames(eventNames: Iterable<string>): TrainingQualitySignals {
  const events = new Set(eventNames);
  return {
    generationSucceeded: events.has('generation_completed'),
    saved: events.has('output_saved'),
    downloaded: events.has('output_downloaded'),
    positiveFeedback: events.has('feedback_positive'),
    negativeFeedback: events.has('feedback_negative'),
    regenerated: events.has('regenerate_clicked'),
    edited: events.has('prompt_edited'),
    // Derived from the regenerate family, not from a single event; see training/processing.
    selected: false,
  };
}
