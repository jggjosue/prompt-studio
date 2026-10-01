import 'server-only';

import { createHash } from 'node:crypto';
import connectToDatabase from '@/lib/mongoose';
import PageComposerAnalyticsEvent from '@/models/PageComposerAnalyticsEvent';
import PageComposerProject from '@/models/PageComposerProject';
import { resolveSiteFromHost } from '@/lib/page-forms';

export const PRODUCT_FUNNEL_EVENTS = [
  'site_created', 'template_selected', 'component_added', 'ai_site_generated', 'ai_component_edited',
  'preview_opened', 'site_published', 'custom_domain_started', 'custom_domain_connected',
  'domain_search', 'domain_checkout_started', 'domain_purchased',
] as const;
export type ProductFunnelEvent = (typeof PRODUCT_FUNNEL_EVENTS)[number];
export type WebsiteEventKind = 'page_view' | 'cta_click' | 'form_conversion';

function visitorHash(visitorId: string): string {
  return createHash('sha256').update(`ps-site-analytics:${visitorId}`).digest('hex').slice(0, 32);
}

function originOnly(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try { return new URL(raw).origin; } catch { return null; }
}

export async function recordWebsiteEvent(input: {
  host: string; kind: WebsiteEventKind; page: string; visitorId: string; referrer?: string | null; country?: string | null;
}): Promise<boolean> {
  const resolved = await resolveSiteFromHost(input.host);
  if (!resolved) return false;
  await PageComposerAnalyticsEvent.create({
    siteId: resolved.siteId,
    kind: input.kind,
    page: input.page.startsWith('/') ? input.page.slice(0, 300) : '/',
    visitorHash: visitorHash(input.visitorId),
    referrer: originOnly(input.referrer),
    country: /^[A-Z]{2}$/.test(input.country ?? '') ? input.country : null,
  });
  return true;
}

export async function siteAnalytics(siteId: string, userId: string, from: Date, to: Date) {
  await connectToDatabase();
  const owns = await PageComposerProject.exists({ _id: siteId, userId });
  if (!owns) throw new Error('SITE_NOT_FOUND');
  const match = { siteId: (await PageComposerProject.findById(siteId).select('_id').lean())?._id, createdAt: { $gte: from, $lte: to } };
  const [summary] = await PageComposerAnalyticsEvent.aggregate([
    { $match: match },
    { $group: { _id: null, visitors: { $addToSet: '$visitorHash' }, pageViews: { $sum: { $cond: [{ $eq: ['$kind', 'page_view'] }, 1, 0] } }, formConversions: { $sum: { $cond: [{ $eq: ['$kind', 'form_conversion'] }, 1, 0] } }, ctaConversions: { $sum: { $cond: [{ $eq: ['$kind', 'cta_click'] }, 1, 0] } } } },
    { $project: { _id: 0, visitors: { $size: '$visitors' }, pageViews: 1, formConversions: 1, ctaConversions: 1 } },
  ]);
  const grouped = await PageComposerAnalyticsEvent.aggregate([
    { $match: match },
    { $facet: {
      topPages: [{ $match: { kind: 'page_view' } }, { $group: { _id: '$page', views: { $sum: 1 } } }, { $sort: { views: -1 } }, { $limit: 10 }],
      referrers: [{ $match: { referrer: { $ne: null } } }, { $group: { _id: '$referrer', visits: { $sum: 1 } } }, { $sort: { visits: -1 } }, { $limit: 10 }],
      countries: [{ $match: { country: { $ne: null } } }, { $group: { _id: '$country', visits: { $sum: 1 } } }, { $sort: { visits: -1 } }, { $limit: 10 }],
    } },
  ]);
  return { summary: summary ?? { visitors: 0, pageViews: 0, formConversions: 0, ctaConversions: 0 }, ...(grouped[0] ?? { topPages: [], referrers: [], countries: [] }) };
}
