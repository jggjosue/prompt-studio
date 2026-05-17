import { SignUp } from '@clerk/nextjs';

type Props = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect_url: redirectUrl } = await searchParams;
  const afterSignUp = redirectUrl ?? '/prices';

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
