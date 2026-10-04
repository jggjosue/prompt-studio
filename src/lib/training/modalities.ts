/**
 * Single source of truth for training modalities.
 *
 * Adding a modality is a two-step change: append it to TRAINING_MODALITIES and,
 * if it produces examples, register a dataset for it in `dataset-registry.ts`.
 * Nothing else in the pipeline switches on modality names.
 *
 * `vision` and `project` are legacy values written by schemaVersion 1 records
 * (the raw AI job kind). They stay readable and are normalized on read.
 */
export const ACTIVE_TRAINING_MODALITIES = ['text', 'image', 'video', 'web'] as const;
export const RESERVED_TRAINING_MODALITIES = ['audio', '3d', 'document', 'agent', 'code', 'multimodal'] as const;
export const TRAINING_MODALITIES = [...ACTIVE_TRAINING_MODALITIES, ...RESERVED_TRAINING_MODALITIES] as const;
export const LEGACY_TRAINING_MODALITIES = ['vision', 'project'] as const;

export type TrainingModality = (typeof TRAINING_MODALITIES)[number];
export type StoredTrainingModality = TrainingModality | (typeof LEGACY_TRAINING_MODALITIES)[number];

/** Every value the MongoDB enum must accept, including legacy rows. */
export const STORED_TRAINING_MODALITIES: readonly StoredTrainingModality[] = [
  ...TRAINING_MODALITIES,
  ...LEGACY_TRAINING_MODALITIES,
];

const LEGACY_MAP: Record<(typeof LEGACY_TRAINING_MODALITIES)[number], TrainingModality> = {
  project: 'web',
  vision: 'multimodal',
};

const JOB_KIND_MAP: Record<string, TrainingModality> = {
  text: 'text',
  image: 'image',
  video: 'video',
  web: 'web',
  project: 'web',
  vision: 'multimodal',
  videoUnderstanding: 'multimodal',
};

export function isTrainingModality(value: unknown): value is TrainingModality {
  return typeof value === 'string' && (TRAINING_MODALITIES as readonly string[]).includes(value);
}

/** Normalizes stored values (including legacy ones) to a current modality. */
export function normalizeTrainingModality(value: unknown): TrainingModality | null {
  if (isTrainingModality(value)) return value;
  if (typeof value === 'string' && value in LEGACY_MAP) return LEGACY_MAP[value as keyof typeof LEGACY_MAP];
  return null;
}

/** Maps an AIGenerationJob kind to the modality recorded for training. */
export function trainingModalityForJobKind(kind: unknown): TrainingModality | null {
  return typeof kind === 'string' ? JOB_KIND_MAP[kind] ?? null : null;
}
