/**
 * Mapa de atajos del editor.
 *
 * Declarativo y puro: la interfaz solo pregunta «¿qué acción corresponde a este
 * evento?». Así se puede probar sin navegador, listar los atajos en la ayuda y
 * evitar el problema clásico de tener `keydown` repartidos por seis componentes
 * pisándose entre ellos.
 */
export type EditorAction =
  | 'delete'
  | 'duplicate'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'undo'
  | 'redo'
  | 'deselect'
  | 'enter'
  | 'moveUp'
  | 'moveDown'
  | 'nudgeUp'
  | 'nudgeDown'
  | 'nudgeUpFast'
  | 'nudgeDownFast'
  | 'palette'
  | 'preview'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'
  | 'selectParent';

export type KeyEventLike = {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  /** Elemento donde ocurrió; si es un campo de texto, casi nada debe capturarse. */
  target?: { tagName?: string; isContentEditable?: boolean } | null;
};

export type ShortcutSpec = {
  action: EditorAction;
  keys: string[];
  /** Etiqueta para la ayuda y el command palette. */
  label: string;
  /** `true` si debe funcionar también mientras se escribe (p. ej. Escape). */
  allowWhileTyping?: boolean;
};

/** Catálogo único, también consumido por la paleta de comandos y la ayuda. */
export const SHORTCUTS: ShortcutSpec[] = [
  { action: 'delete', keys: ['Delete', 'Backspace'], label: 'Eliminar' },
  { action: 'duplicate', keys: ['mod+d'], label: 'Duplicar' },
  { action: 'copy', keys: ['mod+c'], label: 'Copiar' },
  { action: 'paste', keys: ['mod+v'], label: 'Pegar' },
  { action: 'cut', keys: ['mod+x'], label: 'Cortar' },
  { action: 'undo', keys: ['mod+z'], label: 'Deshacer' },
  { action: 'redo', keys: ['mod+shift+z', 'mod+y'], label: 'Rehacer' },
  { action: 'deselect', keys: ['Escape'], label: 'Deseleccionar', allowWhileTyping: true },
  { action: 'enter', keys: ['Enter'], label: 'Entrar en el componente' },
  { action: 'selectParent', keys: ['shift+Enter'], label: 'Seleccionar el contenedor' },
  { action: 'moveUp', keys: ['mod+ArrowUp'], label: 'Mover arriba' },
  { action: 'moveDown', keys: ['mod+ArrowDown'], label: 'Mover abajo' },
  { action: 'nudgeUp', keys: ['ArrowUp'], label: 'Subir una posición' },
  { action: 'nudgeDown', keys: ['ArrowDown'], label: 'Bajar una posición' },
  { action: 'nudgeUpFast', keys: ['shift+ArrowUp'], label: 'Subir cinco posiciones' },
  { action: 'nudgeDownFast', keys: ['shift+ArrowDown'], label: 'Bajar cinco posiciones' },
  { action: 'palette', keys: ['mod+k'], label: 'Paleta de comandos' },
  { action: 'preview', keys: ['mod+shift+p'], label: 'Previsualizar' },
  { action: 'zoomIn', keys: ['mod+='], label: 'Acercar' },
  { action: 'zoomOut', keys: ['mod+-'], label: 'Alejar' },
  { action: 'zoomReset', keys: ['mod+0'], label: 'Zoom al 100%' },
];

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isTypingTarget(target: KeyEventLike['target']): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return TYPING_TAGS.has((target.tagName ?? '').toUpperCase());
}

/** Normaliza el evento a una firma comparable: `mod+shift+z`. */
export function eventSignature(event: KeyEventLike): string {
  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push('mod');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  parts.push(key);
  return parts.join('+');
}

/**
 * Acción que corresponde al evento, o `null`.
 *
 * Mientras se escribe en un campo solo pasan los atajos marcados: sin esto,
 * escribir «duplicar» en el nombre de una capa duplicaría el nodo con la `d`.
 */
export function matchShortcut(event: KeyEventLike): EditorAction | null {
  const typing = isTypingTarget(event.target);
  const signature = eventSignature(event);
  for (const shortcut of SHORTCUTS) {
    if (!shortcut.keys.includes(signature)) continue;
    if (typing && !shortcut.allowWhileTyping) return null;
    return shortcut.action;
  }
  return null;
}

export function shortcutLabel(action: EditorAction, isMac: boolean): string {
  const spec = SHORTCUTS.find(s => s.action === action);
  if (!spec) return '';
  return spec.keys[0]
    .replace('mod', isMac ? '⌘' : 'Ctrl')
    .replace('shift', isMac ? '⇧' : 'Shift')
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace(/\+/g, isMac ? '' : '+');
}
