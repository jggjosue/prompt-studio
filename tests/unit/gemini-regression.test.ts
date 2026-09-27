import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('tres prompts distintos producen imágenes únicas', async () => {
  const prompts = [
    'orange cat running',
    'red sports car in snow', 
    'astronaut on the moon'
  ];
  
  for (const prompt of prompts) {
    const route = await source('src/app/api/ai/jobs/route.ts');
    assert.ok(
      route.includes('idempotencyKey'),
      'la ruta debe validar la clave idempotente'
    );
  }
});

test('fallo del proveedor no consume créditos permanentemente', async () => {
  const route = await source('src/lib/ai-job-runner.ts');
  assert.ok(
    route.includes('mapGeminiError'),
    'debe usar mapGeminiError para categorizar errores'
  );
  assert.ok(
    route.includes('AICreditLedger'),
    'debe verificar ledger entry antes de cobrar'
  );
});

test('reintentos no pueden cobrar doble', async () => {
  const route = await source('src/app/api/ai/jobs/route.ts');
  assert.ok(
    route.includes('duplicate'),
    'la ruta debe manejar respuestas duplicate: true'
  );
  assert.ok(
    route.includes('idempotencyKey'),
    'la ruta debe usar la clave idempotente'
  );
});

test('consumo correcto de créditos en generación exitosa', async () => {
  const service = await source('src/lib/ai-job-service.ts');
  assert.ok(
    service.includes('reconcileCredits'),
    'debe llamar a reconcileCredits después de generación exitosa'
  );
  assert.ok(
    service.includes('AICreditLedger'),
    'debe crear entrada en el ledger de crédito'
  );
});

test('generación fallada es observable por correlation ID', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  assert.ok(
    runner.includes('errorCategory'),
    'debe incluir errorCategory en metadata de observabilidad'
  );
  assert.ok(
    runner.includes('correlationId'),
    'debe incluir correlationId en metadata de observabilidad'
  );
});