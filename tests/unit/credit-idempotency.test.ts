import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('runAIJob does NOT capture credits (single ownership)', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  const runFn = runner.split('export async function runAIJob')[1]?.split('return runExternalWorker')[0] ?? '';
  assert.ok(
    !runFn.includes('captureCredits') && !runFn.includes('refundCredits'),
    'runAIJob debe ser una función pura de generación; los créditos se capturan solo en processOne'
  );
});

test('processOne captures on success and refunds on final failure, each persisted', async () => {
  const route = await source('src/app/api/ai/jobs/process/route.ts');
  // Success path: captureCredits + save
  assert.ok(
    /captureCredits\(job\);[\s\S]*?await job\.save\(\)/.test(route),
    'tras captureCredits debe persistir el job'
  );
  // Final failure path: refundCredits + save
  assert.ok(
    /refundCredits\(job\);[\s\S]*?await job\.save\(\)/.test(route),
    'tras refundCredits debe persistir el job'
  );
});

test('reconcile/refund are guarded by creditsState and ledger uniqueness', async () => {
  const service = await source('src/lib/ai-job-service.ts');
  assert.ok(
    service.includes("if (job.creditsState !== 'reserved') return;"),
    'capturar y reembolsar solo debe proceder cuando la reserva sigue vigente'
  );
  const ledger = await source('src/models/AICreditLedger.ts');
  assert.ok(
    ledger.includes("index({ jobId: 1, operation: 1 }, { unique: true })"),
    'el ledger debe impedir doble capture/refund por job'
  );
});

test('job creation is idempotent per user + idempotencyKey', async () => {
  const model = await source('src/models/AIGenerationJob.ts');
  assert.ok(
    model.includes("index({ userId: 1, idempotencyKey: 1 }, { unique: true })"),
    'dos peticiones con la misma clave idempotente no deben crear dos trabajos'
  );
  const route = await source('src/app/api/ai/jobs/route.ts');
  assert.ok(
    route.includes('code === 11000'),
    'el E11000 debe redirigir al trabajo duplicado sin reservar de nuevo'
  );
  assert.ok(
    route.includes('duplicate: true'),
    'la respuesta duplicada debe marcarse como duplicate: true'
  );
});

test('client sends an idempotency key and follows the server-issued job id', async () => {
  const hook = await source('src/hooks/use-image-generation.ts');
  assert.ok(
    hook.includes("headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }"),
    'el cliente debe declarar una clave idempotente para que el servidor deduplique reenvíos idénticos'
  );
  const processCall = hook.split('/process?jobId=')[1] ?? '';
  assert.ok(
    processCall.includes('jobIdFromRes'),
    'el cliente debe apuntar al job creado por el servidor, no inventar uno nuevo'
  );
});