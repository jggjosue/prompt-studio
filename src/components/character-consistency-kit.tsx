'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { Check, Copy, Crown, Download, ScanFace, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = { basePrompt: string; hasReference: boolean; onUse: (prompt: string) => void };
type Dimension = 'Pose' | 'Escenario' | 'Emoción' | 'Outfit' | 'Ángulo' | 'Campaña';
const DEFAULTS: Array<[Dimension, string]> = [
  ['Pose', 'dynamic three-quarter pose with natural body language'],
  ['Escenario', 'new cinematic environment with lighting consistent with the character'],
  ['Emoción', 'clear joyful expression while preserving facial proportions and identity'],
  ['Outfit', 'new premium outfit fitted naturally to the same body and proportions'],
  ['Ángulo', 'alternate profile camera angle preserving all recognizable facial features'],
  ['Campaña', 'cohesive commercial campaign key visual with reusable brand composition'],
];

export function CharacterConsistencyKit({ basePrompt, hasReference, onUse }: Props) {
  const { ready, canAccessMembership, requestAccess } = useMembershipAccess();
  const [character, setCharacter] = useState('');
  const [copied, setCopied] = useState('');
  const hasPremium = ready && canAccessMembership('Premium');
  const prompts = useMemo(() => DEFAULTS.map(([type, direction]) => ({ type, prompt: `${basePrompt || 'Create a professional character image'}. CHARACTER ANCHOR: ${character || 'preserve the exact same character from the visual reference'}, including facial geometry, skin tone, hair, age, body proportions, and distinctive features. VARIATION — ${type}: ${direction}. Do not redesign, recast, or merge the character with another identity.` })), [basePrompt, character]);
  const download = () => {
    const blob = new Blob([JSON.stringify({ characterAnchor: character, prompts }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'character-consistency-kit.json'; anchor.click(); URL.revokeObjectURL(url);
  };

  if (!hasPremium) return <section className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-background p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="rounded-lg bg-violet-600 p-2 text-white"><Crown className="size-5" /></span><div><div className="flex items-center gap-2"><h3 className="font-bold">Kit de consistencia de personajes</h3><span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">PREMIUM</span></div><p className="mt-1 text-xs text-muted-foreground">Mantén la identidad en poses, escenarios, emociones, outfits, ángulos y campañas.</p></div></div><Button type="button" disabled={!ready} onClick={() => requestAccess('Premium')} className="bg-violet-600 text-white hover:bg-violet-700"><Crown className="mr-2 size-4" />Desbloquear Premium</Button></div></section>;

  return <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-2"><ScanFace className="mt-0.5 size-5 text-violet-600" /><div><div className="flex items-center gap-2"><h3 className="text-sm font-bold">Kit de consistencia de personajes</h3><span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">PREMIUM</span></div><p className="mt-1 text-xs text-muted-foreground">Seis variaciones ancladas a una misma identidad visual.</p></div></div><Button type="button" variant="outline" size="sm" onClick={download}><Download className="mr-2 size-3.5" />Exportar kit</Button></div>{!hasReference ? <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"><Sparkles className="mr-1 inline size-3.5" />Sube primero una referencia visual para obtener continuidad real entre generaciones.</div> : null}<Input value={character} onChange={event => setCharacter(event.target.value)} placeholder="Rasgos invariables opcionales: cabello, edad, vestuario base…" className="mb-4 bg-background text-xs" /><div className="grid gap-2 sm:grid-cols-2">{prompts.map(item => <article key={item.type} className="rounded-lg border bg-background p-3"><div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-bold text-violet-700 dark:text-violet-300">{item.type}</h4><button type="button" title="Copiar" onClick={async () => { await navigator.clipboard.writeText(item.prompt); setCopied(item.type); }} className="rounded p-1 text-muted-foreground hover:bg-muted">{copied === item.type ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}</button></div><p className="line-clamp-3 text-[11px] leading-5 text-muted-foreground">{item.prompt}</p><Button type="button" variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" disabled={!hasReference} onClick={() => onUse(item.prompt)}>Usar esta variante</Button></article>)}</div><p className="mt-3 text-[11px] text-muted-foreground">La consistencia depende del modelo. El kit reduce variaciones accidentales, pero no garantiza coincidencia biométrica exacta.</p></section>;
}
