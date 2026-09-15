'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Bookmark, Boxes, Layers3, Sparkles } from 'lucide-react';
import { useComponentLibrary } from '@/hooks/use-component-library';

const routeByKind: Record<string, string> = { login: '/login-components', header: '/header-components', text: '/text-components', form: '/form-components', button: '/button-components', card: '/card-components', navigation: '/navigation-components', sidebar: '/sidebar-components' };
const complements: Record<string, string[]> = { login: ['form', 'button'], header: ['navigation', 'button'], text: ['button', 'card'], form: ['button', 'card'], button: ['form', 'card'], card: ['button', 'text'], navigation: ['header', 'sidebar'], sidebar: ['navigation', 'card'] };
const industries = ['salud', 'médica', 'fintech', 'finanzas', 'restaurante', 'inmobiliaria', 'bienes raíces', 'e-commerce', 'marketplace', 'saas', 'educación', 'moda'];
const styles = ['minimalista', 'elegante', 'oscuro', 'neón', 'editorial', 'brutalista', 'glassmorphism', 'corporativo', 'futurista'];

export function ComponentBehaviorRecommendations({ id, kind, prompt }: { id: string; kind: string; prompt: string }) {
  const { state, ready, markRecent } = useComponentLibrary();
  const marked = useRef('');
  useEffect(() => { if (ready && marked.current !== id) { marked.current = id; markRecent(id); } }, [id, ready, markRecent]);
  const normalized = prompt.toLowerCase();
  const industry = industries.find(value => normalized.includes(value));
  const style = styles.find(value => normalized.includes(value));
  const behavioral = useMemo(() => [...state.favorites, ...state.recent.map(item => item.id)].filter((value, index, all) => value !== id && all.indexOf(value) === index).slice(0, 2), [id, state.favorites, state.recent]);
  const recommendedKinds = complements[kind] ?? ['button', 'form'];

  return <section className="rounded-xl border p-4"><div className="flex items-center gap-2"><Sparkles className="size-4 text-violet-600"/><p className="text-xs font-black">Recomendado para completar tu proyecto</p></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{industry?<Link href={`/smart-search?q=${encodeURIComponent(industry)}`} className="rounded-lg border p-3 text-[10px] hover:border-violet-400"><strong className="block">Misma industria</strong><span className="text-muted-foreground">Más diseños relacionados con {industry}.</span></Link>:null}{style?<Link href={`/smart-search?q=${encodeURIComponent(style)}`} className="rounded-lg border p-3 text-[10px] hover:border-violet-400"><strong className="block">Estilo parecido</strong><span className="text-muted-foreground">Alternativas con estilo {style}.</span></Link>:null}{recommendedKinds.slice(0,2).map(value=><Link key={value} href={routeByKind[value]??'/smart-search'} className="rounded-lg border p-3 text-[10px] hover:border-violet-400"><Boxes className="mb-1 size-3.5 text-blue-600"/><strong className="block capitalize">{value} complementario</strong><span className="text-muted-foreground">Funciona junto a este {kind}.</span></Link>)}{behavioral.map(value=><Link key={value} href={`/component-builder?component=${value}`} className="rounded-lg border p-3 text-[10px] hover:border-violet-400"><Bookmark className="mb-1 size-3.5 text-amber-600"/><strong className="block">Visto o guardado</strong><span className="text-muted-foreground">Retoma {value} para combinarlo.</span></Link>)}<Link href={`/component-kits?component=${encodeURIComponent(id)}`} className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[10px] text-amber-950 hover:border-amber-500"><Layers3 className="mb-1 size-3.5"/><strong className="block">Bundle recomendado</strong><span>Ver kits que pueden incluir {id}.</span></Link></div><p className="mt-3 text-[9px] text-muted-foreground">Estas recomendaciones usan reglas visibles; no perfiles opacos.</p></section>;
}
