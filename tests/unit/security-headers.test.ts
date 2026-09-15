import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import {
  appContentSecurityPolicy,
  BASELINE_SECURITY_HEADERS,
  cspHeaderKey,
  demoContentSecurityPolicy,
  isCspEnforced,
} from '../../src/lib/security-headers.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

/** Parsea una CSP a `{ directiva: [origenes] }`. */
function parse(policy: string): Record<string, string[]> {
  return Object.fromEntries(
    policy.split(';').map(part => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values];
    })
  );
}

test('la CSP de la app declara las defensas que no dependen de terceros', () => {
  const csp = parse(appContentSecurityPolicy());

  assert.deepEqual(csp['object-src'], ["'none'"], '<object>/<embed> deben quedar neutralizados');
  assert.deepEqual(csp['base-uri'], ["'self'"], 'una inyección no debe poder reescribir <base>');
  assert.deepEqual(csp['frame-ancestors'], ["'self'"], 'protección contra clickjacking');
  assert.ok(csp['default-src'].includes("'self'"));
  assert.ok(csp['form-action'].includes("'self'"), 'los formularios no deben poder enviarse a cualquier host');
});

test('la CSP de la app permite a los terceros que el sitio realmente usa', () => {
  const csp = parse(appContentSecurityPolicy());

  // Si alguno de estos falta, se rompe login, pago o analítica al pasar a modo bloqueo.
  assert.ok(csp['script-src'].some(s => s.includes('clerk')), 'Clerk');
  assert.ok(csp['script-src'].some(s => s.includes('stripe')), 'Stripe');
  assert.ok(csp['script-src'].some(s => s.includes('googletagmanager')), 'Google Analytics');
  assert.ok(csp['frame-src'].some(s => s.includes('stripe')), 'iframe de Stripe Checkout');
  assert.ok(
    csp['frame-src'].some(s => s.includes('challenges.cloudflare.com')),
    'Turnstile: Clerk lo usa para su protección anti-bot'
  );
  assert.ok(csp['connect-src'].some(s => s.includes('clerk')), 'llamadas XHR a Clerk');
});

test('script-src no es un comodín pese a llevar unsafe-inline', () => {
  const csp = parse(appContentSecurityPolicy());
  // `'unsafe-inline'` es una concesión conocida (ver security-headers.ts), pero
  // la allowlist de hosts debe seguir bloqueando <script src="https://atacante/">.
  assert.ok(!csp['script-src'].includes('*'));
  assert.ok(!csp['script-src'].includes('https:'));
});

test('la CSP de las demos es permisiva pero conserva las defensas clave', () => {
  const csp = parse(demoContentSecurityPolicy());

  assert.ok(csp['script-src'].includes('https:'), 'las demos cargan de cdnjs/jsdelivr/unpkg');
  assert.deepEqual(csp['object-src'], ["'none'"]);
  assert.deepEqual(csp['frame-ancestors'], ["'self'"]);
  assert.deepEqual(csp['base-uri'], ["'self'"]);
});

test('ambas políticas informan a /api/csp-report', () => {
  for (const policy of [appContentSecurityPolicy(), demoContentSecurityPolicy()]) {
    assert.deepEqual(parse(policy)['report-uri'], ['/api/csp-report']);
  }
});

test('por defecto la CSP va en Report-Only', () => {
  const previous = process.env.CSP_ENFORCE;
  try {
    delete process.env.CSP_ENFORCE;
    assert.equal(isCspEnforced(), false);
    assert.equal(cspHeaderKey(), 'Content-Security-Policy-Report-Only');

    process.env.CSP_ENFORCE = 'true';
    assert.equal(isCspEnforced(), true);
    assert.equal(cspHeaderKey(), 'Content-Security-Policy');
  } finally {
    if (previous === undefined) delete process.env.CSP_ENFORCE;
    else process.env.CSP_ENFORCE = previous;
  }
});

test('las cabeceras base cubren el mínimo y no incluyen COEP', () => {
  // `as const` estrecha las claves a un union literal; se ensancha para poder comparar.
  const keys: string[] = BASELINE_SECURITY_HEADERS.map(h => h.key);
  for (const expected of [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]) {
    assert.ok(keys.includes(expected), `falta ${expected}`);
  }

  // COEP rompería los embebidos de Stripe y los anuncios; debe quedar fuera.
  assert.ok(!keys.includes('Cross-Origin-Embedder-Policy'));

  // COOP tiene que permitir popups o se rompen el login de Clerk y el pago.
  const coop = BASELINE_SECURITY_HEADERS.find(h => h.key === 'Cross-Origin-Opener-Policy');
  assert.equal(coop?.value, 'same-origin-allow-popups');

  const hsts = BASELINE_SECURITY_HEADERS.find(h => h.key === 'Strict-Transport-Security');
  assert.ok(Number(hsts?.value.match(/max-age=(\d+)/)?.[1]) >= 31536000, 'HSTS mínimo un año');
});

test('las dos entradas de CSP en next.config.ts no se solapan', () => {
  // Si una ruta casara con ambas, el navegador aplicaría la intersección de las
  // dos políticas y las demos dejarían de cargar sus CDNs.
  const require = createRequire(import.meta.url);
  const compiled = require('next/dist/compiled/path-to-regexp/index.js');
  const pathToRegexp = compiled.pathToRegexp ?? compiled.default?.pathToRegexp ?? compiled;

  const app = pathToRegexp('/:path((?!webpages/).*)');
  const demo = pathToRegexp('/webpages/:path*');

  const appOnly = ['/', '/prices', '/landing-pages/foo', '/api/csp-report', '/webpages-otro'];
  for (const route of appOnly) {
    assert.ok(app.test(route), `${route} debería llevar la CSP de la app`);
    assert.ok(!demo.test(route), `${route} no debería llevar la CSP de las demos`);
  }

  const demoOnly = ['/webpages/linear-clone', '/webpages/linear-clone/index.html'];
  for (const route of demoOnly) {
    assert.ok(demo.test(route), `${route} debería llevar la CSP de las demos`);
    assert.ok(!app.test(route), `${route} no debería llevar también la CSP de la app`);
  }
});

test('next.config.ts usa el matcher excluyente y ambas familias de cabeceras', async () => {
  const config = await source('next.config.ts');
  assert.ok(config.includes("source: '/:path((?!webpages/).*)'"));
  assert.ok(config.includes("source: '/webpages/:path*'"));
  assert.ok(config.includes('BASELINE_SECURITY_HEADERS'));
  assert.ok(config.includes('appContentSecurityPolicy()'));
  assert.ok(config.includes('demoContentSecurityPolicy()'));
});

test('el receptor de informes CSP es público pero está limitado', async () => {
  const route = await source('src/app/api/csp-report/route.ts');
  assert.ok(route.includes('enforceIpRateLimit'));
  assert.ok(route.includes('status: 204'), 'no debe dar señal a quien sondee el endpoint');
});
