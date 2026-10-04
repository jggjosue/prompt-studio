import { trainingContentHash } from '@/lib/training-dedupe';
import type { TrainingModality } from '@/lib/training/modalities';

export const PROMPT_ENHANCEMENT_SCHEMA_VERSION = 1 as const;

export type PromptEnhancementExampleV1 = {
  schemaVersion: typeof PROMPT_ENHANCEMENT_SCHEMA_VERSION;
  exampleId: string;
  originalIntent: string;
  improvedPrompt: string;
  modality: TrainingModality | 'vision' | 'project' | null;
  quality: { version: string; score: number; threshold: number };
  provenance: {
    sourceRecordIds: string[];
    requestId: string | null;
    outputId: string | null;
    occurredAt: string;
  };
};

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildPromptEnhancementExample(input: {
  recordId: string;
  requestId: string | null;
  outputId: string | null;
  modality: PromptEnhancementExampleV1['modality'];
  occurredAt: string;
  payload: Record<string, unknown>;
  quality: { version: string; score: number; threshold: number; passes: boolean };
}, options: { applyQualityGate?: boolean } = {}): PromptEnhancementExampleV1 | null {
  // The worker builds examples before all behavioural signals have arrived and
  // stores the quality alongside; releases apply the threshold in force then.
  if (options.applyQualityGate !== false && !input.quality.passes) return null;
  const originalIntent = clean(input.payload.originalIntent ?? input.payload.originalPrompt ?? input.payload.userPrompt);
  const improvedPrompt = clean(input.payload.improvedPrompt ?? input.payload.enhancedPrompt ?? input.payload.finalPrompt);
  if (!originalIntent || !improvedPrompt || originalIntent === improvedPrompt) return null;
  if (originalIntent.length > 20_000 || improvedPrompt.length > 20_000) return null;
  const exampleId = trainingContentHash({ originalIntent, improvedPrompt, modality: input.modality });
  return {
    schemaVersion: PROMPT_ENHANCEMENT_SCHEMA_VERSION,
    exampleId,
    originalIntent,
    improvedPrompt,
    modality: input.modality,
    quality: { version: input.quality.version, score: input.quality.score, threshold: input.quality.threshold },
    provenance: {
      sourceRecordIds: [input.recordId],
      requestId: input.requestId,
      outputId: input.outputId,
      occurredAt: input.occurredAt,
    },
  };
}

export function serializePromptEnhancementJsonl(examples: PromptEnhancementExampleV1[]) {
  return examples.map((example) => JSON.stringify(example)).join('\n') + (examples.length ? '\n' : '');
}
