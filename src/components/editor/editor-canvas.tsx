'use client';

import { useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { NodeView } from '@/components/editor/node-view';
import { ancestorsOf, nodeLabel } from '@/lib/editor/document';
import { autoScrollDelta, hasEditorDrag, readEditorDrag } from '@/lib/editor/drag';
import { DARK_TOKENS, DEFAULT_TOKENS, resolveToken } from '@/lib/editor/tokens';
import { Copy, Lock, LockOpen, Trash2, Unlink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useCallback, useRef } from 'react';

/** Ancho del marco por breakpoint: el mismo que anuncia la barra superior. */
export const VIEWPORT_WIDTH = { desktop: 1440, laptop: 1024, tablet: 768, mobile: 375 } as const;

/**
 * Lienzo del editor.
 *
 * Tres responsabilidades y ninguna más: encuadrar el documento al ancho del
 * breakpoint, aplicar el zoom, y ofrecer una zona de soltado para el hueco final
 * (soltar «al fondo» de la página). Todo lo demás lo resuelve cada `NodeView`,
 * que es lo que permite que arrastrar un nodo no repinte el resto.
 */
export function EditorCanvas({ showCoordinates = false }: { showCoordinates?: boolean }) {
  const store = useEditorStore();
  const rootId = useEditor(state => state.document.rootId);
  const rootChildren = useEditor(state => state.document.nodes[state.document.rootId]?.children ?? []);
  const breakpoint = useEditor(state => state.editor.breakpoint);
  const zoom = useEditor(state => state.editor.zoom);
  const preview = useEditor(state => state.editor.preview);
  const dark = useEditor(state => state.editor.darkCanvas);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const tokens = dark ? DARK_TOKENS : DEFAULT_TOKENS;

  /** Autoscroll: al arrastrar cerca del borde, el lienzo se desplaza solo. */
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!hasEditorDrag(event)) return;
      event.preventDefault();
      const container = scrollRef.current;
      if (!container) return;
      const delta = autoScrollDelta(container.getBoundingClientRect(), event.clientY);
      if (delta === 0) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      if (rafRef.current !== null) return;
      const step = () => {
        container.scrollTop += delta;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    []
  );

  const stopAutoScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="relative h-full overflow-auto bg-[#0b0c10] p-8"
      onDragEnter={event => {
        if (hasEditorDrag(event)) event.preventDefault();
      }}
      onDragOver={handleDragOver}
      onDragLeave={stopAutoScroll}
      onDrop={event => {
        stopAutoScroll();
        // Soltar en el fondo del lienzo = añadir al final de la página.
        // Debe ejecutarse antes de leer datos: sin preventDefault el navegador
        // puede interpretar `text/plain` como una navegación o texto soltado.
        event.preventDefault();
        const payload = readEditorDrag(event);
        if (!payload) return;
        if (payload.source === 'palette') store.insertTypeOnCanvas(payload.type);
        if (payload.source === 'tree') store.run({ kind: 'move', id: payload.id, parentId: rootId, index: rootChildren.length });
        store.setRuntime({ draggingId: null, invalidDrop: false });
      }}
      onClick={() => store.select([])}
      style={{ ['--editor-accent' as string]: '#8b5cf6' }}
    >
      <div
        className={`relative mx-auto transition-[width] duration-300 ${showCoordinates ? 'pl-8 pt-7' : ''}`}
        style={{ width: VIEWPORT_WIDTH[breakpoint] * zoom + (showCoordinates ? 32 : 0), maxWidth: '100%' }}
      >
        {showCoordinates ? <CanvasRulers width={VIEWPORT_WIDTH[breakpoint]} zoom={zoom} /> : null}
        <div
          className="relative origin-top rounded-xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
          style={{
            width: VIEWPORT_WIDTH[breakpoint],
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            background: resolveToken('token:color.background', tokens),
            color: resolveToken('token:color.ink', tokens),
            minHeight: 640,
          }}
        >
          {rootChildren.length === 0 ? (
            <EmptyCanvas />
          ) : (
            rootChildren.map(id => <NodeView key={id} id={id} />)
          )}
        </div>
      </div>
      {preview ? null : <SelectionOverlay />}
    </div>
  );
}

/** Reglas del área de diseño: los valores son coordenadas CSS del canvas. */
function CanvasRulers({ width, zoom }: { width: number; zoom: number }) {
  const marks = Array.from({ length: Math.floor(width / 200) + 1 }, (_, index) => index * 200);
  const scaledWidth = width * zoom;
  return (
    <>
      <div aria-hidden className="absolute left-8 top-0 h-6 border-b border-violet-400/30 text-[9px] font-mono text-violet-200/80" style={{ width: scaledWidth }}>
        <span className="absolute -left-7 top-1 rounded bg-violet-500/20 px-1 text-[8px] font-bold text-violet-200">X</span>
        {marks.map(mark => <span key={mark} className="absolute top-0 h-6 border-l border-violet-400/35 pl-1 pt-1" style={{ left: mark * zoom }}>{mark}</span>)}
      </div>
      <div aria-hidden className="absolute left-0 top-7 w-7 border-r border-violet-400/30 text-[9px] font-mono text-violet-200/80" style={{ height: 640 * zoom }}>
        <span className="absolute left-1 -top-6 rounded bg-violet-500/20 px-1 text-[8px] font-bold text-violet-200">Y</span>
        {[0, 200, 400, 600].map(mark => <span key={mark} className="absolute left-0 w-7 border-t border-violet-400/35 pl-1" style={{ top: mark * zoom }}>{mark}</span>)}
      </div>
    </>
  );
}

function EmptyCanvas() {
  return (
    <div className="grid min-h-[640px] place-items-center p-10 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-bold">Arrastra cualquier componente para empezar</p>
        <p className="mt-2 text-xs opacity-70">
          Si sueltas contenido como un botón, una lista o una tarjeta, crearemos automáticamente una
          sección y un contenedor para conservar una estructura válida.
        </p>
      </div>
    </div>
  );
}

/**
 * Barra del elemento seleccionado: nombre, jerarquía y acciones rápidas.
 *
 * Va fuera del nodo y no dentro, para que las acciones no hereden los estilos
 * que el usuario esté editando —un `opacity: .2` en el nodo no debe volver
 * ilegible su propia barra de acciones—.
 */
function SelectionOverlay() {
  const store = useEditorStore();
  const selection = useEditor(state => state.selection);
  const doc = useEditor(state => state.document);
  const invalidDrop = useEditor(state => state.runtime.invalidDrop);

  if (selection.length === 0) return null;

  if (selection.length > 1) {
    return (
      <div className="pointer-events-auto sticky bottom-4 left-1/2 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/85 px-3 py-2 text-xs text-white backdrop-blur">
        <span className="font-bold">{selection.length} elementos</span>
        <button type="button" onClick={() => selection.forEach(id => store.run({ kind: 'duplicate', id }))} className="rounded px-2 py-1 hover:bg-white/10">
          Duplicar
        </button>
        <button type="button" onClick={() => selection.forEach(id => store.run({ kind: 'remove', id }))} className="rounded px-2 py-1 text-rose-300 hover:bg-rose-500/15">
          Eliminar
        </button>
      </div>
    );
  }

  const id = selection[0];
  const node = doc.nodes[id];
  if (!node) return null;
  const path = [...ancestorsOf(doc, id), id];

  return (
    <div className="pointer-events-auto sticky bottom-4 left-1/2 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/85 px-3 py-2 text-xs text-white backdrop-blur">
      <nav aria-label="Jerarquía" className="flex items-center gap-1 overflow-hidden">
        {path.map((nodeId, index) => (
          <span key={nodeId} className="flex items-center gap-1">
            {index > 0 ? <span className="opacity-40">/</span> : null}
            <button
              type="button"
              onClick={() => store.select([nodeId])}
              className={`truncate rounded px-1.5 py-0.5 hover:bg-white/10 ${nodeId === id ? 'font-bold text-violet-300' : 'opacity-70'}`}
            >
              {nodeLabel(doc, nodeId)}
            </button>
          </span>
        ))}
      </nav>
      <span className="mx-1 h-4 w-px bg-white/15" />
      <QuickAction label="Mover arriba" onClick={() => nudge(store, id, -1)}><ArrowUp className="h-3.5 w-3.5" /></QuickAction>
      <QuickAction label="Mover abajo" onClick={() => nudge(store, id, 1)}><ArrowDown className="h-3.5 w-3.5" /></QuickAction>
      <QuickAction label="Duplicar" onClick={() => store.run({ kind: 'duplicate', id })}><Copy className="h-3.5 w-3.5" /></QuickAction>
      <QuickAction label={node.hidden ? 'Mostrar' : 'Ocultar'} onClick={() => store.run({ kind: 'toggle', id, flag: 'hidden' })}>
        {node.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </QuickAction>
      <QuickAction label={node.locked ? 'Desbloquear' : 'Bloquear'} onClick={() => store.run({ kind: 'toggle', id, flag: 'locked' })}>
        {node.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
      </QuickAction>
      <QuickAction label="Envolver en contenedor" onClick={() => store.run({ kind: 'wrap', id, containerType: 'container' })}><Unlink className="h-3.5 w-3.5" /></QuickAction>
      <QuickAction label="Eliminar" onClick={() => store.run({ kind: 'remove', id })} danger><Trash2 className="h-3.5 w-3.5" /></QuickAction>
      {invalidDrop ? <span className="ml-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-rose-200">Destino no permitido</span> : null}
    </div>
  );
}

function QuickAction({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded p-1.5 transition ${danger ? 'text-rose-300 hover:bg-rose-500/15' : 'hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}

/** Mueve el nodo `offset` posiciones entre sus hermanos. */
export function nudge(store: ReturnType<typeof useEditorStore>, id: string, offset: number) {
  const state = store.getState();
  const node = state.document.nodes[id];
  if (!node?.parentId) return;
  const siblings = state.document.nodes[node.parentId].children;
  const index = siblings.indexOf(id);
  const next = Math.min(Math.max(index + offset, 0), siblings.length - 1);
  if (next === index) return;
  store.run({ kind: 'move', id, parentId: node.parentId, index: next });
}

export default EditorCanvas;
