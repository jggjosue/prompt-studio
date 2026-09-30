import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildWebPageGeneratorPrompt } from '../../src/lib/web-page-generator-prompt.ts';

test('serializa el prompt completo de una landing como JSON para el chat web', () => {
  const prompt = buildWebPageGeneratorPrompt({
    title: 'Light Mode',
    description: 'Create the complete landing with 100% width.',
    imageHint: 'Stripe and Notion inspired landing',
    stack: ['HTML', 'CSS'],
    tags: ['landing page', 'light mode'],
  });
  const parsed = JSON.parse(prompt);

  assert.deepEqual(parsed, {
    title: 'Light Mode',
    description: 'Create the complete landing with 100% width.',
    imageHint: 'Stripe and Notion inspired landing',
    type: 'web',
    stack: ['HTML', 'CSS'],
    tags: ['landing page', 'light mode'],
  });

  const params = new URLSearchParams({ mode: 'project', prompt });
  assert.equal(params.get('prompt'), prompt);
  assert.equal(params.get('mode'), 'project');
});

test('el botón Use prompt está activo y navega a /generate sin enviar automáticamente', () => {
  const source = readFileSync(
    new URL('../../src/components/web-page-prompt-dialog-new.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /router\.push\(`\/generate\?\$\{params\.toString\(\)\}`\)/);
  assert.match(source, /new URLSearchParams\(\{ mode: ['"]project['"], prompt: generatorPrompt \}\)/);
  assert.doesNotMatch(source, /disabled\s*>\s*<Wand2/);
  assert.match(source, /disabled=\{loadingPrompt \|\| !pageDescription\.trim\(\)\}/);
  assert.match(source, /const needsEmailGate = isFree && !isSignedIn && !hasPaidPlan/);
});
