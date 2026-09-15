/**
 * Comprueba si alguna credencial en uso sigue siendo una que se filtró al
 * historial de git.
 *
 *   npm run verify:rotation
 *
 * `.env.example` está versionado y en algún momento contuvo valores reales.
 * Borrarlos de HEAD no los borra del historial: cualquiera con acceso al
 * repositorio puede recuperarlos de los commits antiguos. Este script recorre
 * TODAS las versiones de `.env.example` que existen en el historial, reúne los
 * valores que alguna vez estuvieron ahí, y los compara con lo que hay hoy en
 * `.env` / `.env.local`.
 *
 * Nunca imprime el valor de un secreto: solo el nombre de la clave y en qué
 * commit apareció.
 *
 * LIMITACIÓN IMPORTANTE: solo ve tu entorno local. Si producción usa valores
 * distintos (por ejemplo `sk_live_` en Vercel frente a `sk_test_` en local),
 * una clave puede salir limpia aquí y seguir comprometida en producción. La
 * lista de claves a rotar está en docs/rotacion-de-credenciales.md.
 */
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const TRACKED = '.env.example';
const root = process.cwd();

function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch {
    return '';
  }
}

function parse(text) {
  const values = new Map();
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (value) values.set(key, value);
  }
  return values;
}

async function parseFile(file) {
  try {
    return parse(await readFile(path.join(root, file), 'utf8'));
  } catch {
    return new Map();
  }
}

/** Valores que no son secretos aunque aparezcan en el historial. */
const NOT_SECRET = new Set([
  'NEXT_PUBLIC_SHOW_ADS', 'DOMAIN', 'DOMAIN_DEV', 'RESEND_EMAIL',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL', 'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_UNAUTHORIZED_SIGN_IN', 'NEXT_PUBLIC_CLERK_USER_PROFILE',
  'AI_INITIAL_CREDITS', 'COMPONENT_CATALOG_R2_PREFIX',
  'CLOUDFLARE_R2_BUCKET_NAME', 'NEXT_PUBLIC_CLERK_DOMAIN',
]);

/**
 * Patrones de claves públicas por diseño. Los Buy Button y Payment Link de
 * Stripe se sirven embebidos en el HTML del cliente: aparecer en el historial
 * no los compromete.
 */
const NOT_SECRET_PATTERNS = [
  /_BUY_BUTTON_ID(_DEV)?$/,
  /^NEXT_PUBLIC_STRIPE_CHECKOUT_/,
  /^NEXT_PUBLIC_FIREBASE_/,
  /^PLAN_PUBLISHABLE_KEY/,
  /^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY$/,
];

function isPublicByDesign(key) {
  return NOT_SECRET.has(key) || NOT_SECRET_PATTERNS.some(re => re.test(key));
}

/**
 * Claves que no son secretas pero sí sensibles: saberlas facilita un ataque
 * dirigido aunque no den acceso por sí solas.
 */
const SENSITIVE_IDENTIFIERS = new Set([
  'PROMPT_STUDIO_PREMIUM_JO', 'PROMPT_STUDIO_STARTUP_JO',
  'CLOUDFLARE_ACCOUNT_ID', 'RESEND_AUDIENCE_ID',
]);

const commits = git(['log', '--all', '--format=%H %ad', '--date=short', '--', TRACKED])
  .split('\n')
  .filter(Boolean)
  .map(line => {
    const [hash, date] = line.split(' ');
    return { hash, date, short: hash.slice(0, 8) };
  });

if (!commits.length) {
  console.log(`Sin historial para ${TRACKED}; nada que comprobar.`);
  process.exit(0);
}

// value → primera aparición (commit más antiguo que la contiene)
const leaked = new Map();
for (const commit of commits) {
  const content = git(['show', `${commit.hash}:${TRACKED}`]);
  if (!content) continue;
  for (const [key, value] of parse(content)) {
    const existing = leaked.get(value);
    if (!existing || existing.date > commit.date) {
      leaked.set(value, { key, ...commit });
    }
  }
}

const current = new Map([...(await parseFile('.env')), ...(await parseFile('.env.local'))]);

const mustRotate = [];
const shouldReview = [];

for (const [key, value] of current) {
  const hit = leaked.get(value);
  if (!hit) continue;
  if (isPublicByDesign(key)) continue;
  (SENSITIVE_IDENTIFIERS.has(key) ? shouldReview : mustRotate).push({ key, ...hit });
}

console.log(`\n  ROTACIÓN — ${commits.length} versiones de ${TRACKED} en el historial`);
console.log('  ' + '─'.repeat(58));

if (!mustRotate.length && !shouldReview.length) {
  console.log('  Ninguna credencial local coincide con un valor filtrado.\n');
  console.log('  Recuerda: esto solo mira tu entorno local. Si producción usa');
  console.log('  claves distintas (p. ej. sk_live_ en Vercel), compruébalas aparte.\n');
  process.exit(0);
}

if (mustRotate.length) {
  console.log(`\n  SIN ROTAR — ${mustRotate.length} credencial(es) en uso siguen filtradas:\n`);
  for (const item of mustRotate.sort((a, b) => a.key.localeCompare(b.key))) {
    console.log(`    ${item.key.padEnd(28)} expuesta desde ${item.date} (${item.short})`);
  }
}

if (shouldReview.length) {
  console.log(`\n  IDENTIFICADORES EXPUESTOS — no dan acceso, pero facilitan un ataque dirigido:\n`);
  for (const item of shouldReview.sort((a, b) => a.key.localeCompare(b.key))) {
    console.log(`    ${item.key.padEnd(28)} expuesto desde ${item.date} (${item.short})`);
  }
}

console.log('\n  Pasos: docs/rotacion-de-credenciales.md\n');
process.exitCode = mustRotate.length ? 1 : 0;
