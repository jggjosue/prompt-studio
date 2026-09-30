import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('la telemetría de generación emite inicio, éxito y fallo sin contenido', async () => {
  const telemetry = await source('src/lib/generation-telemetry.ts');
  for (const name of ['generation_started', 'generation_completed', 'generation_failed', 'generation_credit_reconciliation_failed']) {
    assert.ok(telemetry.includes(`name: '${name}'`), `falta el evento ${name}`);
  }
  for (const field of ['errorCategory', 'httpStatus', 'retryable', 'mimeType', 'byteLength', 'storageKind', 'attempts', 'correlationId']) {
    assert.ok(telemetry.includes(field), `falta el campo ${field}`);
  }
  // Nunca se pasa un prompt: de la imagen solo viajan forma y tamaño.
  assert.doesNotMatch(telemetry, /input\.prompt|metadata:.*prompt|requestBody|authorization|imageData:/i);
});

test('la ruta de imagen registra inicio y resultado dentro del runner', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  const imageBranch = runner.split('async function runObservedImageGeneration')[1]?.split('\nexport async function')[0] ?? '';
  assert.match(imageBranch, /recordGenerationStarted/);
  assert.match(imageBranch, /recordImageGenerationCompleted/);
  assert.match(imageBranch, /recordGenerationFailed/);
  assert.match(imageBranch, /durationMs/);
  assert.match(imageBranch, /errorCategory/);
  assert.match(runner, /runObservedImageGeneration\(job, \(\) => generateImage/);
});

test('los conflictos de crédito emiten evento antes de relanzar', async () => {
  const service = await source('src/lib/ai-job-service.ts');
  assert.ok(service.includes("reportCreditReconciliationFailure(job, 'capture', 'CREDIT_CAPTURE_CONFLICT')"));
  assert.ok(service.includes("reportCreditReconciliationFailure(job, 'refund', 'CREDIT_REFUND_CONFLICT')"));
  assert.match(service, /recordCreditReconciliationFailure/);
});

test('el panel de administración agrega por proveedor y modelo', async () => {
  const route = await source('src/app/api/admin/observability/route.ts');
  assert.match(route, /\$metadata\.provider/);
  assert.match(route, /\$metadata\.modelId/);
  assert.ok(route.includes('modelHealth'));
});