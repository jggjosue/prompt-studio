import { trainingContentHash } from '@/lib/training-dedupe';

export const GENERATION_DATASET_SCHEMA_VERSION = 1 as const;
export type GenerationDatasetModality = 'image' | 'video' | 'web';

export type GenerationAssetRef = {
  provider: 'cloudflare-r2';
  bucket: string;
  key: string;
  contentType: string | null;
  contentHash: string | null;
  bytes: number | null;
};

export type GenerationDatasetExampleV1 = {
  schemaVersion: typeof GENERATION_DATASET_SCHEMA_VERSION;
  exampleId: string;
  modality: GenerationDatasetModality;
  prompt: string;
  model: { provider: string; model: string | null; version: string | null } | null;
  parameters: Record<string, unknown>;
  outputs: GenerationAssetRef[];
  quality: { version: string; score: number; threshold: number };
  provenance: { sourceRecordId: string; requestId: string | null; outputId: string | null; occurredAt: string };
};

const CONTENT_TYPES: Record<GenerationDatasetModality, RegExp> = {
  image: /^image\//,
  video: /^video\//,
  web: /^(text\/html|application\/(?:json|xhtml\+xml)|text\/plain)$/,
};

export function buildGenerationDatasetExample(input: {
  modality: GenerationDatasetModality;
  recordId: string;
  requestId: string | null;
  outputId: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
  model: GenerationDatasetExampleV1['model'];
  parameters: Record<string, unknown>;
  assets: GenerationAssetRef[];
  quality: { version: string; score: number; threshold: number; passes: boolean };
}): GenerationDatasetExampleV1 | null {
  if (!input.quality.passes) return null;
  const prompt = typeof input.payload.prompt === 'string'
    ? input.payload.prompt.trim()
    : typeof input.payload.finalPrompt === 'string' ? input.payload.finalPrompt.trim() : '';
  if (!prompt || prompt.length > 20_000) return null;
  const outputs = input.assets.filter((asset) =>
    asset.provider === 'cloudflare-r2'
    && Boolean(asset.bucket && asset.key)
    && (!asset.contentType || CONTENT_TYPES[input.modality].test(asset.contentType)),
  );
  if (!outputs.length) return null;
  const exampleId = trainingContentHash({
    modality: input.modality,
    prompt,
    model: input.model,
    parameters: input.parameters,
    outputHashes: outputs.map((asset) => asset.contentHash ?? asset.key).sort(),
  });
  return {
    schemaVersion: GENERATION_DATASET_SCHEMA_VERSION,
    exampleId,
    modality: input.modality,
    prompt,
    model: input.model,
    parameters: input.parameters,
    outputs,
    quality: { version: input.quality.version, score: input.quality.score, threshold: input.quality.threshold },
    provenance: { sourceRecordId: input.recordId, requestId: input.requestId, outputId: input.outputId, occurredAt: input.occurredAt },
  };
}

export function serializeGenerationJsonl(examples: GenerationDatasetExampleV1[]) {
  return examples.map((example) => JSON.stringify(example)).join('\n') + (examples.length ? '\n' : '');
}
