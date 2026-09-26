import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign Up | Prompt Studio',
  description: 'Create a Prompt Studio account to access curated collections of AI video prompts, generate custom templates, and elevate your creative assets.',
};

type Props = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect_url: redirectUrl } = await searchParams;
  const afterSignUp = redirectUrl ?? '/dashboard/profile';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={afterSignUp}
        fallbackRedirectUrl={afterSignUp}
      />
    </div>
  );
}
