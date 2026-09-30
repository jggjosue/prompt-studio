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
import { Button } from '@/components/ui/button';
import { Eye, FilePlus2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function BuilderTemplates({ locale }: { locale: string }) {
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
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
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
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-400/20 p-6 text-center">
                  <span className="text-sm font-black">{template.label}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold text-violet-500">{template.category}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{template.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewId(template.id)}>
                      <Eye className="mr-1.5 size-3.5" />
                      Preview
                    </Button>
                    <Button asChild size="sm">
                      <Link href={editorHref(template.id)}>
                        <Sparkles className="mr-1.5 size-3.5" />
                        Usar plantilla
                      </Link>
                    </Button>
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