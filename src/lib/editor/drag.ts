/**
 * Contrato de arrastre del editor.
 *
 * Un tipo MIME propio evita que soltar texto arrastrado desde fuera del
 * navegador se interprete como un componente. El *payload* distingue el origen:
 * la paleta crea un nodo nuevo; el lienzo o el árbol mueven uno existente.
 *
 * Toda la API de arrastre está aislada aquí: si algún día entra dnd-kit, este es
 * el único fichero que hay que sustituir.
 */
export const EDITOR_DRAG_MIME = 'application/x-prompt-studio-editor';

export type EditorDragPayload =
  | { source: 'palette'; type: string }
  | { source: 'palette-block'; blockId: string }
  | { source: 'tree'; id: string };

export type DropPosition = 'before' | 'after' | 'inside';

export type DropTarget = { parentId: string; index: number; position: DropPosition; overId: string };

export function writeEditorDrag(event: React.DragEvent, payload: EditorDragPayload): void {
  const raw = JSON.stringify(payload);
  event.dataTransfer.setData(EDITOR_DRAG_MIME, raw);
  event.dataTransfer.setData('text/plain', raw);
  event.dataTransfer.effectAllowed = payload.source === 'tree' ? 'move' : 'copy';
}

export function readEditorDrag(event: React.DragEvent): EditorDragPayload | null {
  const raw = event.dataTransfer.getData(EDITOR_DRAG_MIME) || event.dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EditorDragPayload;
    if (parsed?.source === 'palette' && typeof parsed.type === 'string') return parsed;
    if (parsed?.source === 'palette-block' && typeof parsed.blockId === 'string') return parsed;
    if (parsed?.source === 'tree' && typeof parsed.id === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Durante `dragover` los navegadores no permiten leer `getData()` de forma
 * fiable; normalmente solo exponen los tipos MIME. Si se intenta leer el
 * payload ahí, no se llama a `preventDefault()` y el navegador cancela el
 * `drop`. El contenido se lee únicamente cuando se suelta.
 */
export function hasEditorDrag(event: React.DragEvent): boolean {
  const types = Array.from(event.dataTransfer.types);
  // Safari y algunos WebViews no exponen el MIME personalizado durante
  // `dragover`, aunque sí preservan el fallback `text/plain` que escribimos
  // en `writeEditorDrag`. Aceptarlo aquí permite llamar preventDefault y que
  // el evento `drop` llegue al canvas; el payload se valida al soltar.
  return types.includes(EDITOR_DRAG_MIME) || types.includes('text/plain');
}

/**
 * Decide si el puntero indica «antes», «dentro» o «después».
 *
 * El tercio central solo cuenta como «dentro» si el nodo acepta hijos; en una
 * hoja, apuntar al centro debe resolverse como antes/después o no habría forma
 * de soltar junto a un texto que ocupa todo el ancho.
 */
export function resolveDropPosition(
  rect: { top: number; height: number },
  pointerY: number,
  acceptsChildren: boolean
): DropPosition {
  const offset = (pointerY - rect.top) / Math.max(rect.height, 1);
  if (!acceptsChildren) return offset < 0.5 ? 'before' : 'after';
  if (offset < 0.28) return 'before';
  if (offset > 0.72) return 'after';
  return 'inside';
}

/** Distancia al borde a partir de la cual el lienzo se desplaza solo. */
export const AUTOSCROLL_EDGE = 72;
export const AUTOSCROLL_SPEED = 18;

/** Desplazamiento vertical que toca aplicar, o 0. */
export function autoScrollDelta(
  rect: { top: number; bottom: number },
  pointerY: number
): number {
  if (pointerY - rect.top < AUTOSCROLL_EDGE) return -AUTOSCROLL_SPEED;
  if (rect.bottom - pointerY < AUTOSCROLL_EDGE) return AUTOSCROLL_SPEED;
  return 0;
}
