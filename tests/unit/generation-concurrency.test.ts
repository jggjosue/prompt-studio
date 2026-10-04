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
  const claim = await source('src/lib/generation-job-claim.ts');
  const imageHook = await source('src/hooks/use-image-generation.ts');

  assert.doesNotMatch(route, /void \(async \(\) =>/);
  assert.match(route, /await processOne\(userId \|\| undefined, 5, jobId\)/);
  // El filtrado por jobId se mudó al claim atómico cuando la cola pasó aleases:
  // la ruta ya no hace `findOne`, delega en `claimGenerationJob({ …, jobId })`.
  // Lo que importa es que el filtro siga existiendo en algún lado.
  assert.match(route, /claimGenerationJob\(/, 'la ruta delega el claim en la capa atómica');
  assert.match(
    claim,
    /\.\.\.\(input\.jobId \? \{ _id: input\.jobId \} : \{\}\)/,
    'el claim atómico debe filtrar por el jobId solicitado'
  );
  assert.match(imageHook, /process\?jobId=\$\{encodeURIComponent\(jobIdFromRes\)\}&limit=1/);
});

test('Gemini image failures surface before a result is accepted', async () => {
  // La imagen de Gemini vive ya en `generate-image.ts`: ya no hay subida a R2,
  // así que la invariante es que un resultado vacío no se acepta como éxito.
  const flow = await source('src/ai/flows/generate-image.ts');

  const guard = flow.indexOf('if (!imageUrl)');
  assert.ok(guard >= 0, 'debe detenerse cuando Gemini no devuelve imagen');
  assert.ok(
    flow.indexOf('throw new Error(\'Image generation failed.\')', guard) > guard,
    'debe fallar antes de devolver el resultado'
  );
  assert.ok(
    flow.indexOf('return { imageUrl }', guard) > guard,
    'solo devuelve después de validar'
  );
});

test('inline Gemini images stay bounded and never become a public URL', async () => {
  const flow = await source('src/ai/flows/generate-image.ts');
  const runner = await source('src/lib/ai-job-runner.ts');
  const assetRoute = await source('src/app/api/ai/jobs/[id]/asset/route.ts');

  // El data URI viaja dentro del documento del job, cuyo tope duro de BSON son
  // 16 MB. Sin acotar, una imagen grande revienta la escritura tras gastar
  // créditos. Mismo techo que el worker externo.
  assert.match(flow, /MAX_INLINE_IMAGE_CHARS = 2_000_000/, 'el data URI debe tener un tope');
  const bound = flow.indexOf('imageUrl.length > MAX_INLINE_IMAGE_CHARS');
  assert.ok(bound >= 0, 'debe comprobar el tamaño del data URI');
  assert.ok(
    bound < flow.indexOf('return { imageUrl }'),
    'el tope se comprueba antes de aceptar el resultado'
  );
  assert.match(runner, /JSON\.stringify\(result\)\.length > 2_000_000/, 'el worker mantiene su propio tope');

  // La garantía original sigue en pie por construcción: lo que sale de Gemini
  // es un data URI en línea, no una URL pública inventada.
  assert.match(flow, /media\?\.url/, 'la imagen viene del media del modelo');
  assert.doesNotMatch(
    flow,
    /saveGeneratedImageToR2|https?:\/\/[^\s'"]*\.(?:png|jpe?g|webp)/i,
    'el flujo de Gemini no fabrica ni sube una URL pública'
  );

  // Y la ruta autenticada sigue sirviendo el resto de proveedores con control
  // de propietario y de estado.
  assert.match(assetRoute, /findOne\(\{ _id: id, userId, status: 'completed' \}\)/);
  assert.match(assetRoute, /getR2ObjectBytes\(asset\.key\)/);
  // Solo claves bajo el prefijo del propietario: nunca un objeto ajeno ni público.
  assert.match(assetRoute, /asset\.key\.startsWith\(`users\/\$\{userId\}\/generations\/`\)/);
});
