#!/usr/bin/env node
/**
 * Comprueba que las variables de Clerk estén listas para el entorno indicado.
 *
 * Uso:
 *   node scripts/verify-clerk-env.mjs           # detecta NODE_ENV / VERCEL_ENV
 *   node scripts/verify-clerk-env.mjs production
 *   node scripts/verify-clerk-env.mjs development
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

const mode =
  process.argv[2] ||
  (process.env.VERCEL_ENV === 'production'
    ? 'production'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : 'development');

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const sk = process.env.CLERK_SECRET_KEY?.trim();

let ok = true;

function fail(msg) {
  console.error(`✗ ${msg}`);
  ok = false;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

//console.log(`\nClerk — verificación (${mode})\n`);

if (!pk) {
  fail('Falta NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
} else if (mode === 'production') {
  if (pk.startsWith('pk_live_')) {
    pass('Publishable key de producción (pk_live_*)');
  } else {
    fail(
      'En producción debes usar pk_live_*, no pk_test_*. Configúralo en Vercel → Production.'
    );
  }
} else if (pk.startsWith('pk_test_')) {
  pass('Publishable key de desarrollo (pk_test_*)');
} else if (pk.startsWith('pk_live_')) {
  pass('Publishable key live (válida; recuerda dominios en Clerk Dashboard)');
} else {
  fail('Publishable key con prefijo desconocido');
}

if (!sk) {
  fail('Falta CLERK_SECRET_KEY');
} else if (mode === 'production') {
  if (sk.startsWith('sk_live_')) {
    pass('Secret key de producción (sk_live_*)');
  } else {
    fail('En producción debes usar sk_live_*, no sk_test_*.');
  }
} else if (sk.startsWith('sk_test_')) {
  pass('Secret key de desarrollo (sk_test_*)');
} else if (sk.startsWith('sk_live_')) {
  pass('Secret key live');
} else {
  fail('Secret key con prefijo desconocido');
}

const routes = [
  ['NEXT_PUBLIC_CLERK_SIGN_IN_URL', '/sign-in'],
  ['NEXT_PUBLIC_CLERK_SIGN_UP_URL', '/sign-up'],
  [
    'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL',
    '/dashboard',
  ],
  [
    'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL',
    '/prices',
  ],
];

/** Dominio registrable: `www.ejemplo.com` y `clerk.ejemplo.com` -> `ejemplo.com`. */
function dominioRegistrable(host) {
  const partes = host.toLowerCase().split('.').filter(Boolean);
  return partes.slice(-2).join('.');
}

const sitio = process.env.DOMAIN?.trim();
const hostSitio = (() => {
  if (!sitio) return null;
  try { return new URL(sitio).hostname; } catch { return null; }
})();

/**
 * Estas rutas son páginas de *tu* aplicación, no de Clerk. Apuntarlas a un
 * host distinto —típicamente `clerk.<dominio>`, que sirve la Frontend API de
 * Clerk y no tu página de acceso— hace que `clerkMiddleware` no arranque, y el
 * despliegue responde 500 `MIDDLEWARE_INVOCATION_FAILED` en **todas** las
 * rutas. Antes este bucle imprimía el valor con un ✓ sin comprobar nada, así
 * que una configuración así pasaba la verificación.
 */
for (const [name, fallback] of routes) {
  const value = process.env[name]?.trim() || fallback;
  if (value.startsWith('/')) {
    pass(`${name}=${value}`);
    continue;
  }
  let url;
  try { url = new URL(value); } catch {
    fail(`${name}=${value} — debe ser una ruta de tu aplicación, por ejemplo ${fallback}`);
    continue;
  }
  if (hostSitio && url.hostname === hostSitio) {
    pass(`${name}=${value} (absoluta, mismo dominio que DOMAIN)`);
  } else {
    fail(
      `${name}=${value} — apunta a ${url.hostname}, que no es tu sitio` +
        (hostSitio ? ` (${hostSitio})` : '') +
        `. Debe ser una ruta como ${fallback}; si apunta a clerk.<dominio> el middleware falla en todas las rutas.`
    );
  }
}

/**
 * `NEXT_PUBLIC_CLERK_DOMAIN` es para dominios satélite. Si está puesto y no
 * pertenece al mismo dominio registrable que el sitio, Clerk intenta resolver
 * una instancia que no existe y el middleware deja de arrancar. Un simple error
 * tipográfico en el dominio basta para tumbar la aplicación entera.
 */
const dominioClerk = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim();
if (dominioClerk) {
  if (!hostSitio) {
    pass(`NEXT_PUBLIC_CLERK_DOMAIN=${dominioClerk} (sin DOMAIN, no se puede contrastar)`);
  } else if (dominioRegistrable(dominioClerk) === dominioRegistrable(hostSitio)) {
    pass(`NEXT_PUBLIC_CLERK_DOMAIN=${dominioClerk}`);
  } else {
    fail(
      `NEXT_PUBLIC_CLERK_DOMAIN=${dominioClerk} no pertenece a ${dominioRegistrable(hostSitio)} ` +
        `(DOMAIN=${sitio}). Revisa si hay una errata: con un dominio que no corresponde, ` +
        'clerkMiddleware no arranca y el sitio responde 500 en todas las rutas.'
    );
  }
}

if (mode === 'production') {
  //console.log(`
  //Checklist Clerk Dashboard(https://dashboard.clerk.com):
  //1. Instancia Production(no Development)
  //2. Configure → Domains: añade tu dominio(ej.prompstudio.com, www)
  //3. Paths: /sign-in y /sign - up coinciden con las URLs de arriba
  //4. Tras cambiar variables en Vercel → Redeploy sin caché de build

  //Vercel → Settings → Environment Variables(solo entorno Production):
  //NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
  //CLERK_SECRET_KEY = sk_live_...
  //`);
}

//console.log(ok ? '\nListo.\n' : '\nCorrige los errores antes de desplegar.\n');
process.exit(ok ? 0 : 1);
