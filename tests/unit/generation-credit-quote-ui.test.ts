import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('cost-before-generation quote is server authoritative', () => {
  const route = fs.readFileSync('src/app/api/ai/credits/quote/route.ts', 'utf8');
  const component = fs.readFileSync('src/components/GenerationCreditQuote.tsx', 'utf8');

  assert.match(route, /getEnabledAIOperation\(operationCode\)/);
  assert.match(route, /getCreditBalance\(userId\)/);
  assert.match(route, /credits\.balance - credits\.reserved/);
  assert.match(route, /resolveCodeAuditOperation/);
  assert.match(route, /sufficientCredits: availableBalance >= creditCost/);

  assert.match(component, /\/api\/ai\/credits\/quote/);
  assert.match(component, /Saldo actual/);
  assert.match(component, /Después de generar/);
  assert.match(component, /servidor confirma el precio/);
  assert.match(component, /No tienes Prompt Credits suficientes/);
});
