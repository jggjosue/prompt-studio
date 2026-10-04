/**
 * Pure rules used by the dataset worker: behavioural signals per output,
 * preference pairs inside a regenerate/edit family, and content extraction
 * from job results. No I/O, so every rule is unit-testable.
 */
import type { PreferenceSignalType } from '@/lib/datasets/preference';
import type { TrainingQualitySignals } from '@/lib/training-quality';

export type OutputSignals = {
  succeeded: boolean;
  viewed: boolean;
  saved: boolean;
  downloaded: boolean;
  /** The user regenerated away from this output. */
  regenerated: boolean;
  /** The user edited this output's prompt into a new generation. */
  edited: boolean;
  /** Latest explicit verdict (feedback record), not a sum of events. */
  verdict: 'positive' | 'negative' | null;
};

export type SignalEvent = { eventName: string | null; generationId: string | null; parentGenerationId: string | null };

export function outputSignals(generationId: string, events: SignalEvent[], verdict: OutputSignals['verdict']): OutputSignals {
  const about = (name: string) => events.some((event) => event.eventName === name && event.generationId === generationId);
  return {
    succeeded: about('generation_completed'),
    viewed: about('output_viewed'),
    saved: about('output_saved'),
    downloaded: about('output_downloaded'),
    regenerated: about('regenerate_clicked'),
    edited: events.some((event) => event.eventName === 'prompt_edited' && event.parentGenerationId === generationId),
    verdict,
  };
}

/** Evidence that the user kept or approved an output. */
export function hasKeepEvidence(signals: OutputSignals) {
  return signals.verdict === 'positive' || signals.saved || signals.downloaded;
}

export type FamilyMember = {
  generationId: string;
  parentGenerationId: string | null;
  signals: OutputSignals;
};

function ancestors(member: FamilyMember, byId: Map<string, FamilyMember>) {
  const seen = new Set<string>();
  let parent = member.parentGenerationId;
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    parent = byId.get(parent)?.parentGenerationId ?? null;
  }
  return seen;
}

/** The output the user kept after regenerating at least once from an earlier one. */
export function isSelectedAfterRegenerate(member: FamilyMember, family: FamilyMember[]) {
  if (!hasKeepEvidence(member.signals)) return false;
  const byId = new Map(family.map((item) => [item.generationId, item]));
  return [...ancestors(member, byId)].some((id) => byId.get(id)?.signals.regenerated);
}

export function qualitySignals(signals: OutputSignals, selected: boolean): TrainingQualitySignals {
  return {
    generationSucceeded: signals.succeeded,
    saved: signals.saved,
    downloaded: signals.downloaded,
    positiveFeedback: signals.verdict === 'positive',
    negativeFeedback: signals.verdict === 'negative',
    regenerated: signals.regenerated,
    edited: signals.edited,
    selected,
  };
}

export type PreferencePair = { chosen: string; rejected: string; signalType: PreferenceSignalType };

/**
 * Preference pairs supported by evidence, never invented:
 * - explicit_positive_vs_negative: one output approved, the other disapproved.
 * - {saved,downloaded,selected}_after_regenerate: the user regenerated away
 *   from an earlier output and then saved / downloaded / approved a later one
 *   in the same chain, and the earlier one has no keep evidence of its own.
 * At most one pair (the strongest signal) per ordered (chosen, rejected).
 */
export function preferencePairs(family: FamilyMember[]): PreferencePair[] {
  const byId = new Map(family.map((member) => [member.generationId, member]));
  const pairs: PreferencePair[] = [];
  for (const chosen of family) {
    if (!hasKeepEvidence(chosen.signals)) continue;
    const chosenAncestors = ancestors(chosen, byId);
    for (const rejected of family) {
      if (rejected.generationId === chosen.generationId) continue;
      let signalType: PreferenceSignalType | null = null;
      if (chosen.signals.verdict === 'positive' && rejected.signals.verdict === 'negative') {
        signalType = 'explicit_positive_vs_negative';
      } else if (
        rejected.signals.regenerated
        && !hasKeepEvidence(rejected.signals)
        && chosenAncestors.has(rejected.generationId)
      ) {
        signalType = chosen.signals.saved ? 'saved_after_regenerate'
          : chosen.signals.downloaded ? 'downloaded_after_regenerate'
            : 'selected_after_regenerate';
      }
      if (signalType) pairs.push({ chosen: chosen.generationId, rejected: rejected.generationId, signalType });
    }
  }
  return pairs.sort((a, b) => (a.chosen + a.rejected < b.chosen + b.rejected ? -1 : 1));
}

/** Text produced by a text/optimizer job, from the result shapes our providers return. */
export function resultText(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const value = result as Record<string, unknown>;
  for (const key of ['text', 'output_text', 'output']) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

/** Generated web page markup, without the markdown fences some models add. */
export function resultHtml(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const value = result as Record<string, unknown>;
  const raw = typeof value.html === 'string' ? value.html : resultText(result);
  const unfenced = raw.replace(/^\s*```(?:html)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return /<(?:!doctype|html|head|body|div|section|main|style)\b/i.test(unfenced) ? unfenced : '';
}

/** Prompt optimizer jobs are the evidence-backed source of prompt-enhancement pairs. */
export function isPromptOptimizerJob(job: { kind?: string | null; operationCode?: string | null; input?: Record<string, unknown> | null }) {
  return job.kind === 'text' && (job.input?.optimizerTier !== undefined || /optimi[sz]er/i.test(job.operationCode ?? ''));
}
