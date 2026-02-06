import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Logo from '@/components/layout/logo';
import Link from 'next/link';
import {
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mb-4"
          >
            <Logo />
            <span className="font-bold text-lg font-headline">
              Prompt Studio
            </span>
          </Link>
          <CardTitle className="text-2xl font-headline">Sign In</CardTitle>
          <CardDescription>
            Welcome back! Click the button below to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button asChild>
              <LoginLink>Sign In</LoginLink>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <RegisterLink className="underline">Sign up</RegisterLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
