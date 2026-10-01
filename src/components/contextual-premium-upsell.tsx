'use client';

import Link from 'next/link';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackAnalyticsEvent } from '@/lib/analytics';

export function ContextualPremiumUpsell({ context }: { context: string }) {
  const pricingHref = `/pricing?source=prompt_detail&context=${encodeURIComponent(context)}`;
  return (
    <aside aria-label="Premium options" className="mt-8">
      <Card className="border-primary/15 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="size-5 text-primary"/>¿Quieres llevar este flujo más lejos?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Mantén el acceso gratuito a estos prompts. Premium desbloquea colecciones completas, plantillas avanzadas y más capacidad para reutilizar tus mejores flujos.</p>
            <p className="mt-2 flex items-center gap-2 text-xs font-medium"><LockKeyhole className="size-4"/>Lo bloqueado se identifica antes de abrirlo; no interrumpimos la navegación con popups.</p>
          </div>
          <Button asChild>
            <Link href={pricingHref} onClick={() => trackAnalyticsEvent('view_premium', { item_name: context, item_category: 'prompt_detail', action_source: 'contextual_upsell' })}>Ver opciones Premium</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
