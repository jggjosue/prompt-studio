/**
 * Clerk env + ClerkProvider props.
 * Production must use pk_live_* and list the site domain in Clerk Dashboard.
 */

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it in Vercel → Settings → Environment Variables.'
  );
}

if (
  process.env.NODE_ENV === 'production' &&
  publishableKey.startsWith('pk_test_')
) {
  console.error(
    '[Clerk] Production is using a TEST publishable key (pk_test_*). ' +
      'Set pk_live_* and sk_live_* in Vercel and add your production domain under Clerk → Domains.'
  );
}

const clerkDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim();

export const clerkProviderProps = {
  publishableKey,
  ...(clerkDomain ? { domain: clerkDomain } : {}),
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  signInFallbackRedirectUrl:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/dashboard',
  signUpFallbackRedirectUrl:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? '/prices',
} as const;

function shouldEnforceLiveClerkKeys(): boolean {
  const flag = process.env.CLERK_ENFORCE_LIVE_KEYS?.trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

/**
 * Aviso en build de producción si siguen claves de test.
 * Solo falla el build si `CLERK_ENFORCE_LIVE_KEYS=1` (recomendado cuando ya tengas pk_live_* en Vercel).
 * Comprobación estricta manual: `npm run verify:clerk:prod`
 */
export function assertClerkProductionKeys(): void {
  const isProdBuild =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production';
  if (!isProdBuild) return;

  const problems: string[] = [];
  if (publishableKey.startsWith('pk_test_')) {
    problems.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY es pk_test_*');
  }
  const secret = process.env.CLERK_SECRET_KEY;
  if (secret?.startsWith('sk_test_')) {
    problems.push('CLERK_SECRET_KEY es sk_test_*');
  }
  if (problems.length === 0) return;

  const message =
    '[Clerk] Build de producción con claves de test: ' +
    problems.join('; ') +
    '. Configura pk_live_* y sk_live_* en Vercel (Production). ' +
    'Para bloquear el build hasta entonces, deja CLERK_ENFORCE_LIVE_KEYS sin definir; ' +
    'cuando uses live keys, opcionalmente pon CLERK_ENFORCE_LIVE_KEYS=1 para exigirlas.';

  if (shouldEnforceLiveClerkKeys()) {
    throw new Error(message);
  }

  console.warn(message);
}
