import assert from 'node:assert/strict';
import test from 'node:test';
import { renderWeeklyValueText, weeklyCampaignId } from '../../src/lib/weekly-value-newsletter.ts';

const content = {
  issueId: '2026-W40',
  promptOrWorkflow: { title: 'Product shots', url: 'https://app.promptstudio.com/prompts/1' },
  tutorial: { title: 'Better prompts', url: 'https://app.promptstudio.com/tutorials/1' },
  example: { title: 'Landing page', description: 'A concrete creation example.', url: 'https://app.promptstudio.com/examples/1' },
  productUpdate: { title: 'New editor', url: 'https://app.promptstudio.com/updates/1' },
  offer: { label: 'Try Pro', url: 'https://app.promptstudio.com/pricing' },
};

test('weekly issue has a stable campaign id', () => assert.equal(weeklyCampaignId('2026-W40'), 'weekly_value_2026-W40'));

test('newsletter contains the required value mix and attributed links', () => {
  const text = renderWeeklyValueText(content);
  for (const value of ['Prompt/workflow:', 'Tutorial:', 'Creation example:', 'Product update:', 'Optional offer:']) assert.match(text, new RegExp(value));
  assert.match(text, /utm_source=email/);
  assert.match(text, /email_trigger=weekly_value/);
});
