import 'server-only';
import TrainingDataRecord from '@/models/TrainingDataRecord';
import { calculateTrainingQuality, qualitySignalsFromEventNames } from '@/lib/training-quality';
import type { DatasetName } from '@/lib/dataset-object-contract';

export async function deriveTrainingQuality(input: {
  dataset: DatasetName;
  userId: string;
  requestId: string | null;
  outputId: string | null;
  recordId: string;
}) {
  const clauses: Record<string, unknown>[] = [];
  if (input.requestId) clauses.push({ requestId: input.requestId });
  if (input.outputId) clauses.push({ outputId: input.outputId });
  clauses.push({ recordId: input.recordId });
  const events = await TrainingDataRecord.find({
    userId: input.userId,
    entityType: 'event',
    $or: clauses,
    'consent.training': true,
    'eligibility.status': { $in: ['pending', 'eligible'] },
  }).select({ payload: 1 }).lean();
  const names = events
    .map((event: any) => event.payload?.eventName)
    .filter((name: unknown): name is string => typeof name === 'string');
  return calculateTrainingQuality(input.dataset, qualitySignalsFromEventNames(names));
}
