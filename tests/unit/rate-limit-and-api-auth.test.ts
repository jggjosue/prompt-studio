import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  clientIp,
  limitInMemory,
  RATE_LIMITS,
  rateLimitHeaders,
  resetMemoryStore,
  retryAfterSeconds,
} from '../../src/lib/rate-limit-core.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el limitador permite hasta el tope y corta a partir de ahí', () => {
  resetMemoryStore();
  const options = { key: 'test:permitir', limit: 3, windowMs: 60_000 };

  const allowed = [1, 2, 3].map(() => limitInMemory(options));
  assert.deepEqual(allowed.map(r => r.ok), [true, true, true]);
  assert.deepEqual(allowed.map(r => r.remaining), [2, 1, 0]);

  const blocked = limitInMemory(options);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.remaining, 0);
});

test('cada clave lleva su propio contador', () => {
  resetMemoryStore();
  const options = { limit: 1, windowMs: 60_000 };

  assert.equal(limitInMemory({ key: 'ruta:1.1.1.1', ...options }).ok, true);
  assert.equal(limitInMemory({ key: 'ruta:1.1.1.1', ...options }).ok, false);
  // Otra IP no debe verse afectada por el bloqueo de la primera.
  assert.equal(limitInMemory({ key: 'ruta:2.2.2.2', ...options }).ok, true);
});

test('la cuota se renueva al cambiar de ventana', () => {
  resetMemoryStore();
  const options = { key: 'test:ventana', limit: 1, windowMs: 60_000 };
  const realNow = Date.now;

  try {
    Date.now = () => 1_000_000;
    assert.equal(limitInMemory(options).ok, true);
    assert.equal(limitInMemory(options).ok, false);

    // Se avanza más allá del reinicio de la ventana.
    Date.now = () => 1_000_000 + 60_001;
    assert.equal(limitInMemory(options).ok, true, 'la ventana nueva debe reiniciar la cuota');
  } finally {
    Date.now = realNow;
  }
});

test('clientIp toma la primera IP de x-forwarded-for y tiene respaldo', () => {
  const forwarded = new Request('https://example.com', {
    headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' },
  });
  assert.equal(clientIp(forwarded), '203.0.113.7');

  const realIp = new Request('https://example.com', { headers: { 'x-real-ip': '198.51.100.4' } });
  assert.equal(clientIp(realIp), '198.51.100.4');

  assert.equal(clientIp(new Request('https://example.com')), 'unknown');
});

test('las cabeceras de cuota y Retry-After son coherentes', () => {
  const result = { ok: false, limit: 5, remaining: 0, resetAt: Date.now() + 30_000 };
  const headers = rateLimitHeaders(result);

  assert.equal(headers['RateLimit-Limit'], '5');
  assert.equal(headers['RateLimit-Remaining'], '0');
  assert.ok(Number(headers['RateLimit-Reset']) > 0);
  assert.ok(retryAfterSeconds(result) >= 1, 'Retry-After nunca debe ser 0');
});

test('los presets de límite son conservadores para escrituras anónimas', () => {
  assert.ok(RATE_LIMITS.publicWrite.limit <= RATE_LIMITS.publicRead.limit);
  for (const preset of Object.values(RATE_LIMITS)) {
    assert.ok(preset.limit > 0 && preset.windowMs > 0);
  }
});

test('las rutas /api/sync-* exigen CRON_SECRET o sesión de admin', async () => {
  for (const route of [
    'src/app/api/sync-clerk/route.ts',
    'src/app/api/sync-registered-users-to-resend/route.ts',
  ]) {
    const value = await source(route);
    assert.ok(value.includes('requireCronOrAdmin'), `${route} no exige autorización`);
    assert.ok(
      value.includes('if (denied) return denied;'),
      `${route} no corta la petición cuando se deniega`
    );
  }
});

test('el guard compara el secreto en tiempo constante', async () => {
  const value = await source('src/lib/api-auth.ts');
  assert.ok(value.includes('safeEqual'));
  assert.ok(value.includes('diff |='), 'la comparación debe ser sin cortocircuito');
  assert.ok(!/authorization === `Bearer/.test(value), 'no debe quedar comparación directa con ===');
  assert.ok(value.includes('hasValidCronSecretHeader'), 'debe ofrecer autenticación sin secretos en query');
});

test('las rutas públicas de escritura aplican rate limiting', async () => {
  for (const [route, preset] of [
    ['src/app/api/new-users/route.ts', 'publicWrite'],
    ['src/app/api/affiliate/click/route.ts', 'publicWrite'],
    ['src/app/api/search/intent/route.ts', 'publicRead'],
  ] as const) {
    const value = await source(route);
    assert.ok(value.includes('enforceIpRateLimit'), `${route} no está limitada`);
    assert.ok(value.includes(`RATE_LIMITS.${preset}`), `${route} no usa el preset ${preset}`);
    assert.ok(value.includes('if (limited) return limited;'), `${route} no corta al superar la cuota`);
  }
});

test('la creación de trabajos de IA se limita por usuario, no por IP', async () => {
  const value = await source('src/app/api/ai/jobs/route.ts');
  assert.ok(value.includes('`ai-jobs:${userId}`'), 'la clave debe incluir el userId');
  assert.ok(value.includes('RATE_LIMITS.expensiveAuthed'));
  assert.ok(value.includes('tooManyRequests(quota)'));
});
