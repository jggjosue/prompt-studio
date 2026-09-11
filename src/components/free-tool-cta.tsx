import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * Llamada a la acción al pie de las herramientas gratuitas.
 *
 * Las cuatro herramientas —auditor de código, búsqueda inteligente, optimizador
 * de prompts y preguntas frecuentes— son el activo de captación más barato del
 * sitio: atraen búsquedas con intención propia sin depender de posicionar el
 * catálogo. Pero dos de ellas no tenían **ningún** enlace al catálogo, así que
 * el visitante llegaba, usaba la herramienta y se iba.
 *
 * Este componente no interrumpe el uso de la herramienta: va al final, después
 * de que la persona haya obtenido lo que vino a buscar. Poner un muro delante
 * destruiría justo lo que hace que estas páginas atraigan enlaces.
 */
export async function FreeToolCta({ variant = 'catalog' }: { variant?: 'catalog' | 'landings' }) {
  const t = await getTranslations('freeTools');
  const destination = variant === 'landings' ? '/landing-pages' : '/prompts';

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm md:p-8">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">{t('ctaTitle')}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          {t('ctaDescription')}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={destination}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('ctaPrimary')}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/prices"
            className="inline-flex items-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
