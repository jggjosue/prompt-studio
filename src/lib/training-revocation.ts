import 'server-only';
import { randomUUID } from 'node:crypto';
import { TrainingDataRecord } from '@/models/TrainingDataRecord';
import { TrainingDataRevocation, TRAINING_REVOCATION_REASONS } from '@/models/TrainingDataRevocation';

export async function revokeTrainingRecords(input: {
  sourceRecordIds: string[];
  reason: (typeof TRAINING_REVOCATION_REASONS)[number];
  requestedBy: string;
  notes?: string | null;
}) {
  const ids = [...new Set(input.sourceRecordIds.map((id) => id.trim()).filter(Boolean))].sort();
  if (!ids.length) throw new Error('REVOCATION_SOURCE_RECORDS_REQUIRED');
  const revocationId = randomUUID();
  const requestedAt = new Date();
  await TrainingDataRevocation.create({
    revocationId, reason: input.reason, sourceRecordIds: ids, requestedAt, requestedBy: input.requestedBy, notes: input.notes ?? null,
  });
  const result = await TrainingDataRecord.updateMany(
    { recordId: { $in: ids }, 'eligibility.status': { $in: ['pending', 'eligible'] } },
    { $set: { 'eligibility.status': 'revoked', 'eligibility.reason': `revocation:${revocationId}` } },
  );
  return { revocationId, requestedAt: requestedAt.toISOString(), sourceRecordIds: ids, modifiedRecords: result.modifiedCount };
}

export function excludeRevokedExamples<T extends { provenance?: { sourceRecordId?: string; sourceRecordIds?: string[] } }>(
  examples: T[],
  revokedRecordIds: Iterable<string>,
) {
  const revoked = new Set(revokedRecordIds);
  return examples.filter((example) => {
    const ids = [
      example.provenance?.sourceRecordId,
      ...(example.provenance?.sourceRecordIds ?? []),
    ].filter((id): id is string => Boolean(id));
    return !ids.some((id) => revoked.has(id));
  });
}
