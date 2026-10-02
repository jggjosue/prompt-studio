import { trainingContentHash } from '@/lib/training-dedupe';

export const PREFERENCE_DATASET_SCHEMA_VERSION = 1 as const;
export const PREFERENCE_SIGNAL_TYPES = [
  'explicit_positive_vs_negative',
  'selected_after_regenerate',
  'saved_after_regenerate',
  'downloaded_after_regenerate',
] as const;
export type PreferenceSignalType = (typeof PREFERENCE_SIGNAL_TYPES)[number];

export type PreferenceCandidate = {
  outputId: string;
  contentRef: string | null;
  modelId: string | null;
};

export type PreferenceExampleV1 = {
  schemaVersion: typeof PREFERENCE_DATASET_SCHEMA_VERSION;
  exampleId: string;
  context: string;
  chosen: PreferenceCandidate;
  rejected: PreferenceCandidate;
  signal: { type: PreferenceSignalType; eventIds: string[] };
  provenance: { requestId: string; sourceRecordIds: string[]; occurredAt: string };
};

function validCandidate(candidate: PreferenceCandidate) {
  return Boolean(candidate.outputId && candidate.outputId.length <= 160 && (!candidate.contentRef || candidate.contentRef.length <= 1024));
}

export function buildPreferenceExample(input: {
  requestId: string;
  context: string;
  chosen: PreferenceCandidate;
  rejected: PreferenceCandidate;
  signalType: PreferenceSignalType;
  eventIds: string[];
  sourceRecordIds: string[];
  occurredAt: string;
}): PreferenceExampleV1 | null {
  const context = input.context.trim();
  if (!context || context.length > 20_000) return null;
  if (!PREFERENCE_SIGNAL_TYPES.includes(input.signalType)) return null;
  if (!validCandidate(input.chosen) || !validCandidate(input.rejected)) return null;
  if (input.chosen.outputId === input.rejected.outputId) return null;
  if (!input.eventIds.length || !input.sourceRecordIds.length || !input.requestId) return null;
  const eventIds = [...new Set(input.eventIds)].sort();
  const sourceRecordIds = [...new Set(input.sourceRecordIds)].sort();
  const exampleId = trainingContentHash({
    requestId: input.requestId,
    context,
    chosenOutputId: input.chosen.outputId,
    rejectedOutputId: input.rejected.outputId,
    signalType: input.signalType,
  });
  return {
    schemaVersion: PREFERENCE_DATASET_SCHEMA_VERSION,
    exampleId,
    context,
    chosen: input.chosen,
    rejected: input.rejected,
    signal: { type: input.signalType, eventIds },
    provenance: { requestId: input.requestId, sourceRecordIds, occurredAt: input.occurredAt },
  };
}

export function serializePreferenceJsonl(examples: PreferenceExampleV1[]) {
  return examples.map((example) => JSON.stringify(example)).join('\n') + (examples.length ? '\n' : '');
}
