'use client';

/**
 * Estado del Visual Website Builder.
 *
 * El documento vive aquí y solo cambia a través de las mutaciones puras de
 * `page-schema-ops`: cada gesto del usuario es una transición completa, nunca un
 * parcheo del árbol. El historial se guarda por instantáneas del schema, sin
 * persistir nada durante el arrastre: el autoguardado escribe una sola vez,
 * con retardo, cuando el documento ya está asentado.
 */

import { getPageComponent } from '@/components/editor/page-components';
import {
  PAGE_BREAKPOINT_WIDTHS,
  createLandingSchema,
  findPage,
  type Breakpoint,
  type PageComponentType,
  type PageNode,
  type SitePage,
  type SiteSchema,
} from '@/lib/editor/page-schema';
import {
  addNode,
  canInsert,
  canMove,
  clearNodeStyle,
  duplicateNode,
  locateNode,
  moveNode,
  moveWithinParent,
  removeNode,
  resetNode,
  resetNodeProp,
  resetNodeStyles,
  setNodeProp,
  setNodeStyle,
  type DropTarget,
  type NodeLocation,
  type OpsDeps,
  type OpsError,
} from '@/lib/editor/page-schema-ops';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** Ancho del lienzo por dispositivo, en píxeles. */
export const DEVICE_WIDTH: Record<Breakpoint, number> = {
  desktop: 1440,
  laptop: PAGE_BREAKPOINT_WIDTHS.laptop,
  tablet: PAGE_BREAKPOINT_WIDTHS.tablet,
  mobile: 390,
};

export const DEVICE_ORDER: readonly Breakpoint[] = ['desktop', 'laptop', 'tablet', 'mobile'];

const HISTORY_LIMIT = 50;
const AUTOSAVE_DELAY = 900;

/** Lo que se está arrastrando en este momento. */
export type DragState =
  | { source: 'library'; type: PageComponentType; label: string }
  | { source: 'node'; nodeId: string; type: PageComponentType; label: string };

/** Identificador de un nodo nuevo: empieza por letra y solo usa [a-z0-9-]. */
function nextId(type: PageComponentType): string {
  const random = Math.random().toString(36).slice(2, 7);
  return `${type}-${Date.now().toString(36)}${random}`;
}

/** Dependencias de las operaciones, tomadas del catálogo real. */
const deps: OpsDeps = {
  makeId: nextId,
  defaults: type => {
    const definition = getPageComponent(type);
    return definition
      ? { defaultProps: definition.defaultProps, defaultStyles: definition.defaultStyles }
      : undefined;
  },
};

export type BuilderContextValue = {
  schema: SiteSchema;
  page: SitePage | undefined;
  slug: string | undefined;
  setSlug: (slug: string) => void;
  device: Breakpoint;
  drag: DragState | null;
  selectedId: string | null;
  selected: NodeLocation | null;
  canUndo: boolean;
  canRedo: boolean;
  savedAt: number | null;
  setDevice: (device: Breakpoint) => void;
  setDrag: (drag: DragState | null) => void;
  select: (nodeId: string | null) => void;
  /** Vista previa del rechazo para un tipo de la biblioteca, sin aplicarlo. */
  previewInsert: (type: PageComponentType, target: DropTarget) => OpsError | null;
  previewMove: (nodeId: string, target: DropTarget) => OpsError | null;
  addComponent: (type: PageComponentType, target: DropTarget) => OpsError | null;
  moveExisting: (nodeId: string, target: DropTarget) => OpsError | null;
  duplicate: (nodeId: string) => OpsError | null;
  remove: (nodeId: string) => void;
  move: (nodeId: string, delta: number) => void;
  setProp: (nodeId: string, key: string, value: unknown) => OpsError | null;
  setStyle: (nodeId: string, property: string, value: string | number, breakpoint: Breakpoint) => OpsError | null;
  clearStyle: (nodeId: string, property: string, breakpoint: Breakpoint) => OpsError | null;
  resetProp: (nodeId: string, key: string) => void;
  resetStyles: (nodeId: string) => void;
  resetComponent: (nodeId: string) => void;
  undo: () => void;
  redo: () => void;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilder(): BuilderContextValue {
  const value = useContext(BuilderContext);
  if (!value) throw new Error('useBuilder debe usarse dentro de <BuilderProvider>.');
  return value;
}

export function BuilderProvider({
  children,
  initialSchema,
  initialSlug,
  persistKey,
}: {
  children: ReactNode;
  initialSchema?: SiteSchema;
  initialSlug?: string;
  persistKey?: string;
}) {
  const [schema, setSchema] = useState<SiteSchema>(() => initialSchema ?? createLandingSchema());
  const [slug, setSlug] = useState<string | undefined>(initialSlug);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Breakpoint>('desktop');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });

  const past = useRef<SiteSchema[]>([]);
  const future = useRef<SiteSchema[]>([]);

  const syncHistory = useCallback(() => {
    setHistory({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 });
  }, []);

  const commit = useCallback(
    (next: SiteSchema) => {
      setSchema(previous => {
        past.current.push(previous);
        if (past.current.length > HISTORY_LIMIT) past.current.shift();
        future.current = [];
        return next;
      });
      syncHistory();
    },
    [syncHistory]
  );

  const undo = useCallback(() => {
    setSchema(previous => {
      const restored = past.current.pop();
      if (!restored) return previous;
      future.current.push(previous);
      return restored;
    });
    syncHistory();
  }, [syncHistory]);

  const redo = useCallback(() => {
    setSchema(previous => {
      const restored = future.current.pop();
      if (!restored) return previous;
      past.current.push(previous);
      return restored;
    });
    syncHistory();
  }, [syncHistory]);

  // Autoguardado con retardo: no se escribe en cada movimiento del puntero, solo
  // cuando el documento lleva un momento quieto.
  useEffect(() => {
    if (!persistKey) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(persistKey, JSON.stringify(schema));
        setSavedAt(Date.now());
      } catch {
        setSavedAt(null);
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [schema, persistKey]);

  const page = useMemo(() => findPage(schema, slug), [schema, slug]);
  const selected = useMemo(
    () => (page && selectedId ? locateNode(page, selectedId) ?? null : null),
    [page, selectedId]
  );

  const addComponent = useCallback(
    (type: PageComponentType, target: DropTarget): OpsError | null => {
      const result = addNode(schema, slug, target, type, deps);
      if (!result.ok) return result;
      commit(result.schema);
      setSelectedId(result.id);
      return null;
    },
    [schema, slug, commit]
  );

  const moveExisting = useCallback(
    (nodeId: string, target: DropTarget): OpsError | null => {
      const result = moveNode(schema, slug, nodeId, target);
      if (!result.ok) return result;
      commit(result.schema);
      setSelectedId(nodeId);
      return null;
    },
    [schema, slug, commit]
  );

  const duplicate = useCallback(
    (nodeId: string): OpsError | null => {
      const result = duplicateNode(schema, slug, nodeId, deps);
      if (!result.ok) return result;
      commit(result.schema);
      setSelectedId(result.id);
      return null;
    },
    [schema, slug, commit]
  );

  const remove = useCallback(
    (nodeId: string) => {
      const result = removeNode(schema, slug, nodeId);
      if (!result.ok) return;
      commit(result.schema);
      setSelectedId(current => (current === nodeId ? null : current));
    },
    [schema, slug, commit]
  );

  const move = useCallback(
    (nodeId: string, delta: number) => {
      const result = moveWithinParent(schema, slug, nodeId, delta);
      if (!result.ok) return;
      commit(result.schema);
    },
    [schema, slug, commit]
  );

  const setProp = useCallback(
    (nodeId: string, key: string, value: unknown): OpsError | null => {
      const result = setNodeProp(schema, slug, nodeId, key, value);
      if (!result.ok) return result;
      commit(result.schema);
      return null;
    },
    [schema, slug, commit]
  );

  const setStyle = useCallback(
    (nodeId: string, property: string, value: string | number, breakpoint: Breakpoint): OpsError | null => {
      const result = setNodeStyle(schema, slug, nodeId, property, value, breakpoint);
      if (!result.ok) return result;
      commit(result.schema);
      return null;
    },
    [schema, slug, commit]
  );

  const clearStyle = useCallback(
    (nodeId: string, property: string, breakpoint: Breakpoint): OpsError | null => {
      const result = clearNodeStyle(schema, slug, nodeId, property, breakpoint);
      if (!result.ok) return result;
      commit(result.schema);
      return null;
    },
    [schema, slug, commit]
  );

  const resetProp = useCallback(
    (nodeId: string, key: string) => {
      const location = page ? locateNode(page, nodeId) : undefined;
      if (!location) return;
      const defaults = getPageComponent(location.node.type)?.defaultProps ?? {};
      const result = resetNodeProp(schema, slug, nodeId, key, defaults);
      if (result.ok) commit(result.schema);
    },
    [schema, slug, commit, page]
  );

  const resetStyles = useCallback(
    (nodeId: string) => {
      const result = resetNodeStyles(schema, slug, nodeId);
      if (result.ok) commit(result.schema);
    },
    [schema, slug, commit]
  );

  const resetComponent = useCallback(
    (nodeId: string) => {
      const location = page ? locateNode(page, nodeId) : undefined;
      if (!location) return;
      const defaults = getPageComponent(location.node.type)?.defaultProps ?? {};
      const result = resetNode(schema, slug, nodeId, defaults);
      if (result.ok) commit(result.schema);
    },
    [schema, slug, commit, page]
  );

  const value: BuilderContextValue = useMemo(
    () => ({
      schema,
      page,
      slug,
      device,
      drag,
      selectedId,
      selected,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      savedAt,
      setSlug,
      setDevice,
      setDrag,
      select: setSelectedId,
      previewInsert: (type, target) => canInsert(schema, slug, target, type),
      previewMove: (nodeId, target) => canMove(schema, slug, nodeId, target),
      addComponent,
      moveExisting,
      duplicate,
      remove,
      move,
      setProp,
      setStyle,
      clearStyle,
      resetProp,
      resetStyles,
      resetComponent,
      undo,
      redo,
    }),
    [
      schema,
      page,
      slug,
      device,
      drag,
      selectedId,
      selected,
      savedAt,
      history,
      addComponent,
      moveExisting,
      duplicate,
      remove,
      move,
      setProp,
      setStyle,
      clearStyle,
      resetProp,
      resetStyles,
      resetComponent,
      undo,
      redo,
    ]
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

/** Etiqueta legible de un nodo, para el lienzo y los overlays. */
export function nodeLabel(node: PageNode): string {
  return getPageComponent(node.type)?.label ?? node.type;
}
