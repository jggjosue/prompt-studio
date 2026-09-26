'use client';
import { StaticComponentPreview } from '@/components/static-component-preview';

import ComponentQualityBadges from '@/components/component-quality-badges';
import ComponentCommercialPanel from '@/components/component-commercial-panel';
import { trackAnalyticsEvent } from '@/lib/analytics';

import GlobalResponsivePreview from '@/components/global-responsive-preview';

import catalog from '../../../../public/catalog/components/web-login-components.json';
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
import { Check, Copy, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

type RawItem = (typeof catalog.components)[number];
type LoginItem = RawItem & { title: string; summary: string; localizedPrompt: string };

function LoginPreview({ item, large = false }: { item: LoginItem; large?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const { primary, secondary, background, rounded, dark, layout } = item.preview;
  const radius = rounded === 'none' ? '0px' : rounded === 'lg' ? '16px' : rounded === 'xl' ? '22px' : '30px';
  const panel = dark ? '#11131acc' : '#ffffffeb';
  const text = dark ? '#f8fafc' : '#111827';
  const muted = dark ? '#a1a1aa' : '#64748b';
  const isSplit = layout === 'split' || layout === 'editorial' || layout === 'corporate';
  return (
    <div
      className={`relative isolate grid overflow-hidden ${large ? 'min-h-[520px]' : 'min-h-[330px]'} ${isSplit ? 'md:grid-cols-2' : 'place-items-center'}`}
      style={{ background, color: text, borderRadius: radius }}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full blur-3xl" style={{ background: secondary, opacity: .32 }} />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl" style={{ background: primary, opacity: .25 }} />
      {isSplit ? (
        <div className="relative hidden h-full flex-col justify-between overflow-hidden p-8 text-white md:flex" style={{ background: `linear-gradient(145deg, ${primary}, ${secondary})` }}>
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15"><Sparkles className="size-5" /></span>
          <div><p className="text-xs font-black uppercase tracking-[.22em] opacity-75">Welcome back</p><h3 className="mt-3 text-3xl font-black tracking-tight">Continue building<br />something remarkable.</h3></div>
          <p className="text-xs opacity-70">Secure authentication · Trusted workspace</p>
        </div>
      ) : null}
      <form className={`relative z-10 mx-auto w-full ${large ? 'max-w-md p-8 sm:p-10' : 'max-w-sm p-6'}`} onSubmit={event => event.preventDefault()}>
        <div className="mb-6"><span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}><LockKeyhole className="size-5" /></span><h3 className={`${large ? 'text-3xl' : 'text-2xl'} font-black tracking-tight`}>Welcome back</h3><p className="mt-1 text-sm" style={{ color: muted }}>Sign in to continue to your account.</p></div>
        <div className="space-y-3">
          <label className="block text-xs font-bold">Email address<div className="mt-1.5 flex items-center gap-2 border px-3 py-2.5" style={{ borderColor: `${primary}35`, borderRadius: radius === '0px' ? 0 : 12, background: dark ? '#ffffff0b' : '#ffffff' }}><Mail className="size-4" style={{ color: primary }} /><input aria-label="Email address" autoComplete="email" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="help@prompstudio.com" /></div></label>
          <label className="block text-xs font-bold">Password<div className="mt-1.5 flex items-center gap-2 border px-3 py-2.5" style={{ borderColor: `${primary}35`, borderRadius: radius === '0px' ? 0 : 12, background: dark ? '#ffffff0b' : '#ffffff' }}><KeyRound className="size-4" style={{ color: primary }} /><input aria-label="Password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} className="min-w-0 flex-1 bg-transparent text-sm outline-none" defaultValue="password123" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
          <div className="flex items-center justify-between text-[11px]"><label className="flex items-center gap-1.5"><input type="checkbox" /> Remember me</label><button type="button" className="font-bold" style={{ color: primary }}>Forgot password?</button></div>
          <button type="submit" className="w-full py-3 text-sm font-black text-white shadow-lg transition hover:brightness-110" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})`, borderRadius: radius === '0px' ? 0 : 12 }}>Sign in securely</button>
          <button type="button" className="w-full border py-2.5 text-xs font-bold" style={{ borderColor: `${primary}35`, borderRadius: radius === '0px' ? 0 : 12, background: panel }}>Continue with Google</button>
        </div>
        <p className="mt-5 text-center text-[11px]" style={{ color: muted }}>New here? <span className="font-bold" style={{ color: primary }}>Create an account</span></p>
      </form>
    </div>
  );
}

export default function LoginComponentsClient() {
  const locale = useLocale();
  const spanish = locale.toLowerCase().startsWith('es');
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('Todos');
  const [selected, setSelected] = useState<LoginItem | null>(null);
  const [copied, setCopied] = useState(false);
  const items = useMemo<LoginItem[]>(() => catalog.components.map(item => ({ ...item, title: spanish ? item.name.es : item.name.en, summary: spanish ? item.description.es : item.description.en, localizedPrompt: spanish ? item.prompt.es : item.prompt.en })), [spanish]);
  const tags = useMemo(() => ['Todos', ...Array.from(new Set(items.flatMap(item => item.tags))).slice(0, 12)], [items]);
  const filtered = useMemo(() => items.filter(item => (tag === 'Todos' || item.tags.includes(tag)) && `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [items, query, tag]);
  const copyPrompt = async (item: LoginItem) => {
    const result = await copyWithDailyLimit(() => copyToClipboard(item.localizedPrompt));
    if (result === 'copied') { trackAnalyticsEvent('component_prompt_copy', { item_id: item.id, item_name: item.title, item_category: 'login', membership: item.membership, action_source: 'catalog-copy' }); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  };
  return <div className="flex min-h-screen flex-col bg-background"><Header /><main className="flex-1 py-12 md:py-16"><div className="container max-w-7xl"><header className="mx-auto mb-10 max-w-3xl text-center"><Badge className="mb-4 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/10"><ShieldCheck className="mr-1 size-3.5" />React · Next.js · Accessible</Badge><h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">{spanish ? catalog.title_es : catalog.title_en}</h1><p className="mt-4 text-lg text-muted-foreground">{spanish ? catalog.description_es : catalog.description_en}</p><p className="mt-3 text-sm font-bold text-indigo-500">50 {spanish ? 'diseños disponibles' : 'designs available'}</p><SearchInput className="mx-auto mt-6 max-w-md" placeholder={spanish ? 'Buscar login por estilo o tecnología…' : 'Search by style or technology…'} value={query} onValueChange={setQuery} /></header><div className="mb-8 flex flex-wrap justify-center gap-2">{tags.map(value => <button key={value} onClick={() => setTag(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${tag === value ? 'border-indigo-500 bg-indigo-500 text-white' : 'hover:border-indigo-500/50'}`}>{value}</button>)}</div><div className="grid gap-7 lg:grid-cols-2">{filtered.map(item => <Card key={item.id} className="group overflow-hidden border-border/70 transition hover:border-indigo-500/50 hover:shadow-xl"><div className="cursor-pointer p-3" onClick={() => setSelected(item)}><StaticComponentPreview title={item.title} type="login" preview={item.preview} /></div><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle>{item.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{item.summary}</p></div><Badge variant={item.membership === 'Free' ? 'secondary' : 'default'}>{item.membership}</Badge></div></CardHeader><CardContent className="flex flex-wrap gap-1.5">{item.tags.slice(0, 4).map(value => <Badge key={value} variant="outline" className="text-[10px]">{value}</Badge>)}</CardContent><ComponentQualityBadges prompt={item.localizedPrompt} stack={item.stack} className="px-6 pb-3" /><CardFooter className="gap-2"><Button className="flex-1" onClick={() => setSelected(item)}><Eye className="mr-2 size-4" />{spanish ? 'Ver diseño' : 'View design'}</Button><Button variant="outline" onClick={() => void copyPrompt(item)}><Copy className="mr-2 size-4" />{spanish ? 'Copiar prompt' : 'Copy prompt'}</Button></CardFooter></Card>)}</div>{filtered.length === 0 ? <p className="py-24 text-center text-muted-foreground">{spanish ? 'No encontramos diseños.' : 'No designs found.'}</p> : null}</div></main><Footer /><Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}><DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">{selected ? <><DialogHeader><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.summary}</DialogDescription></DialogHeader><Tabs defaultValue="preview"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="preview">{spanish ? 'Vista previa' : 'Preview'}</TabsTrigger><TabsTrigger value="prompt">Prompt</TabsTrigger></TabsList><TabsContent value="preview" className="mt-4"><GlobalResponsivePreview><LoginPreview item={selected} large /></GlobalResponsivePreview></TabsContent><TabsContent value="prompt" className="mt-4"><pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-5 text-xs leading-6 text-zinc-200"><code>{selected.localizedPrompt}</code></pre></TabsContent></Tabs><ComponentCommercialPanel id={selected.id} kind="login" name={selected.title} prompt={selected.localizedPrompt} stack={selected.stack} membership={selected.membership} /><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><ComponentQualityBadges prompt={selected.localizedPrompt} stack={selected.stack} /><div className="flex flex-wrap gap-1.5">{selected.stack.map(value => <Badge key={value} variant="outline">{value}</Badge>)}</div><Button onClick={() => void copyPrompt(selected)}>{copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}{copied ? (spanish ? 'Copiado' : 'Copied') : (spanish ? 'Copiar prompt' : 'Copy prompt')}</Button></div></> : null}</DialogContent></Dialog></div>;
}
