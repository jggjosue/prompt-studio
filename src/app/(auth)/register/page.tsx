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
  RegisterLink,
  LoginLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
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
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Click the button below to create an account and get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button asChild>
              <RegisterLink>Sign Up</RegisterLink>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <LoginLink className="underline">Sign in</LoginLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
