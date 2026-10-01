export type EmailFunnelEvent =
  | 'email_sent'
  | 'email_delivered'
  | 'email_bounced'
  | 'email_complained'
  | 'email_clicked'
  | 'email_unsubscribed'
  | 'email_activation'
  | 'email_checkout'
  | 'email_purchase';

export type EmailAttribution = {
  campaignId: string;
  sequenceId?: string | null;
  lifecycleTrigger?: string | null;
  destinationUrl?: string | null;
  utmCampaign: string;
};

const SAFE_TOKEN = /^[a-zA-Z0-9._-]{1,120}$/;

export function normalizeAttributionToken(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && SAFE_TOKEN.test(trimmed) ? trimmed : null;
}

export function buildEmailUrl(destination: string, attribution: EmailAttribution): string {
  const url = new URL(destination);
  url.searchParams.set('utm_source', 'email');
  url.searchParams.set('utm_medium', 'email');
  url.searchParams.set('utm_campaign', attribution.utmCampaign);
  url.searchParams.set('email_campaign', attribution.campaignId);
  if (attribution.sequenceId) url.searchParams.set('email_sequence', attribution.sequenceId);
  if (attribution.lifecycleTrigger) url.searchParams.set('email_trigger', attribution.lifecycleTrigger);
  return url.toString();
}

export function attributionFromUrl(url: URL): Omit<EmailAttribution, 'destinationUrl'> | null {
  const campaignId = normalizeAttributionToken(url.searchParams.get('email_campaign'));
  const utmCampaign = normalizeAttributionToken(url.searchParams.get('utm_campaign'));
  if (!campaignId || !utmCampaign) return null;
  return {
    campaignId,
    sequenceId: normalizeAttributionToken(url.searchParams.get('email_sequence')),
    lifecycleTrigger: normalizeAttributionToken(url.searchParams.get('email_trigger')),
    utmCampaign,
  };
}

// GA4/product analytics payloads intentionally contain no email, name, user ID,
// provider contact ID or other direct recipient identifier.
export function toSafeAnalyticsParams(attribution: EmailAttribution) {
  return {
    campaign_id: attribution.campaignId,
    sequence_id: attribution.sequenceId ?? undefined,
    lifecycle_trigger: attribution.lifecycleTrigger ?? undefined,
    utm_campaign: attribution.utmCampaign,
  };
}
