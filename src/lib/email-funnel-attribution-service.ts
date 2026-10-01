import 'server-only';

import { createHash } from 'node:crypto';
import { attributionFromUrl } from '@/lib/email-attribution';
import EmailFunnelEvent from '@/models/EmailFunnelEvent';

export type DownstreamEmailEvent = 'email_activation' | 'email_checkout' | 'email_purchase';

function eventKey(params: { eventType: DownstreamEmailEvent; sourceEventId: string; campaignId: string }) {
  return createHash('sha256').update(`${params.eventType}:${params.sourceEventId}:${params.campaignId}`).digest('hex');
}

export async function recordEmailFunnelEvent(params: {
  eventType: DownstreamEmailEvent;
  sourceEventId: string;
  attributedUrl: string;
  occurredAt?: Date;
  valueCents?: number | null;
  currency?: string | null;
}) {
  let url: URL;
  try { url = new URL(params.attributedUrl); } catch { return { recorded: false as const, reason: 'invalid_url' as const }; }
  const attribution = attributionFromUrl(url);
  if (!attribution) return { recorded: false as const, reason: 'not_email_attributed' as const };

  const key = eventKey({ eventType: params.eventType, sourceEventId: params.sourceEventId, campaignId: attribution.campaignId });
  const result = await EmailFunnelEvent.updateOne(
    { eventKey: key },
    { $setOnInsert: {
      eventKey: key,
      eventType: params.eventType,
      campaignId: attribution.campaignId,
      sequenceId: attribution.sequenceId ?? null,
      lifecycleTrigger: attribution.lifecycleTrigger ?? null,
      utmCampaign: attribution.utmCampaign,
      occurredAt: params.occurredAt ?? new Date(),
      valueCents: params.eventType === 'email_purchase' ? (params.valueCents ?? null) : null,
      currency: params.eventType === 'email_purchase' ? (params.currency?.toUpperCase() ?? null) : null,
    } },
    { upsert: true }
  );
  return { recorded: result.upsertedCount > 0, reason: result.upsertedCount > 0 ? 'recorded' as const : 'duplicate' as const };
}
