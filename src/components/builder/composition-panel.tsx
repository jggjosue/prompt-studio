'use client';

import { writeBlockDrag } from '@/components/builder/block-drag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BLOCK_SPECS,
  blockLabel,
  canAddBlock,
  remainingSlots,
  type BuilderBlock,
  type BuilderBlockKind,
} from '@/lib/builder-blocks';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';

type Props = {
  blocks: BuilderBlock[];
  palette: BuilderBlockKind[];
  locale: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (kind: BuilderBlockKind) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onReset: () => void;
};

/**
 * Paleta + lista de capas.
 *
 * La paleta se arrastra al lienzo, pero **también** se puede pulsar: arrastrar
 * es cómodo con ratón y no existe con teclado ni con lector de pantalla. Por lo
 * mismo, cada capa lleva botones de subir y bajar además del arrastre.
 */
export function CompositionPanel({
  blocks,
  palette,
  locale,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onRemove,
  onDuplicate,
  onToggleHidden,
  onTextChange,
  onReset,
}: Props) {
  const es = locale.startsWith('es');
  const selected = blocks.find(b => b.id === selectedId) ?? null;

  return (
    <div className="grid gap-6">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">{es ? 'Bloques' : 'Blocks'}</h3>
          <span className="text-xs text-muted-foreground">
            {es ? 'arrastra o pulsa' : 'drag or click'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {palette.map(kind => {
            const disponible = canAddBlock(blocks, kind);
            const restantes = remainingSlots(blocks, kind);
            return (
              <button
                key={kind}
                type="button"
                draggable={disponible}
                onDragStart={event => writeBlockDrag(event, { source: 'palette', kind })}
                onClick={() => disponible && onAdd(kind)}
                disabled={!disponible}
                title={
                  disponible
                    ? es
                      ? `Añadir ${blockLabel(kind, locale)} (quedan ${restantes})`
                      : `Add ${blockLabel(kind, locale)} (${restantes} left)`
                    : es
                      ? `Máximo ${BLOCK_SPECS[kind].max} alcanzado`
                      : `Max ${BLOCK_SPECS[kind].max} reached`
                }
                className="inline-flex cursor-grab items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500/40 hover:bg-violet-500/10 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3 w-3" aria-hidden />
                {blockLabel(kind, locale)}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">
            {es ? 'Capas' : 'Layers'}{' '}
            <span className="font-normal text-muted-foreground">({blocks.length})</span>
          </h3>
          <Button type="button" size="sm" variant="ghost" onClick={onReset} className="h-7 px-2 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" />
            {es ? 'Restablecer' : 'Reset'}
          </Button>
        </div>

        <ul className="grid gap-2">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              draggable
              onDragStart={event => writeBlockDrag(event, { source: 'canvas', index })}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                const raw =
                  event.dataTransfer.getData('application/x-prompt-studio-block') ||
                  event.dataTransfer.getData('text/plain');
                try {
                  const payload = JSON.parse(raw);
                  if (payload?.source === 'canvas') onMove(payload.index, index);
                  else if (payload?.source === 'palette') onAdd(payload.kind);
                } catch {
                  /* arrastre externo: se ignora */
                }
              }}
              className={`flex items-center justify-between gap-1.5 rounded-xl border px-2.5 py-2 text-xs transition-all overflow-hidden ${
                selectedId === block.id
                  ? 'border-violet-500/60 bg-violet-500/15 shadow-sm'
                  : 'border-border/60 bg-card/60 hover:border-violet-500/30 hover:bg-card/90'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/70 hover:text-foreground" aria-hidden />
                <button
                  type="button"
                  onClick={() => onSelect(block.id)}
                  className="min-w-0 flex-1 truncate text-left font-semibold"
                >
                  <span className={block.hidden ? 'line-through opacity-60' : ''}>
                    {blockLabel(block.kind, locale)}
                  </span>
                  {block.text ? (
                    <span className="ml-1.5 truncate font-normal text-muted-foreground">({block.text})</span>
                  ) : null}
                </button>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  aria-label={es ? 'Subir' : 'Move up'}
                  className="rounded p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-20 shrink-0"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === blocks.length - 1}
                  aria-label={es ? 'Bajar' : 'Move down'}
                  className="rounded p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-20 shrink-0"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleHidden(block.id)}
                  aria-label={block.hidden ? (es ? 'Mostrar' : 'Show') : es ? 'Ocultar' : 'Hide'}
                  className="rounded p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                >
                  {block.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(block.id)}
                  disabled={!canAddBlock(blocks, block.kind)}
                  aria-label={es ? 'Duplicar' : 'Duplicate'}
                  className="rounded p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-20 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(block.id)}
                  aria-label={es ? 'Eliminar' : 'Remove'}
                  className="rounded p-1 text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-400 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {selected && BLOCK_SPECS[selected.kind].defaultText.es !== '' ? (
        <section className="grid gap-2">
          <Label htmlFor="builder-block-text" className="text-xs font-bold uppercase tracking-wide">
            {es ? 'Texto del bloque' : 'Block text'} · {blockLabel(selected.kind, locale)}
          </Label>
          <Input
            id="builder-block-text"
            value={selected.text}
            onChange={event => onTextChange(selected.id, event.target.value)}
            placeholder={BLOCK_SPECS[selected.kind].defaultText[es ? 'es' : 'en']}
          />
          <p className="text-[0.7rem] text-muted-foreground">
            {es
              ? 'Los separadores «·» dividen enlaces y accesos sociales en varios elementos.'
              : 'The «·» separator splits nav links and social rows into several items.'}
          </p>
        </section>
      ) : null}
    </div>
  );
}

export default CompositionPanel;
