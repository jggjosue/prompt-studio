import { trainingContentHash } from '@/lib/training-dedupe';

export const PROMPT_ENHANCEMENT_SCHEMA_VERSION = 1 as const;

export type PromptEnhancementExampleV1 = {
  schemaVersion: typeof PROMPT_ENHANCEMENT_SCHEMA_VERSION;
  exampleId: string;
  originalIntent: string;
  improvedPrompt: string;
  modality: 'image' | 'video' | 'web' | 'text' | 'vision' | 'project' | null;
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
}): PromptEnhancementExampleV1 | null {
  if (!input.quality.passes) return null;
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
