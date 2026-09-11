'use client';

import { Button } from '@/components/ui/button';
import { buildImageModelPromptVariants, type ImagePromptModel } from '@/lib/image-model-prompt-variants';
import { Check, Copy, Cpu, Download } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = { prompt: string; negative: string; ratio: string; realism: number };

export function ModelPromptVariants(props: Props) {
  const variants = useMemo(() => buildImageModelPromptVariants(props), [props]);
  const [active, setActive] = useState<ImagePromptModel>('gpt-image');
  const [copied, setCopied] = useState('');
  if (!props.prompt.trim()) return null;
  const selected = variants.find(item => item.id === active) ?? variants[0];
  const copy = async (value: string, id: string) => { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(''), 1600); };
  const download = () => {
    const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), variants }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'prompt-variants.json'; anchor.click(); URL.revokeObjectURL(url);
  };
  return <section className="overflow-hidden rounded-xl border border-indigo-500/25 bg-indigo-500/5"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Cpu className="size-4 text-indigo-600" /><div><h3 className="text-sm font-bold">Compatibilidad por modelo</h3><p className="text-xs text-muted-foreground">Seis versiones adaptadas, no una copia idéntica.</p></div></div><Button type="button" variant="outline" size="sm" onClick={download}><Download className="mr-2 size-3.5" />Descargar todas</Button></div><div className="flex gap-1 overflow-x-auto border-b bg-background/60 p-2">{variants.map(item => <button key={item.id} type="button" onClick={() => setActive(item.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${active === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-muted'}`}>{item.name}</button>)}</div><div className="p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{selected.name}</p><p className="text-xs text-muted-foreground">{selected.note}</p></div><Button type="button" variant="outline" size="sm" onClick={() => void copy(selected.prompt, selected.id)}>{copied === selected.id ? <Check className="mr-2 size-3.5 text-emerald-600" /> : <Copy className="mr-2 size-3.5" />}{copied === selected.id ? 'Copiado' : 'Copiar'}</Button></div><pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-xs leading-5 text-zinc-200"><code>{selected.prompt}</code></pre></div></section>;
}
