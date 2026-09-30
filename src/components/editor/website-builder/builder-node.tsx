'use client';

/**
 * Nodo del lienzo.
 *
 * Envuelve cada componente del catálogo con la capa de edición: selección,
 * controles (subir, bajar, duplicar, borrar), asa de arrastre y los huecos entre
 * hermanos donde se puede soltar. El componente en sí se renderiza con el
 * registro, así que lo que se ve editando es exactamente lo que se publica.
 */

import { componentTokens, getPageComponent, withDefaultProps } from '@/components/editor/page-components';
import type { PageComponentType, PageNode } from '@/lib/editor/page-schema';
import type { OpsError } from '@/lib/editor/page-schema-ops';
import { resolveNodeStyles, styleMapToCssProperties } from '@/lib/editor/responsive';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ArrowDown, ArrowUp, Copy, GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { createElement, Fragment, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { nodeLabel, useBuilder } from './builder-context';

/** Identificador estable de un hueco de soltar. */
export function slotId(parentId: string | null, index: number): string {
  return `slot:${parentId ?? 'root'}:${index}`;
}

/**
 * Hueco entre hermanos: un índice de inserción en la lista del padre.
 *
 * Cuando el arrastre pasa por encima se ilumina en verde si el tipo es compatible
 * y en rojo si no, para que el usuario sepa antes de soltar si el gesto tendrá
 * efecto. Es la zona de "insertar entre secciones" y de anidación.
 */
export function DropSlot({ parentId, index, empty = false }: { parentId: string | null; index: number; empty?: boolean }) {
  const builder = useBuilder();
  const { setNodeRef, isOver } = useDroppable({ id: slotId(parentId, index), data: { kind: 'slot', parentId, index } });
  const drag = builder.drag;
  let error: OpsError | null = null;
  if (drag?.source === 'library') error = builder.previewInsert(drag.type, { parentId, index });
  else if (drag?.source === 'section') error = builder.previewSectionInsert(drag.sectionId, { parentId, index });
  else if (drag?.source === 'node') error = builder.previewMove(drag.nodeId, { parentId, index });

  const valid = error === null;
  const active = isOver && drag !== null;

  if (empty) {
    return (
      <div
        ref={setNodeRef}
        className={`flex min-h-16 items-center justify-center rounded-lg border-2 border-dashed text-xs transition-colors ${
          active
            ? valid
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-destructive bg-destructive/10 text-destructive'
            : 'border-border/70 text-muted-foreground'
        }`}
      >
        {active ? (valid ? 'Suelta aquí' : 'No compatible') : 'Suelta un componente aquí'}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className={`relative h-1.5 rounded-full transition-all ${
        active ? (valid ? 'h-2.5 bg-primary/80' : 'h-2.5 bg-destructive/80') : 'bg-border/50'
      }`}
    />
  );
}

/** Asa de arrastre: único puntero que inicia el drag, para no robar clics al nodo. */
function DragHandle({ id, type, label }: { id: string; type: PageComponentType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `node:${id}`,
    data: { source: 'node', nodeId: id, type, label },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label={`Arrastrar ${label}`}
      className={`absolute top-1 left-1 z-20 cursor-grab rounded border border-border bg-background/95 p-1 text-muted-foreground shadow-sm transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing ${
        isDragging ? 'opacity-40' : 'opacity-0 group-hover:opacity-100'
      }`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden />
    </div>
  );
}

function NodeChrome({ node }: { node: PageNode }) {
  const builder = useBuilder();
  const label = nodeLabel(node);
  const stop = (event: MouseEvent) => event.stopPropagation();

  return (
    <div
      className="absolute -top-3 right-2 z-20 flex items-center gap-0.5 rounded-md border border-border bg-background/95 p-0.5 shadow-sm"
      onMouseDown={stop}
      onClick={stop}
    >
      <span className="px-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">{label}</span>
      <button
        type="button"
        onClick={() => builder.openAIEdit(node.id)}
        className="rounded p-1 text-violet-500 hover:bg-violet-500/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Editar ${label} con IA`}
        title="Editar con IA"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => builder.move(node.id, -1)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Subir ${label}`}
      >
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => builder.move(node.id, 1)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Bajar ${label}`}
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => builder.duplicate(node.id)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Duplicar ${label}`}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => builder.remove(node.id)}
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Eliminar ${label}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function BuilderNode({ node }: { node: PageNode }) {
  const builder = useBuilder();
  const definition = getPageComponent(node.type);
  const selected = builder.selectedId === node.id;
  const dragging = builder.drag?.source === 'node' && builder.drag.nodeId === node.id;

  if (!definition) return null;

  const tokens = componentTokens(builder.page?.theme ?? builder.schema.site.theme);
  const resolvedStyles = styleMapToCssProperties(resolveNodeStyles(node, builder.device));
  const childContent: ReactNode = definition.allowedChildren.length
    ? createElement(
        Fragment,
        null,
        ...node.children.flatMap((child, childIndex) => [
          <DropSlot key={`slot-${child.id}`} parentId={node.id} index={childIndex} />,
          <BuilderNode key={child.id} node={child} />,
        ]),
        <DropSlot key="slot-last" parentId={node.id} index={node.children.length} empty={node.children.length === 0} />
      )
    : undefined;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      builder.select(node.id);
    } else if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      builder.move(node.id, -1);
    } else if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      builder.move(node.id, 1);
    } else if (event.altKey && (event.key === 'd' || event.key === 'D')) {
      event.preventDefault();
      builder.duplicate(node.id);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      builder.remove(node.id);
    } else if (event.key === 'Escape') {
      builder.select(null);
    }
  };

  return (
    <div
      data-ps-id={node.id}
      data-ps-type={node.type}
      style={resolvedStyles}
      role="group"
      tabIndex={0}
      aria-label={`${nodeLabel(node)} (${node.type})`}
      onClick={event => {
        event.stopPropagation();
        builder.select(node.id);
      }}
      onFocus={() => builder.select(node.id)}
      onKeyDown={onKeyDown}
      className={`group relative cursor-pointer rounded-md outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/40'
      } ${dragging ? 'opacity-40' : ''}`}
    >
      <DragHandle id={node.id} type={node.type} label={nodeLabel(node)} />
      {selected ? <NodeChrome node={node} /> : null}
      {createElement(
        definition.component,
        {
          node: { ...node, props: withDefaultProps(node.type, node.props) },
          tokens,
          breakpoint: builder.device,
        },
        childContent
      )}
    </div>
  );
}

/** Sección de primer nivel: hueco previo, nodo y hueco posterior. */
export function BuilderSection({ node, index, total }: { node: PageNode; index: number; total: number }) {
  return (
    <>
      <DropSlot parentId={null} index={index} />
      <BuilderNode node={node} />
      {index === total - 1 ? <DropSlot parentId={null} index={total} /> : null}
    </>
  );
}
