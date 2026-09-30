import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AFFILIATE_COMMISSION_PERCENT, AFFILIATE_COMMISSION_RATE } from '../../src/lib/affiliate.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const PAGE = 'src/app/[locale]/affiliate-program/affiliate-client.tsx';

test('las cifras de muestra van etiquetadas como ejemplo', async () => {
  const page = await source(PAGE);
  // Sin etiqueta, «Pagado: $18,940» afirma que el programa ha pagado esa
  // cantidad. El programa no ha tenido ninguna venta.
  assert.ok(page.includes("t('tracking.sampleBadge')"), 'falta el distintivo de ejemplo');
  assert.ok(page.includes("t('tracking.sampleNote')"), 'falta la aclaración de que no son resultados reales');

  const badgeAt = page.indexOf("t('tracking.sampleBadge')");
  const statsAt = page.indexOf('{trackingStats.map(');
  assert.ok(badgeAt > -1 && statsAt > -1);
  assert.ok(badgeAt < statsAt, 'la etiqueta debe leerse antes que las cifras, no después');
});

test('la etiqueta de ejemplo existe en los dos idiomas', async () => {
  for (const locale of ['es', 'en']) {
    const messages = JSON.parse(await source(`messages/${locale}.json`)) as Record<string, any>;
    const tracking = messages.affiliateProgram?.tracking ?? messages.affiliate?.tracking;
    assert.ok(tracking?.sampleBadge, `falta sampleBadge en ${locale}`);
    assert.ok(tracking?.sampleNote, `falta sampleNote en ${locale}`);
    assert.match(
      String(tracking.sampleNote),
      /No son resultados|Not actual/i,
      `la aclaración de ${locale} debe negar explícitamente que sean resultados reales`
    );
  }
});

test('la comisión mostrada sale del código que la paga', async () => {
  const page = await source(PAGE);
  // Un número escrito a mano se desvía del cálculo real en la primera vez que
  // alguien cambie la tasa, y entonces la página promete lo que no se paga.
  assert.ok(
    page.includes('{AFFILIATE_COMMISSION_PERCENT}%'),
    'la tasa debe leerse de la constante'
  );
  assert.ok(!/>20%</.test(page), 'no puede quedar la tasa escrita a mano');
  // Y la constante debe ser coherente consigo misma.
  assert.equal(AFFILIATE_COMMISSION_RATE, AFFILIATE_COMMISSION_PERCENT / 100);
  assert.ok(AFFILIATE_COMMISSION_PERCENT > 0 && AFFILIATE_COMMISSION_PERCENT <= 100);
});

test('la comisión se presenta como un solo plan común', async () => {
  const page = await source(PAGE);
  assert.ok(page.includes('const commissionPlan = {'));
  assert.ok(!page.includes('const tiersData = ['), 'no deben renderizarse tiers duplicados');
  assert.ok(page.includes('rate: `${AFFILIATE_COMMISSION_PERCENT}%`'));
});

test('los datos complementarios de la solicitud son opcionales de extremo a extremo', async () => {
  const page = await source(PAGE);
  const route = await source('src/app/api/affiliate/applications/route.ts');
  const model = await source('src/models/AffiliateApplication.ts');

  assert.match(page, /const requiredFields:[\s\S]*?'name',[\s\S]*?'email',[\s\S]*?'message',[\s\S]*?\];/);
  for (const field of ['profile', 'audience', 'channel', 'experience', 'plan']) {
    assert.ok(
      !route.includes(`if (!${field})`),
      `${field} no debe rechazarse en la API cuando está vacío`
    );
    assert.match(model, new RegExp(`${field}: \\{ type: String, default: ''`));
  }
});

test('el flujo del programa está completo antes de reclutar a nadie', async () => {
  // Meter afiliados en un programa incompleto quema la relación una sola vez.
  for (const route of [
    'src/app/api/affiliate/applications/route.ts',
    'src/app/api/affiliate/click/route.ts',
    'src/app/api/admin/affiliate-applications/[applicationId]/route.ts',
    'src/app/api/profile/paypal/route.ts',
  ]) {
    await source(route);
  }
});

test('la atribución sobrevive a las redirecciones heredadas', async () => {
  const proxy = await source('src/proxy.ts');
  // El referido viaja en `?ref=`. Antes se perdía en cada redirección
  // permanente, así que los enlaces de afiliado a URLs antiguas no cobraban.
  assert.ok(proxy.includes('function permanentRedirect('), 'las redirecciones deben preservar la query');
  assert.ok(proxy.includes('url.search = req.nextUrl.search'), 'y copiarla de la petición original');
});
