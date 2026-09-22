'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { buildCheckoutUrl, buildSignUpUrl } from '@/lib/membership-access';
import { Crown, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PageComposerClient from './page-composer-client';

function PremiumAccessGate({ loading, isSignedIn }: { loading: boolean; isSignedIn: boolean }) {
  const checkoutUrl = isSignedIn
    ? buildCheckoutUrl({ plan: 'creator' })
    : buildSignUpUrl(buildCheckoutUrl({ plan: 'creator' }));

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-zinc-950 px-5 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,.2),transparent_35%)]" />
      <div className="relative w-full max-w-3xl text-center">
        <div className="mx-auto mb-8 grid size-20 place-items-center rounded-3xl border border-white/15 bg-white/10 shadow-2xl shadow-violet-950/40 transition-transform duration-700 hover:rotate-6 hover:scale-105">
          {loading ? <Sparkles className="size-9 animate-pulse text-cyan-300" /> : <LockKeyhole className="size-9 text-violet-200" />}
        </div>
        <Badge className="border-white/15 bg-white/10 text-cyan-200" variant="outline">
          <Crown className="mr-2 size-3.5" />Acceso Premium
        </Badge>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Tu próximo sitio empieza aquí.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-300">
          El Composer reúne tus componentes, crea una experiencia coherente y prepara tu proyecto Next.js para descargar.
        </p>
        <div className="mx-auto mt-9 grid max-w-xl gap-3 text-left sm:grid-cols-3">
          {[
            ['Cuenta', isSignedIn ? 'Cuenta verificada' : 'Crea tu cuenta'],
            ['Pago', loading ? 'Validando pago...' : isSignedIn ? 'Plan Premium requerido' : 'Activa Premium'],
            ['Editor', loading ? 'Preparando acceso...' : 'Editor desbloqueado'],
          ].map(([label, value], index) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.07] p-4 transition-colors hover:border-cyan-300/50">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                {label}
              </div>
              <p className="mt-2 text-xs text-zinc-400">{value}</p>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="mx-auto mt-10 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
          </div>
        ) : (
          <Button asChild className="mt-10 h-12 rounded-xl bg-white px-7 font-black text-zinc-950 transition-transform hover:-translate-y-1 hover:bg-cyan-100">
            <Link href={checkoutUrl}>
              {isSignedIn ? 'Activar Premium' : 'Crear cuenta y activar Premium'}
              <Sparkles className="ml-2 size-4" />
            </Link>
          </Button>
        )}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="size-4 text-emerald-400" />Acceso verificado con tu cuenta y suscripción
        </div>
      </div>
    </main>
  );
}

export default function PageComposerAccess() {
  const { ready, isSignedIn, plan } = useMembershipAccess();
  const hasPremiumAccess = ready && isSignedIn && plan === 'creator';

  if (!ready) return <PremiumAccessGate loading isSignedIn={Boolean(isSignedIn)} />;
  if (!hasPremiumAccess) return <PremiumAccessGate loading={false} isSignedIn={Boolean(isSignedIn)} />;
  return <PageComposerClient />;
}
