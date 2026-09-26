'use client';
import { StaticComponentPreview } from '@/components/static-component-preview';

import ComponentQualityBadges from '@/components/component-quality-badges';
import ComponentCommercialPanel from '@/components/component-commercial-panel';
import { trackAnalyticsEvent } from '@/lib/analytics';

import GlobalResponsivePreview from '@/components/global-responsive-preview';
import catalog from '../../../../public/catalog/components/web-button-components.json';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Check, Download, Eye, Loader2, MousePointerClick, Plus, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useMemo, useState, type CSSProperties } from 'react';

type RawItem = (typeof catalog.components)[number];
type ButtonItem = RawItem & { title: string; summary: string; localizedPrompt: string };

function DemoButton({ item, large = false }: { item: ButtonItem; large?: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const { primary, secondary, background, dark, shape, style, icon } = item.preview;
  const ink = dark ? '#f8fafc' : '#111827', muted = dark ? '#a1a1aa' : '#64748b';
  const radius = shape === 'pill' ? '999px' : shape === 'square' ? '0px' : shape === 'soft' ? '18px' : shape === 'cut' ? '4px 18px 4px 18px' : '12px';
  const outlined = ['outline', 'minimal', 'underline', 'editorial'].includes(style);
  const css: CSSProperties = {
    borderRadius: radius,
    color: outlined ? primary : '#fff',
    background: outlined ? 'transparent' : `linear-gradient(100deg,${primary},${secondary})`,
    border: `2px solid ${primary}`,
    boxShadow: ['glow', 'neon', 'cyber', 'holographic'].includes(style) ? `0 0 28px ${primary}88` : `0 12px 30px ${primary}35`,
  };
  const Icon = icon === 'download' ? Download : icon === 'plus' ? Plus : icon === 'check' ? Check : icon === 'spark' ? Sparkles : ArrowRight;
  const click = () => {
    if (state !== 'idle') return;
    setState('loading');
    window.setTimeout(() => { setState('success'); window.setTimeout(() => setState('idle'), 1300); }, 850);
  };
  return (
    <div className={`button-preview relative isolate grid place-items-center overflow-hidden ${large ? 'min-h-[520px]' : 'min-h-[300px]'}`} style={{ background, color: ink }}>
      <div className="absolute -right-20 -top-24 size-72 rounded-full blur-3xl" style={{ background: secondary, opacity: .25 }} />
      <div className="absolute -bottom-24 -left-20 size-64 rounded-full blur-3xl" style={{ background: primary, opacity: .2 }} />
      <div className="relative z-10 text-center">
        <p className="mb-6 text-[10px] font-black uppercase tracking-[.28em]" style={{ color: muted }}>Default · Hover · Loading · Success</p>
        <button
          type="button"
          aria-busy={state === 'loading'}
          disabled={state === 'loading'}
          onClick={click}
          className={`${large ? 'min-h-16 px-10 text-lg' : 'min-h-12 px-7 text-sm'} button-demo inline-flex min-w-40 items-center justify-center gap-2 font-black transition duration-300 active:scale-95 disabled:cursor-wait`}
          style={css}
        >
          {state === 'loading' ? <><Loader2 className="size-4 animate-spin" />Processing</> : state === 'success' ? <><Check className="size-4" />Completed</> : <>{icon !== 'arrow' ? <Icon className="size-4" /> : null}{item.label}{icon === 'arrow' ? <Icon className="size-4 transition-transform group-hover:translate-x-1" /> : null}</>}
        </button>
        <p className="mt-5 text-xs" style={{ color: muted }}>Click to test the async state</p>
      </div>
    </div>
  );
}

export default function ButtonComponentsClient() {
  const locale = useLocale(), spanish = locale.toLowerCase().startsWith('es');
  const [query, setQuery] = useState(''), [tag, setTag] = useState('Todos'), [selected, setSelected] = useState<ButtonItem | null>(null);

  const items = useMemo<ButtonItem[]>(
    () => catalog.components.map(item => ({
      ...item,
      title: spanish ? item.name.es : item.name.en,
      summary: spanish ? item.description.es : item.description.en,
      localizedPrompt: spanish ? item.prompt.es : item.prompt.en,
    })),
    [spanish],
  );
  const tags = useMemo(() => ['Todos', ...Array.from(new Set(items.flatMap(item => item.tags))).slice(0, 14)], [items]);
  const filtered = useMemo(
    () => items.filter(item => (tag === 'Todos' || item.tags.includes(tag)) && `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, tag],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <header className="mx-auto mb-10 max-w-3xl text-center">
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 hover:bg-orange-500/10">
              <MousePointerClick className="mr-1 size-3.5" />Interactive · Accessible · Async
            </Badge>
            <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">{spanish ? catalog.title_es : catalog.title_en}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{spanish ? catalog.description_es : catalog.description_en}</p>
            <p className="mt-3 text-sm font-bold text-orange-600">50 {spanish ? 'botones disponibles' : 'buttons available'}</p>
            <SearchInput className="mx-auto mt-6 max-w-md" placeholder={spanish ? 'Buscar botón por estilo…' : 'Search buttons by style…'} value={query} onValueChange={setQuery} />
          </header>

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {tags.map(value => (
              <button key={value} onClick={() => setTag(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tag === value ? 'border-orange-600 bg-orange-600 text-white' : 'hover:border-orange-500/50'}`}>
                {value}
              </button>
            ))}
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            {filtered.map(item => (
              <Card key={item.id} className="overflow-hidden border-border/70 transition hover:border-orange-500/50 hover:shadow-xl">
                <div className="p-3">
                  <StaticComponentPreview title={item.title} type="button" preview={item.preview} />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 4).map(value => <Badge key={value} variant="outline" className="text-[10px]">{value}</Badge>)}
                </CardContent>
                <ComponentQualityBadges prompt={item.localizedPrompt} stack={item.stack} className="px-6 pb-3" />
                <CardFooter className="gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      trackAnalyticsEvent('component_preview_view', { item_id: item.id, item_name: item.title, item_category: 'button', membership: 'Free' });
                      setSelected(item);
                    }}
                  >
                    <Eye className="mr-2 size-4" />{spanish ? 'Ver diseño' : 'View design'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {!filtered.length ? <p className="py-24 text-center text-muted-foreground">{spanish ? 'No encontramos botones.' : 'No buttons found.'}</p> : null}
        </div>
      </main>
      <Footer />

      <Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.summary}</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="preview">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">{spanish ? 'Vista previa' : 'Preview'}</TabsTrigger>
                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <GlobalResponsivePreview>
                    <DemoButton item={selected} large />
                  </GlobalResponsivePreview>
                </TabsContent>
                <TabsContent value="prompt" className="mt-4">
                  <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-5 text-xs leading-6 text-zinc-200">
                    <code>{selected.localizedPrompt}</code>
                  </pre>
                </TabsContent>
              </Tabs>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <ComponentQualityBadges prompt={selected.localizedPrompt} stack={selected.stack} />
                <div className="flex flex-wrap gap-1.5">
                  {selected.stack.map(value => <Badge key={value} variant="outline">{value}</Badge>)}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <style>{`.button-demo{position:relative;overflow:hidden}.button-demo:before{content:"";position:absolute;inset:0;transform:translateX(-130%) skewX(-20deg);background:linear-gradient(90deg,transparent,#fff5,transparent);transition:transform .65s}.button-demo:hover{transform:translateY(-3px) scale(1.025);filter:brightness(1.08)}.button-demo:hover:before{transform:translateX(130%) skewX(-20deg)}@media(prefers-reduced-motion:reduce){.button-demo,.button-demo:before{transition-duration:.001ms!important}}`}</style>
    </div>
  );
}
