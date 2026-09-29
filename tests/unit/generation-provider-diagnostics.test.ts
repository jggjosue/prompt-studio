import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('generation worker records every outbound integration with safe labels', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  for (const service of ['google-gemini', 'google-imagen', 'ai-generation-worker', 'generated-image-source', 'cloudflare-r2']) {
    assert.ok(runner.includes(`service: '${service}'`), `falta instrumentar ${service}`);
  }
  assert.match(runner, /observedGenerationFetch/);
  assert.match(runner, /recordGenerationRequest/);
  assert.doesNotMatch(runner, /endpointLabel: endpoint/);
});

test('structured provider logs include actionable fields without request secrets', async () => {
  const diagnostics = await source('src/lib/generation-request-observability.ts');
  for (const field of ['service', 'provider', 'host', 'endpointLabel', 'httpStatus', 'durationMs', 'correlationId', 'jobId', 'modelId', 'retryable', 'providerErrorCode', 'providerErrorMessage']) {
    assert.ok(diagnostics.includes(field), `falta el campo ${field}`);
  }
  assert.doesNotMatch(diagnostics, /authorization|cookie|requestBody|responseBody|apiKey/i);
});
