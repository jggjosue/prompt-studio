'use client';

import { useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { nodeLabel } from '@/lib/editor/document';
import { hasEditorDrag, readEditorDrag, resolveDropPosition, writeEditorDrag, type DropPosition } from '@/lib/editor/drag';
import { getDefinition } from '@/lib/editor/registry';
import { ChevronRight, Eye, EyeOff, Lock, LockOpen } from 'lucide-react';
import { memo, useState } from 'react';

/**
 * Panel de capas, al estilo del de Figma.
 *
 * Es la **alternativa accesible al arrastre**: cada fila tiene botones de subir,
 * bajar, ocultar y bloquear, y el nombre se edita con doble clic. Quien no pueda
 * arrastrar tiene aquí todas las operaciones de estructura, que es el requisito
 * que impide depender solo del ratón.
 */
export function LayersPanel() {
  const rootId = useEditor(state => state.document.rootId);
  return (
    <div className="h-full overflow-y-auto p-2 text-xs">
      <LayerRow id={rootId} depth={0} />
    </div>
  );
}

const LayerRow = memo(function LayerRow({ id, depth }: { id: string; depth: number }) {
  const store = useEditorStore();
  const node = useEditor(state => state.document.nodes[id]);
  const label = useEditor(state => nodeLabel(state.document, id));
  const isSelected = useEditor(state => state.selection.includes(id));
  const isHover = useEditor(state => state.runtime.hoverId === id);
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [dropHint, setDropHint] = useState<DropPosition | null>(null);

  if (!node) return null;
  const definition = getDefinition(node.type);
  const acceptsChildren = Boolean(definition?.rules.canHaveChildren);
  const isRoot = node.parentId === null;

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDropHint(null);
    const payload = readEditorDrag(event);
    if (!payload) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position = isRoot ? 'inside' : resolveDropPosition(rect, event.clientY, acceptsChildren);
    const parentId = position === 'inside' ? id : node.parentId;
    if (!parentId) return;
    const siblings = store.getState().document.nodes[parentId]?.children ?? [];
    const index = position === 'inside' ? siblings.length : siblings.indexOf(id) + (position === 'after' ? 1 : 0);

    if (payload.source === 'tree') store.run({ kind: 'move', id: payload.id, parentId, index });
    else if (payload.source === 'palette') store.insertType(payload.type, parentId, index);
  }

  return (
    <div>
      <div
        draggable={!isRoot && !node.locked}
        onDragStart={event => {
          event.stopPropagation();
          writeEditorDrag(event, { source: 'tree', id });
          store.setRuntime({ draggingId: id });
        }}
        onDragEnd={() => store.setRuntime({ draggingId: null })}
        onDragOver={event => {
          if (!hasEditorDrag(event)) return;
          event.preventDefault();
          event.stopPropagation();
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          setDropHint(isRoot ? 'inside' : resolveDropPosition(rect, event.clientY, acceptsChildren));
        }}
        onDragLeave={() => setDropHint(null)}
        onDrop={handleDrop}
        onMouseEnter={() => store.setRuntime({ hoverId: id })}
        onMouseLeave={() => store.setRuntime({ hoverId: null })}
        className={`group relative flex items-center gap-1 rounded-md px-1.5 py-1 transition ${
          isSelected ? 'bg-violet-600/25 text-violet-100' : isHover ? 'bg-white/5' : ''
        } ${dropHint === 'inside' ? 'ring-1 ring-violet-400' : ''}`}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        {dropHint === 'before' || dropHint === 'after' ? (
          <span
            aria-hidden
            className="absolute left-2 right-2 h-0.5 rounded bg-violet-400"
            style={dropHint === 'before' ? { top: -1 } : { bottom: -1 }}
          />
        ) : null}

        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-label={open ? 'Contraer' : 'Expandir'}
            aria-expanded={open}
            className="rounded p-0.5 hover:bg-white/10"
          >
            <ChevronRight className={`h-3 w-3 transition ${open ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <span className="w-4" />
        )}

        {renaming ? (
          <input
            autoFocus
            defaultValue={node.name ?? label}
            onBlur={event => {
              setRenaming(false);
              store.run({ kind: 'rename', id, name: event.currentTarget.value });
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') setRenaming(false);
            }}
            className="min-w-0 flex-1 rounded bg-black/40 px-1 py-0.5 text-xs outline-none ring-1 ring-violet-500"
          />
        ) : (
          <button
            type="button"
            onClick={event => (event.shiftKey ? store.toggleInSelection(id) : store.select([id]))}
            onDoubleClick={() => !isRoot && setRenaming(true)}
            className={`min-w-0 flex-1 truncate text-left ${node.hidden ? 'line-through opacity-50' : ''}`}
          >
            {label}
          </button>
        )}

        {isRoot ? null : (
          <span className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <RowAction label={node.hidden ? 'Mostrar' : 'Ocultar'} onClick={() => store.run({ kind: 'toggle', id, flag: 'hidden' })}>
              {node.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </RowAction>
            <RowAction label={node.locked ? 'Desbloquear' : 'Bloquear'} onClick={() => store.run({ kind: 'toggle', id, flag: 'locked' })}>
              {node.locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
            </RowAction>
          </span>
        )}
      </div>

      {open ? node.children.map(childId => <LayerRow key={childId} id={childId} depth={depth + 1} />) : null}
    </div>
  );
});

function RowAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="rounded p-1 hover:bg-white/10">
      {children}
    </button>
  );
}

export default LayersPanel;
