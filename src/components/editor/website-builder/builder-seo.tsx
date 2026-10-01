'use client';

/**
 * Gestión SEO de la página actual.
 *
 * Edita title, description, slug, canonical, Open Graph, index/noindex y datos
 * estructurados. Incluye "Generar SEO con IA": el resultado llega como patch
 * estructurado, se muestra **editable** y solo se guarda al pulsar "Guardar"
 * (deshacible).
 */

import { Search, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBuilder } from './builder-context';

type SeoPatch = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
};
type ErrorResponse = { error?: string; code?: string };

const inputClass =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export function BuilderSeo({ onClose }: { onClose: () => void }) {
  const builder = useBuilder();
  const page = builder.page;
  const [form, setForm] = useState<SeoPatch>(() => ({
    title: page?.seo?.title ?? '',
    description: page?.seo?.description ?? '',
    canonical: page?.seo?.canonical ?? '',
    ogTitle: page?.seo?.ogTitle ?? '',
    ogDescription: page?.seo?.ogDescription ?? '',
    ogImage: page?.seo?.ogImage ?? '',
    noIndex: page?.seo?.noIndex ?? false,
  }));
  const [slug, setSlug] = useState(page?.slug ?? '/');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estimateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (estimateTimer.current) clearTimeout(estimateTimer.current);
    };
  }, []);

  if (!page) return null;

  const set = <K extends keyof SeoPatch>(key: K, value: SeoPatch[K]) => setForm(current => ({ ...current, [key]: value }));

  const save = () => {
    const patch: SeoPatch = {
      title: form.title?.trim() || undefined,
      description: form.description?.trim() || undefined,
      canonical: form.canonical?.trim() || undefined,
      ogTitle: form.ogTitle?.trim() || undefined,
      ogDescription: form.ogDescription?.trim() || undefined,
      ogImage: form.ogImage?.trim() || undefined,
      noIndex: form.noIndex,
    };
    let failure = saveAsDefault ? builder.applySiteSeo(patch) : builder.applyPageSeo(patch);
    if (!failure && slug !== page.slug) failure = builder.changePageSlug(slug.trim());
    if (failure) setError(failure.message);
    else onClose();
  };

  const generateSeo = async () => {
    if (!aiPrompt.trim() || aiBusy) return;
    setAiBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/page-composer/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: aiPrompt,
          pageContext: { name: page.name, slug: page.slug, seo: page.seo },
          hostname: `${builder.siteId ? 'sitio' : 'sitio'}.prompstudio.com`,
        }),
      });
      const data = (await response.json()) as { seo?: SeoPatch } | ErrorResponse;
      if (!response.ok || !('seo' in data) || !data.seo) {
        setError((data as ErrorResponse).error ?? 'No se pudo generar SEO.');
        return;
      }
      // El resultado es editable: rellena el formulario, el usuario lo revisa.
      setForm(current => ({ ...current, ...data.seo }));
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex max-h-[92dvh] w-full max-w-xl flex-col rounded-2xl bg-background shadow-2xl"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-label="SEO de la página"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <strong className="flex items-center gap-2">
            <Search className="size-4 text-violet-500" />
            SEO · {page.name}
          </strong>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">Ruta (slug)</span>
            <input value={slug} onChange={event => setSlug(event.target.value)} className={inputClass} placeholder="/" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">Título ({form.title?.length ?? 0}/70)</span>
            <input value={form.title ?? ''} onChange={event => set('title', event.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">Meta descripción ({form.description?.length ?? 0}/165)</span>
            <textarea
              value={form.description ?? ''}
              onChange={event => set('description', event.target.value)}
              rows={3}
              className={`${inputClass} h-auto resize-y py-1.5`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">Canonical (vacío = automática)</span>
            <input value={form.canonical ?? ''} onChange={event => set('canonical', event.target.value)} className={inputClass} placeholder="https://tu-dominio.com/" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">OG título</span>
              <input value={form.ogTitle ?? ''} onChange={event => set('ogTitle', event.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">OG descripción</span>
              <input value={form.ogDescription ?? ''} onChange={event => set('ogDescription', event.target.value)} className={inputClass} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">OG imagen</span>
            <input value={form.ogImage ?? ''} onChange={event => set('ogImage', event.target.value)} className={inputClass} placeholder="/images/… o https://…" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={form.noIndex === true} onChange={event => set('noIndex', event.target.checked)} className="accent-violet-600" />
            No indexar esta página (noindex)
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={saveAsDefault} onChange={event => setSaveAsDefault(event.target.checked)} className="accent-violet-600" />
            Usar estos valores como predeterminados del sitio
          </label>
          <p className="-mt-2 text-[10px] text-muted-foreground">
            Las páginas sin un valor propio heredarán estos datos. El SEO de esta página mantiene prioridad si ya tiene un override.
          </p>

          <div className="rounded-md border border-violet-500/25 bg-violet-500/5 p-3">
            <p className="text-[11px] font-bold text-violet-500">Generar SEO con IA</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={aiPrompt}
                onChange={event => setAiPrompt(event.target.value)}
                placeholder="p. ej. «SEO para una cafetería en México»"
                className={inputClass}
              />
              <button
                type="button"
                onClick={generateSeo}
                disabled={aiBusy || !aiPrompt.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              >
                <Sparkles className="size-3.5" />
                {aiBusy ? 'Generando…' : 'Generar'}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              El resultado se rellena aquí y es editable antes de guardar.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {saveAsDefault ? 'Guardar predeterminados' : 'Guardar SEO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
