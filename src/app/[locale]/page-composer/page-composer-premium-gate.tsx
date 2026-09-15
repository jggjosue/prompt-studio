import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PLAN_PRICES } from '@/lib/subscription-plans';
import { ArrowRight, Check, Crown, LogIn, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PageComposerPremiumGate({
  reason,
  locale,
}: {
  reason: 'anonymous' | 'unpaid';
  locale?: string;
}) {
  const es = (locale ?? 'es').startsWith('es');
  const returnTo = '/page-composer';
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`;
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent('/prices?plan=premium')}`;

  const benefits = es
    ? ['Combina secciones en una sola página coherente', 'Vista previa adaptable para escritorio, tablet y móvil', 'Prompt maestro y descarga de proyecto Next.js', 'Componentes de conversión, confianza y contenido']
    : ['Combine sections into one cohesive page', 'Responsive desktop, tablet, and mobile preview', 'Master prompt and Next.js project download', 'Conversion, trust, and content components'];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-[radial-gradient(circle_at_20%_0%,rgba(79,70,229,.2),transparent_34%),radial-gradient(circle_at_80%_15%,rgba(6,182,212,.14),transparent_30%)] px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
              <Crown className="size-3.5" />
              {es ? 'Incluido en Premium' : 'Included in Premium'}
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              {es ? 'Genera páginas que se sienten como un sistema' : 'Generate pages that feel like one system'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              {reason === 'anonymous'
                ? es ? 'Crea una cuenta y activa Premium para usar el Composer.' : 'Create an account and activate Premium to use the Composer.'
                : es ? 'Tu cuenta está activa, pero este generador requiere un plan Premium.' : 'Your account is active, but this generator requires a Premium plan.'}
            </p>
            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left">
              {benefits.map(benefit => <li key={benefit} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />{benefit}</li>)}
            </ul>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {reason === 'anonymous' ? <>
                <Button asChild size="lg" className="h-12 rounded-full px-6"><Link href={signUpUrl}><Sparkles className="mr-2 size-4" />{es ? 'Crear cuenta' : 'Create account'}</Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6"><Link href={signInUrl}><LogIn className="mr-2 size-4" />{es ? 'Ya tengo cuenta' : 'I already have an account'}</Link></Button>
              </> : <>
                <Button asChild size="lg" className="h-12 rounded-full px-6"><Link href="/prices?plan=premium"><Crown className="mr-2 size-4" />{es ? `Activar Premium · $${PLAN_PRICES.premium.monthly}/mes` : `Get Premium · $${PLAN_PRICES.premium.monthly}/mo`}<ArrowRight className="ml-2 size-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6"><Link href="/dashboard/billing">{es ? 'Ver mi facturación' : 'View billing'}</Link></Button>
              </>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
