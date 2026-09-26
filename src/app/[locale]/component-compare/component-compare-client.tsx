'use client';

import buttonCatalog from '../../../../public/catalog/components/web-button-components.json';
import cardCatalog from '../../../../public/catalog/components/web-card-components.json';
import formCatalog from '../../../../public/catalog/components/web-form-components.json';
import headerCatalog from '../../../../public/catalog/components/web-header-components.json';
import loginCatalog from '../../../../public/catalog/components/web-login-components.json';
import navigationCatalog from '../../../../public/catalog/components/web-navigation-components.json';
import sidebarCatalog from '../../../../public/catalog/components/web-sidebar-components.json';
import textCatalog from '../../../../public/catalog/components/web-text-components.json';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Accessibility,
  ArrowUpDown,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Eye,
  Flame,
  Gauge,
  Info,
  Layers3,
  MonitorSmartphone,
  Palette,
  RotateCcw,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

type Kind = 'login' | 'header' | 'text' | 'form' | 'button' | 'card' | 'navigation' | 'sidebar';

type Entry = {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  prompt: { en: string; es: string };
  preview: {
    primary?: string;
    secondary?: string;
    background?: string;
    layout?: string;
    dark?: boolean;
    rounded?: string;
  };
  stack: string[];
  tags: string[];
  membership: string;
  price?: string;
};

type Item = Entry & { kind: Kind };

type Metrics = {
  overall: number;
  responsive: number;
  accessibility: number;
  complexity: number;
  customization: number;
  states: string[];
  evidence: {
    responsive: string[];
    accessibility: string[];
    customization: string[];
  };
};

const KIND_META: Record<Kind, { labelEs: string; labelEn: string; color: string; bg: string }> = {
  form: { labelEs: 'Formularios', labelEn: 'Forms', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  button: { labelEs: 'Botones', labelEn: 'Buttons', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  card: { labelEs: 'Tarjetas', labelEn: 'Cards', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  header: { labelEs: 'Cabeceras', labelEn: 'Headers', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  login: { labelEs: 'Autenticación', labelEn: 'Login', color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  navigation: { labelEs: 'Navegación', labelEn: 'Navigation', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  sidebar: { labelEs: 'Sidebars', labelEn: 'Sidebars', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  text: { labelEs: 'Textos & Tipos', labelEn: 'Typography', color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
};

const sources: Array<[Kind, Entry[]]> = [
  ['login', loginCatalog.components as Entry[]],
  ['header', headerCatalog.components as Entry[]],
  ['text', textCatalog.components as Entry[]],
  ['form', formCatalog.components as Entry[]],
  ['button', buttonCatalog.components as Entry[]],
  ['card', cardCatalog.components as Entry[]],
  ['navigation', navigationCatalog.components as Entry[]],
  ['sidebar', sidebarCatalog.components as Entry[]],
];

const PRESETS = [
  {
    id: 'forms-duel',
    labelEs: 'Formularios: Cita vs Diagnóstico',
    labelEn: 'Forms: Appointment vs Intake',
    ids: ['form-008', 'form-015'],
  },
  {
    id: 'auth-showcase',
    labelEs: 'Auth: Aurora Glass vs Terminal Hacker',
    labelEn: 'Auth: Aurora Glass vs Hacker Terminal',
    ids: ['login-001', 'login-009'],
  },
  {
    id: 'cards-trio',
    labelEs: 'Tarjetas: SaaS vs Finanzas vs Brutal',
    labelEn: 'Cards: SaaS vs Finance vs Brutal',
    ids: ['card-001', 'card-005', 'card-007'],
  },
  {
    id: 'header-duel',
    labelEs: 'Cabeceras: Minimalista vs Enterprise',
    labelEn: 'Headers: Minimal vs Enterprise',
    ids: ['header-001', 'header-003'],
  },
];

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const matches = (text: string, terms: string[]) =>
  terms.filter(term => text.includes(term));

const levelInfo = (score: number) => {
  if (score >= 85) return { labelEs: 'Excelente', labelEn: 'Excellent', color: 'text-emerald-500', bar: 'from-emerald-500 to-teal-400' };
  if (score >= 70) return { labelEs: 'Alta', labelEn: 'High', color: 'text-cyan-500', bar: 'from-cyan-500 to-blue-500' };
  if (score >= 50) return { labelEs: 'Media', labelEn: 'Medium', color: 'text-amber-500', bar: 'from-amber-500 to-orange-400' };
  return { labelEs: 'Básica', labelEn: 'Basic', color: 'text-rose-500', bar: 'from-rose-500 to-pink-500' };
};

function analyze(item: Item): Metrics {
  const text = normalize(
    `${item.description.es} ${item.description.en} ${item.prompt.es} ${item.prompt.en} ${item.tags.join(' ')} ${item.stack.join(' ')}`
  );
  const responsiveHits = matches(text, [
    'responsive', 'mobile', 'movil', 'breakpoint', 'drawer', 'desktop', 'tablet', 'adaptive', 'flex', 'grid'
  ]);
  const accessHits = matches(text, [
    'aria', 'keyboard', 'teclado', 'wcag', 'semantic', 'semantico', 'focus', 'screen reader', 'accessible', 'accesibilidad', 'contrast'
  ]);
  const customHits = matches(text, [
    'theme', 'tema', 'token', 'variant', 'variante', 'custom', 'personaliz', 'palette', 'paleta', 'prop', 'dark', 'light', 'glass'
  ]);

  const stateTerms: [string, string][] = [
    ['Loading', 'loading'],
    ['Error', 'error'],
    ['Success', 'success'],
    ['Empty', 'empty'],
    ['Hover', 'hover'],
    ['Focus', 'focus'],
    ['Disabled', 'disabled'],
    ['Active', 'active'],
    ['Expanded', 'expanded'],
    ['Validation', 'validation'],
  ];

  const states = stateTerms
    .filter(([, term]) => text.includes(term))
    .map(([label]) => label);

  const dependencyWeight = Math.max(0, item.stack.length - 3) * 5;
  const promptWeight = Math.min(25, Math.round((item.prompt.en.length + item.prompt.es.length) / 500));

  const responsiveScore = Math.min(100, 42 + responsiveHits.length * 9);
  const accessibilityScore = Math.min(100, 35 + accessHits.length * 9);
  const complexityScore = Math.min(100, 22 + dependencyWeight + promptWeight + states.length * 3);
  const customizationScore = Math.min(100, 35 + customHits.length * 8);

  const overall = Math.round(
    (responsiveScore * 0.3) +
    (accessibilityScore * 0.3) +
    (customizationScore * 0.25) +
    (Math.max(10, 100 - complexityScore * 0.3) * 0.15)
  );

  return {
    overall,
    responsive: responsiveScore,
    accessibility: accessibilityScore,
    complexity: complexityScore,
    customization: customizationScore,
    states,
    evidence: {
      responsive: responsiveHits,
      accessibility: accessHits,
      customization: customHits,
    },
  };
}

function MetricScoreMeter({ value, spanish }: { value: number; spanish: boolean }) {
  const lvl = levelInfo(value);
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className={`font-semibold ${lvl.color}`}>
          {spanish ? lvl.labelEs : lvl.labelEn}
        </span>
        <span className="font-mono font-medium text-foreground">{value} / 100</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-border/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${lvl.bar} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(5, value)}%` }}
        />
      </div>
    </div>
  );
}

export default function ComponentCompareClient() {
  const locale = useLocale();
  const spanish = locale.toLowerCase().startsWith('es');

  const items = useMemo<Item[]>(
    () => sources.flatMap(([kind, list]) => list.map(item => ({ ...item, kind }))),
    []
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(['form-008', 'form-015']);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<Kind | 'all'>('all');
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<Item | null>(null);

  // Sync URL query params with state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const paramIds = urlParams.get('ids')?.split(',').filter(id => items.some(item => item.id === id)).slice(0, 3);
    if (paramIds && paramIds.length > 0) {
      setSelectedIds(paramIds);
    }
  }, [items]);

  const updateIds = useCallback((newIds: string[]) => {
    setSelectedIds(newIds);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newIds.length > 0) {
        url.searchParams.set('ids', newIds.join(','));
      } else {
        url.searchParams.delete('ids');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const add = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      updateIds([...selectedIds, id]);
    }
  };

  const remove = (id: string) => {
    updateIds(selectedIds.filter(val => val !== id));
  };

  const clearAll = () => {
    updateIds([]);
  };

  const selected = useMemo(
    () => selectedIds.map(id => items.find(item => item.id === id)!).filter(Boolean),
    [selectedIds, items]
  );

  const available = useMemo(() => {
    return items
      .filter(item => {
        if (selectedIds.includes(item.id)) return false;
        if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
        if (!query.trim()) return true;
        const searchPool = normalize(`${item.id} ${item.name.es} ${item.name.en} ${item.tags.join(' ')} ${item.stack.join(' ')}`);
        return searchPool.includes(normalize(query));
      })
      .slice(0, 16);
  }, [items, selectedIds, kindFilter, query]);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedId('url');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPrompt = async (item: Item) => {
    try {
      const promptText = spanish ? item.prompt.es : item.prompt.en;
      await navigator.clipboard.writeText(promptText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const comparisonRows = useMemo(() => {
    const list = [
      {
        id: 'category',
        label: spanish ? 'Categoría & Tipo' : 'Category & Type',
        icon: Layers3,
        description: spanish ? 'Familia de componente y estilo visual' : 'Component family & visual style',
      },
      {
        id: 'readiness',
        label: spanish ? 'Índice de Madurez' : 'Readiness Index',
        icon: Zap,
        description: spanish ? 'Puntaje ponderado de completitud y arquitectura' : 'Weighted score of completeness and architecture',
      },
      {
        id: 'responsive',
        label: spanish ? 'Diseño Adaptativo / Responsive' : 'Adaptive / Responsive Design',
        icon: MonitorSmartphone,
        description: spanish ? 'Soporte móvil, breakpoints y layouts fluidos' : 'Mobile support, breakpoints, fluid layouts',
      },
      {
        id: 'accessibility',
        label: spanish ? 'Accesibilidad (WCAG AA)' : 'Accessibility (WCAG AA)',
        icon: Accessibility,
        description: spanish ? 'Semántica, ARIA, foco de teclado y contraste' : 'Semantics, ARIA, keyboard focus & contrast',
      },
      {
        id: 'complexity',
        label: spanish ? 'Complejidad Técnica' : 'Technical Complexity',
        icon: Gauge,
        description: spanish ? 'Lógica requerida, estados y volumen del prompt' : 'Required logic, states, and prompt volume',
      },
      {
        id: 'customization',
        label: spanish ? 'Personalización y Temas' : 'Customization & Theming',
        icon: Palette,
        description: spanish ? 'Soporte de tokens, paletas y modos oscuro/claro' : 'Tokens, color palettes & dark/light modes',
      },
      {
        id: 'dependencies',
        label: spanish ? 'Stack y Dependencias' : 'Stack & Dependencies',
        icon: Code2,
        description: spanish ? 'Librerías externas y paquetes requeridos' : 'External libraries and packages required',
      },
      {
        id: 'states',
        label: spanish ? 'Estados de UI Contemplados' : 'UI States Covered',
        icon: ShieldCheck,
        description: spanish ? 'Loading, error, focus, hover, validación...' : 'Loading, error, focus, hover, validation...',
      },
      {
        id: 'membership',
        label: spanish ? 'Licencia y Acceso' : 'License & Access',
        icon: Sparkles,
        description: spanish ? 'Disponibilidad gratuita o requerimiento de plan Pro' : 'Free access or Pro membership required',
      },
    ];

    if (!onlyDifferences || selected.length <= 1) return list;

    return list.filter(row => {
      if (row.id === 'category') {
        const kinds = new Set(selected.map(s => s.kind));
        return kinds.size > 1;
      }
      if (row.id === 'membership') {
        const mems = new Set(selected.map(s => s.membership));
        return mems.size > 1;
      }
      if (row.id === 'dependencies') {
        const stringified = selected.map(s => [...s.stack].sort().join(','));
        return new Set(stringified).size > 1;
      }
      if (row.id === 'states') {
        const stateCounts = selected.map(s => analyze(s).states.sort().join(','));
        return new Set(stateCounts).size > 1;
      }
      if (['readiness', 'responsive', 'accessibility', 'complexity', 'customization'].includes(row.id)) {
        const scores = selected.map(s => {
          const a = analyze(s);
          if (row.id === 'readiness') return a.overall;
          return a[row.id as 'responsive' | 'accessibility' | 'complexity' | 'customization'];
        });
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        return max - min >= 5;
      }
      return true;
    });
  }, [selected, onlyDifferences, spanish]);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-500/20">
      <Header />

      <main className="flex-1 pb-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-violet-950/20 via-background to-background py-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300 shadow-sm backdrop-blur-md">
                  <Flame className="size-3.5 text-violet-500 animate-pulse" />
                  <span>{spanish ? 'Laboratorio de Auditoría y Benchmark' : 'Audit & Benchmark Lab'}</span>
                </div>

                <h1 className="mt-4 font-headline text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-foreground">
                  {spanish ? (
                    <>Compara antes de <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">construir</span></>
                  ) : (
                    <>Compare before you <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">build</span></>
                  )}
                </h1>

                <p className="mt-4 text-base text-muted-foreground sm:text-lg leading-relaxed">
                  {spanish
                    ? 'Examina hasta 3 componentes lado a lado. Evalúa ergonomía móvil, cobertura de accesibilidad WCAG, complejidad técnica, dependencias y estados garantizados.'
                    : 'Analyze up to 3 components side-by-side. Inspect mobile ergonomics, WCAG accessibility, technical complexity, external dependencies, and built-in UI states.'}
                </p>
              </div>

              {/* ACTION BAR */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="rounded-xl border-border/80 bg-background/60 shadow-sm backdrop-blur hover:bg-muted/80"
                >
                  {copiedId === 'url' ? (
                    <>
                      <Check className="mr-1.5 size-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">{spanish ? '¡Enlace copiado!' : 'Link copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-1.5 size-4" />
                      <span>{spanish ? 'Compartir comparación' : 'Share comparison'}</span>
                    </>
                  )}
                </Button>

                {selected.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1.5 size-4" />
                    <span>{spanish ? 'Limpiar todo' : 'Clear all'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* PRESETS BAR */}
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
                <Sparkles className="size-3.5 text-amber-500" />
                {spanish ? 'Comparaciones populares:' : 'Popular comparisons:'}
              </span>
              {PRESETS.map(preset => {
                const isActive = preset.ids.length === selectedIds.length && preset.ids.every(id => selectedIds.includes(id));
                return (
                  <button
                    key={preset.id}
                    onClick={() => updateIds(preset.ids)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/30'
                    }`}
                  >
                    {spanish ? preset.labelEs : preset.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN COMPARISON WORKSPACE */}
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            {/* SIDEBAR: CATALOG SELECTOR */}
            <aside className="space-y-4">
              {/* CURRENT SELECTION CARD */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-violet-500" />
                    <h2 className="text-sm font-bold text-foreground">
                      {spanish ? 'Selección activa' : 'Active selection'}
                    </h2>
                  </div>
                  <Badge variant={selected.length === 3 ? 'default' : 'outline'} className={selected.length === 3 ? 'bg-violet-600' : ''}>
                    {selected.length} / 3
                  </Badge>
                </div>

                <div className="mt-3.5 space-y-2">
                  {selected.map(item => {
                    const kindMeta = KIND_META[item.kind];
                    return (
                      <div
                        key={item.id}
                        className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/70 bg-background/80 p-2.5 transition-all hover:border-violet-500/50 hover:shadow-md"
                      >
                        <span
                          className="size-9 shrink-0 rounded-lg shadow-inner ring-1 ring-black/10 dark:ring-white/10"
                          style={{
                            background: `linear-gradient(135deg, ${item.preview.primary || '#8b5cf6'}, ${item.preview.secondary || '#06b6d4'})`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">
                              {spanish ? item.name.es : item.name.en}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono uppercase">{item.id}</span>
                            <span>•</span>
                            <span className={kindMeta.color}>
                              {spanish ? kindMeta.labelEs : kindMeta.labelEn}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={spanish ? 'Quitar de la comparación' : 'Remove from comparison'}
                          onClick={() => remove(item.id)}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    );
                  })}

                  {selected.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/70 p-6 text-center">
                      <Layers3 className="mx-auto size-8 text-muted-foreground/50" />
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        {spanish ? 'Ningún componente elegido' : 'No components chosen'}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {spanish
                          ? 'Busca o selecciona en la lista inferior para agregarlo a la tabla.'
                          : 'Search or pick from the list below to populate the comparison table.'}
                      </p>
                    </div>
                  )}

                  {selected.length < 3 && selected.length > 0 && (
                    <div className="rounded-lg border border-dashed border-border/50 py-2 text-center text-[11px] text-muted-foreground">
                      {spanish
                        ? `Puedes añadir ${3 - selected.length} más`
                        : `You can add ${3 - selected.length} more`}
                    </div>
                  )}
                </div>
              </div>

              {/* SEARCH & BROWSE COMPONENT CARD */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Search className="size-4 text-violet-500" />
                    <h3 className="text-sm font-bold text-foreground">
                      {spanish ? 'Explorar catálogo' : 'Browse Catalog'}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {available.length} {spanish ? 'disp.' : 'avail.'}
                  </span>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="h-9 rounded-xl pl-8 pr-7 text-xs bg-background/70 border-border/60 focus-visible:ring-violet-500"
                    placeholder={spanish ? 'Filtrar por nombre, stack o tag...' : 'Filter by name, stack, tag...'}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* CATEGORY FILTER PILLS */}
                <div className="mt-3 flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                  <button
                    onClick={() => setKindFilter('all')}
                    className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                      kindFilter === 'all'
                        ? 'bg-violet-600 text-white'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {spanish ? 'Todos' : 'All'}
                  </button>
                  {(Object.keys(KIND_META) as Kind[]).map(kind => (
                    <button
                      key={kind}
                      onClick={() => setKindFilter(kind)}
                      className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                        kindFilter === kind
                          ? 'bg-violet-600 text-white'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {spanish ? KIND_META[kind].labelEs : KIND_META[kind].labelEn}
                    </button>
                  ))}
                </div>

                {/* COMPONENT LIST */}
                <div className="mt-3 max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
                  {available.map(item => {
                    const kindMeta = KIND_META[item.kind];
                    const isMax = selected.length >= 3;
                    return (
                      <button
                        key={item.id}
                        disabled={isMax}
                        onClick={() => add(item.id)}
                        className="group flex w-full items-center justify-between rounded-xl border border-transparent p-2 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/5 disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="size-6 shrink-0 rounded-md shadow-sm"
                            style={{ background: item.preview.primary || '#8b5cf6' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400">
                              {spanish ? item.name.es : item.name.en}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {item.id} • {spanish ? kindMeta.labelEs : kindMeta.labelEn}
                            </span>
                          </div>
                        </div>
                        <span className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-violet-600 group-hover:text-white">
                          <ChevronRight className="size-3.5" />
                        </span>
                      </button>
                    );
                  })}

                  {available.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      {spanish ? 'No se encontraron componentes.' : 'No components found.'}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* MAIN COMPARISON TABLE CONTAINER */}
            <div className="min-w-0 space-y-4">
              {/* TABLE TOP CONTROLS */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground select-none">
                    <input
                      type="checkbox"
                      checked={onlyDifferences}
                      onChange={e => setOnlyDifferences(e.target.checked)}
                      className="size-4 rounded border-border text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
                    />
                    <span>{spanish ? 'Destacar solo diferencias' : 'Highlight differences only'}</span>
                  </label>
                  {onlyDifferences && (
                    <Badge variant="secondary" className="text-[10px]">
                      {spanish ? 'Filtro activo' : 'Filter active'}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {spanish
                    ? `Comparando ${selected.length} de 3 componentes`
                    : `Comparing ${selected.length} of 3 components`}
                </div>
              </div>

              {/* TABLE CANVAS */}
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-lg backdrop-blur-md">
                {selected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="grid size-16 place-items-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
                      <Scale className="size-8" />
                    </div>
                    <h3 className="mt-4 font-headline text-lg font-bold text-foreground">
                      {spanish ? 'Comienza añadiendo componentes' : 'Start adding components'}
                    </h3>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      {spanish
                        ? 'Selecciona al menos dos componentes del panel lateral o prueba un preset para contrastar métricas y prompts.'
                        : 'Choose at least two components from the side panel or try a preset to contrast metrics and prompts.'}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {PRESETS.slice(0, 2).map(preset => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => updateIds(preset.ids)}
                          className="rounded-xl border-violet-500/30 hover:bg-violet-500/10 text-xs"
                        >
                          <Sparkles className="mr-1.5 size-3 text-amber-500" />
                          {spanish ? preset.labelEs : preset.labelEn}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          {/* CRITERIA HEADER COLUMN */}
                          <th className="w-60 min-w-[220px] p-5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <ArrowUpDown className="size-3.5 text-violet-500" />
                              <span>{spanish ? 'Criterio Técnico' : 'Technical Criterion'}</span>
                            </div>
                          </th>

                          {/* COMPONENT COLUMNS */}
                          {selected.map(item => {
                            const kindMeta = KIND_META[item.kind];
                            const metrics = analyze(item);
                            return (
                              <th
                                key={item.id}
                                className="min-w-[260px] p-5 align-top transition-all"
                              >
                                <div className="space-y-3">
                                  {/* PREVIEW MINI CARD */}
                                  <div
                                    className="relative h-20 w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 p-3 shadow-inner flex flex-col justify-between"
                                    style={{
                                      background: item.preview.dark
                                        ? `radial-gradient(circle at top left, ${item.preview.primary}33, ${item.preview.background || '#09090b'})`
                                        : `radial-gradient(circle at top left, ${item.preview.primary}22, ${item.preview.background || '#f8fafc'})`,
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] uppercase font-bold border-black/20 dark:border-white/20 bg-background/70 backdrop-blur`}
                                      >
                                        <span className={kindMeta.color}>
                                          {spanish ? kindMeta.labelEs : kindMeta.labelEn}
                                        </span>
                                      </Badge>
                                      <button
                                        type="button"
                                        onClick={() => remove(item.id)}
                                        className="rounded-full bg-background/80 p-1 text-muted-foreground hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        title={spanish ? 'Quitar' : 'Remove'}
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-[11px] font-bold text-foreground">
                                        {item.id}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setPreviewModalItem(item)}
                                        className="h-6 gap-1 rounded-md px-2 text-[10px] bg-background/60 hover:bg-background/90"
                                      >
                                        <Eye className="size-3" />
                                        <span>{spanish ? 'Detalles' : 'Details'}</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* NAME & OVERALL BADGE */}
                                  <div>
                                    <h3 className="font-headline text-base font-bold text-foreground leading-tight">
                                      {spanish ? item.name.es : item.name.en}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                      {spanish ? item.description.es : item.description.en}
                                    </p>
                                  </div>

                                  {/* QUICK ACTIONS */}
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <Button
                                      asChild
                                      size="sm"
                                      className="h-7 w-full rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm"
                                    >
                                      <Link href={`/component-builder?component=${item.id}`}>
                                        <Wand2 className="mr-1.5 size-3.5" />
                                        <span>{spanish ? 'Personalizar' : 'Customize'}</span>
                                      </Link>
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopyPrompt(item)}
                                      className="h-7 flex-1 rounded-lg text-xs border-border/80 hover:bg-muted"
                                    >
                                      {copiedId === item.id ? (
                                        <>
                                          <Check className="mr-1 size-3 text-emerald-500" />
                                          <span className="text-emerald-600 dark:text-emerald-400">{spanish ? 'Copiado' : 'Copied'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="mr-1 size-3" />
                                          <span>{spanish ? 'Prompt' : 'Prompt'}</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border/50">
                        {comparisonRows.map(row => {
                          const Icon = row.icon;
                          return (
                            <tr key={row.id} className="transition-colors hover:bg-muted/20">
                              {/* ROW LABEL */}
                              <td className="p-5 align-top border-r border-border/50 bg-card/40">
                                <div className="flex items-start gap-2.5">
                                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 mt-0.5">
                                    <Icon className="size-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-foreground">
                                      {row.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                                      {row.description}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* COMPONENT CELLS */}
                              {selected.map(item => {
                                const metrics = analyze(item);
                                const kindMeta = KIND_META[item.kind];

                                let content: ReactNode = null;

                                if (row.id === 'category') {
                                  content = (
                                    <div className="space-y-1.5">
                                      <Badge variant="outline" className={`font-semibold ${kindMeta.bg} ${kindMeta.color}`}>
                                        {spanish ? kindMeta.labelEs : kindMeta.labelEn}
                                      </Badge>
                                      <p className="text-[11px] text-muted-foreground capitalize">
                                        Layout: <strong className="text-foreground">{item.preview.layout || 'standard'}</strong>
                                      </p>
                                    </div>
                                  );
                                } else if (row.id === 'readiness') {
                                  content = (
                                    <div className="space-y-2">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-headline text-2xl font-black text-foreground">
                                          {metrics.overall}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/ 100</span>
                                        <Badge
                                          variant="secondary"
                                          className={`ml-auto text-[10px] font-bold ${levelInfo(metrics.overall).color}`}
                                        >
                                          {spanish ? levelInfo(metrics.overall).labelEs : levelInfo(metrics.overall).labelEn}
                                        </Badge>
                                      </div>
                                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
                                          style={{ width: `${metrics.overall}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                } else if (row.id === 'responsive') {
                                  content = (
                                    <div className="space-y-2">
                                      <MetricScoreMeter value={metrics.responsive} spanish={spanish} />
                                      {metrics.evidence.responsive.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                          {metrics.evidence.responsive.map(tag => (
                                            <span
                                              key={tag}
                                              className="rounded bg-muted/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else if (row.id === 'accessibility') {
                                  content = (
                                    <div className="space-y-2">
                                      <MetricScoreMeter value={metrics.accessibility} spanish={spanish} />
                                      {metrics.evidence.accessibility.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                          {metrics.evidence.accessibility.map(tag => (
                                            <span
                                              key={tag}
                                              className="rounded bg-muted/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else if (row.id === 'complexity') {
                                  content = (
                                    <div className="space-y-2">
                                      <MetricScoreMeter value={metrics.complexity} spanish={spanish} />
                                      <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                                        <span>{spanish ? 'Tokens prompt:' : 'Prompt tokens:'}</span>
                                        <span className="font-mono font-medium text-foreground">
                                          ~{Math.round((item.prompt.en.length + item.prompt.es.length) / 8)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                } else if (row.id === 'customization') {
                                  content = (
                                    <div className="space-y-2">
                                      <MetricScoreMeter value={metrics.customization} spanish={spanish} />
                                      <div className="flex items-center gap-1.5 pt-1">
                                        <span className="text-[10px] text-muted-foreground">{spanish ? 'Paleta:' : 'Palette:'}</span>
                                        <div className="flex -space-x-1">
                                          {item.preview.primary && (
                                            <span
                                              className="size-3.5 rounded-full ring-1 ring-background shadow-xs"
                                              style={{ background: item.preview.primary }}
                                              title={`Primary: ${item.preview.primary}`}
                                            />
                                          )}
                                          {item.preview.secondary && (
                                            <span
                                              className="size-3.5 rounded-full ring-1 ring-background shadow-xs"
                                              style={{ background: item.preview.secondary }}
                                              title={`Secondary: ${item.preview.secondary}`}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else if (row.id === 'dependencies') {
                                  content = (
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.stack.map(dep => (
                                        <Badge
                                          key={dep}
                                          variant="outline"
                                          className="bg-background/80 text-[10px] font-normal hover:bg-muted"
                                        >
                                          {dep}
                                        </Badge>
                                      ))}
                                    </div>
                                  );
                                } else if (row.id === 'states') {
                                  content = (
                                    <div>
                                      {metrics.states.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {metrics.states.map(state => (
                                            <span
                                              key={state}
                                              className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                            >
                                              <Check className="size-2.5" />
                                              {state}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground italic">
                                          {spanish ? 'Estados básicos estándar' : 'Basic standard states'}
                                        </span>
                                      )}
                                    </div>
                                  );
                                } else if (row.id === 'membership') {
                                  const isPremium = item.membership?.toLowerCase() === 'premium';
                                  content = (
                                    <div className="space-y-1.5">
                                      <Badge
                                        className={
                                          isPremium
                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400'
                                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                        }
                                        variant="outline"
                                      >
                                        <Sparkles className="mr-1 size-3" />
                                        {item.membership || 'Free'}
                                      </Badge>
                                      <p className="text-[10px] text-muted-foreground">
                                        {isPremium
                                          ? spanish
                                            ? 'Incluido en suscripción PRO'
                                            : 'Included with PRO membership'
                                          : spanish
                                            ? 'Acceso y copia gratuita'
                                            : 'Free access & copy'}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <td
                                    key={`${row.id}-${item.id}`}
                                    className="p-5 align-top border-r last:border-r-0 border-border/40"
                                  >
                                    {content}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* FOOTER INFO CARD */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Info className="size-4" />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground">
                      {spanish ? 'Metodología de cálculo y auditoría:' : 'Audit and scoring methodology:'}
                    </p>
                    <p>
                      {spanish
                        ? 'Nuestros índices analizan el stack formal, la cobertura de selectores ARIA, eventos de teclado, diseño responsive en CSS moderno, resiliencia ante estados de red o validación y soporte de tokens temáticos. Un resultado alto certifica especificaciones minuciosas listas para integración fluida con Cursor, Claude, v0 o ChatGPT.'
                        : 'Our indices evaluate required dependencies, ARIA selector coverage, keyboard events, responsive layouts in modern CSS, resilience across network and validation states, and theming token support. A high score guarantees exhaustive prompt specs ready for seamless integration with Cursor, Claude, v0, or ChatGPT.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QUICK PREVIEW & DETAILS MODAL */}
      <Dialog open={!!previewModalItem} onOpenChange={open => !open && setPreviewModalItem(null)}>
        {previewModalItem && (
          <DialogContent className="max-w-2xl rounded-2xl p-6 sm:p-8">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-violet-500">
                  {previewModalItem.kind}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  {previewModalItem.id}
                </span>
              </div>
              <DialogTitle className="font-headline text-2xl font-bold mt-2">
                {spanish ? previewModalItem.name.es : previewModalItem.name.en}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {spanish ? previewModalItem.description.es : previewModalItem.description.en}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* PALETTE & STACK */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {spanish ? 'Paleta de Color' : 'Color Palette'}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-5 rounded-full ring-1 ring-border shadow-xs"
                        style={{ background: previewModalItem.preview.primary }}
                      />
                      <span className="font-mono text-xs">{previewModalItem.preview.primary}</span>
                    </div>
                    {previewModalItem.preview.secondary && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-5 rounded-full ring-1 ring-border shadow-xs"
                          style={{ background: previewModalItem.preview.secondary }}
                        />
                        <span className="font-mono text-xs">{previewModalItem.preview.secondary}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {spanish ? 'Stack Técnico' : 'Technical Stack'}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {previewModalItem.stack.map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* PROMPT CODE VIEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {spanish ? 'Prompt de generación' : 'Generation Prompt'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyPrompt(previewModalItem)}
                    className="h-6 gap-1 text-[11px]"
                  >
                    {copiedId === previewModalItem.id ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span>{spanish ? '¡Copiado!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>{spanish ? 'Copiar Prompt' : 'Copy Prompt'}</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground select-all scrollbar-thin">
                  {spanish ? previewModalItem.prompt.es : previewModalItem.prompt.en}
                </div>
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewModalItem(null)}
                  className="rounded-xl text-xs"
                >
                  {spanish ? 'Cerrar' : 'Close'}
                </Button>
                <Button
                  asChild
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
                >
                  <Link href={`/component-builder?component=${previewModalItem.id}`}>
                    <Wand2 className="mr-1.5 size-3.5" />
                    <span>{spanish ? 'Abrir en Constructor Visual' : 'Open in Visual Builder'}</span>
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
