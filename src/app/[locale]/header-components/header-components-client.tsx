'use client';
import { StaticComponentPreview } from '@/components/static-component-preview';

import ComponentQualityBadges from '@/components/component-quality-badges';
import ComponentCommercialPanel from '@/components/component-commercial-panel';
import { trackAnalyticsEvent } from '@/lib/analytics';

import GlobalResponsivePreview from '@/components/global-responsive-preview';

import catalog from '../../../../public/catalog/components/web-header-components.json';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { Check, ChevronDown, Copy, Eye, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

type RawItem = (typeof catalog.components)[number];
type HeaderItem = RawItem & { title: string; summary: string; localizedPrompt: string };

function HeaderPreview({ item, large = false }: { item: HeaderItem; large?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { primary, secondary, background, dark, layout } = item.preview;
  const foreground = dark ? '#f8fafc' : '#111827';
  const muted = dark ? '#a1a1aa' : '#64748b';
  const floating = ['floating','glass','pill'].includes(layout);
  const brutal = layout === 'brutal';
  const terminal = layout === 'terminal';
  return <div className={`relative isolate overflow-hidden ${large ? 'min-h-[560px]' : 'min-h-[340px]'}`} style={{ background, color: foreground }}>
    <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 72% 35%, ${secondary}, transparent 38%), radial-gradient(circle at 20% 80%, ${primary}, transparent 34%)` }} />
    {item.description.en.includes('announcement') ? <div className="relative z-20 py-1.5 text-center text-[10px] font-bold text-white" style={{ background: primary }}>New collection available — Explore now</div> : null}
    <nav aria-label="Primary navigation" className={`relative z-20 flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5 ${floating ? 'm-3 border rounded-2xl shadow-xl backdrop-blur-xl' : ''} ${brutal ? 'border-2 shadow-[4px_4px_0_#000]' : ''}`} style={{ borderColor: `${primary}35`, background: floating ? `${background}dd` : background }}>
      <button type="button" className="flex shrink-0 items-center gap-2 font-black tracking-tight"><span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: terminal ? '#111' : `linear-gradient(135deg,${primary},${secondary})` }}>{terminal ? '>' : <Sparkles className="size-4" />}</span><span>{terminal ? 'dev.nav' : 'Nova'}</span></button>
      <div className={`hidden items-center gap-1 text-xs font-bold md:flex ${layout === 'centered' ? 'absolute left-1/2 -translate-x-1/2' : ''}`}>
        <button className="rounded-lg px-3 py-2" style={{ background: `${primary}14`, color: primary }}>Home</button>
        <div className="relative"><button type="button" aria-expanded={productsOpen} onClick={() => setProductsOpen(value => !value)} className="flex items-center gap-1 rounded-lg px-3 py-2">Products <ChevronDown className="size-3" /></button>{productsOpen ? <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border p-2 text-left shadow-2xl" style={{ background, borderColor: `${primary}40` }}>{['Analytics suite','Team workspace','Automations'].map((label,index) => <button key={label} className="flex w-full items-center gap-2 rounded-lg p-2 text-xs hover:opacity-70"><span className="size-7 rounded-lg" style={{ background:index % 2 ? secondary : primary, opacity:.2 }} />{label}</button>)}</div> : null}</div>
        <button className="rounded-lg px-3 py-2">Solutions</button><button className="rounded-lg px-3 py-2">Pricing</button>
      </div>
      <div className="hidden items-center gap-2 md:flex"><button aria-label="Search" className="grid size-8 place-items-center rounded-lg"><Search className="size-4" /></button>{item.tags.includes('E-commerce') ? <button aria-label="Shopping bag" className="grid size-8 place-items-center rounded-lg"><ShoppingBag className="size-4" /></button> : <button className="text-xs font-bold">Sign in</button>}<button className={`px-3 py-2 text-xs font-black text-white ${brutal ? '' : 'rounded-lg'}`} style={{ background: primary }}>Get started</button></div>
      <button aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)} className="grid size-9 place-items-center rounded-lg md:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
    </nav>
    {mobileOpen ? <div className="absolute inset-x-3 top-20 z-30 rounded-2xl border p-3 shadow-2xl md:hidden" style={{ background, borderColor:`${primary}45` }}>{['Home','Products','Solutions','Pricing'].map(label => <button key={label} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-bold">{label}</button>)}<button className="mt-2 w-full rounded-xl py-3 text-sm font-black text-white" style={{ background:primary }}>Get started</button></div> : null}
    <section className={`relative z-10 flex flex-col items-center justify-center px-6 text-center ${large ? 'min-h-[455px]' : 'min-h-[250px]'}`}><Badge variant="outline" className="mb-4" style={{ borderColor:`${primary}66`, color:primary }}>Responsive navigation</Badge><h3 className={`${large ? 'text-5xl' : 'text-3xl'} max-w-2xl font-black tracking-[-.05em]`}>Navigation that makes every destination feel closer.</h3><p className="mt-3 max-w-lg text-sm" style={{ color:muted }}>Accessible menus, intentional hierarchy and a clear path to conversion.</p><div className="mt-6 flex gap-2"><button className="rounded-xl px-4 py-2.5 text-xs font-black text-white" style={{ background:primary }}>Start building</button><button className="rounded-xl border px-4 py-2.5 text-xs font-black" style={{ borderColor:`${primary}45` }}>View docs</button></div></section>
  </div>;
}

export default function HeaderComponentsClient() {
  const locale = useLocale();
  const spanish = locale.toLowerCase().startsWith('es');
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const [query,setQuery] = useState(''); const [tag,setTag] = useState('Todos'); const [selected,setSelected] = useState<HeaderItem|null>(null); const [copied,setCopied] = useState(false);
  const items = useMemo<HeaderItem[]>(() => catalog.components.map(item => ({...item,title:spanish?item.name.es:item.name.en,summary:spanish?item.description.es:item.description.en,localizedPrompt:spanish?item.prompt.es:item.prompt.en})),[spanish]);
  const tags = useMemo(() => ['Todos',...Array.from(new Set(items.flatMap(item=>item.tags))).slice(0,12)],[items]);
  const filtered = useMemo(() => items.filter(item => (tag==='Todos'||item.tags.includes(tag))&&`${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),[items,query,tag]);
  const copyPrompt = async (item:HeaderItem) => { const result=await copyWithDailyLimit(()=>copyToClipboard(item.localizedPrompt)); if(result==='copied'){trackAnalyticsEvent('component_prompt_copy',{item_id:item.id,item_name:item.title,item_category:'header',membership:item.membership,action_source:'catalog-copy'});setCopied(true);window.setTimeout(()=>setCopied(false),1800);} };
  return <div className="flex min-h-screen flex-col bg-background"><Header/><main className="flex-1 py-12 md:py-16"><div className="container max-w-7xl"><header className="mx-auto mb-10 max-w-3xl text-center"><Badge className="mb-4 bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/10"><Menu className="mr-1 size-3.5"/>React · Next.js · Responsive</Badge><h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">{spanish?catalog.title_es:catalog.title_en}</h1><p className="mt-4 text-lg text-muted-foreground">{spanish?catalog.description_es:catalog.description_en}</p><p className="mt-3 text-sm font-bold text-cyan-600">50 {spanish?'headers disponibles':'headers available'}</p><SearchInput className="mx-auto mt-6 max-w-md" placeholder={spanish?'Buscar header por estilo…':'Search headers by style…'} value={query} onValueChange={setQuery}/></header><div className="mb-8 flex flex-wrap justify-center gap-2">{tags.map(value=><button key={value} onClick={()=>setTag(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tag===value?'border-cyan-600 bg-cyan-600 text-white':'hover:border-cyan-500/50'}`}>{value}</button>)}</div><div className="grid gap-7 lg:grid-cols-2">{filtered.map(item=><Card key={item.id} className="overflow-hidden border-border/70 transition hover:border-cyan-500/50 hover:shadow-xl"><div className="cursor-pointer p-3" onClick={()=>setSelected(item)}><StaticComponentPreview title={item.title} type="header" preview={item.preview} /></div><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle>{item.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{item.summary}</p></div><Badge variant={item.membership==='Free'?'secondary':'default'}>{item.membership}</Badge></div></CardHeader><CardContent className="flex flex-wrap gap-1.5">{item.tags.slice(0,4).map(value=><Badge key={value} variant="outline" className="text-[10px]">{value}</Badge>)}</CardContent><ComponentQualityBadges prompt={item.localizedPrompt} stack={item.stack} className="px-6 pb-3"/><CardFooter className="gap-2"><Button className="flex-1" onClick={()=>setSelected(item)}><Eye className="mr-2 size-4"/>{spanish?'Ver diseño':'View design'}</Button><Button variant="outline" onClick={()=>void copyPrompt(item)}><Copy className="mr-2 size-4"/>{spanish?'Copiar prompt':'Copy prompt'}</Button></CardFooter></Card>)}</div>{!filtered.length?<p className="py-24 text-center text-muted-foreground">{spanish?'No encontramos headers.':'No headers found.'}</p>:null}</div></main><Footer/><Dialog open={Boolean(selected)} onOpenChange={open=>!open&&setSelected(null)}><DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">{selected?<><DialogHeader><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.summary}</DialogDescription></DialogHeader><Tabs defaultValue="preview"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="preview">{spanish?'Vista previa':'Preview'}</TabsTrigger><TabsTrigger value="prompt">Prompt</TabsTrigger></TabsList><TabsContent value="preview" className="mt-4"><GlobalResponsivePreview><HeaderPreview item={selected} large/></GlobalResponsivePreview></TabsContent><TabsContent value="prompt" className="mt-4"><pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-5 text-xs leading-6 text-zinc-200"><code>{selected.localizedPrompt}</code></pre></TabsContent></Tabs><ComponentCommercialPanel id={selected.id} kind="header" name={selected.title} prompt={selected.localizedPrompt} stack={selected.stack} membership={selected.membership}/><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><ComponentQualityBadges prompt={selected.localizedPrompt} stack={selected.stack}/><div className="flex flex-wrap gap-1.5">{selected.stack.map(value=><Badge key={value} variant="outline">{value}</Badge>)}</div><Button onClick={()=>void copyPrompt(selected)}>{copied?<Check className="mr-2 size-4"/>:<Copy className="mr-2 size-4"/>}{copied?(spanish?'Copiado':'Copied'):(spanish?'Copiar prompt':'Copy prompt')}</Button></div></>:null}</DialogContent></Dialog></div>;
}
