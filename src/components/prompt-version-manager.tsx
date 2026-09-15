'use client';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GitCompareArrows, GitFork, History, RotateCcw, Save } from 'lucide-react';
import { changedLines } from '@/lib/prompt-versioning';

type Version = { id: string; version: number; content: string; note: string; action: 'saved'|'duplicated'|'restored'; basedOnVersion: number|null; modelSnapshot: string[]; createdAt: string };
type Props = { promptId: string; promptKind: 'image'|'video'|'web'; title: string; initialContent: string; modelSnapshot: string[]; locale: string };

export function PromptVersionManager(props: Props) {
  const es = props.locale.startsWith('es');
  const [draft, setDraft] = useState(props.initialContent), [note, setNote] = useState(''), [versions, setVersions] = useState<Version[]>([]), [selected, setSelected] = useState<number[]>([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const load = async () => { const response = await fetch(`/api/prompt-versions?promptId=${encodeURIComponent(props.promptId)}`); if (response.ok) setVersions((await response.json()).versions); };
  useEffect(() => { void load(); }, [props.promptId]);
  const comparison = useMemo(() => { if (selected.length !== 2) return []; const a = versions.find(v => v.version === selected[0]), b = versions.find(v => v.version === selected[1]); return a && b ? changedLines(a.content, b.content) : []; }, [selected, versions]);
  const create = async (action: Version['action'], source?: Version) => {
    setBusy(true); setMessage('');
    const content = source?.content ?? draft;
    const response = await fetch('/api/prompt-versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ promptId: props.promptId, promptKind: props.promptKind, title: props.title, content, note, action, basedOnVersion: source?.version ?? versions[0]?.version ?? null, modelSnapshot: props.modelSnapshot }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setDraft(content); setNote(''); setMessage(es ? `Versión ${data.version.version} creada.` : `Version ${data.version.version} created.`); await load(); } else setMessage(data.error || (es ? 'No se pudo guardar.' : 'Could not save.'));
    setBusy(false);
  };
  const toggle = (version: number) => setSelected(current => current.includes(version) ? current.filter(v => v !== version) : current.length < 2 ? [...current, version] : [current[1], version]);
  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><History className="size-5" />{es ? 'Versiones del prompt' : 'Prompt versions'}</CardTitle></CardHeader><CardContent className="space-y-4">
    <Textarea value={draft} onChange={event => setDraft(event.target.value)} className="min-h-40 font-mono text-xs" maxLength={20000} aria-label={es ? 'Borrador del prompt' : 'Prompt draft'} />
    <input value={note} onChange={event => setNote(event.target.value)} maxLength={300} placeholder={es ? 'Nota del cambio (opcional)' : 'Change note (optional)'} className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
    <div className="flex flex-wrap gap-2"><Button onClick={() => create('saved')} disabled={busy || !draft.trim()}><Save className="mr-2 size-4" />{es ? 'Guardar versión' : 'Save version'}</Button><span className="self-center text-sm text-muted-foreground">{message}</span></div>
    {versions.length > 0 && <div className="space-y-2"><p className="text-sm font-semibold">{es ? 'Historial' : 'History'} <span className="font-normal text-muted-foreground">· {es ? 'selecciona dos para comparar' : 'select two to compare'}</span></p>{versions.map(version => <div key={version.id} className={`rounded-lg border p-3 ${selected.includes(version.version) ? 'border-primary' : ''}`}><div className="flex flex-wrap items-center justify-between gap-2"><button onClick={() => toggle(version.version)} className="flex items-center gap-2 text-left"><Badge>v{version.version}</Badge><span className="text-sm">{version.note || version.action}</span><span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(version.createdAt))}</span></button><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => create('duplicated', version)} disabled={busy}><GitFork className="mr-1 size-4" />{es ? 'Duplicar' : 'Duplicate'}</Button><Button size="sm" variant="ghost" onClick={() => create('restored', version)} disabled={busy}><RotateCcw className="mr-1 size-4" />{es ? 'Restaurar' : 'Restore'}</Button></div></div></div>)}</div>}
    {selected.length === 2 && <div className="rounded-lg border bg-muted/30 p-3"><p className="mb-2 flex items-center gap-2 text-sm font-semibold"><GitCompareArrows className="size-4" />v{selected[0]} → v{selected[1]} · {comparison.length} {es ? 'líneas modificadas' : 'changed lines'}</p><div className="max-h-72 space-y-2 overflow-auto font-mono text-xs">{comparison.length ? comparison.map(change => <div key={change.line}><div className="text-red-600">− {change.line}: {change.before || '∅'}</div><div className="text-emerald-600">+ {change.line}: {change.after || '∅'}</div></div>) : <p>{es ? 'Sin diferencias.' : 'No differences.'}</p>}</div></div>}
  </CardContent></Card>;
}
