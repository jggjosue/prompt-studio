/**
 * Impide que `.env.example` vuelva a contener secretos reales.
 *
 *   npm run verify:env-example
 *
 * `.env.example` está versionado (`.gitignore` lo exceptúa con `!.env.example`)
 * y por tanto se publica con el repositorio. En algún momento llegó a contener
 * 54 valores idénticos a `.env`, incluida una `sk_live_` de Clerk, la URI de
 * Mongo y las credenciales de R2. Este script existe para que eso no dependa de
 * que alguien se acuerde.
 *
 * Dos comprobaciones:
 *  1. Ningún valor de `.env.example` coincide con el de `.env` o `.env.local`.
 *  2. Ningún valor tiene forma de secreto real (prefijos conocidos, entropía).
 *
 * No imprime nunca el valor de un secreto: solo el nombre de la clave.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

/** Valores que son plantilla legítima y no deben disparar la alarma. */
const PLACEHOLDER = /^$|^(x{3,}|<.*>|tu[-_]|your[-_]|change[-_]?me|ejemplo|example|placeholder)/i;
/** Sufijo de plantilla habitual: `sk_test_xxxxxxxx`. */
const TEMPLATE_SUFFIX = /x{6,}$/i;
/**
 * Marcadores que delatan una plantilla aunque el valor empiece por un prefijo
 * real, como `mongodb+srv://usuario:password@cluster.mongodb.net/...`.
 */
const TEMPLATE_MARKERS =
  /(usuario|username|user):(password|contrasena|contraseña|pass)@|<[^>]+>|\bxxxx+/i;

/** Prefijos que identifican un secreto real de un proveedor conocido. */
const SECRET_PREFIXES = [
  ['sk_live_', 'clave secreta de Clerk/Stripe en modo LIVE'],
  ['sk_test_', 'clave secreta en modo test'],
  ['rk_live_', 'clave restringida de Stripe'],
  ['whsec_', 'secreto de webhook'],
  ['re_', 'clave de API de Resend'],
  ['cfut_', 'token de API de Cloudflare'],
  ['mongodb+srv://', 'cadena de conexión de MongoDB'],
  ['mongodb://', 'cadena de conexión de MongoDB'],
];

/** Claves cuyo valor es público por diseño y puede ir literal en el ejemplo. */
const PUBLIC_BY_DESIGN = new Set([
  'NEXT_PUBLIC_SHOW_ADS',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_UNAUTHORIZED_SIGN_IN',
  'NEXT_PUBLIC_CLERK_USER_PROFILE',
  'AI_INITIAL_CREDITS',
  'COMPONENT_CATALOG_R2_PREFIX',
  'DOMAIN',
  'DOMAIN_DEV',
]);

async function parseEnv(file) {
  const values = new Map();
  let raw;
  try {
    raw = await readFile(path.join(root, file), 'utf8');
  } catch {
    return values; // El archivo puede no existir en CI; no es un fallo.
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    values.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim());
  }
  return values;
}

/** Heurística de entropía: distingue un token real de `xxxxxxxx`. */
function looksHighEntropy(value) {
  if (value.length < 24) return false;
  const unique = new Set(value).size;
  const hasMixedCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  return unique >= 12 && hasMixedCase && hasDigit;
}

function isPlaceholder(value) {
  return PLACEHOLDER.test(value) || TEMPLATE_SUFFIX.test(value) || TEMPLATE_MARKERS.test(value);
}

const example = await parseEnv('.env.example');
const real = new Map([...(await parseEnv('.env')), ...(await parseEnv('.env.local'))]);

const leaked = [];
const suspicious = [];

for (const [key, value] of example) {
  if (!value || PUBLIC_BY_DESIGN.has(key) || isPlaceholder(value)) continue;

  if (real.get(key) === value) {
    leaked.push(key);
    continue;
  }

  const prefix = SECRET_PREFIXES.find(([p]) => value.startsWith(p));
  if (prefix) {
    suspicious.push(`${key} — parece ${prefix[1]}`);
  } else if (looksHighEntropy(value)) {
    suspicious.push(`${key} — cadena de alta entropía (${value.length} caracteres)`);
  }
}

if (!leaked.length && !suspicious.length) {
  console.log(`.env.example limpio (${example.size} claves revisadas).`);
  process.exit(0);
}

console.error('\n  .env.example CONTIENE SECRETOS. Está versionado y se publica con el repo.\n');

if (leaked.length) {
  console.error('  Valores idénticos a los de .env / .env.local:');
  for (const key of leaked) console.error(`    - ${key}`);
  console.error('');
}
if (suspicious.length) {
  console.error('  Con forma de secreto real:');
  for (const item of suspicious) console.error(`    - ${item}`);
  console.error('');
}

console.error('  Sustitúyelos por placeholders. Si alguno llegó a commitearse,');
console.error('  rota la credencial: borrarla de HEAD no la borra del historial.');
console.error('  Guía: docs/rotacion-de-credenciales.md\n');
process.exit(1);
