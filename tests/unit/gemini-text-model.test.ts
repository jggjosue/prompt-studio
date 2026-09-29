import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AI_MODEL_CONFIG, resolveAIModelId } from '../../src/lib/ai-credit-config';
import { GEMINI_TEXT_MODEL, GEMINI_WEB_MODELS } from '../../src/lib/gemini-web-models';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('Gemini 3.1 Flash-Lite is the canonical Google text and web model', () => {
  assert.equal(GEMINI_TEXT_MODEL, 'gemini-3.1-flash-lite');
  assert.equal(resolveAIModelId('project', 'google'), GEMINI_TEXT_MODEL);
  assert.deepEqual(Object.keys(GEMINI_WEB_MODELS), [GEMINI_TEXT_MODEL]);
  assert.equal(AI_MODEL_CONFIG[`google:${GEMINI_TEXT_MODEL}`]?.inputTokenPriceUsdPerMillion, 0.25);
  assert.equal(AI_MODEL_CONFIG[`google:${GEMINI_TEXT_MODEL}`]?.outputTokenPriceUsdPerMillion, 1.5);
});

test('Google text jobs and server actions use the Interactions API', async () => {
  const interactions = await source('src/lib/gemini-interactions.ts');
  const runner = await source('src/lib/ai-job-runner.ts');
  const actions = await source('src/app/actions.ts');
  assert.ok(interactions.includes("import { GoogleGenAI } from '@google/genai'"));
  assert.ok(interactions.includes('ai.interactions.create'));
  assert.ok(interactions.includes('model: GEMINI_TEXT_MODEL'));
  assert.ok(interactions.includes('interaction.output_text'));
  assert.ok(runner.includes("job.kind === 'project' && job.provider === 'google'"));
  assert.ok(runner.includes('createGeminiTextInteraction(prompt)'));
  assert.ok(actions.includes('createGeminiTextInteraction(prompt, key)'));
});
