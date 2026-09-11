/**
 * Store del editor visual.
 *
 * **Sin dependencia nueva.** Se valoró Zustand (1,2 kB) y Redux Toolkit; lo que
 * hace falta aquí es suscripción por selector para que mover un nodo no
 * re-renderice los otros 999, y eso lo da `useSyncExternalStore`, que ya viene
 * en React 19. Añadir Zustand aportaría azúcar sintáctico sobre 60 líneas que sí
 * podemos leer y probar, en una ruta que ya pesa ~300 kB de JS. Si más adelante
 * hacen falta middlewares (persist, devtools, transient updates), Zustand es el
 * cambio natural y este módulo es la única pieza que habría que sustituir.
 *
 * El estado está **separado por responsabilidad**, como pide el diseño: el
 * documento no se entera del zoom, y cambiar de breakpoint no toca el historial.
 */
import { useCallback, useSyncExternalStore } from 'react';
import {
  BREAKPOINTS,
  countNodes,
  createDocument,
  createNode,
  incrementalIds,
  type Breakpoint,
  type EditorDocument,
  type IdFactory,
} from '@/lib/editor/document';
import {
  applyCommand,
  applyInverse,
  canRedo,
  canUndo,
  emptyHistory,
  pushHistory,
  type EditorCommand,
  type HistoryState,
} from '@/lib/editor/history';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type EditorState = {
  /** Lo que se guarda y se exporta. */
  document: EditorDocument;
  /** Qué está seleccionado. Lista, no id único: el multiselección lo necesita. */
  selection: string[];
  /** Estado del editor: viewport, zoom, modo. */
  editor: {
    breakpoint: Breakpoint;
    zoom: number;
    preview: boolean;
    snap: boolean;
    /** Tema del lienzo. No es el tema de la app: se previsualizan los dos. */
    darkCanvas: boolean;
  };
  /** Estado de interfaz: paneles. No se guarda con el documento. */
  ui: {
    leftPanel: boolean;
    rightPanel: boolean;
    layers: boolean;
  };
  history: HistoryState;
  /** Estado en ejecución: hover, arrastre, guardado. Volátil. */
  runtime: {
    hoverId: string | null;
    draggingId: string | null;
    dropTarget: { parentId: string; index: number } | null;
    invalidDrop: boolean;
    save: SaveStatus;
    lastError: string | null;
    /** Tipos insertados hace poco, para la sección «recientes» de la paleta. */
    recentTypes: string[];
  };
};

export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function initialState(makeId: IdFactory): EditorState {
  return {
    document: createDocument(makeId),
    selection: [],
    editor: { breakpoint: 'desktop', zoom: 1, preview: false, snap: true, darkCanvas: true },
    ui: { leftPanel: true, rightPanel: true, layers: true },
    history: emptyHistory,
    runtime: { hoverId: null, draggingId: null, dropTarget: null, invalidDrop: false, save: 'idle', lastError: null, recentTypes: [] },
  };
}

export type EditorStore = {
  getState: () => EditorState;
  subscribe: (listener: () => void) => () => void;
  /** Única puerta de escritura del documento: pasa por el historial. */
  run: (command: EditorCommand) => { ok: boolean; error?: string; focusId?: string };
  /**
   * Inserta un tipo del registro. Atajo para la paleta y el arrastre: crea el
   * nodo con sus valores por defecto y lo mete por el mismo camino que todo lo
   * demás, así queda en el historial.
   */
  insertType: (type: string, parentId: string, index: number) => { ok: boolean; error?: string; id?: string };
  /** Inserta en la página; los elementos de contenido se envuelven en estructura segura. */
  insertTypeOnCanvas: (type: string) => { ok: boolean; error?: string; id?: string };
  undo: () => boolean;
  redo: () => boolean;
  select: (ids: string[]) => void;
  toggleInSelection: (id: string) => void;
  setEditor: (patch: Partial<EditorState['editor']>) => void;
  setUi: (patch: Partial<EditorState['ui']>) => void;
  setRuntime: (patch: Partial<EditorState['runtime']>) => void;
  replaceDocument: (document: EditorDocument, options?: { resetHistory?: boolean }) => void;
  nextId: IdFactory;
};

export function createEditorStore(makeId: IdFactory = incrementalIds()): EditorStore {
  let state = initialState(makeId);
  const listeners = new Set<() => void>();

  const commit = (next: EditorState) => {
    state = next;
    for (const listener of listeners) listener();
  };

  return {
    getState: () => state,
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    nextId: makeId,

    run: command => {
      const result = applyCommand(state.document, command, makeId);
      if ('error' in result) {
        commit({ ...state, runtime: { ...state.runtime, lastError: result.error } });
        return { ok: false, error: result.error };
      }
      commit({
        ...state,
        document: result.document,
        history: pushHistory(state.history, result.inverse),
        selection: result.focusId ? [result.focusId] : state.selection,
        runtime: { ...state.runtime, save: 'dirty', lastError: null },
      });
      return { ok: true, focusId: result.focusId };
    },

    insertType: (type, parentId, index) => {
      const node = createNode(type, makeId);
      const result = applyCommand(state.document, { kind: 'insert', node, parentId, index }, makeId);
      if ('error' in result) {
        commit({ ...state, runtime: { ...state.runtime, lastError: result.error } });
        return { ok: false, error: result.error };
      }
      commit({
        ...state,
        document: result.document,
        history: pushHistory(state.history, result.inverse),
        selection: [node.id],
        runtime: {
          ...state.runtime,
          save: 'dirty',
          lastError: null,
          recentTypes: [type, ...state.runtime.recentTypes.filter(t => t !== type)].slice(0, 8),
        },
      });
      return { ok: true, id: node.id };
    },

    insertTypeOnCanvas(type) {
      const rootId = state.document.rootId;
      const direct = state.document.nodes[rootId]?.children.length ?? 0;
      const firstTry = (() => {
        const node = createNode(type, makeId);
        const result = applyCommand(state.document, { kind: 'insert', node, parentId: rootId, index: direct }, makeId);
        if ('error' in result) return null;
        commit({
          ...state,
          document: result.document,
          history: pushHistory(state.history, result.inverse),
          selection: [node.id],
          runtime: { ...state.runtime, save: 'dirty', lastError: null, recentTypes: [type, ...state.runtime.recentTypes.filter(t => t !== type)].slice(0, 8) },
        });
        return { ok: true as const, id: node.id };
      })();
      if (firstTry) return firstTry;

      // La raíz solo admite estructura. Para que soltar «Lista» o «Botón» en
      // un canvas vacío sea natural, construimos Section → Container → nodo.
      const section = this.insertType('section', rootId, direct);
      if (!section.ok || !section.id) return section;
      const container = this.insertType('container', section.id, 0);
      if (!container.ok || !container.id) return container;
      return this.insertType(type, container.id, 0);
    },

    undo: () => {
      if (!canUndo(state.history)) return false;
      const past = [...state.history.past];
      const inverse = past.pop()!;
      const result = applyInverse(state.document, inverse, makeId);
      if ('error' in result) return false;
      commit({
        ...state,
        document: result.document,
        history: { past, future: [...state.history.future, result.inverse] },
        runtime: { ...state.runtime, save: 'dirty' },
      });
      return true;
    },

    redo: () => {
      if (!canRedo(state.history)) return false;
      const future = [...state.history.future];
      const inverse = future.pop()!;
      const result = applyInverse(state.document, inverse, makeId);
      if ('error' in result) return false;
      commit({
        ...state,
        document: result.document,
        history: { past: [...state.history.past, result.inverse], future },
        runtime: { ...state.runtime, save: 'dirty' },
      });
      return true;
    },

    select: ids => commit({ ...state, selection: [...new Set(ids)] }),

    toggleInSelection: id =>
      commit({
        ...state,
        selection: state.selection.includes(id)
          ? state.selection.filter(value => value !== id)
          : [...state.selection, id],
      }),

    setEditor: patch => {
      const editor = { ...state.editor, ...patch };
      if (patch.zoom !== undefined) {
        editor.zoom = Math.min(Math.max(patch.zoom, ZOOM_STEPS[0]), ZOOM_STEPS[ZOOM_STEPS.length - 1]);
      }
      if (patch.breakpoint && !BREAKPOINTS.includes(patch.breakpoint)) editor.breakpoint = state.editor.breakpoint;
      commit({ ...state, editor });
    },

    setUi: patch => commit({ ...state, ui: { ...state.ui, ...patch } }),

    setRuntime: patch => commit({ ...state, runtime: { ...state.runtime, ...patch } }),

    replaceDocument: (document, options) =>
      commit({
        ...state,
        document,
        selection: [],
        history: options?.resetHistory ? emptyHistory : state.history,
        runtime: { ...state.runtime, save: 'saved', lastError: null },
      }),
  };
}

/**
 * Suscripción por selector.
 *
 * El componente solo se vuelve a renderizar si **su** porción cambia de
 * identidad. Es lo que evita que teclear en el panel de propiedades repinte el
 * árbol de capas y el lienzo completo.
 */
export function useEditorSelector<T>(store: EditorStore, selector: (state: EditorState) => T): T {
  const subscribe = useCallback((listener: () => void) => store.subscribe(listener), [store]);
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ------------------------------------------------------------- selectores --- */

export const selectNodeCount = (state: EditorState) => countNodes(state.document);
export const selectSelectedId = (state: EditorState) =>
  state.selection.length === 1 ? state.selection[0] : null;
export const selectNode = (id: string | null) => (state: EditorState) =>
  id ? state.document.nodes[id] : undefined;
export const selectChildren = (id: string) => (state: EditorState) =>
  state.document.nodes[id]?.children ?? [];
export const selectCanUndo = (state: EditorState) => canUndo(state.history);
export const selectCanRedo = (state: EditorState) => canRedo(state.history);
