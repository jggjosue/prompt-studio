#!/usr/bin/env node
/**
 * Comprueba que las variables de Clerk estén listas para el entorno indicado.
 *
 * Uso:
 *   node scripts/verify-clerk-env.mjs           # detecta NODE_ENV / VERCEL_ENV
 *   node scripts/verify-clerk-env.mjs production
 *   node scripts/verify-clerk-env.mjs development
 */

import { readFileSync, existsSync } from 'fs';
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

console.log(`\nClerk — verificación (${mode})\n`);

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

for (const [name, fallback] of routes) {
  const value = process.env[name]?.trim() || fallback;
  pass(`${name}=${value}`);
}

if (mode === 'production') {
  console.log(`
Checklist Clerk Dashboard (https://dashboard.clerk.com):
  1. Instancia Production (no Development)
  2. Configure → Domains: añade tu dominio (ej. promptstudio.com, www)
  3. Paths: /sign-in y /sign-up coinciden con las URLs de arriba
  4. Tras cambiar variables en Vercel → Redeploy sin caché de build

Vercel → Settings → Environment Variables (solo entorno Production):
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
  CLERK_SECRET_KEY = sk_live_...
`);
}

console.log(ok ? '\nListo.\n' : '\nCorrige los errores antes de desplegar.\n');
process.exit(ok ? 0 : 1);
