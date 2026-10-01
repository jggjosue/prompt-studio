import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('explicit consent enrolls the onboarding lifecycle idempotently', async () => {
  const preferences = await source('src/app/api/email/preferences/route.ts');
  assert.ok(preferences.includes('profile.marketingOptIn'));
  assert.ok(preferences.includes('enrollOnboardingLifecycle(userId)'));
});

test('authenticated cron processes due lifecycle enrollments as a batch', async () => {
  const route = await source('src/app/api/cron/onboarding-lifecycle/route.ts');
  const processor = await source('src/lib/onboarding-lifecycle-processor.ts');
  assert.ok(route.includes('requireCronOrAdmin'));
  assert.ok(route.includes('processDueOnboardingBatch'));
  assert.ok(processor.includes('dueAt > now'));
  assert.ok(processor.includes('processDueOnboardingEnrollment'));
});
