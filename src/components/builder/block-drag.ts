/**
 * Contrato de arrastre compartido entre la paleta y el lienzo.
 *
 * Se usa un tipo MIME propio en lugar de `text/plain` para que al soltar texto
 * arrastrado desde fuera del navegador no se interprete como un bloque.
 */
export const BLOCK_DRAG_MIME = 'application/x-prompt-studio-block';

export type BlockDragPayload =
  | { source: 'palette'; kind: string }
  | { source: 'canvas'; index: number };

export function writeBlockDrag(event: React.DragEvent, payload: BlockDragPayload): void {
  event.dataTransfer.setData(BLOCK_DRAG_MIME, JSON.stringify(payload));
  // Respaldo: algunos navegadores exigen `text/plain` para iniciar el arrastre.
  event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  event.dataTransfer.effectAllowed = payload.source === 'palette' ? 'copy' : 'move';
}

export function readBlockDrag(event: React.DragEvent): BlockDragPayload | null {
  const raw =
    event.dataTransfer.getData(BLOCK_DRAG_MIME) || event.dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BlockDragPayload;
    if (parsed?.source === 'palette' && typeof parsed.kind === 'string') return parsed;
    if (parsed?.source === 'canvas' && Number.isInteger(parsed.index)) return parsed;
    return null;
  } catch {
    return null;
  }
}
