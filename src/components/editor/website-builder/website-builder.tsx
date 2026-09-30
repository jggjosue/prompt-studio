'use client';

/**
 * Editor visual: layout de tres columnas + barra superior, con DnD de @dnd-kit.
 *
 * El arrastre se resuelve siempre contra un hueco (`slot`) que codifica
 * `{ parentId, index }`. Al soltar, el gesto se traduce en una mutación pura de
 * PageSchema (`addComponent` / `moveExisting`), que es la única forma en que el
 * documento cambia. Un soltar inválido simplemente no hace nada.
 */

import type { PageComponentType, SiteSchema } from '@/lib/editor/page-schema';
import { isSectionId } from '@/lib/editor/page-sections';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { BuilderProvider, useBuilder } from './builder-context';
import { BuilderAIEdit } from './builder-ai-edit';
import { BuilderCanvas } from './builder-canvas';
import { BuilderLibrary } from './builder-library';
import { BuilderProperties } from './builder-properties';
import { BuilderToolbar } from './builder-toolbar';

type DragData = {
  source?: string;
  type?: PageComponentType;
  nodeId?: string;
  sectionId?: string;
  label?: string;
};

type SlotTarget = { kind?: string; parentId?: string | null; index?: number };

function EditorShell() {
  const builder = useBuilder();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (!data) return;
    if (data.source === 'library' && data.type) {
      builder.setDrag({ source: 'library', type: data.type, label: data.label ?? data.type });
    } else if (data.source === 'section' && isSectionId(data.sectionId)) {
      builder.setDrag({ source: 'section', sectionId: data.sectionId, label: data.label ?? data.sectionId });
    } else if (data.source === 'node' && data.nodeId) {
      builder.setDrag({
        source: 'node',
        nodeId: data.nodeId,
        type: data.type ?? 'container',
        label: data.label ?? data.nodeId,
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    builder.setDrag(null);
    if (!over) return;

    const target = over.data.current as SlotTarget | undefined;
    if (target?.kind !== 'slot') return;

    const data = active.data.current as DragData | undefined;
    if (!data) return;

    const destination = { parentId: target.parentId ?? null, index: target.index ?? 0 };
    if (data.source === 'section' && isSectionId(data.sectionId)) {
      builder.insertSection(data.sectionId, destination);
    } else if (data.source === 'library' && data.type) {
      builder.addComponent(data.type, destination);
    } else if (data.source === 'node' && data.nodeId) {
      builder.moveExisting(data.nodeId, destination);
    }
  };

  const onDragCancel = () => builder.setDrag(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <BuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          <BuilderLibrary />
          <BuilderCanvas />
          <BuilderProperties />
        </div>
      </div>

      <DragOverlay>
        {builder.drag ? (
          <div className="rounded-md border border-primary bg-background px-3 py-2 text-sm font-medium text-foreground shadow-lg">
            {builder.drag.label}
          </div>
        ) : null}
      </DragOverlay>

      {builder.aiEditTarget ? <BuilderAIEdit /> : null}
    </DndContext>
  );
}

export function WebsiteBuilder({
  initialSchema,
  initialSlug,
  projectId,
  initialVersion,
}: {
  initialSchema?: SiteSchema;
  initialSlug?: string;
  projectId?: string;
  initialVersion?: number | null;
}) {
  return (
    <BuilderProvider
      initialSchema={initialSchema}
      initialSlug={initialSlug}
      projectId={projectId}
      initialVersion={initialVersion}
    >
      <EditorShell />
    </BuilderProvider>
  );
}
