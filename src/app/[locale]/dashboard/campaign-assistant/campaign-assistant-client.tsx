'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowRight, Check, CircleDashed, Coins, Download, ExternalLink, Megaphone, Palette, Play, RefreshCw, RotateCcw, Sparkles, WalletCards } from 'lucide-react';

type Summary = { id: string; name: string; language: string; count: number };
type BrandKit = { id: string; name: string };
type Job = { status: string; progress: number; progressMessage: string; provider: string; creditCost: number; estimatedCostUsd: number; actualCostUsd: number | null; lastError?: string | null };
type Stage = { key: string; label: string; progress: number; status: 'complete' | 'active' | 'pending' | 'blocked'; pending: string | null };
type Control = { progress: number; pending: string[]; stages: Stage[]; nextAction: { stage: string; label: string; href: string }; costs: { credits: number; estimatedUsd: number; actualUsd: number | null } };
type Detail = { id: string; name: string; projectId: string; brief: string; audience: string; language: string; control: Control; budget: {limitCredits:number|null;limitUsd:number|null;creditPercent:number|null;usdPercent:number|null;warnings:string[]}; tasks: Array<{ stage: string; label: string; jobId: string; job: Job | null }> };
const providers = { image: ['google', 'openai', 'fal', 'replicate'], video: ['runway', 'veo', 'kling', 'luma', 'pika', 'hailuo', 'sora'], text: ['openai', 'google', 'anthropic', 'deepseek'] };

export function CampaignAssistantClient() {
  const [name, setName] = useState('Campaña integral');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('Español');
  const [brandKitId, setBrandKitId] = useState('');
  const [imageProvider, setImageProvider] = useState('google');
  const [videoProvider, setVideoProvider] = useState('runway');
  const [textProvider, setTextProvider] = useState('openai');
  const [budgetLimitCredits, setBudgetLimitCredits] = useState('');
  const [budgetLimitUsd, setBudgetLimitUsd] = useState('');
  const [approvalCredits, setApprovalCredits] = useState('');
  const [approvalUsd, setApprovalUsd] = useState('');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [history, setHistory] = useState<Summary[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const historyLoad = useCallback(async () => {
    const response = await fetch('/api/campaign-workflows', { cache: 'no-store' });
    if (response.ok) setHistory((await response.json()).campaigns || []);
  }, []);
  const open = useCallback(async (id: string) => {
    const response = await fetch(`/api/campaign-workflows/${id}`, { cache: 'no-store' });
    if (response.ok) setDetail((await response.json()).campaign);
  }, []);

  useEffect(() => {
    void historyLoad();
    void fetch('/api/brand-kits', { cache: 'no-store' }).then(response => response.ok ? response.json() : { kits: [] }).then(data => setBrandKits(data.kits || []));
  }, [historyLoad]);
  useEffect(() => {
    if (!detail || detail.tasks.every(task => task.job && ['completed', 'failed'].includes(task.job.status))) return;
    const timer = setInterval(() => void open(detail.id), 4_000);
    return () => clearInterval(timer);
  }, [detail, open]);

  const create = async (projectBudgetApproved = false) => {
    setBusy(true); setError(''); setApprovalRequired(false);
    const response = await fetch('/api/campaign-workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, brief, audience, language, brandKitId, imageProvider, videoProvider, textProvider, budgetLimitCredits, budgetLimitUsd, approvalCredits, approvalUsd, projectBudgetApproved }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { await open(data.id); await historyLoad(); }
    else { setError(data.error || 'No se pudo crear la campaña.'); setApprovalRequired(data.approvalRequired === true); }
    setBusy(false);
  };
  const retry = async () => {
    if (!detail) return;
    setBusy(true);
    await fetch(`/api/campaign-workflows/${detail.id}`, { method: 'PATCH' });
    await open(detail.id);
    setBusy(false);
  };

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><Badge className="mb-2 bg-fuchsia-600"><Megaphone className="mr-1 size-3.5" />Centro de campaña</Badge><h1 className="text-3xl font-black">Del brief a la publicación</h1><p className="mt-2 max-w-2xl text-muted-foreground">Una vista operativa para saber qué está listo, qué falta, cuánto cuesta y cuál es la siguiente decisión.</p></div>
      {detail ? <Button variant="outline" asChild><a href={`/dashboard/projects`}><ExternalLink className="mr-2 size-4" />Abrir proyecto</a></Button> : null}
    </div>

    {detail ? <>
      <Card className="overflow-hidden border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 via-background to-cyan-500/10">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
          <div><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-fuchsia-600">Campaña activa</p><h2 className="mt-1 text-2xl font-black">{detail.name}</h2><p className="mt-1 text-sm text-muted-foreground">{detail.audience || 'Audiencia definida en el brief'} · {detail.language}</p></div><span className="text-4xl font-black tabular-nums">{detail.control.progress}%</span></div><Progress className="mt-5 h-3" value={detail.control.progress} /><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{detail.brief}</p></div>
          <div className="rounded-2xl border bg-background/80 p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Próximo paso</p><p className="mt-2 text-lg font-black">{detail.control.nextAction.label}</p><p className="mt-1 text-xs text-muted-foreground">La recomendación cambia automáticamente según el estado real.</p>{detail.control.nextAction.stage === 'generations' && detail.tasks.some(task => task.job?.status === 'failed') ? <Button className="mt-4 w-full" onClick={retry} disabled={busy}><RotateCcw className="mr-2 size-4" />Reintentar fallidos</Button> : <Button className="mt-4 w-full" asChild><a href={detail.control.nextAction.href}>{detail.control.nextAction.label}<ArrowRight className="ml-2 size-4" /></a></Button>}</div>
        </CardContent>
      </Card>

      <section aria-label="Recorrido de campaña" className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {detail.control.stages.map((stage, index) => <StageCard key={stage.key} stage={stage} index={index + 1} />)}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card><CardHeader><CardTitle className="text-base">Costos de la campaña</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-3"><Metric icon={<Coins />} label={detail.budget.limitCredits===null?'Créditos':`de ${detail.budget.limitCredits} créditos`} value={String(detail.control.costs.credits)} /><Metric icon={<WalletCards />} label={detail.budget.limitUsd===null?'Estimado':`límite $${detail.budget.limitUsd.toFixed(2)}`} value={`$${detail.control.costs.estimatedUsd.toFixed(2)}`} /><Metric icon={<Sparkles />} label="Real" value={detail.control.costs.actualUsd === null ? 'Pendiente' : `$${detail.control.costs.actualUsd.toFixed(2)}`} /></div>{detail.budget.warnings.map(warning=><p key={warning} className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700"><AlertTriangle className="size-4"/>{warning}</p>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Pendientes</CardTitle></CardHeader><CardContent>{detail.control.pending.length ? <div className="grid gap-2 sm:grid-cols-2">{detail.control.pending.map(item => <div key={item} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><CircleDashed className="size-4 shrink-0 text-amber-500" />{item}</div>)}</div> : <div className="flex items-center gap-2 text-sm text-emerald-600"><Check className="size-4" />La campaña está completa.</div>}</CardContent></Card>
      </div>

      <Card id="campaign-generations"><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Generaciones coordinadas</CardTitle><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void open(detail.id)}><RefreshCw className="mr-1 size-4" />Actualizar</Button><Button size="sm" variant="outline" disabled={!detail.tasks.some(task => task.job?.status === 'failed')} onClick={retry}><RotateCcw className="mr-1 size-4" />Reintentar</Button><Button size="sm" asChild><a href={`/api/campaign-workflows/${detail.id}/export`}><Download className="mr-1 size-4" />ZIP</a></Button></div></div></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{detail.tasks.map(task => <article key={task.jobId} className="rounded-xl border p-4"><div className="flex justify-between gap-2"><strong>{task.label}</strong><Badge variant={task.job?.status === 'failed' ? 'destructive' : 'outline'}>{task.job?.status || 'missing'}</Badge></div><p className="mt-1 text-xs capitalize text-muted-foreground">{task.stage} · {task.job?.provider}</p><Progress className="mt-3" value={task.job?.progress || 0} /><p className="mt-2 text-xs text-muted-foreground">{task.job?.progressMessage}</p>{task.job?.lastError ? <p className="mt-2 flex gap-1 text-xs text-destructive"><AlertTriangle className="size-3.5 shrink-0" />{task.job.lastError}</p> : null}</article>)}</CardContent></Card>
    </> : null}

    <Card id="campaign-create"><CardHeader><CardTitle>{detail ? 'Crear otra campaña' : 'Nueva campaña coordinada'}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><div><Label>Campaña</Label><Input value={name} onChange={event => setName(event.target.value)} /></div><div><Label>Audiencia</Label><Input value={audience} onChange={event => setAudience(event.target.value)} placeholder="Emprendedores B2B" /></div><div><Label>Idioma</Label><Input value={language} onChange={event => setLanguage(event.target.value)} /></div></div><div><Label>Brief</Label><Textarea className="mt-1 min-h-40" value={brief} onChange={event => setBrief(event.target.value)} placeholder="Producto, problema, propuesta de valor, oferta, tono y CTA..." /></div><div className="grid gap-3 sm:grid-cols-4"><label className="text-sm font-medium">Brand Kit<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={brandKitId} onChange={event => setBrandKitId(event.target.value)}><option value="">Sin Brand Kit</option>{brandKits.map(kit => <option key={kit.id} value={kit.id}>{kit.name}</option>)}</select></label><Provider label="Imágenes" value={imageProvider} set={setImageProvider} options={providers.image} /><Provider label="Video" value={videoProvider} set={setVideoProvider} options={providers.video} /><Provider label="Landing y textos" value={textProvider} set={setTextProvider} options={providers.text} /></div><div className="rounded-xl border bg-muted/20 p-4"><p className="mb-3 text-sm font-bold">Presupuesto del proyecto <span className="font-normal text-muted-foreground">— deja vacío para no limitar</span></p><div className="grid gap-3 sm:grid-cols-4"><LabeledNumber label="Límite créditos" value={budgetLimitCredits} set={setBudgetLimitCredits} /><LabeledNumber label="Límite USD" value={budgetLimitUsd} set={setBudgetLimitUsd} /><LabeledNumber label="Aprobar desde créditos" value={approvalCredits} set={setApprovalCredits} /><LabeledNumber label="Aprobar desde USD" value={approvalUsd} set={setApprovalUsd} /></div></div>{!brandKits.length ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Palette className="size-4" />Todavía no tienes Brand Kits. Puedes crear la campaña y configurarlo después.</p> : null}<div className="flex flex-wrap items-center gap-3">{approvalRequired ? <Button onClick={() => void create(true)} disabled={busy} variant="destructive"><Check className="mr-2 size-4" />Aprobar costo y ejecutar</Button> : <Button onClick={() => void create()} disabled={busy || brief.trim().length < 20}><Play className="mr-2 size-4" />{busy ? 'Coordinando…' : 'Crear campaña completa'}</Button>}<span className="text-sm text-muted-foreground">6 trabajos · 11 créditos estimados</span>{error ? <span className="text-sm text-destructive">{error}</span> : null}</div></CardContent></Card>

    {history.length ? <Card><CardHeader><CardTitle>Campañas recientes</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">{history.map(item => <button key={item.id} onClick={() => void open(item.id)} className="flex w-full justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"><span>{item.name}</span><span className="text-xs text-muted-foreground">{item.count} entregables · {item.language}</span></button>)}</CardContent></Card> : null}
  </div>;
}

function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const colors = stage.status === 'complete' ? 'border-emerald-500/30 bg-emerald-500/5' : stage.status === 'blocked' ? 'border-destructive/40 bg-destructive/5' : stage.status === 'active' ? 'border-fuchsia-500/40 bg-fuchsia-500/5' : 'bg-muted/20';
  return <Card className={colors}><CardContent className="p-4"><div className="flex items-center justify-between"><span className="grid size-7 place-items-center rounded-full border text-xs font-bold">{stage.status === 'complete' ? <Check className="size-4" /> : index}</span><span className="text-xs font-black tabular-nums">{stage.progress}%</span></div><h3 className="mt-4 font-bold">{stage.label}</h3><p className="mt-1 min-h-8 text-xs text-muted-foreground">{stage.pending || 'Completado'}</p><Progress className="mt-3 h-1.5" value={stage.progress} /></CardContent></Card>;
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-xl border p-3"><span className="text-muted-foreground [&>svg]:size-4">{icon}</span><p className="mt-3 text-xl font-black">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>; }
function LabeledNumber({ label, value, set }: { label: string; value: string; set: (value: string) => void }) { return <label className="text-xs font-medium">{label}<Input className="mt-1" type="number" min="0" step="0.01" value={value} onChange={event => set(event.target.value)} /></label>; }
function Provider({ label, value, set, options }: { label: string; value: string; set: (value: string) => void; options: string[] }) { return <label className="text-sm font-medium">{label}<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={value} onChange={event => set(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
