/**
 * Historial de deshacer/rehacer del editor.
 *
 * **Comandos con inverso**, no instantáneas del documento. Con 1.000 nodos, una
 * instantánea por pulsación gasta megabytes y hace que el autoguardado envíe el
 * documento entero por cada tecla. Un comando guarda solo lo que hace falta para
 * revertirlo: el nodo movido y su posición anterior, el estilo previo, el
 * subárbol borrado.
 *
 * Los comandos son **datos serializables** (nada de closures) por dos razones:
 * se pueden guardar junto al documento para reconstruir una sesión, y son el
 * formato que el asistente de IA puede emitir para modificar el mismo árbol que
 * edita el usuario, en lugar de devolver HTML desconectado.
 */
import {
  duplicateNode,
  insertNode,
  moveNode,
  removeNode,
  renameNode,
  restoreSubtree,
  setProps,
  setStyles,
  toggleFlag,
  wrapInContainer,
  type Breakpoint,
  type EditorDocument,
  type EditorNode,
  type IdFactory,
  type RemovedSubtree,
  type StyleMap,
} from '@/lib/editor/document';

export type EditorCommand =
  | { kind: 'insert'; node: EditorNode; parentId: string; index: number }
  | { kind: 'remove'; id: string }
  | { kind: 'move'; id: string; parentId: string; index: number }
  | { kind: 'duplicate'; id: string }
  | { kind: 'wrap'; id: string; containerType: string }
  | { kind: 'setProps'; id: string; patch: Record<string, unknown> }
  | { kind: 'setStyles'; id: string; breakpoint: Breakpoint; patch: Record<string, string | number | null> }
  | { kind: 'rename'; id: string; name: string }
  | { kind: 'toggle'; id: string; flag: 'hidden' | 'locked' };

/** Lo necesario para revertir un comando ya aplicado. */
export type CommandInverse =
  | { kind: 'remove'; id: string }
  | { kind: 'restore'; removed: RemovedSubtree }
  | { kind: 'move'; id: string; parentId: string; index: number }
  | { kind: 'setProps'; id: string; patch: Record<string, unknown> }
  | { kind: 'setStyles'; id: string; breakpoint: Breakpoint; patch: Record<string, string | number | null> }
  | { kind: 'rename'; id: string; name: string }
  | { kind: 'toggle'; id: string; flag: 'hidden' | 'locked' };

export type Applied = {
  document: EditorDocument;
  inverse: CommandInverse;
  /** Nodo que conviene seleccionar después (inserción, duplicado, envoltura). */
  focusId?: string;
};

export type ApplyResult = Applied | { error: string };

function previousStyles(
  document: EditorDocument,
  id: string,
  breakpoint: Breakpoint,
  patch: Record<string, string | number | null>
): Record<string, string | number | null> {
  const current: StyleMap = document.nodes[id]?.styles[breakpoint] ?? {};
  const inverse: Record<string, string | number | null> = {};
  // Para cada clave tocada se guarda su valor anterior, o `null` si no existía:
  // así el inverso borra las que se crearon y repone las que se cambiaron.
  for (const key of Object.keys(patch)) {
    inverse[key] = Object.hasOwn(current, key) ? current[key] : null;
  }
  return inverse;
}

export function applyCommand(
  document: EditorDocument,
  command: EditorCommand,
  makeId: IdFactory
): ApplyResult {
  switch (command.kind) {
    case 'insert': {
      const result = insertNode(document, command.node, command.parentId, command.index);
      if ('error' in result) return { error: result.error };
      return { document: result.document, inverse: { kind: 'remove', id: command.node.id }, focusId: command.node.id };
    }
    case 'remove': {
      const result = removeNode(document, command.id);
      if ('error' in result) return { error: result.error };
      return { document: result.document, inverse: { kind: 'restore', removed: result.removed } };
    }
    case 'move': {
      const node = document.nodes[command.id];
      if (!node || node.parentId === null) return { error: 'missing' };
      const previousParent = node.parentId;
      const previousIndex = document.nodes[previousParent]!.children.indexOf(command.id);
      const result = moveNode(document, command.id, command.parentId, command.index);
      if ('error' in result) return { error: result.error };
      return {
        document: result.document,
        inverse: { kind: 'move', id: command.id, parentId: previousParent, index: previousIndex },
      };
    }
    case 'duplicate': {
      const result = duplicateNode(document, command.id, makeId);
      if ('error' in result) return { error: result.error };
      return { document: result.document, inverse: { kind: 'remove', id: result.newId }, focusId: result.newId };
    }
    case 'wrap': {
      const result = wrapInContainer(document, command.id, command.containerType, makeId);
      if ('error' in result) return { error: result.error };
      // Deshacer una envoltura no es borrar el contenedor —eso se llevaría al
      // hijo—: es devolver el hijo a su padre original y luego quitar el envoltorio.
      const node = document.nodes[command.id]!;
      const originalParent = node.parentId!;
      const originalIndex = document.nodes[originalParent]!.children.indexOf(command.id);
      return {
        document: result.document,
        inverse: { kind: 'move', id: command.id, parentId: originalParent, index: originalIndex },
        focusId: result.containerId,
      };
    }
    case 'setProps': {
      const node = document.nodes[command.id];
      if (!node) return { error: 'missing' };
      const inversePatch: Record<string, unknown> = {};
      for (const key of Object.keys(command.patch)) inversePatch[key] = node.props[key];
      return {
        document: setProps(document, command.id, command.patch),
        inverse: { kind: 'setProps', id: command.id, patch: inversePatch },
      };
    }
    case 'setStyles': {
      if (!document.nodes[command.id]) return { error: 'missing' };
      const inversePatch = previousStyles(document, command.id, command.breakpoint, command.patch);
      return {
        document: setStyles(document, command.id, command.breakpoint, command.patch),
        inverse: { kind: 'setStyles', id: command.id, breakpoint: command.breakpoint, patch: inversePatch },
      };
    }
    case 'rename': {
      const node = document.nodes[command.id];
      if (!node) return { error: 'missing' };
      return {
        document: renameNode(document, command.id, command.name),
        inverse: { kind: 'rename', id: command.id, name: node.name ?? '' },
      };
    }
    case 'toggle': {
      if (!document.nodes[command.id]) return { error: 'missing' };
      return {
        document: toggleFlag(document, command.id, command.flag),
        inverse: { kind: 'toggle', id: command.id, flag: command.flag },
      };
    }
  }
}

/** Aplica un inverso y devuelve **su** inverso, para poder rehacer. */
export function applyInverse(
  document: EditorDocument,
  inverse: CommandInverse,
  makeId: IdFactory
): ApplyResult {
  switch (inverse.kind) {
    case 'restore': {
      const restored = restoreSubtree(document, inverse.removed);
      return {
        document: restored,
        inverse: { kind: 'remove', id: inverse.removed.nodes[0].id },
        focusId: inverse.removed.nodes[0].id,
      };
    }
    case 'remove':
      return applyCommand(document, { kind: 'remove', id: inverse.id }, makeId);
    case 'move':
      return applyCommand(document, inverse, makeId);
    case 'setProps':
      return applyCommand(document, inverse, makeId);
    case 'setStyles':
      return applyCommand(document, inverse, makeId);
    case 'rename':
      return applyCommand(document, inverse, makeId);
    case 'toggle':
      return applyCommand(document, inverse, makeId);
  }
}

export type HistoryState = { past: CommandInverse[]; future: CommandInverse[] };

export const emptyHistory: HistoryState = { past: [], future: [] };

/** Tope del historial: sesiones largas no deben crecer sin límite. */
export const HISTORY_LIMIT = 100;

export function pushHistory(history: HistoryState, inverse: CommandInverse): HistoryState {
  const past = [...history.past, inverse].slice(-HISTORY_LIMIT);
  // Una acción nueva invalida lo rehacible: es el comportamiento que espera
  // cualquiera que venga de Figma o de un editor de texto.
  return { past, future: [] };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}
