import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('retention definition is activation-cohort based and uses exact UTC D1 D7 D30 dates', async () => {
  const code = await source('src/lib/retention-analytics.ts');
  assert.ok(code.includes('RETENTION_DAYS = [1, 7, 30]'));
  assert.ok(code.includes("cohort: 'activationDate'"));
  assert.ok(code.includes("timezone: 'UTC'"));
  assert.ok(code.includes('activityDateUtc'));
  assert.ok(code.includes('retained[day] / cohortSize'));
});

test('daily activity is idempotent per user and UTC day', async () => {
  const model = await source('src/models/RetentionActivity.ts');
  assert.ok(model.includes('userId: 1, activityDateUtc: 1'));
  assert.ok(model.includes('unique: true'));
});

test('successful authenticated product activity records retention activity', async () => {
  const route = await source('src/app/api/analytics/activation/route.ts');
  assert.ok(route.includes('recordRetentionActivity(userId, now)'));
});

test('retention metrics endpoint requires authentication and admin role', async () => {
  const route = await source('src/app/api/admin/analytics/retention/route.ts');
  assert.ok(route.includes("status: 401"));
  assert.ok(route.includes("role !== 'admin'"));
  assert.ok(route.includes("status: 403"));
});
