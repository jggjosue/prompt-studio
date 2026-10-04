import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generationJobErrorCategory } from '../../src/lib/generation-job-state';
import { generationRetryDecision } from '../../src/lib/generation-retry-policy';
import { runSitePlanJobCore, SITE_PLAN_INLINE_MAX_BYTES, sitePlanSchemaKey } from '../../src/lib/site-plan-job-core';
import { httpError, workerHarness } from '../fixtures/generation-worker-harness';

const SITE = {
  schemaVersion: 1,
  site: {
    name: 'Café Oaxaca', defaultLocale: 'es',
    seo: { title: 'Café Oaxaca', description: 'Café de especialidad en México.' },
    theme: { tokens: { 'color.primary': '#6f4e37', 'color.background': '#faf7f2' }, fontFamily: 'Inter, sans-serif' },
  },
  pages: [{
    id: 'page-home', name: 'Inicio', slug: '/', seo: { title: 'Café Oaxaca', description: 'Nuestro café.' },
    sections: [
      { id: 'hero', type: 'hero', props: { eyebrow: 'Café', title: 'Bienvenido', subtitle: 'Granos de altura.', primaryLabel: 'Ver menú', primaryHref: '#menu', align: 'center' }, styles: {}, children: [] },
      { id: 'footer', type: 'footer', props: { brand: 'Café Oaxaca', copyright: '© Café Oaxaca.' }, styles: {}, children: [] },
    ],
  }],
};
const input = { userId: 'user_1', jobId: '65f0000000000000000000bb', request: 'Sitio para una cafetería', provider: 'google', model: 'gemini-2.5-flash' };
const category = (error: unknown) => generationJobErrorCategory({ code: (error as { code?: string }).code, message: (error as Error).message });
const retries = (error: unknown) => generationRetryDecision({ category: category(error), attempt: 1, maxAttempts: 3 }).action === 'retry';

test('site plan job produces a validated PageSchema stored in R2 and referenced from the job', async () => {
  const stored = new Map<string, string>();
  const result = await runSitePlanJobCore(input, {
    callModel: async () => JSON.stringify(SITE),
    storeSchema: async (key, json) => { stored.set(key, json); return `https://r2.invalid/${key}`; },
  });
  const key = sitePlanSchemaKey('user_1', input.jobId);
  assert.equal(result.assetKey, key);
  assert.equal(result.outputUrl, `https://r2.invalid/${key}`);
  assert.equal(result.pageCount, 1);
  assert.equal(result.schemaInline, true);
  assert.equal(JSON.parse(stored.get(key)!).pages[0].id, 'page-home');
  assert.equal(result.workflow, 'site_plan');
});

test('large schemas are kept only in R2, not inline in MongoDB', async () => {
  const big = structuredClone(SITE);
  big.site.seo.description = 'x'.repeat(SITE_PLAN_INLINE_MAX_BYTES);
  const result = await runSitePlanJobCore(input, { callModel: async () => JSON.stringify(big), storeSchema: async key => `https://r2.invalid/${key}` });
  assert.equal(result.schemaInline, false);
  assert.equal('schema' in result, false);
});

test('invalid model output is a non-retryable validation error and nothing is stored', async () => {
  let stored = false;
  for (const output of ['not json at all', JSON.stringify({ schemaVersion: 1 })]) {
    const error = await runSitePlanJobCore(input, { callModel: async () => output, storeSchema: async () => { stored = true; return 'x'; } }).catch(e => e);
    assert.match(String((error as { code?: string }).code), /^VALIDATION_/);
    assert.equal(category(error), 'validation_error');
    assert.equal(retries(error), false);
  }
  assert.equal(stored, false);
});

test('R2 unavailable is a storage error; provider timeouts stay retryable', async () => {
  const noR2 = await runSitePlanJobCore(input, { callModel: async () => JSON.stringify(SITE), storeSchema: async () => null }).catch(e => e);
  assert.equal(category(noR2), 'storage_error');
  const timeout = await runSitePlanJobCore(input, { callModel: async () => { throw new Error('request timeout'); }, storeSchema: async () => 'x' }).catch(e => e);
  assert.equal(category(timeout), 'timeout');
  assert.equal(retries(timeout), true);
});

test('web jobs on the shared runtime: validation failure is refunded once, success captured once', async () => {
  const failing = workerHarness({ kind: 'project', outcomes: [Object.assign(new Error('bad schema'), { code: 'VALIDATION_INVALID_SCHEMA' })] });
  assert.equal((await failing.deliver())?.status, 'dead_letter');
  assert.equal(failing.count('refund'), 1);
  assert.equal(failing.followUps.length, 0);
  const ok = workerHarness({ kind: 'project', outcomes: [httpError(503), 'ok'] });
  assert.equal((await ok.deliver())?.status, 'queued');
  ok.untilNextAttempt();
  assert.equal((await ok.deliver())?.status, 'completed');
  assert.equal(ok.count('capture'), 1);
});

test('runner routes site-plan jobs before the generic web text path; Next.js app stays on Vercel', () => {
  const runner = readFileSync('src/lib/ai-job-runner.ts', 'utf8');
  assert.ok(runner.indexOf('isSitePlanJob(job)') < runner.indexOf("job.kind === 'project' && job.provider === 'google'"));
  const route = readFileSync('src/app/api/page-composer/ai/plan/route.ts', 'utf8');
  assert.match(route, /generateSitePlan\(/, 'synchronous page-composer route is unchanged until cut-over');
  const dockerfile = readFileSync('workers/generation/Dockerfile', 'utf8');
  assert.doesNotMatch(dockerfile, /next (build|start)/, 'the worker image does not run the Next.js app');
});
