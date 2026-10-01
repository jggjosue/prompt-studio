import 'server-only';

import { resend } from '@/lib/resend';
import {
  EMAIL_BEHAVIOR_SEGMENTS,
  rebuildBehaviorSegments,
  rebuildPreferenceTopics,
  type EmailSegmentationFacts,
} from '@/lib/email-segmentation';

export const RESEND_TOPIC_DEFINITIONS = [
  { key: 'product_updates', name: 'Product updates', defaultSubscription: 'opt_out' },
  { key: 'tutorials', name: 'Tutorials', defaultSubscription: 'opt_out' },
  { key: 'offers', name: 'Offers', defaultSubscription: 'opt_out' },
] as const;

type ProviderSegment = { id: string; name: string };
type ProviderTopic = { id: string; name: string };

export async function ensureResendSegments() {
  const listed = await resend.segments.list();
  if (listed.error) throw listed.error;
  const existing = (listed.data?.data ?? []) as ProviderSegment[];
  const byName = new Map(existing.map(segment => [segment.name, segment.id]));

  for (const name of EMAIL_BEHAVIOR_SEGMENTS) {
    if (byName.has(name)) continue;
    const created = await resend.segments.create({ name });
    if (created.error) throw created.error;
  }
}

export async function ensureResendTopics() {
  const listed = await resend.topics.list();
  if (listed.error) throw listed.error;
  const existing = (listed.data?.data ?? []) as ProviderTopic[];
  const byName = new Set(existing.map(topic => topic.name));

  for (const definition of RESEND_TOPIC_DEFINITIONS) {
    if (byName.has(definition.name)) continue;
    const created = await resend.topics.create({
      name: definition.name,
      defaultSubscription: definition.defaultSubscription,
    });
    if (created.error) throw created.error;
  }
}

export function desiredResendSegmentation(
  facts: EmailSegmentationFacts,
  preferenceTopics: readonly string[],
  now = new Date(),
) {
  return {
    segments: rebuildBehaviorSegments(facts, now),
    topics: rebuildPreferenceTopics(preferenceTopics),
  };
}
