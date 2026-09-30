import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('generation runner records every outbound integration with safe labels', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  // Servicios que el runner instrumenta hoy: la ruta de imagen local (google-gemini)
  // y el worker externo (ai-generation-worker). Los antiguos google-imagen,
  // generated-image-source y cloudflare-r2 eran imports muertos, no servicios reales.
  for (const service of ['google-gemini', 'ai-generation-worker']) {
    assert.ok(runner.includes(`service: '${service}'`), `falta instrumentar ${service}`);
  }
  // La telemetría confirma el arranque, el éxito y el fallo de la generación.
  for (const symbol of ['observedGenerationFetch', 'recordGenerationStarted', 'recordImageGenerationCompleted', 'recordGenerationFailed']) {
    assert.match(runner, new RegExp(symbol));
  }
  assert.doesNotMatch(runner, /endpointLabel: endpoint/);
});

test('structured provider logs include actionable fields without request secrets', async () => {
  const diagnostics = await source('src/lib/generation-request-observability.ts');
  for (const field of ['service', 'provider', 'host', 'endpointLabel', 'httpStatus', 'durationMs', 'correlationId', 'jobId', 'modelId', 'retryable', 'providerErrorCode', 'providerErrorMessage']) {
    assert.ok(diagnostics.includes(field), `falta el campo ${field}`);
  }
  assert.doesNotMatch(diagnostics, /authorization|cookie|requestBody|responseBody|apiKey/i);
});
