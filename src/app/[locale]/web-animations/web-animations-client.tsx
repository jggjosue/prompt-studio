'use client';

import Footer from '@/components/layout/footer';
import GlobalResponsivePreview from '@/components/global-responsive-preview';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { ParallaxReveal } from '@/components/ui/parallax-reveal';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Code2, Copy, ExternalLink, Loader2, Tag, X } from 'lucide-react';
import { useCatalogSearchUrl } from '@/hooks/use-catalog-search-url';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, type CSSProperties } from 'react';
import animationCatalog from '../../../data/prompts/web-animations.json';
import { AdUnit } from '@/components/ad-unit';
import { ViewportRender } from '@/components/viewport-render';
import { StaticComponentPreview } from '@/components/static-component-preview';

type AnimationKind =
  | 'orbit'
  | 'loader'
  | 'particles'
  | 'hover'
  | 'waves'
  | 'text'
  | 'flip-card';

type AnimationItem = {
  id: string;
  name: string;
  kind: AnimationKind;
  tags: string[];
  status: string;
  prompt: string;
  preview?: AnimationPreviewConfig;
};

type AnimationPreviewConfig = {
  kind: AnimationKind;
  primary: string;
  secondary: string;
  background: string;
  design?: string;
};

const ITEMS_PER_PAGE = 20;

function animationKindFromPrompt(name: string, spanishPrompt: string): AnimationKind {
  const source = `${name} ${spanishPrompt}`.toLowerCase();

  if (/partícula|burbuja|estrella|confeti|nieve|lluvia|matrix/.test(source)) {
    return 'particles';
  }
  if (/loader|loading|carga|spinner|progreso|skeleton/.test(source)) {
    return 'loader';
  }
  if (/onda|wave|agua|gradiente|aurora|fondo animado/.test(source)) {
    return 'waves';
  }
  if (/texto|letra|typewriter|máquina de escribir|tipograf|contador/.test(source)) {
    return 'text';
  }
  if (/hover|mouse|tarjeta|card|botón|3d|tilt|spotlight|flip|galería|grid/.test(source)) {
    return 'hover';
  }
  return 'orbit';
}

function animationTags(name: string, prompt: string): string[] {
  const source = `${name} ${prompt}`.toLowerCase();
  const candidates = [
    'scroll',
    'hover',
    'loader',
    'button',
    'text',
    'particles',
    'gradient',
    'card',
    'background',
    '3d',
  ];
  const matches = candidates.filter(tag => source.includes(tag)).slice(0, 2);
  return ['animation', ...matches].slice(0, 3);
}

function AnimationPreview({
  kind,
  preview,
  large = false,
}: {
  kind: AnimationKind;
  preview?: AnimationPreviewConfig;
  large?: boolean;
}) {
  const stageStyle = preview
    ? ({ '--wa-primary': preview.primary, '--wa-secondary': preview.secondary, '--wa-background': preview.background } as CSSProperties)
    : undefined;
  return (
    <div
      className={`wa-stage ${large ? 'wa-stage-large' : ''}`}
      style={stageStyle}
      aria-label="Vista previa interactiva de la animación"
    >
      {kind === 'orbit' ? (
        <div className="wa-orbit"><i /><i /><i /><span /></div>
      ) : null}
      {kind === 'loader' ? (
        <div className="wa-loader"><span /><span /><span /></div>
      ) : null}
      {kind === 'particles' ? (
        <div className="wa-particles">
          {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
        </div>
      ) : null}
      {kind === 'hover' ? (
        <div className="wa-hover" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      ) : null}
      {kind === 'waves' ? (
        <div className="wa-waves"><i /><i /><i /></div>
      ) : null}
      {kind === 'text' ? (
        <div className="wa-type"><span>CREATE</span><span>MOVE</span><span>REPEAT</span></div>
      ) : null}
      {kind === 'flip-card' ? (
        <div className="wa-flip-grid" aria-hidden="true">
          <div className="wa-flip-card"><div className="wa-flip-inner"><div className="wa-flip-front"></div><div className="wa-flip-back"></div></div></div>
          <div className="wa-flip-card"><div className="wa-flip-inner"><div className="wa-flip-front"></div><div className="wa-flip-back"></div></div></div>
          <div className="wa-flip-card"><div className="wa-flip-inner"><div className="wa-flip-front"></div><div className="wa-flip-back"></div></div></div>
          <div className="wa-flip-card"><div className="wa-flip-inner"><div className="wa-flip-front"></div><div className="wa-flip-back"></div></div></div>
        </div>
      ) : null}
    </div>
  );
}

export default function WebAnimationsClient() {
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<AnimationItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'animation' | 'prompt'>('animation');
  const [copied, setCopied] = useState(false);
  const isSpanish = locale.toLowerCase().startsWith('es');
  const pageTitle = isSpanish ? animationCatalog.title_es.trim() : animationCatalog.title_en;
  const pageDescription = isSpanish
    ? animationCatalog.description_es
    : animationCatalog.description_en;
  const animations = useMemo<AnimationItem[]>(
    () =>
      Array.from(
        new Map(
          animationCatalog.animations.map(animation => [animation.id, animation])
        ).values()
      ).map(animation => {
        const name = isSpanish ? animation.name.es : animation.name.en;
        const prompt = isSpanish ? animation.prompt.es : animation.prompt.en;
        return {
          id: String(animation.id),
          name,
          kind: ('preview' in animation && animation.preview?.kind
            ? animation.preview.kind
            : String(animation.id) === '130' ? 'flip-card' : animationKindFromPrompt(animation.name.es, animation.prompt.es)) as AnimationKind,
          preview: 'preview' in animation ? animation.preview as AnimationPreviewConfig : undefined,
          tags: 'tags' in animation && Array.isArray(animation.tags) ? animation.tags : animationTags(name, prompt),
          status: 'membership' in animation && typeof animation.membership === 'string' ? animation.membership : 'Free',
          prompt,
        };
      }),
    [isSpanish]
  );
  const searchParamsKey = searchParams.toString();
  const facetTags = useMemo(
    () =>
      new URLSearchParams(searchParamsKey)
        .getAll('tag')
        .map(tag => tag.trim())
        .filter(Boolean),
    [searchParamsKey]
  );
  const filteredByTag = useMemo(
    () =>
      facetTags.length === 0
        ? animations
        : animations.filter(animation =>
          facetTags.some(tag => animation.tags.includes(tag))
        ),
    [animations, facetTags]
  );
  const customCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const animation of animations) {
      for (const tag of animation.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [
      {
        label: isSpanish ? 'Tipos de animación' : 'Animation types',
        entries: Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([key, count]) => ({ key, count })),
      },
    ];
  }, [animations, isSpanish]);
  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();
  const matchingAnimations = useFuzzyFilter(
    filteredByTag,
    debouncedQuery,
    animation => [animation.name, animation.prompt, ...animation.tags],
    animation => animation.id
  );
  const {
    visibleItems,
    hasMore,
    observerTarget,
  } = useInfiniteScroll(matchingAnimations, ITEMS_PER_PAGE);

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParamsKey);
    const selectedTags = params.getAll('tag');
    const exists = selectedTags.some(
      selectedTag => selectedTag.toLowerCase() === tag.toLowerCase()
    );
    params.delete('tag');
    selectedTags
      .filter(selectedTag => selectedTag.toLowerCase() !== tag.toLowerCase())
      .forEach(selectedTag => params.append('tag', selectedTag));
    if (!exists) params.append('tag', tag);
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParamsKey);
    params.delete('tag');
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const copyCode = async () => {
    if (!selected) return;
    const result = await copyWithDailyLimit(() =>
      copyToClipboard(selected.prompt)
    );
    if (result !== 'copied') return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openAnimation = (animation: AnimationItem) => {
    setDialogMode('animation');
    setSelected(animation);
  };

  const openPrompt = (animation: AnimationItem) => {
    setDialogMode('prompt');
    setSelected(animation);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="h-16 w-full border-b" />}>
        <Header />
      </Suspense>

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <div className="mb-10 flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              {pageTitle}
            </h1>
            <p className="mx-auto max-w-[720px] text-muted-foreground md:text-xl">
              {pageDescription}
            </p>
            <p className="text-sm font-medium text-blue-400">
              {animations.length} {isSpanish ? 'animaciones' : 'animations'}
            </p>
            <SearchInput
              className="mt-2 max-w-md"
              placeholder={isSpanish ? 'Buscar animaciones...' : 'Search animations...'}
              value={searchInput}
              onValueChange={setSearchInput}
              isPending={isSearchPending}
            />
            {(debouncedQuery || facetTags.length > 0) ? (
              <p className="text-sm text-muted-foreground">
                {matchingAnimations.length}{' '}
                {isSpanish ? 'animaciones encontradas' : 'animations found'}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr] md:gap-x-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden md:block md:sticky md:top-24">
              <CatalogFacetBar
                customCategories={customCategories}
                activeTags={facetTags}
                onSelectTag={toggleTag}
                onClearFacets={clearFilters}
                orientation="vertical"
                selectionVariant="checkbox"
              />
            </aside>
            <div className="min-w-0">
              <div className="mb-6 md:hidden">
                <CatalogFacetBar
                  customCategories={customCategories}
                  activeTags={facetTags}
                  onSelectTag={toggleTag}
                  onClearFacets={clearFilters}
                  orientation="horizontal"
                  selectionVariant="checkbox"
                />
              </div>
              {matchingAnimations.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                  <p>{isSpanish ? 'No hay animaciones coincidentes.' : 'No matching animations.'}</p>
                  <Button variant="outline" onClick={() => { clearSearch(); clearFilters(); }}>
                    {isSpanish ? 'Quitar filtros' : 'Clear filters'}
                  </Button>
                </div>
              ) : null}
              <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
                {visibleItems.map((animation, index) => (
                  <ViewportRender key={animation.id} minHeight={490}>
                  <ParallaxReveal reverse={index % 2 === 1}>
                    <Card
                      className="group flex h-full cursor-pointer flex-col overflow-hidden border-border/70 bg-card transition-colors hover:border-blue-500/45"
                      onClick={() => openAnimation(animation)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-headline">
                              {animation.name}
                            </CardTitle>
                            <p className="mt-1 mb-2 text-xs text-muted-foreground">
                              HTML · CSS · JavaScript
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="shrink-0 border-blue-500/45 bg-blue-500/10 px-3 py-1 text-blue-400"
                          >
                            {animation.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-4 w-4 shrink-0" />
                          <span className="truncate">{animation.tags.join(', ')}</span>
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={event => {
                            event.stopPropagation();
                            openAnimation(animation);
                          }}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              openAnimation(animation);
                            }
                          }}
                          className="block w-full overflow-hidden rounded-lg border text-left outline-none transition group-hover:border-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500"
                          aria-label={`Abrir animación ${animation.name}`}
                        >
                          <StaticComponentPreview title={animation.name} type="animation" preview={animation.preview ?? {}}>
                            <AnimationPreview kind={animation.kind} preview={animation.preview} />
                          </StaticComponentPreview>
                        </div>
                        <AdUnit />
                      </CardContent>

                      <CardFooter className="justify-between border-t bg-muted/50 p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={event => {
                            event.stopPropagation();
                            openPrompt(animation);
                          }}
                        >
                          <Code2 className="mr-2 h-4 w-4" />
                          {isSpanish ? 'Ver Instrucción' : 'View Instruction'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={event => {
                            event.stopPropagation();
                            openAnimation(animation);
                          }}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir
                        </Button>
                      </CardFooter>
                    </Card>
                  </ParallaxReveal></ViewportRender>
                ))}
              </div>
              {hasMore ? (
                <div ref={observerTarget} className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto p-0">
          {selected ? (
            dialogMode === 'animation' ? (
              <GlobalResponsivePreview><AnimationPreview kind={selected.kind} preview={selected.preview} large /></GlobalResponsivePreview>
            ) : (
              <>
                <DialogHeader className="border-b px-6 py-5 pr-14">
                  <DialogTitle className="font-headline text-2xl">
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription>
                    HTML · CSS · JavaScript · {selected.tags.join(' · ')}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 sm:p-6">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                      {isSpanish ? 'Descripción de la instrucción' : 'Instruction description'}
                    </p>
                    <p className="text-sm leading-7 text-foreground/90 sm:text-base">
                      {selected.prompt}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelected(null)}>
                      <X className="mr-2 h-4 w-4" />
                      {isSpanish ? 'Cerrar' : 'Close'}
                    </Button>
                    <Button onClick={copyCode} className="bg-blue-600 text-white hover:bg-blue-700">
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied
                        ? isSpanish ? 'Instrucción copiada' : 'Instruction copied'
                        : isSpanish ? 'Copiar instrucción' : 'Copy instruction'}
                    </Button>
                  </div>
                </div>
              </>
            )
          ) : null}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .wa-stage { --wa-primary:#38bdf8;--wa-secondary:#6366f1;--wa-background:#02030a;position:relative; display:grid; place-items:center; width:100%; aspect-ratio:16/9; min-height:220px; overflow:hidden; background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--wa-primary) 24%,var(--wa-background)) 0,var(--wa-background) 48%,#02030a 100%); isolation:isolate; }
        .wa-stage-large { min-height:min(58vh,560px); }
        .wa-orbit { position:relative; width:110px; height:110px; }
        .wa-orbit i { position:absolute; inset:0; border:2px solid transparent; border-top-color:#38bdf8; border-radius:50%; animation:wa-spin 2.4s linear infinite; }
        .wa-orbit i:nth-child(2){inset:14px;border-top-color:#6366f1;animation-duration:1.7s;animation-direction:reverse}.wa-orbit i:nth-child(3){inset:29px;border-top-color:#22d3ee;animation-duration:1.1s}.wa-orbit span{position:absolute;inset:46px;border-radius:50%;background:#fff;box-shadow:0 0 25px #38bdf8}
        .wa-loader { display:flex; gap:12px; align-items:center; }
        .wa-loader span { width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#22d3ee);animation:wa-bounce 1s ease-in-out infinite;box-shadow:0 0 25px #2563eb88}.wa-loader span:nth-child(2){animation-delay:.14s}.wa-loader span:nth-child(3){animation-delay:.28s}
        .wa-particles { position:absolute; inset:0; }
        .wa-particles i { position:absolute; width:5px;height:5px;border-radius:50%;background:#60a5fa;box-shadow:0 0 12px #60a5fa;animation:wa-float 5s ease-in-out infinite; }
        .wa-particles i:nth-child(1){left:8%;top:70%}.wa-particles i:nth-child(2){left:15%;top:22%;animation-delay:-2s}.wa-particles i:nth-child(3){left:24%;top:52%;animation-delay:-4s}.wa-particles i:nth-child(4){left:33%;top:16%;animation-delay:-1s}.wa-particles i:nth-child(5){left:42%;top:78%;animation-delay:-3s}.wa-particles i:nth-child(6){left:51%;top:39%;animation-delay:-2.5s}.wa-particles i:nth-child(7){left:61%;top:66%;animation-delay:-.5s}.wa-particles i:nth-child(8){left:70%;top:18%;animation-delay:-3.5s}.wa-particles i:nth-child(9){left:80%;top:49%;animation-delay:-1.5s}.wa-particles i:nth-child(10){left:90%;top:75%;animation-delay:-4.5s}.wa-particles i:nth-child(11){left:5%;top:35%;animation-delay:-1.2s}.wa-particles i:nth-child(12){left:28%;top:88%;animation-delay:-2.8s}.wa-particles i:nth-child(13){left:56%;top:12%;animation-delay:-4.2s}.wa-particles i:nth-child(14){left:76%;top:84%;animation-delay:-.8s}.wa-particles i:nth-child(15){left:94%;top:25%;animation-delay:-3.2s}.wa-particles i:nth-child(16){left:46%;top:55%;animation-delay:-1.8s}
        .wa-hover { display:grid;grid-template-columns:repeat(2,72px);gap:12px;perspective:600px;transform:rotateX(8deg) rotateY(-8deg);transition:transform .45s ease}.wa-hover span{display:block;aspect-ratio:1;border:1px solid #60a5fa;border-radius:14px;background:linear-gradient(145deg,#0b1d42,#071021);box-shadow:0 10px 30px #0008,inset 0 0 24px #2563eb22;transition:transform .35s ease,background .35s ease,box-shadow .35s ease}.wa-stage:hover .wa-hover{transform:rotateX(-4deg) rotateY(8deg) scale(1.04)}.wa-stage:hover .wa-hover span{background:linear-gradient(145deg,#2563eb,#0ea5e9);box-shadow:0 18px 40px #2563eb55}.wa-stage:hover .wa-hover span:nth-child(1){transform:translate(-5px,-5px)}.wa-stage:hover .wa-hover span:nth-child(2){transform:translate(5px,-5px)}.wa-stage:hover .wa-hover span:nth-child(3){transform:translate(-5px,5px)}.wa-stage:hover .wa-hover span:nth-child(4){transform:translate(5px,5px)}
        .wa-waves { position:absolute;inset:0;filter:blur(4px) saturate(1.35)}.wa-waves i{position:absolute;width:85%;height:75%;left:8%;top:25%;border-radius:42% 58% 65% 35%;background:linear-gradient(110deg,#2563eb88,#06b6d477,#8b5cf688);animation:wa-wave 7s ease-in-out infinite}.wa-waves i:nth-child(2){left:22%;top:5%;animation-delay:-2.5s;animation-direction:reverse;opacity:.65}.wa-waves i:nth-child(3){left:-12%;top:46%;animation-delay:-5s;opacity:.45}
        .wa-type { display:grid;gap:2px;text-align:center;font-size:clamp(28px,7vw,64px);font-weight:900;line-height:.84;letter-spacing:-.06em}.wa-type span{background:linear-gradient(90deg,#fff,#60a5fa,#fff);background-size:200% auto;color:transparent;background-clip:text;animation:wa-shine 3s linear infinite}.wa-type span:nth-child(2){animation-delay:-1s}.wa-type span:nth-child(3){animation-delay:-2s}
        .wa-flip-grid { display:grid; grid-template-columns:repeat(2, 72px); gap:12px; perspective:600px; transform:rotateX(8deg) rotateY(-8deg); transition:transform .45s ease;}
        .wa-flip-card { width:100%; aspect-ratio:1; cursor:pointer; perspective:1000px; }
        .wa-flip-inner { position:relative; width:100%; height:100%; transition:transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style:preserve-3d; }
        .wa-stage:hover .wa-flip-card:nth-child(1) .wa-flip-inner { transform:rotateY(180deg); }
        .wa-stage:hover .wa-flip-card:nth-child(4) .wa-flip-inner { transform:rotateY(180deg); transition-delay:0.1s; }
        .wa-flip-front, .wa-flip-back { position:absolute; inset:0; backface-visibility:hidden; border-radius:14px; border:1px solid rgba(96,165,250,0.4); }
        .wa-flip-front { background:linear-gradient(145deg,#0b1d42,#071021); box-shadow:inset 0 0 24px #2563eb22; }
        .wa-flip-back { background:linear-gradient(145deg,#2563eb,#0ea5e9); transform:rotateY(180deg); border-color:#60a5fa; box-shadow:0 10px 30px #2563eb55; }
        .wa-stage:hover .wa-flip-grid { transform:rotateX(-4deg) rotateY(8deg) scale(1.04); }
        .wa-stage .wa-orbit i{border-top-color:var(--wa-primary)}.wa-stage .wa-orbit i:nth-child(2){border-top-color:var(--wa-secondary)}.wa-stage .wa-orbit i:nth-child(3){border-top-color:color-mix(in srgb,var(--wa-primary),white 38%)}.wa-stage .wa-orbit span{box-shadow:0 0 25px var(--wa-primary)}
        .wa-stage .wa-loader span{background:linear-gradient(135deg,var(--wa-primary),var(--wa-secondary));box-shadow:0 0 25px var(--wa-primary)}
        .wa-stage .wa-particles i{background:var(--wa-primary);box-shadow:0 0 12px var(--wa-secondary)}
        .wa-stage .wa-hover span{border-color:var(--wa-primary);background:linear-gradient(145deg,var(--wa-background),color-mix(in srgb,var(--wa-primary) 22%,var(--wa-background)))}.wa-stage:hover .wa-hover span{background:linear-gradient(145deg,var(--wa-primary),var(--wa-secondary));box-shadow:0 18px 40px color-mix(in srgb,var(--wa-primary) 48%,transparent)}
        .wa-stage .wa-waves i{background:linear-gradient(110deg,var(--wa-primary),var(--wa-secondary),color-mix(in srgb,var(--wa-primary),white 35%))}
        .wa-stage .wa-type span{background-image:linear-gradient(90deg,#fff,var(--wa-primary),var(--wa-secondary),#fff)}
        .wa-stage .wa-flip-front{background:linear-gradient(145deg,var(--wa-background),color-mix(in srgb,var(--wa-primary) 24%,var(--wa-background)))}.wa-stage .wa-flip-back{background:linear-gradient(145deg,var(--wa-primary),var(--wa-secondary));border-color:var(--wa-primary);box-shadow:0 10px 30px color-mix(in srgb,var(--wa-primary) 45%,transparent)}
        @keyframes wa-spin{to{transform:rotate(360deg)}}@keyframes wa-bounce{0%,100%{transform:translateY(0) scale(.8);opacity:.55}50%{transform:translateY(-25px) scale(1.15);opacity:1}}@keyframes wa-float{0%,100%{transform:translate(0,0) scale(.7);opacity:.35}50%{transform:translate(30px,-42px) scale(1.45);opacity:1}}@keyframes wa-wave{0%,100%{transform:rotate(-8deg) scale(1)}50%{transform:rotate(10deg) scale(1.18, .82)}}@keyframes wa-shine{to{background-position:-200% center}}
        @media (prefers-reduced-motion:reduce){.wa-stage *{animation-duration:.001ms!important;animation-iteration-count:1!important}}
      `}</style>
    </div>
  );
}
