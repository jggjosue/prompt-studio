'use client';
import { StaticComponentPreview } from '@/components/static-component-preview';

import ComponentQualityBadges from '@/components/component-quality-badges';
import ComponentCommercialPanel from '@/components/component-commercial-panel';
import { trackAnalyticsEvent } from '@/lib/analytics';

import GlobalResponsivePreview from '@/components/global-responsive-preview';

import catalog from '../../../../public/catalog/components/web-text-components.json';
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
import { Check, Copy, Eye, Play, Sparkles, Type } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useMemo, useState, type CSSProperties } from 'react';

type RawItem = (typeof catalog.components)[number];
type TextItem = RawItem & { title: string; summary: string; localizedPrompt: string };

function TextPreview({ item, large = false }: { item: TextItem; large?: boolean }) {
  const [run, setRun] = useState(0);
  const { primary,secondary,background,alignment,family,dark,style } = item.preview;
  const textColor=dark?'#f8fafc':'#111827'; const muted=dark?'#a1a1aa':'#64748b';
  const familyValue=family==='serif'?'Georgia, Times, serif':family==='mono'?'ui-monospace, SFMono-Regular, monospace':family==='display'?'Impact, Arial Black, sans-serif':'Inter, Arial, sans-serif';
  const special:CSSProperties = style==='outline'?{color:'transparent',WebkitTextStroke:`2px ${primary}`} : style==='shadow'?{color:primary,textShadow:`5px 5px 0 ${secondary}`} : ['gradient','holographic','duotone','masked'].includes(style)?{backgroundImage:`linear-gradient(100deg,${primary},${secondary},${primary})`,backgroundSize:'200% auto',WebkitBackgroundClip:'text',color:'transparent'} : {color:textColor};
  const transform=style==='condensed'?'scaleX(.72)':style==='vertical'?'rotate(-3deg)':style==='speed'?'skewX(-12deg)':undefined;
  return <div className={`text-preview relative isolate flex overflow-hidden p-7 ${large?'min-h-[540px]':'min-h-[320px]'}`} style={{background,color:textColor,alignItems:'center',justifyContent:alignment==='left'?'flex-start':alignment==='right'?'flex-end':'center',textAlign:alignment as CSSProperties['textAlign']}}>
    <div className="absolute -right-20 -top-24 size-72 rounded-full blur-3xl" style={{background:secondary,opacity:.24}}/><div className="absolute -bottom-24 -left-20 size-64 rounded-full blur-3xl" style={{background:primary,opacity:.22}}/>
    {style==='brutal'?<div className="absolute inset-5 border-[3px]" style={{borderColor:textColor}}/>:null}
    {style==='circle'?<div className="absolute size-56 rounded-full border border-dashed motion-safe:animate-spin" style={{borderColor:primary,animationDuration:'12s'}}/>:null}
    <div key={run} className={`relative z-10 max-w-4xl ${['typewriter','scramble','reveal'].includes(style)?'text-preview-enter':''}`}>
      <p className="mb-4 text-[10px] font-black uppercase tracking-[.3em]" style={{color:primary}}>Typography system · 0{Number(item.id.slice(-3))}</p>
      <h3 className={`${large?'text-[clamp(3.5rem,9vw,8rem)]':'text-[clamp(2.3rem,6vw,5rem)]'} font-black leading-[.88] tracking-[-.065em]`} style={{fontFamily:familyValue,transform,...special}}>{item.sample}</h3>
      <div className={`mt-5 h-1 ${alignment==='center'?'mx-auto':alignment==='right'?'ml-auto':''} w-20`} style={{background:`linear-gradient(90deg,${primary},${secondary})`}}/>
      <p className="mt-4 max-w-md text-xs leading-5" style={{color:muted}}>Fluid scale · Balanced wrapping · Accessible contrast</p>
    </div>
    <button type="button" aria-label="Replay animation" onClick={event=>{event.stopPropagation();setRun(value=>value+1)}} className="absolute bottom-4 right-4 z-20 grid size-9 place-items-center rounded-full border backdrop-blur" style={{borderColor:`${primary}55`,background:`${background}bb`}}><Play className="size-3.5"/></button>
  </div>;
}

export default function TextComponentsClient(){
  const locale=useLocale();const spanish=locale.toLowerCase().startsWith('es');const{copyWithDailyLimit}=useDailyCopyLimit();const[query,setQuery]=useState('');const[tag,setTag]=useState('Todos');const[selected,setSelected]=useState<TextItem|null>(null);const[copied,setCopied]=useState(false);
  const items=useMemo<TextItem[]>(()=>catalog.components.map(item=>({...item,title:spanish?item.name.es:item.name.en,summary:spanish?item.description.es:item.description.en,localizedPrompt:spanish?item.prompt.es:item.prompt.en})),[spanish]);
  const tags=useMemo(()=>['Todos',...Array.from(new Set(items.flatMap(item=>item.tags))).slice(0,14)],[items]);
  const filtered=useMemo(()=>items.filter(item=>(tag==='Todos'||item.tags.includes(tag))&&`${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),[items,query,tag]);
  const copyPrompt=async(item:TextItem)=>{const result=await copyWithDailyLimit(()=>copyToClipboard(item.localizedPrompt));if(result==='copied'){trackAnalyticsEvent('component_prompt_copy',{item_id:item.id,item_name:item.title,item_category:'text',membership:item.membership,action_source:'catalog-copy'});setCopied(true);window.setTimeout(()=>setCopied(false),1800)}};
  return <div className="flex min-h-screen flex-col bg-background"><Header/><main className="flex-1 py-12 md:py-16"><div className="container max-w-7xl"><header className="mx-auto mb-10 max-w-3xl text-center"><Badge className="mb-4 bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/10"><Type className="mr-1 size-3.5"/>React · Fluid type · Accessible</Badge><h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl">{spanish?catalog.title_es:catalog.title_en}</h1><p className="mt-4 text-lg text-muted-foreground">{spanish?catalog.description_es:catalog.description_en}</p><p className="mt-3 text-sm font-bold text-fuchsia-600">50 {spanish?'diseños disponibles':'designs available'}</p><SearchInput className="mx-auto mt-6 max-w-md" placeholder={spanish?'Buscar texto por estilo…':'Search text by style…'} value={query} onValueChange={setQuery}/></header><div className="mb-8 flex flex-wrap justify-center gap-2">{tags.map(value=><button key={value} onClick={()=>setTag(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tag===value?'border-fuchsia-600 bg-fuchsia-600 text-white':'hover:border-fuchsia-500/50'}`}>{value}</button>)}</div><div className="grid gap-7 lg:grid-cols-2">{filtered.map(item=><Card key={item.id} className="overflow-hidden border-border/70 transition hover:border-fuchsia-500/50 hover:shadow-xl"><div className="cursor-pointer p-3" onClick={()=>setSelected(item)}><StaticComponentPreview title={item.title} type="text" preview={item.preview} /></div><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle>{item.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{item.summary}</p></div><Badge variant={item.membership==='Free'?'secondary':'default'}>{item.membership}</Badge></div></CardHeader><CardContent className="flex flex-wrap gap-1.5">{item.tags.slice(0,4).map(value=><Badge key={value} variant="outline" className="text-[10px]">{value}</Badge>)}</CardContent><ComponentQualityBadges prompt={item.localizedPrompt} stack={item.stack} className="px-6 pb-3"/><CardFooter className="gap-2"><Button className="flex-1" onClick={()=>setSelected(item)}><Eye className="mr-2 size-4"/>{spanish?'Ver diseño':'View design'}</Button><Button variant="outline" onClick={()=>void copyPrompt(item)}><Copy className="mr-2 size-4"/>{spanish?'Copiar prompt':'Copy prompt'}</Button></CardFooter></Card>)}</div>{!filtered.length?<p className="py-24 text-center text-muted-foreground">{spanish?'No encontramos textos.':'No text designs found.'}</p>:null}</div></main><Footer/><Dialog open={Boolean(selected)} onOpenChange={open=>!open&&setSelected(null)}><DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">{selected?<><DialogHeader><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.summary}</DialogDescription></DialogHeader><Tabs defaultValue="preview"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="preview">{spanish?'Vista previa':'Preview'}</TabsTrigger><TabsTrigger value="prompt">Prompt</TabsTrigger></TabsList><TabsContent value="preview" className="mt-4"><GlobalResponsivePreview><TextPreview item={selected} large/></GlobalResponsivePreview></TabsContent><TabsContent value="prompt" className="mt-4"><pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-5 text-xs leading-6 text-zinc-200"><code>{selected.localizedPrompt}</code></pre></TabsContent></Tabs><ComponentCommercialPanel id={selected.id} kind="text" name={selected.title} prompt={selected.localizedPrompt} stack={selected.stack} membership={selected.membership}/><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><ComponentQualityBadges prompt={selected.localizedPrompt} stack={selected.stack}/><div className="flex flex-wrap gap-1.5">{selected.stack.map(value=><Badge key={value} variant="outline">{value}</Badge>)}</div><Button onClick={()=>void copyPrompt(selected)}>{copied?<Check className="mr-2 size-4"/>:<Copy className="mr-2 size-4"/>}{copied?(spanish?'Copiado':'Copied'):(spanish?'Copiar prompt':'Copy prompt')}</Button></div></>:null}</DialogContent></Dialog><style jsx global>{`.text-preview-enter{animation:textPreviewEnter .85s cubic-bezier(.2,.8,.2,1) both}.text-preview h3{transition:filter .35s,transform .35s}.text-preview:hover h3{filter:brightness(1.14);transform:translateY(-4px) scale(1.015)}@keyframes textPreviewEnter{from{opacity:0;transform:translateY(28px);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}@media(prefers-reduced-motion:reduce){.text-preview *{animation-duration:.001ms!important;transition-duration:.001ms!important}}`}</style></div>;
}
