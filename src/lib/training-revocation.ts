import 'server-only';
import { randomUUID } from 'node:crypto';
import TrainingDataRecord from '@/models/TrainingDataRecord';
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
    { $set: { 'eligibility.status': 'revoked', 'eligibility.evaluatedAt': requestedAt }, $addToSet: { 'eligibility.reasonCodes': `revocation:${revocationId}` } },
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

/**
 * Consent withdrawal for a whole account (POST /api/ai/training-consent with
 * training=false):
 * - writes an immutable TrainingDataRevocation audit entry naming the user,
 *   so releases exclude the user even for records captured later by mistake;
 * - marks every pending/eligible record revoked;
 * - re-queues the user's output records so the worker (which holds the
 *   training-bucket credentials; the web app does not) removes their
 *   processed examples.
 * Published releases are immutable and are never modified; see
 * findReleaseAffectedByRevocations and `npm run dataset:rebuild-revoked`.
 */
export async function revokeUserTrainingConsent(input: { userId: string; requestedBy: string; now?: Date }) {
  const requestedAt = input.now ?? new Date();
  const outputs = await TrainingDataRecord.find({ userId: input.userId, entityType: 'output' })
    .select('recordId generationId provenance.correlationId').lean<Array<{ recordId: string; generationId?: string | null; provenance?: { correlationId?: string | null } }>>();
  const revocationId = randomUUID();
  await TrainingDataRevocation.create({
    revocationId,
    reason: 'consent_revoked',
    userId: input.userId,
    sourceRecordIds: outputs.map((record) => record.recordId).sort(),
    requestedAt,
    requestedBy: input.requestedBy,
    notes: null,
  });
  const result = await TrainingDataRecord.updateMany(
    { userId: input.userId, 'eligibility.status': { $in: ['pending', 'eligible'] } },
    {
      $set: { 'eligibility.status': 'revoked', 'eligibility.evaluatedAt': requestedAt, 'eligibility.evaluatorVersion': 'consent-gate-v1', updatedAt: requestedAt },
      $addToSet: { 'eligibility.reasonCodes': { $each: ['training_consent_revoked', `revocation:${revocationId}`] } },
    },
  );
  // Imported lazily: the queue module pulls in the SQS client, which the revocation tests do not need.
  const { enqueueTrainingRecord } = await import('@/lib/training/training-queue');
  let requeued = 0;
  for (const record of outputs) {
    const sent = await enqueueTrainingRecord({
      recordId: record.recordId, entityType: 'output', generationId: record.generationId ?? null, correlationId: record.provenance?.correlationId ?? null,
    }, `revocation-${revocationId}`);
    if (sent.enqueued) requeued += 1;
  }
  return { revocationId, revokedRecords: result.modifiedCount, outputRecords: outputs.length, requeued };
}
