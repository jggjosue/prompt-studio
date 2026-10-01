import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('signup lifecycle instrumentation is present without direct PII', async () => {
  const auth = await source('src/components/clerk-auth-analytics.tsx');
  for (const event of ['signup_started', 'sign_up', 'login']) assert.ok(auth.includes(`'${event}'`));
  assert.ok(!auth.includes('email'));
  assert.ok(!auth.includes('userId'));
});

test('save_prompt fires only after a successful authenticated save', async () => {
  const saved = await source('src/components/saved-items-provider.tsx');
  assert.ok(saved.includes("trackAnalyticsEvent('save_prompt'"));
  assert.ok(saved.indexOf("if (!response.ok)") < saved.indexOf("trackAnalyticsEvent('save_prompt'"));
  assert.ok(saved.includes("auth_state: 'authenticated'"));
});

test('generation events fire on completed image, video, and web outputs', async () => {
  const cases = [
    ['src/hooks/use-image-generation.ts', 'generate_image', "status: 'completed'"],
    ['src/hooks/use-video-generation.ts', 'generate_video', 'setOutputVideoUrl(videoOutputUrl)'],
    ['src/hooks/use-web-generation.ts', 'generate_web', 'setOutputWebHTML(cleanHTML)'],
  ] as const;
  for (const [file, event, completion] of cases) {
    const code = await source(file);
    assert.ok(code.includes(completion));
    assert.ok(code.includes(`trackAnalyticsEvent('${event}'`));
    assert.ok(code.indexOf(completion) < code.indexOf(`trackAnalyticsEvent('${event}'`));
  }
});
