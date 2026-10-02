import 'server-only';
import TrainingContentFingerprint from '@/models/TrainingContentFingerprint';
import { TRAINING_CANONICALIZATION_VERSION, trainingContentHash, trainingDedupeKey } from '@/lib/training-dedupe';

export async function claimTrainingFingerprint(input: { dataset: string; recordId: string; value: unknown }) {
  const contentHash = trainingContentHash(input.value);
  const dedupeKey = trainingDedupeKey(input.dataset, contentHash);
  try {
    await TrainingContentFingerprint.create({
      dedupeKey,
      canonicalizationVersion: TRAINING_CANONICALIZATION_VERSION,
      dataset: input.dataset,
      contentHash,
      canonicalRecordId: input.recordId,
      duplicateRecordIds: [],
    });
    return { duplicate: false as const, contentHash, dedupeKey, canonicalRecordId: input.recordId };
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await TrainingContentFingerprint.findOneAndUpdate(
      { dedupeKey },
      { $addToSet: { duplicateRecordIds: input.recordId } },
      { new: true },
    ).lean();
    if (!existing) throw new Error('TRAINING_DEDUPE_RACE_UNRESOLVED');
    return { duplicate: true as const, contentHash, dedupeKey, canonicalRecordId: existing.canonicalRecordId };
  }
}
