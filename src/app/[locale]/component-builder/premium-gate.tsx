import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PLAN_PRICES } from '@/lib/subscription-plans';
import { ArrowRight, Check, Crown, LogIn, MousePointerClick, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Pantalla que ve quien no puede entrar al constructor.
 *
 * Dos motivos distintos, dos llamadas a la acción distintas: sin cuenta se
 * ofrece registro; con cuenta y sin plan, el checkout. Mezclarlas manda al
 * usuario ya registrado a un formulario de registro que no necesita.
 */
export default function ComponentBuilderPremiumGate({
  reason,
  locale,
}: {
  reason: 'anonymous' | 'unpaid';
  /** Se usa solo para el texto; la URL pública no lleva prefijo de idioma. */
  locale?: string;
}) {
  const es = (locale ?? 'es').startsWith('es');
  const returnTo = '/component-builder';
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`;
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent('/prices?plan=premium')}`;
  const checkoutUrl = '/prices?plan=premium';

  const ventajas = es
    ? [
        'Lienzo por capas con arrastrar y soltar',
        'Reordena, duplica y oculta bloques en vivo',
        'Prompt generado a partir de tu composición real',
        'Exportación y variantes de los 450 componentes',
      ]
    : [
        'Layer canvas with drag and drop',
        'Reorder, duplicate and hide blocks live',
        'Prompt generated from your actual composition',
        'Export and variants across all 450 components',
      ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-violet-600/10 via-background to-background px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-600/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              <Crown className="h-3.5 w-3.5" />
              {es ? 'Incluido en Premium' : 'Included in Premium'}
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              {es ? 'Constructor visual de componentes' : 'Visual component builder'}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {reason === 'anonymous'
                ? es
                  ? 'Necesitas una cuenta y un plan Premium activo para diseñar aquí.'
                  : 'You need an account and an active Premium plan to design here.'
                : es
                  ? 'Tu cuenta está activa, pero el constructor requiere un plan Premium.'
                  : 'Your account is active, but the builder requires a Premium plan.'}
            </p>

            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left">
              {ventajas.map(item => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {reason === 'anonymous' ? (
                <>
                  <Button asChild size="lg" className="h-12 rounded-full px-6">
                    <Link href={signUpUrl}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {es ? 'Crear cuenta' : 'Create account'}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
                    <Link href={signInUrl}>
                      <LogIn className="mr-2 h-4 w-4" />
                      {es ? 'Ya tengo cuenta' : 'I already have an account'}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 rounded-full px-6">
                    <Link href={checkoutUrl}>
                      <Crown className="mr-2 h-4 w-4" />
                      {es
                        ? `Activar Creator · $${PLAN_PRICES.creator.monthly}/mes`
                        : `Get Creator · $${PLAN_PRICES.creator.monthly}/mo`}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
                    <Link href="/dashboard/billing">
                      {es ? 'Ver mi facturación' : 'View my billing'}
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {es ? (
                <>
                  ¿Quieres verlo antes? El catálogo de{' '}
                  <Link href="/component-kits" className="underline decoration-dotted hover:text-foreground">
                    componentes
                  </Link>{' '}
                  y los{' '}
                  <Link href="/prompts" className="underline decoration-dotted hover:text-foreground">
                    prompts
                  </Link>{' '}
                  siguen abiertos.
                </>
              ) : (
                <>
                  Want a look first? The{' '}
                  <Link href="/component-kits" className="underline decoration-dotted hover:text-foreground">
                    component catalog
                  </Link>{' '}
                  and{' '}
                  <Link href="/prompts" className="underline decoration-dotted hover:text-foreground">
                    prompts
                  </Link>{' '}
                  stay open.
                </>
              )}
            </p>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { icon: MousePointerClick, t: es ? 'Arrastra bloques' : 'Drag blocks', d: es ? 'Compón el componente moviendo capas, sin tocar código.' : 'Compose by moving layers, no code.' },
              { icon: Wand2, t: es ? 'Ajusta en vivo' : 'Tune live', d: es ? 'Color, tipografía, radios y espaciado con vista previa inmediata.' : 'Color, type, radii and spacing with instant preview.' },
              { icon: Sparkles, t: es ? 'Copia el prompt' : 'Copy the prompt', d: es ? 'El prompt describe tu composición, no una plantilla genérica.' : 'The prompt describes your composition, not a generic template.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <Icon className="h-5 w-5 text-violet-400" />
                <h2 className="mt-3 font-bold">{t}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
