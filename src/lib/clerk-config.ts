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

/** Ejecutar antes de build de producción: `npm run verify:clerk -- production` */
export function assertClerkProductionKeys(): void {
  if (process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production') {
    return;
  }
  if (publishableKey.startsWith('pk_test_')) {
    throw new Error(
      '[Clerk] Build de producción con pk_test_*. Usa pk_live_* y sk_live_* en Vercel (entorno Production).'
    );
  }
  const secret = process.env.CLERK_SECRET_KEY;
  if (secret?.startsWith('sk_test_')) {
    throw new Error(
      '[Clerk] Build de producción con sk_test_*. Usa sk_live_* en Vercel (entorno Production).'
    );
  }
}
