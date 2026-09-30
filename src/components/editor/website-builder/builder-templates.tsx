'use client';

/**
 * Galería de plantillas del Website Builder.
 *
 * Muestra "Crear desde cero" + las plantillas por categoría. Cada tarjeta puede
 * previsualizarse (render real del `PageSchema`) y crearse. Las plantillas se
 * guardan como `PageSchema` válido y al crearlas se abre una copia editable.
 */

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { PageRenderer } from '@/components/editor/page-renderer';
import { createTemplateSchema, listPageTemplates, type TemplateId } from '@/lib/editor/page-templates';
import type { PageComposerDraftSummary } from '@/lib/page-composer-project';
import { Button } from '@/components/ui/button';
import { Crown, Eye, FilePlus2, FolderOpen, LockKeyhole, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function BuilderTemplates({
  locale,
  canUsePremium,
  projects,
  notice,
}: {
  locale: string;
  canUsePremium: boolean;
  projects: PageComposerDraftSummary[];
  notice?: string;
}) {
  const templates = listPageTemplates();
  const [previewId, setPreviewId] = useState<TemplateId | 'blank' | null>(null);
  const editorHref = (target: 'blank' | TemplateId) =>
    `/${locale}/page-composer/website/editor?template=${target}`;

  const previewSchema = previewId === null ? null : previewId === 'blank' ? null : createTemplateSchema(previewId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-[radial-gradient(circle_at_18%_0%,rgba(124,58,237,.18),transparent_36%)] px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-violet-500">Visual Website Builder</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Elige una plantilla o empieza desde cero.</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Cada plantilla es un PageSchema válido que puedes editar sección por sección. Las plantillas se
              previsualizan en vivo y se abren como una copia editable.
            </p>
            {notice ? <p className="mt-4 max-w-2xl rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200" role="status">{notice}</p> : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          {projects.length > 0 ? (
            <div className="mb-12">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-500">Mis proyectos</p><h2 className="mt-1 text-2xl font-black">Continúa donde lo dejaste</h2></div>
                <span className="text-xs text-muted-foreground">{projects.length} guardado{projects.length === 1 ? '' : 's'}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <article key={project.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                    <div className="relative h-40 overflow-hidden border-b bg-white" aria-label={`Vista del proyecto ${project.name}`}>
                      <div className="pointer-events-none absolute left-0 top-0 h-[312.5%] w-[312.5%] origin-top-left scale-[.32]" aria-hidden>
                        <PageRenderer schema={project.schema} />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-black">{project.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Actualizado {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(project.updatedAtIso))}</p>
                      <Button asChild className="mt-5 w-full" size="sm">
                        <Link href={`/${locale}/page-composer/website/editor?project=${encodeURIComponent(project.id)}`}>
                          <FolderOpen className="mr-1.5 size-4" />Continuar editando
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-500">Plantillas</p><h2 className="mt-1 text-2xl font-black">Crea un nuevo diseño</h2></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article className="flex flex-col overflow-hidden rounded-2xl border border-dashed bg-card">
              <div className="grid h-40 place-items-center bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px]">
                <span className="rounded-full border border-dashed bg-background/80 px-3 py-1 text-xs font-bold">Lienzo vacío</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-black">Crear desde cero</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">Una página vacía lista para que insertes secciones.</p>
                <Button asChild className="mt-5 w-full" size="sm">
                  <Link href={editorHref('blank')}>
                    <FilePlus2 className="mr-1.5 size-4" />
                    Crear
                  </Link>
                </Button>
              </div>
            </article>

            {templates.map(template => (
              <article key={template.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                <div className="relative h-40 overflow-hidden border-b bg-muted">
                  <Image src={template.imageUrl} alt={`Vista previa de ${template.label}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase shadow-lg ${template.access === 'premium' ? 'bg-violet-600 text-white' : 'bg-emerald-500 text-emerald-950'}`}>
                    {template.access === 'premium' ? <Crown className="size-3" /> : null}{template.access === 'premium' ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold text-violet-500">{template.category}</p>
                  <h3 className="mt-1 font-black">{template.label}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{template.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewId(template.id)}>
                      <Eye className="mr-1.5 size-3.5" />
                      Preview
                    </Button>
                    {template.access === 'free' || canUsePremium ? <Button asChild size="sm"><Link href={editorHref(template.id)}><Sparkles className="mr-1.5 size-3.5" />Usar plantilla</Link></Button> : <Button size="sm" disabled title="Disponible para Creator y Premium"><LockKeyhole className="mr-1.5 size-3.5" />Requiere Premium</Button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      {previewSchema ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3"
          onClick={() => setPreviewId(null)}
          role="dialog"
          aria-label={`Vista previa de la plantilla`}
        >
          <div
            className="flex h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
              <strong>{templates.find(template => template.id === previewId)?.label}</strong>
              <Button size="sm" variant="ghost" onClick={() => setPreviewId(null)}>
                Cerrar
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40">
              <PageRenderer schema={previewSchema} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
