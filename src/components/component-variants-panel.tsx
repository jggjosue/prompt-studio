'use client';

import type { ComponentExportConfig } from '@/components/component-export-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { Check, Copy, Download, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Framework = 'react' | 'next' | 'html' | 'vue';
type Density = 'minimal' | 'premium';
type Viewport = 'desktop' | 'mobile';

const clamp = (value: number) => Math.max(0, Math.min(255, value));
const adjust = (hex: string, amount: number) => {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#7c3aed';
  const number = Number.parseInt(normalized.slice(1), 16);
  return `#${[number >> 16, (number >> 8) & 255, number & 255].map(channel => clamp(channel + amount).toString(16).padStart(2, '0')).join('')}`;
};
const text = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('{', '&#123;').replaceAll('}', '&#125;');

function generateCode(config: ComponentExportConfig, framework: Framework, dark: boolean, viewport: Viewport, density: Density, motion: boolean, brand: string) {
  const palette = { primary: brand, light: adjust(brand, 48), dark: adjust(brand, -48), background: dark ? '#09090b' : '#f8fafc', foreground: dark ? '#f8fafc' : '#111827' };
  const radius = density === 'premium' ? Math.max(config.radius, 24) : Math.min(config.radius, 12);
  const width = viewport === 'mobile' ? '390px' : '1120px';
  const markup = `<article class="variant-card"><span>${text(config.title)}</span><h2>${text(config.heading)}</h2><p>${text(config.body)}</p><button>${text(config.cta)}</button></article>`;
  const css = `.variant-shell{--primary:${palette.primary};--primary-light:${palette.light};--primary-dark:${palette.dark};max-width:${width};margin:auto;padding:${density === 'premium' ? config.spacing * 1.5 : config.spacing}px;background:${palette.background};color:${palette.foreground};font-family:${config.font},Arial,sans-serif}.variant-card{padding:${density === 'premium' ? config.spacing * 1.25 : config.spacing}px;border:1px solid ${palette.primary}55;border-radius:${radius}px;background:${dark ? '#ffffff0a' : '#ffffff'};${density === 'premium' ? `box-shadow:0 28px 80px ${palette.primary}30;background-image:radial-gradient(circle at top right,${palette.light}22,transparent 45%);` : ''}}.variant-card span{color:var(--primary);font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.18em}.variant-card button{min-height:44px;margin-top:1rem;padding:.75rem 1.25rem;border:0;border-radius:${Math.max(6, radius / 2)}px;color:white;font-weight:800;background:linear-gradient(100deg,var(--primary),var(--primary-dark));${motion ? 'transition:transform .25s,filter .25s' : ''}}${motion ? '.variant-card button:hover{transform:translateY(-3px);filter:brightness(1.08)}@media(prefers-reduced-motion:reduce){.variant-card button{transition:none}}' : ''}`;
  if (framework === 'html') return `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main class="variant-shell">${markup}</main></body></html>`;
  if (framework === 'vue') return `<template><main class="variant-shell">${markup}</main></template>\n\n<style scoped>\n${css}\n</style>`;
  const directive = framework === 'next' ? `'use client';\n\n` : '';
  return `${directive}export default function ComponentVariant(){return <main className="variant-shell"><article className="variant-card"><span>${text(config.title)}</span><h2>${text(config.heading)}</h2><p>${text(config.body)}</p><button>${text(config.cta)}</button></article><style>{\`${css}\`}</style></main>}`;
}

export default function ComponentVariantsPanel({ config }: { config: ComponentExportConfig }) {
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const { runWithAccess } = useMembershipAccess();
  const [framework, setFramework] = useState<Framework>('next');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [density, setDensity] = useState<Density>('premium');
  const [dark, setDark] = useState(config.dark);
  const [motion, setMotion] = useState(config.motion);
  const [brand, setBrand] = useState(config.primary);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setBrand(config.primary); setDark(config.dark); setMotion(config.motion); }, [config.id, config.primary, config.dark, config.motion]);
  const palettes = useMemo(() => [
    { name: 'Marca', value: brand },
    { name: 'Más clara', value: adjust(brand, 48) },
    { name: 'Más profunda', value: adjust(brand, -48) },
    { name: 'Complemento', value: `#${(0xffffff ^ Number.parseInt(brand.slice(1), 16)).toString(16).padStart(6, '0')}` },
  ], [brand]);
  const code = generateCode(config, framework, dark, viewport, density, motion, brand);
  const variants = useMemo(() => {
    const result: Record<string, string> = {};
    for (const target of ['react', 'next', 'html', 'vue'] as Framework[])
      for (const theme of [false, true])
        for (const screen of ['desktop', 'mobile'] as Viewport[])
          for (const style of ['minimal', 'premium'] as Density[])
            for (const animated of [false, true]) {
              const key = `${target}-${theme ? 'dark' : 'light'}-${screen}-${style}-${animated ? 'motion' : 'static'}`;
              result[key] = generateCode(config, target, theme, screen, style, animated, brand);
            }
    return result;
  }, [config, brand]);
  const copy = async () => { const result = await copyWithDailyLimit(() => copyToClipboard(code)); if (result === 'copied') { setCopied(true); window.setTimeout(() => setCopied(false), 1600); } };
  const downloadBatch = () => runWithAccess('Premium', () => {
    const payload = JSON.stringify({ component: config.id, brand, generatedAt: new Date().toISOString(), palettes, variants }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${config.id}-64-variants.json`; anchor.click(); URL.revokeObjectURL(url);
  });
  return <div className="rounded-xl border bg-muted/30 p-3">
    <div className="flex items-center justify-between"><p className="text-xs font-black">Variantes automáticas</p><Badge variant="outline">64</Badge></div>
    <p className="mt-1 text-[10px] text-muted-foreground">Combina tema, dispositivo, acabado, movimiento y framework.</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Select value={framework} onValueChange={value => setFramework(value as Framework)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{['react', 'next', 'html', 'vue'].map(value => <SelectItem key={value} value={value}>{value === 'next' ? 'Next.js' : value.toUpperCase()}</SelectItem>)}</SelectContent></Select>
      <Select value={viewport} onValueChange={value => setViewport(value as Viewport)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desktop">Desktop</SelectItem><SelectItem value="mobile">Móvil</SelectItem></SelectContent></Select>
      <Select value={density} onValueChange={value => setDensity(value as Density)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="minimal">Minimalista</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent></Select>
      <Input aria-label="Color de marca" type="color" className="h-9 p-1" value={brand} onChange={event => setBrand(event.target.value)} />
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2"><label className="flex items-center justify-between rounded-lg border px-2 py-1.5 text-[10px] font-bold">Oscuro<Switch checked={dark} onCheckedChange={setDark} /></label><label className="flex items-center justify-between rounded-lg border px-2 py-1.5 text-[10px] font-bold">Animación<Switch checked={motion} onCheckedChange={setMotion} /></label></div>
    <div className="mt-2 flex gap-1">{palettes.map(item => <button key={item.name} title={item.name} aria-label={`Usar ${item.name}`} className="h-7 flex-1 rounded-md border" style={{ background: item.value }} onClick={() => setBrand(item.value)} />)}</div>
    <pre className="mt-3 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-3 text-[9px] leading-4 text-zinc-200">{code}</pre>
    <div className="mt-2 grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={() => void copy()}>{copied ? <Check className="mr-1 size-3.5" /> : <Copy className="mr-1 size-3.5" />}{copied ? 'Copiado' : 'Copiar variante'}</Button><Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={downloadBatch}><Download className="mr-1 size-3.5" />Lote completo</Button></div>
    <p className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground"><WandSparkles className="size-3" />El lote Premium incluye 64 combinaciones y cuatro paletas de marca.</p>
  </div>;
}
