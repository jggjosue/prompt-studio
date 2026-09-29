'use client';

import { useEffect } from 'react';
import { Check, Code2, LockKeyhole, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ComponentBehaviorRecommendations } from '@/components/component-behavior-recommendations';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { useComponentProductDetail } from '@/hooks/use-component-product-detail';

type Props = { id: string; kind: string; name: string; prompt: string; stack: string[]; membership: string };

export default function ComponentCommercialPanel({ id, kind, name, prompt: promptPreview, stack, membership }: Props) {
  const { detail } = useComponentProductDetail(id);
  const prompt = detail?.prompt ?? promptPreview;
  useEffect(() => { trackAnalyticsEvent('component_preview_view', { item_id: id, item_name: name, item_category: kind, membership }); }, [id, kind, membership, name]);

  return (
    <section className="mt-4 grid gap-4 border-t pt-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs font-black">Qué incluye</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            {['Prompt completo', 'Archivos organizados', 'Especificaciones', 'Licencia comercial', 'Responsive', 'Actualizaciones'].map(value => (
              <span key={value} className="flex items-center gap-1">
                <Check className="size-3 text-emerald-500" />{value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-black">Compatibilidad</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {stack.map(value => <Badge key={value} variant="outline" className="text-[9px]">{value}</Badge>)}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black">Prompt parcial gratuito</p>
            <Badge variant="secondary">Preview</Badge>
          </div>
          <p className="mt-2 line-clamp-4 text-[10px] leading-5 text-muted-foreground">
            {prompt.slice(0, 320)}{prompt.length > 320 ? '…' : ''}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl border bg-zinc-950 p-4 text-zinc-300">
          <div className="flex items-center gap-2 text-xs font-black">
            <Code2 className="size-4" />Vista del código
          </div>
          <pre className="mt-3 select-none text-[9px] opacity-35">
            {`export function ${name.replace(/[^a-z0-9]/gi, '')}() {\n  return <section>••••••••</section>\n}`}
          </pre>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent px-3 pb-4 pt-10 text-[10px] font-bold">
            <LockKeyhole className="size-3.5" />Código disponible después de comprar
          </div>
        </div>
        <ComponentBehaviorRecommendations id={id} kind={kind} prompt={prompt} />
      </div>
    </section>
  );
}
