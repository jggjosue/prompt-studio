import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('localGenerating is a counter, not a single boolean lock', async () => {
  const hook = await source('src/hooks/use-generation-editor.ts');
  // The old bug: a boolean useState meant one finishing generation cleared the flag for all.
  // Find the localGenerating declaration specifically.
  const decl = hook.match(/localGenerating[^\n]*/)?.[0] ?? '';
  assert.ok(decl.includes('activeGenerations > 0'), 'localGenerating debe derivarse del contador');
  assert.ok(hook.includes('useState(0)'), 'debe usar un contador numérico');
  assert.ok(hook.includes('Math.max(0, prev - 1)'), 'debe decrementar sin bajar de cero');
  assert.ok(hook.includes('prev + 1'), 'debe incrementar al iniciar generación');
  // Ensure localGenerating is not declared as a boolean useState
  assert.ok(
    !/localGenerating\s*[,\]]/.test(hook.match(/useState\(false\)[^\n]*localGenerating[^\n]*/)?.[0] ?? ''),
    'localGenerating no debe ser un booleano useState'
  );
  // Positive: it must be computed from the counter
  assert.ok(
    /const localGenerating = activeGenerations > 0/.test(hook),
    'localGenerating debe derivarse de activeGenerations'
  );
});

test('beginGeneration increments, finish/fail decrement', async () => {
  const hook = await source('src/hooks/use-generation-editor.ts');
  // beginGeneration sets true (increment), finishGeneration/failGeneration set false (decrement)
  const begin = hook.match(/beginGeneration[\s\S]*?\}, \[/)?.[0] ?? '';
  const finish = hook.match(/finishGeneration[\s\S]*?\}, \[/)?.[0] ?? '';
  const fail = hook.match(/failGeneration[\s\S]*?\}, \[/)?.[0] ?? '';
  assert.ok(begin.includes('setLocalGenerating(true)'), 'beginGeneration debe incrementar');
  assert.ok(finish.includes('setLocalGenerating(false)'), 'finishGeneration debe decrementar');
  assert.ok(fail.includes('setLocalGenerating(false)'), 'failGeneration debe decrementar');
});

test('Generación en curso message source is documented', async () => {
  const hook = await source('src/hooks/use-image-generation.ts');
  // The message appears when polling times out without an image URL — not from a lock.
  assert.ok(
    hook.includes('Generación en curso'),
    'el mensaje debe existir en use-image-generation.ts'
  );
  // It's returned as an error when imageOutputUrl is missing after polling
  assert.ok(
    hook.includes('if (!imageOutputUrl)'),
    'el mensaje se emite cuando no hay URL tras agotar el polling'
  );
});

test('no globalThis or module-level locks in generation paths', async () => {
  const files = [
    'src/hooks/use-generation-editor.ts',
    'src/hooks/use-image-generation.ts',
    'src/hooks/use-chat-generator.ts',
    'src/app/api/ai/jobs/route.ts',
    'src/app/api/ai/jobs/process/route.ts',
  ];
  for (const file of files) {
    const content = await source(file);
    assert.ok(
      !content.includes('globalThis.'),
      `${file} no debe usar globalThis para locks`
    );
  }
});

test('server idempotency is scoped per user', async () => {
  const route = await source('src/app/api/ai/jobs/route.ts');
  // Idempotency key lookup must include userId to avoid cross-user blocking
  assert.ok(
    route.includes('AIGenerationJob.findOne({ userId, idempotencyKey })'),
    'la búsqueda idempotente debe filtrar por userId'
  );
});

test('user-triggered processing stays alive and targets the requested job', async () => {
  const route = await source('src/app/api/ai/jobs/process/route.ts');
  const imageHook = await source('src/hooks/use-image-generation.ts');

  assert.doesNotMatch(route, /void \(async \(\) =>/);
  assert.match(route, /await processOne\(userId \|\| undefined, 5, jobId\)/);
  assert.match(route, /\.\.\.\(jobId \? \{ _id: jobId \} : \{\}\)/);
  assert.match(imageHook, /process\?jobId=\$\{encodeURIComponent\(jobIdFromRes\)\}&limit=1/);
});

test('Gemini failures are returned before attempting an empty R2 upload', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  const failureGuard = runner.indexOf("if (status === 'failed' || !imageUrl)");
  const upload = runner.indexOf('saveGeneratedImageToR2(imageUrl, job)', failureGuard);

  assert.ok(failureGuard >= 0, 'debe detenerse cuando Gemini no devuelve imagen');
  assert.ok(upload > failureGuard, 'debe validar el resultado antes de subirlo a R2');
  assert.match(runner.slice(failureGuard, upload), /throw new Error\(_userMessage\)/);
});

test('stored images use the authenticated job asset instead of an invented public R2 URL', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  const renderer = await source('src/components/chat/message-renderers.tsx');
  const assetRoute = await source('src/app/api/ai/jobs/[id]/asset/route.ts');

  assert.match(runner, /imageUrl: `\/api\/ai\/jobs\/\$\{String\(job\._id\)\}\/asset`/);
  assert.match(runner, /imageKey: key/);
  assert.match(assetRoute, /findOne\(\{ _id: id, userId, status: 'completed' \}\)/);
  assert.match(assetRoute, /getR2ObjectBytes\(imageKey\)/);
  assert.match(renderer, /forceUnoptimized/);
});
