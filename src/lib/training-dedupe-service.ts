import 'server-only';
import TrainingContentFingerprint from '@/models/TrainingContentFingerprint';
import { TRAINING_CANONICALIZATION_VERSION, trainingDedupeKey } from '@/lib/training-dedupe';

/**
 * Claims a content fingerprint for one processed example.
 *
 * `sourceKey` identifies the logical example (e.g. its output record), not the
 * delivery. Re-processing the same example (retries, redeliveries, new quality
 * signals) finds its own claim and is NOT a duplicate; only a different source
 * with identical content is. v1 recorded the record as a duplicate of itself
 * after a crash between claim and write, silently dropping it.
 */
export async function claimTrainingFingerprint(input: { dataset: string; sourceKey: string; contentHash: string }) {
  const dedupeKey = trainingDedupeKey(input.dataset, input.contentHash);
  try {
    await TrainingContentFingerprint.create({
      dedupeKey,
      canonicalizationVersion: TRAINING_CANONICALIZATION_VERSION,
      dataset: input.dataset,
      contentHash: input.contentHash,
      canonicalRecordId: input.sourceKey,
      duplicateRecordIds: [],
    });
    return { duplicate: false as const, dedupeKey, canonicalRecordId: input.sourceKey };
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await TrainingContentFingerprint.findOne({ dedupeKey }).lean<{ canonicalRecordId: string }>();
    if (!existing) throw new Error('TRAINING_DEDUPE_RACE_UNRESOLVED');
    if (existing.canonicalRecordId === input.sourceKey) {
      return { duplicate: false as const, dedupeKey, canonicalRecordId: input.sourceKey };
    }
    await TrainingContentFingerprint.updateOne({ dedupeKey }, { $addToSet: { duplicateRecordIds: input.sourceKey } });
    return { duplicate: true as const, dedupeKey, canonicalRecordId: existing.canonicalRecordId };
  }
}
