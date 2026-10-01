'use client';

import PageBuilderWorkspace from '@/components/page-builder/editor/page-builder-workspace';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTemplatePageSchema } from '@/lib/page-builder/templates';
import type { SourcePageTemplate } from '@/lib/page-builder/source-template-catalog';
import { ArrowLeft, Crown, Eye, Monitor, PencilLine, Search, Sparkles, Tablet, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Template = SourcePageTemplate & { blank?: boolean };

const BLANK_TEMPLATE: Template = { id: 'blank-canvas', name: 'Iniciar desde cero', category: 'Blank', description: 'Un lienzo vacío para crear tu propia página, sección por sección.', image: '', preview: '', tags: ['Blank', 'Custom', 'Libre'], assets: [], membership: 'Free', catalogId: null, blank: true };

function TemplateThumbnail({ template }: { template: Template }) {
  const [failed, setFailed] = useState(false);
  if (template.blank) return <div className="grid h-40 place-items-center bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px]"><span className="rounded-full border border-dashed bg-background/80 px-3 py-1 text-xs font-bold">Lienzo vacío</span></div>;
  if (failed) return <div className="grid h-40 place-items-center bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-400/20 p-6 text-center"><span className="text-sm font-black text-white">{template.name}</span></div>;
  return <div className="relative h-40 w-full"><Image src={template.image} alt={`Vista previa de ${template.name}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" onError={() => setFailed(true)} className="object-cover" /></div>;
}

export default function PageComposerEditorClient({ canEdit, templates: sourceTemplates, initialTemplateId, purchasedPages, canUsePremiumTemplates }: { canEdit: boolean; templates: SourcePageTemplate[]; initialTemplateId: string | null; purchasedPages: string[]; canUsePremiumTemplates: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [preview, setPreview] = useState<Template | null>(null);
  const [editing, setEditing] = useState<{ template: Template; showOriginal: boolean } | null>(() => {
    if (!initialTemplateId) return null;
    const template = sourceTemplates.find(item => item.id === initialTemplateId || item.catalogId === initialTemplateId);
    if (!template) return null;
    const isFree = template.membership.trim().toLowerCase() === 'free';
    const purchased = purchasedPages.includes(template.id) || Boolean(template.catalogId && purchasedPages.includes(template.catalogId));
    return isFree || purchased || canUsePremiumTemplates ? { template, showOriginal: true } : null;
  });
  const catalog = useMemo<Template[]>(() => [BLANK_TEMPLATE, ...sourceTemplates], [sourceTemplates]);
  // El árbol de la plantilla se crea una vez por selección. Sin esta memoria,
  // cualquier re-render de la galería podía reemplazar el borrador en curso.
  const editableSchema = useMemo(() => (editing ? createTemplatePageSchema(editing.template) : null), [editing]);
  const templates = useMemo(() => catalog.filter(template =>
    (category === 'Todas' || template.category === category) &&
    `${template.name} ${template.category} ${template.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  ), [catalog, category, query]);
  const categories = ['Todas', ...new Set(catalog.map(template => template.category))];
  const canUseTemplate = (template: Template) => template.blank || template.membership.trim().toLowerCase() === 'free' || canUsePremiumTemplates || purchasedPages.includes(template.id) || Boolean(template.catalogId && purchasedPages.includes(template.catalogId));
  const editTemplate = (template: Template, showOriginal: boolean) => {
    if (!canUseTemplate(template)) return;
    setEditing({ template, showOriginal });
    const params = new URLSearchParams(window.location.search);
    params.set('template', template.catalogId || template.id);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  if (editing) {
    return (
      <div className="flex min-h-screen flex-col bg-[#090a0f]">
        <Header />
        <main className="flex-1 px-3 py-3 sm:px-5 sm:py-5">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-white">
              <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => { setEditing(null); window.history.replaceState(null, '', window.location.pathname); }} aria-label="Volver a plantillas"><ArrowLeft className="size-4" /></Button><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">{editing.showOriginal ? 'Página original seleccionada' : 'Borrador desde plantilla'}</p><h1 className="text-sm font-bold">{editing.template.name}</h1></div></div>
              <span className="hidden text-xs text-zinc-400 sm:block">ID: {editing.template.catalogId || editing.template.id} · {editing.template.membership} · {editing.showOriginal ? `${editing.template.assets.length} assets locales` : 'PageSchema editable'}</span>
            </div>
            {editableSchema ? <PageBuilderWorkspace key={`${editing.template.id}-${editing.showOriginal ? 'original' : 'blocks'}`} name={`${editing.template.name} · Mi página`} initialSchema={editableSchema} sourcePreview={editing.showOriginal && !editing.template.blank ? { title: editing.template.name, url: `/webpages/${encodeURIComponent(editing.template.preview)}/index.html` } : undefined} /> : null}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background"><Header />
      <main className="flex-1"><section className="border-b bg-[radial-gradient(circle_at_18%_0%,rgba(124,58,237,.18),transparent_36%)] px-4 py-12"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-500">Page Composer</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Elige una plantilla y hazla tuya.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Las plantillas son inmutables. Al usar una se crea una copia estructurada que puedes editar, guardar y continuar después.</p></div></section>
        <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8"><div className="mb-6 flex flex-col gap-3"><div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={event => setQuery(event.target.value)} className="pl-9" placeholder="Buscar plantilla…" /></div><div className="flex gap-2 overflow-x-auto pb-2">{categories.map(item => <Button key={item} className="shrink-0" variant={category === item ? 'default' : 'outline'} size="sm" onClick={() => setCategory(item)}>{item}</Button>)}</div></div>
          {!canEdit ? <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4"><p className="text-sm">Esta funcionalidad está disponible para usuarios Premium.</p><Button asChild><Link href="/prices?plan=premium"><Crown className="mr-2 size-4"/>Actualizar a Premium</Link></Button></div> : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{templates.map(template => <article key={template.id} className="min-w-0 overflow-hidden rounded-2xl border bg-card"><TemplateThumbnail template={template} /><div className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-violet-500">{template.category}</p><h2 className="mt-1 truncate font-black">{template.name}</h2></div><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px]">{template.membership.trim().toLowerCase() === 'free' ? 'Free' : canUseTemplate(template) ? 'Premium · Disponible' : 'Premium'}</span></div><p className="mt-3 line-clamp-3 min-h-10 text-sm text-muted-foreground">{template.description}</p><div className="mt-3 flex flex-wrap gap-1">{template.tags.slice(0, 4).map(tag => <span key={tag} className="rounded bg-muted px-2 py-1 text-[10px]">{tag}</span>)}</div><div className="mt-5 flex flex-wrap gap-2">{template.blank ? null : <Button variant="outline" size="sm" onClick={() => setPreview(template)}><Eye className="mr-1.5 size-3.5"/>Preview</Button>}<Button variant="secondary" size="sm" disabled={!canUseTemplate(template)} onClick={() => editTemplate(template, !template.blank)}><PencilLine className="mr-1.5 size-3.5"/>Editar</Button><Button size="sm" disabled={!canUseTemplate(template)} onClick={() => editTemplate(template, false)}><Sparkles className="mr-1.5 size-3.5"/>Usar plantilla</Button></div></div></article>)}</div>
        </section></main><Footer />
      {preview ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-2 sm:p-3"><div className="flex h-[94dvh] w-[97vw] max-w-none flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"><div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b p-3"><strong className="min-w-0 flex-1 truncate">{preview.name}</strong><div className="flex items-center gap-1 text-muted-foreground"><Monitor className="size-4"/><Tablet className="size-4"/><Smartphone className="size-4"/></div><Button size="sm" disabled={!canUseTemplate(preview)} onClick={() => { editTemplate(preview, true); setPreview(null); }}><PencilLine className="mr-1.5 size-3.5"/>Editar</Button><Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Cerrar</Button></div><iframe title={`Vista previa de ${preview.name}`} src={`/webpages/${encodeURIComponent(preview.preview)}/index.html`} className="min-h-0 w-full flex-1 bg-white" /></div></div> : null}
    </div>
  );
}
