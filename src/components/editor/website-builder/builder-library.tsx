'use client';

import { useDraggable } from '@dnd-kit/core';
import { listPageComponents, type PageComponentDefinition } from '@/components/editor/page-components';
import { PageRenderer } from '@/components/editor/page-renderer';
import { createSectionPreviewSchema, listPageSections, type SectionDefinition, type SectionId } from '@/lib/editor/page-sections';
import { Eye, GripVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { useBuilder } from './builder-context';

const CATEGORY_LABELS: Record<PageComponentDefinition['category'], string> = {
  structure: 'Estructura',
  navigation: 'Navegación',
  typography: 'Tipografía',
  media: 'Medios',
  conversion: 'Conversión',
  'social-proof': 'Prueba social',
};

const CATEGORY_ORDER: readonly PageComponentDefinition['category'][] = [
  'structure',
  'navigation',
  'typography',
  'media',
  'conversion',
  'social-proof',
];

function LibraryItem({ definition }: { definition: PageComponentDefinition }) {
  const builder = useBuilder();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib:${definition.type}`,
    data: { source: 'library', type: definition.type, label: definition.label },
  });

  const append = () => {
    builder.addComponent(definition.type, {
      parentId: null,
      index: builder.page?.sections.length ?? 0,
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`group flex items-start gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/50 hover:bg-accent ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
        aria-label={`Arrastrar ${definition.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-foreground">{definition.label}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{definition.description}</span>
      </span>
      <button
        type="button"
        onClick={append}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group-hover:opacity-100"
        aria-label={`Añadir ${definition.label} al final de la página`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function SectionItem({ definition, onPreview }: { definition: SectionDefinition; onPreview: (sectionId: SectionId) => void }) {
  const builder = useBuilder();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sec:${definition.id}`,
    data: { source: 'section', sectionId: definition.id, label: definition.label },
  });

  const append = () => {
    builder.insertSection(definition.id, {
      parentId: null,
      index: builder.page?.sections.length ?? 0,
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`group flex items-start gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/50 hover:bg-accent ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
        aria-label={`Arrastrar sección ${definition.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-foreground">{definition.label}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{definition.description}</span>
      </span>
      <button
        type="button"
        onClick={() => onPreview(definition.id)}
        className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Vista previa de ${definition.label}`}
        title="Vista previa"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={append}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group-hover:opacity-100"
        aria-label={`Añadir sección ${definition.label} al final`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function BuilderLibrary() {
  const definitions = listPageComponents();
  const sections = listPageSections();
  const [previewId, setPreviewId] = useState<SectionId | null>(null);
  const grouped = CATEGORY_ORDER.map(category => ({
    category,
    items: definitions.filter(definition => definition.category === category),
  })).filter(group => group.items.length > 0);

  const previewSchema = previewId ? createSectionPreviewSchema(previewId) : null;

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-muted/30">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Biblioteca</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">Arrastra al lienzo o pulsa + para añadir al final.</p>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <section className="flex flex-col gap-1.5">
          <h3 className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Secciones</h3>
          <div className="flex flex-col gap-1">
            {sections.map(definition => (
              <SectionItem key={definition.id} definition={definition} onPreview={setPreviewId} />
            ))}
          </div>
        </section>

        {grouped.map(group => (
          <section key={group.category} className="flex flex-col gap-1.5">
            <h3 className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[group.category]}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map(definition => (
                <LibraryItem key={definition.type} definition={definition} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {previewSchema ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setPreviewId(null)}
          role="dialog"
          aria-label={`Vista previa de ${previewId}`}
        >
          <div
            className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <strong>{sections.find(section => section.id === previewId)?.label}</strong>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Cerrar
              </button>
            </div>
            <div className="bg-muted/40">
              <PageRenderer schema={previewSchema} />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
