import { buildEmailUrl } from '@/lib/email-attribution';

export const WEEKLY_VALUE_SEQUENCE = 'weekly_value_newsletter';
export const WEEKLY_VALUE_SEGMENT = 'newsletter_eligible';

export type WeeklyValueContent = {
  issueId: string;
  promptOrWorkflow: { title: string; url: string };
  tutorial: { title: string; url: string };
  example: { title: string; description: string; url: string };
  productUpdate: { title: string; url: string };
  offer?: { label: string; url: string };
};

export function weeklyCampaignId(issueId: string) {
  return `weekly_value_${issueId.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export function weeklyTrackedUrl(url: string, issueId: string) {
  const campaignId = weeklyCampaignId(issueId);
  return buildEmailUrl(url, { campaignId, sequenceId: WEEKLY_VALUE_SEQUENCE, lifecycleTrigger: 'weekly_value', utmCampaign: campaignId });
}

export function renderWeeklyValueText(content: WeeklyValueContent) {
  const sections = [
    `Prompt/workflow: ${content.promptOrWorkflow.title}\n${weeklyTrackedUrl(content.promptOrWorkflow.url, content.issueId)}`,
    `Tutorial: ${content.tutorial.title}\n${weeklyTrackedUrl(content.tutorial.url, content.issueId)}`,
    `Creation example: ${content.example.title}\n${content.example.description}\n${weeklyTrackedUrl(content.example.url, content.issueId)}`,
    `Product update: ${content.productUpdate.title}\n${weeklyTrackedUrl(content.productUpdate.url, content.issueId)}`,
  ];
  if (content.offer) sections.push(`Optional offer: ${content.offer.label}\n${weeklyTrackedUrl(content.offer.url, content.issueId)}`);
  return sections.join('\n\n');
}
