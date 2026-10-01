import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('Multimedia omits disabled capabilities that are available through chat slash commands', async () => {
  const header = await readFile(
    new URL('../../src/components/layout/header-client.tsx', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(header, /imageEditor:/);
  assert.doesNotMatch(header, /imageToVideo:/);
  assert.doesNotMatch(header, /analyzeImage:/);
  assert.match(header, /href: '\/generate\?mode=image'/);
  assert.match(header, /href: '\/generate\?mode=video'/);
});

test('Webs omits prompt optimization and code auditing now provided by chat', async () => {
  const header = await readFile(
    new URL('../../src/components/layout/header-client.tsx', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(header, /optimize: 'Optimizar prompts'/);
  assert.doesNotMatch(header, /auditor: 'Auditor de código'/);
  assert.doesNotMatch(header, /href: '\/prompt-optimizer'/);
  assert.doesNotMatch(header, /href: '\/code-auditor'/);
});
