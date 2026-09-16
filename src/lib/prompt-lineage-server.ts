import 'server-only';
import { signalsByVersion, type EvaluationFeedbackLike, type EvaluationJobLike, type VersionSignals } from '@/lib/prompt-evaluation';
import { lineage, type PromptVersionLike } from '@/lib/prompt-lineage';
import connectToDatabase from '@/lib/mongoose';
import AssetProvenance from '@/models/AssetProvenance';
import AIGenerationFeedback from '@/models/AIGenerationFeedback';
import AIGenerationJob from '@/models/AIGenerationJob';
import PromptVersion from '@/models/PromptVersion';

export interface VersionSlim extends PromptVersionLike {
  _id: unknown;
  promptId: string;
  promptKind: string;
  title: string;
  content?: string;
  note: string;
  action: string;
  modelSnapshot: string[];
  createdAt: Date | string;
}

export async function versionById(id: string, userId: string) {
  await connectToDatabase();
  return PromptVersion.findOne({ _id: id, userId }).lean();
}

export async function lineageFor(id: string, userId: string) {
  await connectToDatabase();
  const version = await PromptVersion.findOne({ _id: id, userId }).lean();
  if (!version) return null;
  const siblings = await PromptVersion.find({ userId, promptId: version.promptId })
    .select('version basedOnVersion title note action modelSnapshot createdAt')
    .sort({ version: 1 })
    .lean() as unknown as VersionSlim[];
  const { ancestors, descendants } = lineage(siblings, version.version);
  return { version, ancestors, descendants };
}

export async function provenanceForVersion(versionId: string, userId: string) {
  await connectToDatabase();
  return AssetProvenance.find({ userId, 'prompt.versionId': versionId }).sort({ generatedAt: -1 }).limit(200).lean();
}

export async function signalsForVersion(versionNumber: number, userId: string): Promise<VersionSignals | null> {
  await connectToDatabase();
  const [jobs, feedbacks] = await Promise.all([
    AIGenerationJob.find({ userId, promptVersionNumber: versionNumber })
      .select('status estimatedCostUsd actualCostUsd actualDurationMs promptVersionNumber result')
      .lean() as unknown as EvaluationJobLike[],
    AIGenerationFeedback.find({ userId, promptVersionNumber: versionNumber })
      .select('useful rating reason promptVersionNumber')
      .lean() as unknown as EvaluationFeedbackLike[],
  ]);
  return signalsByVersion(jobs, feedbacks, versionNumber);
}