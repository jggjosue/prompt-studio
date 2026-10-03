import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import { ClerkAuthAnalytics } from '@/components/clerk-auth-analytics';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In | Prompt Studio',
  description: 'Sign in to your Prompt Studio account to access AI video prompts, collections, and custom prompt templates.',
};

export default function SignInPage() {
  const afterSignIn = '/dashboard/projects';
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <ClerkAuthAnalytics surface="sign_in" />
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={afterSignIn}
        fallbackRedirectUrl={afterSignIn}
      />
    </div>
  );
}
