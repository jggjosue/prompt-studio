import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Prompt Credit balance UI is backed by the authoritative credit endpoint', () => {
  const route = fs.readFileSync('src/app/api/ai/credits/route.ts', 'utf8');
  const component = fs.readFileSync('src/components/PromptCreditBalance.tsx', 'utf8');

  assert.match(route, /await auth\(\)/);
  assert.match(route, /getCreditBalance\(userId\)/);
  assert.match(route, /private-no-store/);

  assert.match(component, /fetch\('\/api\/ai\/credits'/);
  assert.match(component, /balance - reserved/);
  assert.match(component, /compact/);
  assert.match(component, /sm:inline/);
  assert.match(component, /prompt-credits-changed/);
});
