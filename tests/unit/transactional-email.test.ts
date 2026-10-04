import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el recibo de compra lleva descarga y petición de reseña', async () => {
  const { buildPurchaseReceipt } = await import('../../src/lib/purchase-email-content.ts');
  const mail = buildPurchaseReceipt({
    productName: 'Botón neón',
    productId: 'web-button-neon',
    amountPaidCents: 1900,
    currency: 'usd',
    receiptUrl: 'https://stripe.example/recibo',
  });
  assert.match(mail.subject, /Botón neón/);
  assert.match(mail.text, /19\.00 USD/, 'el importe debe aparecer en el cuerpo');
  assert.match(mail.text, /\/dashboard\/library/, 'sin enlace de descarga el recibo no sirve');
  assert.match(mail.text, /web-button-neon/, 'debe enlazar al producto para dejar reseña');
  assert.match(mail.text, /https:\/\/stripe\.example\/recibo/, 'la factura de Stripe debe incluirse');
});

test('sin factura de Stripe el recibo sigue siendo válido', async () => {
  const { buildPurchaseReceipt } = await import('../../src/lib/purchase-email-content.ts');
  const mail = buildPurchaseReceipt({ productName: 'X', productId: 'x', amountPaidCents: 100, currency: 'eur' });
  assert.ok(!mail.text.includes('Factura de Stripe'), 'no debe dejar una línea vacía de factura');
  assert.match(mail.text, /1\.00 EUR/);
});

test('la confirmación de recarga dice el saldo resultante', async () => {
  const { buildCreditTopUpReceipt } = await import('../../src/lib/purchase-email-content.ts');
  const mail = buildCreditTopUpReceipt({ credits: 66, amountPaidCents: 2400, currency: 'usd', balance: 78.5 });
  assert.match(mail.subject, /66 créditos/);
  assert.match(mail.text, /78\.5 créditos/, 'el saldo tras la recarga es el dato que se quiere ver');
  assert.match(mail.text, /no caducan/, 'la política de caducidad debe constar por escrito');
});

test('Resend nunca se importa de forma estática', async () => {
  // `@/lib/resend` lanza al cargarse si falta RESEND_API_KEY. Un import
  // estático rompería el webhook entero en cualquier entorno sin clave.
  for (const file of [
    'src/lib/transactional-email.ts',
    'src/lib/credit-topup.ts',
    'src/app/api/webhooks/stripe/route.ts',
  ]) {
    const code = await source(file);
    assert.ok(
      !/^import .*from '@\/lib\/resend'/m.test(code),
      `${file} no puede importar Resend estáticamente`
    );
  }
  const mail = await source('src/lib/transactional-email.ts');
  assert.ok(mail.includes("await import('@/lib/resend')"), 'debe importarse de forma dinámica');
});

test('sin configuración de correo no se intenta enviar', async () => {
  const mail = await source('src/lib/transactional-email.ts');
  // Enviar sin clave lanzaría dentro del webhook de Stripe.
  assert.ok(mail.includes('function emailConfigured()'), 'hace falta comprobar la configuración');
  assert.ok(mail.includes('if (!emailConfigured()) return false;'), 'debe salir antes de tocar Resend');
});

test('un fallo de envío no tumba la operación que lo originó', async () => {
  const mail = await source('src/lib/transactional-email.ts');
  // Devolver 500 a Stripe provoca reintentos del webhook y la compra ya está
  // registrada: el correo es lo secundario.
  assert.ok(mail.includes('reportOperationalError('), 'el fallo debe quedar registrado');
  assert.ok(mail.includes('return false;'), 'y no propagarse');
  const webhook = await source('src/app/api/webhooks/stripe/route.ts');
  assert.ok(webhook.includes('void sendPurchaseReceipt('), 'el envío no debe bloquear el webhook');
});

test('el recibo no se envía dos veces aunque Stripe reintente', async () => {
  const webhook = await source('src/app/api/webhooks/stripe/route.ts');
  assert.ok(
    webhook.includes('receiptEmailSentAt: null }'),
    'la marca debe reclamarse de forma atómica antes de enviar'
  );
  assert.ok(webhook.includes('if (claimReceipt.modifiedCount)'), 'solo quien gana la marca envía');

  const topup = await source('src/lib/credit-topup.ts');
  assert.ok(topup.includes('if (claimEmail.modifiedCount)'), 'la recarga necesita la misma protección');

  for (const model of ['src/models/ComponentPurchase.ts', 'src/models/CreditPurchase.ts']) {
    const code = await source(model);
    assert.ok(code.includes('receiptEmailSentAt'), `${model} debe guardar la marca`);
  }
});

test('el contenido de los correos no depende de servidor', async () => {
  const content = await source('src/lib/purchase-email-content.ts');
  // Con `server-only` no se puede comprobar el texto en pruebas, que es
  // justamente donde importa revisar qué se le dice a un cliente que pagó.
  assert.ok(!content.includes("import 'server-only'"), 'el módulo de contenido debe ser puro');
  const sender = await source('src/lib/transactional-email.ts');
  assert.ok(sender.includes("import 'server-only'"), 'el envío sí debe quedar restringido al servidor');
});

test('el bienvenido de cuenta dice que la cuenta se creó y enlaza al catálogo', async () => {
  const { buildAccountWelcomeEmail } = await import('../../src/lib/account-welcome-email.ts');
  const mail = buildAccountWelcomeEmail({ firstName: 'Ana', locale: 'es' });
  assert.match(mail.subject, /Bienvenido a Prompt Studio/);
  assert.match(mail.text, /Hola Ana,/);
  assert.match(mail.text, /se ha creado correctamente/);
  assert.match(mail.text, /\/landing-pages/, 'debe enlazar al catálogo para empezar');
});

test('el bienvenido en inglés usa el nombre y saluda correctamente', async () => {
  const { buildAccountWelcomeEmail } = await import('../../src/lib/account-welcome-email.ts');
  const withName = buildAccountWelcomeEmail({ firstName: 'John', locale: 'en' });
  assert.match(withName.subject, /Welcome to Prompt Studio/);
  assert.match(withName.text, /Hi John,/);
  assert.match(withName.text, /account has been created/);

  const anonymous = buildAccountWelcomeEmail({ locale: 'en' });
  assert.ok(!anonymous.text.includes('Hi ,'), 'sin nombre no debe dejar un saludo vacío');
  assert.match(anonymous.text, /^Hi,/m);
});

test('el bienvenido no depende de servidor', async () => {
  const content = await source('src/lib/account-welcome-email.ts');
  assert.ok(!content.includes("import 'server-only'"), 'el contenido del bienvenido debe ser puro');
});

test('el webhook de Clerk envía el bienvenido al crear la cuenta sin bloquear el flujo', async () => {
  const webhook = await source('src/app/api/webhooks/clerk/route.ts');
  assert.ok(webhook.includes('sendTransactionalEmail('), 'debe enviar el bienvenido por Resend');
  assert.ok(webhook.includes('buildAccountWelcomeEmail('), 'debe construir el contenido');
  assert.ok(
    /if \(evt\.type === 'user\.created'\)/.test(webhook) &&
      webhook.indexOf('user.created') < webhook.indexOf('sendTransactionalEmail('),
    'el envío debe ocurrir en user.created'
  );
  assert.ok(
    !webhook.includes('upsertResendContact'),
    'crear una cuenta no puede suscribir a marketing'
  );
});
