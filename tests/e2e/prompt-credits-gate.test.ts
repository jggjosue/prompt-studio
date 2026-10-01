import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const jobsRoute = fs.readFileSync('src/app/api/ai/jobs/route.ts', 'utf8');
const boundary = fs.readFileSync('src/lib/generation-credit-boundary.ts', 'utf8');
const runner = fs.readFileSync('src/lib/ai-job-runner.ts', 'utf8');
const jobModel = fs.readFileSync('src/models/AIGenerationJob.ts', 'utf8');
const ledger = fs.readFileSync('src/models/AICreditLedger.ts', 'utf8');

test('E2E gate: canonical paid generation resolves server pricing before reservation', () => {
  assert.match(jobsRoute, /resolveRuntimeOperationPricing/);
  assert.match(jobsRoute, /cost = \{ \.\.\.cost, credits: runtimePricing\.creditCost \}/);
  assert.match(jobsRoute, /pricingSnapshot: operationCode \? \{ creditCost: cost\.credits, pricedAt: new Date\(\) \} : null/);
  assert.match(jobsRoute, /reserveGenerationCredits\(job\)/);
});

test('E2E gate: provider execution requires a paid reservation', () => {
  assert.match(runner, /assertPaidGenerationReserved\(job\)/);
  assert.match(boundary, /PAID_GENERATION_REQUIRES_RESERVED_CREDITS/);
  assert.match(boundary, /reserveCredits\(job\)/);
});

test('E2E gate: terminal credit boundary supports exactly-once capture and release', () => {
  assert.match(boundary, /captureCredits\(job\)/);
  assert.match(boundary, /refundCredits\(job\)/);
  assert.match(boundary, /CREDIT_CAPTURE_INCOMPLETE/);
  assert.match(boundary, /CREDIT_RELEASE_INCOMPLETE/);
  assert.match(ledger, /\{ jobId: 1, operation: 1 \}/);
  assert.match(ledger, /unique: true/);
});

test('E2E gate: canonical job retains operation, pricing and provider-cost telemetry', () => {
  for (const field of ['operationCode', 'pricingSnapshot', 'creditsCharged', 'actualCostUsd', 'provider', 'modelId']) assert.match(jobModel, new RegExp(field));
});

test('E2E gate: all paid operation families are resolved server-side', () => {
  for (const resolver of ['resolveTextGenerationOperation','resolvePromptOptimizerOperation','resolveImageGenerationOperation','resolveVideoGenerationOperation','resolveWebsiteGenerationOperation','resolveWebsiteAIEditOperation','resolveCodeAuditOperation','resolveComponentOperation']) assert.match(jobsRoute, new RegExp(resolver));
});
