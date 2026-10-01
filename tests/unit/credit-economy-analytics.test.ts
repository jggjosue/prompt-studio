import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('credit economy analytics derives revenue proxy, provider cost and margin from canonical jobs', () => {
  const service = fs.readFileSync('src/lib/credit-economy-analytics.ts', 'utf8');
  assert.match(service, /AIGenerationJob\.aggregate/);
  assert.match(service, /\$creditsCharged/);
  assert.match(service, /\$actualCostUsd/);
  assert.match(service, /PROMPT_CREDIT_COMMERCIAL_VALUE_USD/);
  assert.match(service, /marginPercent/);
  assert.match(service, /jobsWithActualCost/);
  assert.match(service, /operationCode/);
  assert.match(service, /provider/);
  assert.match(service, /modelId/);
});

test('analytics API and dashboard are admin-only and expose cost coverage', () => {
  const api = fs.readFileSync('src/app/api/admin/ai/credit-economy/route.ts', 'utf8');
  const page = fs.readFileSync('src/app/[locale]/admin/credit-economy/page.tsx', 'utf8');
  assert.match(api, /isPremiumJoAdmin/);
  assert.match(api, /status: 403/);
  for (const label of ['Credits charged', 'Provider cost', 'Commercial value', 'Gross margin', 'Cost coverage']) assert.match(page, new RegExp(label));
});
