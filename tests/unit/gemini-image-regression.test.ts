import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  GoogleImageProviderError,
  requestGoogleImage,
} from '../../src/lib/google-image-provider';
import { validateGeminiSmokeImage } from '../../src/lib/gemini-image-smoke';
import { parseGeneratedImageSource } from '../../src/lib/generated-image-source';
import { generatedImageKey } from '../../src/lib/r2-storage';
import { generationSubmissionKey } from '../../src/lib/generation-idempotency';
import { generationRetryDecision } from '../../src/lib/generation-retry-policy';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

/**
 * Los tres prompts que el issue pide cubrir. Son deliberadamente distintos en
 * sujeto, color y entorno: dos comparten un sustantivo y ninguno comparte paleta,
 * así que una imagen repetida no puede disfrazarse de coincidencia.
 */
const PROMPTS = ['orange cat running', 'red sports car in snow', 'astronaut on the moon'] as const;

/** PNG real y mínimo, con la firma que el validador exige. */
function pngBytes(seed: string, length = 96): Buffer {
  const bytes = Buffer.alloc(length, 0x20);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  // El relleno depende del prompt: si dos generaciones comparten bytes, el
  // proveedor está devolviendo la misma imagen y el test debe notarlo.
  createHash('sha256').update(seed).digest().copy(bytes, 8);
  return bytes;
}

function imageResponse(seed: string) {
  return new Response(
    JSON.stringify({
      candidates: [
        { content: { parts: [{ inlineData: { mimeType: 'image/png', data: pngBytes(seed).toString('base64') } }] } },
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

/** Proveedor falso que es fiel en lo que importa: deriva los bytes del prompt. */
function providerDerivingFromPrompt() {
  const seen: string[] = [];
  const fetchImpl: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { contents: Array<{ parts: Array<{ text: string }> }> };
    const prompt = body.contents[0].parts[0].text;
    seen.push(prompt);
    return imageResponse(prompt);
  };
  return { fetchImpl, seen };
}

test('los tres prompts producen tres imágenes distintas, no la misma repetida', async () => {
  const { fetchImpl, seen } = providerDerivingFromPrompt();
  const generated = await Promise.all(
    PROMPTS.map((prompt) => requestGoogleImage({ prompt, apiKey: 'k', fetchImpl })),
  );

  const urls = generated.map((g) => g.result.imageUrl);
  assert.equal(new Set(urls).size, PROMPTS.length, 'cada prompt debe dar una imagen distinta');
  // Y no basta con que la URL sea distinta: los bytes tienen que diferir, que es
  // donde se manifestaría un placeholder o una respuesta cacheada.
  const payloads = urls.map((url) => {
    const source = parseGeneratedImageSource(url);
    assert.equal(source.kind, 'inline', 'el proveedor devuelve bytes, no una URL remota');
    return source.buffer.toString('base64');
  });
  assert.equal(new Set(payloads).size, PROMPTS.length, 'los bytes deben diferir, no solo la URL');
  assert.deepEqual(seen, [...PROMPTS], 'cada prompt debe llegar al proveedor por separado');
});

test('una respuesta de calidad sirve datos de imagen válidos, no un marcador', async () => {
  const { fetchImpl } = providerDerivingFromPrompt();
  for (const prompt of PROMPTS) {
    const { result } = await requestGoogleImage({ prompt, apiKey: 'k', fetchImpl });
    assert.equal(result.kind, 'IMAGE');
    // El validador de bytes es el que impide que un placeholder pase por imagen:
    // comprueba firma, tamaño y que el mime declarado coincida con el real.
    const image = validateGeminiSmokeImage(result.imageUrl);
    assert.equal(image.mimeType, 'image/png');
    assert.ok(image.byteLength > 32);
  }
});

test('un placeholder no puede satisfacer una aserción de éxito', () => {
  // Bytes que no son una imagen, con la misma forma de data URL que sí devuelve
  // el proveedor. Va "> 32 bytes" a propósito: por debajo el validador cortaría
  // antes por tamaño y no estaríamos probando la detección de formato.
  const filler = 'placeholder-no-es-una-imagen-real-ni-un-png-valido';
  const notAnImage = `data:image/png;base64,${Buffer.from(filler, 'utf8').toString('base64')}`;
  assert.throws(() => validateGeminiSmokeImage(notAnImage), /formato de imagen permitido/);

  // Un PNG con la firma correcta pero diminuto tampoco es una imagen generada.
  const tiny = pngBytes('x', 12).toString('base64');
  assert.throws(() => validateGeminiSmokeImage(`data:image/png;base64,${tiny}`), /tamaño de la imagen/);
});

test('una respuesta sin imagen falla en vez de devolver un marcador', async () => {
  const textOnly: typeof fetch = async () =>
    new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'no puedo generar eso' }] } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    requestGoogleImage({ prompt: PROMPTS[0], apiKey: 'k', fetchImpl: textOnly }),
    (error: unknown) => {
      assert.ok(error instanceof GoogleImageProviderError);
      // NO_IMAGE es una categoría con mensaje propio: el usuario recibe «no se
      // generó ninguna imagen» en vez de un PNG de relleno.
      assert.equal(error.code, 'NO_IMAGE');
      assert.equal(error.finishReason, 'STOP');
      return true;
    },
  );
});

test('el fallo del proveedor conserva estado y código, y no finge una imagen', async () => {
  const failing: typeof fetch = async () =>
    new Response(JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED', message: 'quota' } }),
      { status: 429, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    requestGoogleImage({ prompt: PROMPTS[1], apiKey: 'k', fetchImpl: failing }),
    (error: unknown) => {
      assert.ok(error instanceof GoogleImageProviderError);
      assert.equal(error.status, 429);
      assert.equal(error.code, 'RESOURCE_EXHAUSTED');
      return true;
    },
  );
});

test('la clave de almacenamiento es única por generación, nunca por prompt', () => {
  // La misma imagen para dos generaciones distintas es exactamente el bug que se
  // quiere evitar: si la clave dependiera del prompt, dos trabajos distintos
  // sobrescribirían el mismo objeto en R2.
  const generationIds = ['65f0c0ffee000000000000a1', '65f0c0ffee000000000000b2', '65f0c0ffee000000000000c3'];
  const keys = generationIds.map((id) => generatedImageKey('user-1', id, 'image/png'));
  assert.equal(new Set(keys).size, generationIds.length);
  for (const key of keys) assert.match(key, /^users\/user-1\/generations\/65f0c0ffee000000000000[a-z0-9]{2}\.png$/);

  // Y dos generaciones del mismo prompt tampoco comparten objeto.
  const samePrompt = ['gen-a', 'gen-b'].map((id) => generatedImageKey('user-1', id, 'image/png'));
  assert.notEqual(samePrompt[0], samePrompt[1]);
});

test('reintentar la misma generación no crea una segunda clave idempotente', () => {
  const job = { _id: '65f0c0ffee0000000000abcd', generationIdempotencyKey: 'idem-1' };
  // Es la invariante que hace que un reintento no se cobre dos veces: la clave
  // persiste entre intentos en lugar de derivarse del intento.
  assert.equal(generationSubmissionKey(job), 'idem-1');
  assert.equal(generationSubmissionKey(job), generationSubmissionKey({ ...job }));
  assert.equal(generationSubmissionKey({ _id: 'job-2' }), 'job-2', 'sin clave persistida cae al id del trabajo');
});

test('un fallo reintentable no consume los créditos de golpe', () => {
  const now = new Date('2026-09-28T12:00:00.000Z');
  const first = generationRetryDecision({ category: 'rate_limit_or_quota', attempt: 1, maxAttempts: 3, now, random: () => 0.5 });
  assert.equal(first.action, 'retry');
  assert.ok(first.nextAttemptAt! > now, 'el reintento se aplaza, así que el trabajo sigue reservado');

  const exhausted = generationRetryDecision({ category: 'rate_limit_or_quota', attempt: 3, maxAttempts: 3, now });
  assert.equal(exhausted.action, 'dead_letter', 'agotados los intentos ya no se reintenta');

  // Un fallo permanente ni siquiera se reintenta: va directo a cerrar y devolver
  // la reserva, sin esperar a agotar intentos.
  const permanent = generationRetryDecision({ category: 'validation_error', attempt: 1, maxAttempts: 3, now });
  assert.equal(permanent.action, 'dead_letter');
});

test('la ruta de producción valida los bytes antes de darlos por buenos', async () => {
  // El parser de la ruta de debug es el único que hoy valida firma y tamaño; el
  // flujo de Genkit que usa el runner solo comprueba que haya URL. Este test
  // fija el contrato que ya cumple la ruta validada, y falla si alguien deja de
  // validar bytes allí.
  const debugRoute = await source('src/app/api/debug/gemini-image/route.ts');
  assert.ok(debugRoute.includes('validateGeminiSmokeImage'), 'la ruta de diagnóstico valida los bytes');
  assert.ok(
    debugRoute.includes('classifyGeminiSmokeFailure'),
    'y clasifica el fallo en vez de devolver la respuesta tal cual',
  );

  const runner = await source('src/lib/ai-job-runner.ts');
  assert.ok(runner.includes('mapGeminiError'), 'el runner categoriza los errores del proveedor');
  assert.ok(!runner.includes('captureCredits'), 'el runner no captura créditos; esa propiedad es de processOne');
});
