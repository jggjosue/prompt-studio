'use client';

/**
 * Estado del Visual Website Builder.
 *
 * El documento solo cambia a través de mutaciones puras, y cada cambio se
 * registra como un **comando** (`ADD_COMPONENT`, `UPDATE_STYLES`, …) con las
 * instantáneas antes/después. El historial deshace y rehace comandos; el
 * `SaveManager` convierte la corriente de cambios en guardados debounced y
 * serializados hacia el backend (MongoDB), sin guardar en cada movimiento.
 */

import { getPageComponent } from '@/components/editor/page-components';
import { createLandingSchema, findPage, type PageComponentType, type PageNode, type SitePage, type SiteSchema } from '@/lib/editor/page-schema';
import {
  addNode,
  canInsert,
  canMove,
  clearNodeStyle,
  duplicateNode,
  insertSectionNode,
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
import { EditorHistory, makeCommand, type EditorCommand } from '@/lib/editor/editor-commands';
import {
  SaveManager,
  StaleSaveError,
  type SaveFailure,
  type SaveStatus,
} from '@/lib/editor/save-manager';
import { EDITOR_BREAKPOINTS, type EditorBreakpoint } from '@/lib/editor/responsive';
import { createSection, getSectionDefinition, type SectionId } from '@/lib/editor/page-sections';
import { applyAIEditOps, type AIEditOp } from '@/lib/editor/ai-edit-ops';
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
export const DEVICE_WIDTH: Record<EditorBreakpoint, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

export const DEVICE_ORDER: readonly EditorBreakpoint[] = EDITOR_BREAKPOINTS;

const AUTOSAVE_DEBOUNCE_MS = 1200;

/** Lo que se está arrastrando en este momento. */
export type DragState =
  | { source: 'library'; type: PageComponentType; label: string }
  | { source: 'section'; sectionId: SectionId; label: string }
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
  /** Id del sitio (borrador persistido), para publicación. */
  siteId: string | undefined;
  device: EditorBreakpoint;
  drag: DragState | null;
  selectedId: string | null;
  selected: NodeLocation | null;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  saveFailure: SaveFailure | null;
  isDirty: boolean;
  setDevice: (device: EditorBreakpoint) => void;
  setDrag: (drag: DragState | null) => void;
  select: (nodeId: string | null) => void;
  /** Vista previa del rechazo para un tipo de la biblioteca, sin aplicarlo. */
  previewInsert: (type: PageComponentType, target: DropTarget) => OpsError | null;
  previewMove: (nodeId: string, target: DropTarget) => OpsError | null;
  addComponent: (type: PageComponentType, target: DropTarget) => OpsError | null;
  /** Vista previa del rechazo al insertar una sección de la biblioteca. */
  previewSectionInsert: (sectionId: SectionId, target: DropTarget) => OpsError | null;
  /** Inserta una sección preconstruida en el primer nivel. */
  insertSection: (sectionId: SectionId, target: DropTarget) => OpsError | null;
  moveExisting: (nodeId: string, target: DropTarget) => OpsError | null;
  duplicate: (nodeId: string) => OpsError | null;
  remove: (nodeId: string) => void;
  move: (nodeId: string, delta: number) => void;
  setProp: (nodeId: string, key: string, value: unknown) => OpsError | null;
  setStyle: (nodeId: string, property: string, value: string | number, breakpoint: EditorBreakpoint) => OpsError | null;
  clearStyle: (nodeId: string, property: string, breakpoint: EditorBreakpoint) => OpsError | null;
  resetProp: (nodeId: string, key: string) => void;
  resetStyles: (nodeId: string) => void;
  resetComponent: (nodeId: string) => void;
  undo: () => void;
  redo: () => void;
  /** Carga un documento nuevo (p. ej. generado por IA) y reinicia el historial. */
  loadSchema: (schema: SiteSchema) => void;
  /** Nodo sobre el que está abierta la edición por IA, o null. */
  aiEditTarget: string | null;
  openAIEdit: (nodeId: string | null) => void;
  /** Aplica operaciones de IA validadas contra el documento (deshacible). */
  applyAIEdit: (ops: AIEditOp[]) => OpsError | null;
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
  projectId,
  initialVersion,
}: {
  children: ReactNode;
  initialSchema?: SiteSchema;
  initialSlug?: string;
  /** Id del borrador persistido; `undefined` crea uno nuevo al primer guardado. */
  projectId?: string;
  /** Versión del borrador cargado, para concurrencia optimista. */
  initialVersion?: number | null;
}) {
  const [schema, setSchema] = useState<SiteSchema>(() => initialSchema ?? createLandingSchema());
  const [slug, setSlug] = useState<string | undefined>(initialSlug);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<EditorBreakpoint>('desktop');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('clean');
  const [saveFailure, setSaveFailure] = useState<SaveFailure | null>(null);
  const [aiEditTarget, setAIEditTarget] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | undefined>(projectId);

  const historyRef = useRef(new EditorHistory());
  const projectIdRef = useRef<string | undefined>(projectId);
  const saveManagerRef = useRef<SaveManager | null>(null);

  if (saveManagerRef.current === null) {
    saveManagerRef.current = new SaveManager({
      debounceMs: AUTOSAVE_DEBOUNCE_MS,
      save: async ({ schema: payload, version }) => {
        const id = projectIdRef.current;
        const response = await fetch(`/api/page-composer/projects/${id ?? 'new'}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema: payload, version }),
        });
        if (response.status === 409) throw new StaleSaveError();
        if (!response.ok) throw new Error(`Guardado falló (${response.status}).`);
        const data = (await response.json()) as { id?: string; version: number };
        if (typeof data.id === 'string') {
          projectIdRef.current = data.id;
          setSiteId(data.id);
        }
        return { version: data.version, id: data.id };
      },
      onStatus: setSaveStatus,
      onFailure: setSaveFailure,
    });
    saveManagerRef.current.setVersion(initialVersion ?? null);
  }

  /** Registra un comando aplicado y agenda el guardado del nuevo documento. */
  const commit = useCallback((command: EditorCommand) => {
    historyRef.current.push(command);
    setSchema(() => command.after);
    saveManagerRef.current?.markDirty(command.after);
  }, []);

  const undo = useCallback(() => {
    const command = historyRef.current.undo();
    if (!command) return;
    setSchema(() => command.before);
    saveManagerRef.current?.markDirty(command.before);
  }, []);

  const redo = useCallback(() => {
    const command = historyRef.current.redo();
    if (!command) return;
    setSchema(() => command.after);
    saveManagerRef.current?.markDirty(command.after);
  }, []);

  const loadSchema = useCallback((next: SiteSchema) => {
    historyRef.current.clear();
    setSchema(() => next);
    saveManagerRef.current?.markDirty(next);
  }, []);

  const applyAIEdit = useCallback(
    (ops: AIEditOp[]): OpsError | null => {
      const outcome = applyAIEditOps(schema, slug, ops, deps);
      if (!outcome.ok) {
        return { ok: false, reason: 'invalid-prop', message: outcome.error };
      }
      commit(
        makeCommand('UPDATE_PROPS', `Editar con IA (${outcome.applied.length} operaciones)`, schema, outcome.schema)
      );
      return null;
    },
    [schema, slug, commit]
  );

  // Atajos de teclado: Cmd/Ctrl+Z deshace, Cmd/Ctrl+Shift+Z rehace.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key !== 'z') return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  // Al cerrar la pestaña, guardar lo pendiente (best effort).
  useEffect(() => {
    const onBeforeUnload = () => {
      saveManagerRef.current?.flush();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      saveManagerRef.current?.dispose();
    };
  }, []);

  const page = useMemo(() => findPage(schema, slug), [schema, slug]);
  const selected = useMemo(
    () => (page && selectedId ? locateNode(page, selectedId) ?? null : null),
    [page, selectedId]
  );

  const addComponent = useCallback(
    (type: PageComponentType, target: DropTarget): OpsError | null => {
      const result = addNode(schema, slug, target, type, deps);
      if (!result.ok) return result;
      commit(makeCommand('ADD_COMPONENT', `Añadir ${getPageComponent(type)?.label ?? type}`, schema, result.schema));
      setSelectedId(result.id);
      return null;
    },
    [schema, slug, commit]
  );

  const previewSectionInsert = useCallback(
    (sectionId: SectionId, target: DropTarget): OpsError | null => {
      const rootType = getSectionDefinition(sectionId).type;
      return canInsert(schema, slug, target, rootType);
    },
    [schema, slug]
  );

  const insertSection = useCallback(
    (sectionId: SectionId, target: DropTarget): OpsError | null => {
      if (target.parentId !== null) {
        return { ok: false, reason: 'invalid-nesting', message: 'Las secciones solo pueden vivir en el primer nivel.' };
      }
      const node = createSection(sectionId, deps.makeId);
      const result = insertSectionNode(schema, slug, target.index, node);
      if (!result.ok) return result;
      commit(
        makeCommand('ADD_COMPONENT', `Insertar sección ${getSectionDefinition(sectionId).label}`, schema, result.schema)
      );
      setSelectedId(result.id);
      return null;
    },
    [schema, slug, commit]
  );

  const moveExisting = useCallback(
    (nodeId: string, target: DropTarget): OpsError | null => {
      const result = moveNode(schema, slug, nodeId, target);
      if (!result.ok) return result;
      commit(makeCommand('MOVE_COMPONENT', `Mover ${nodeId}`, schema, result.schema));
      setSelectedId(nodeId);
      return null;
    },
    [schema, slug, commit]
  );

  const duplicate = useCallback(
    (nodeId: string): OpsError | null => {
      const result = duplicateNode(schema, slug, nodeId, deps);
      if (!result.ok) return result;
      commit(makeCommand('DUPLICATE_COMPONENT', `Duplicar ${nodeId}`, schema, result.schema));
      setSelectedId(result.id);
      return null;
    },
    [schema, slug, commit]
  );

  const remove = useCallback(
    (nodeId: string) => {
      const result = removeNode(schema, slug, nodeId);
      if (!result.ok) return;
      commit(makeCommand('REMOVE_COMPONENT', `Eliminar ${nodeId}`, schema, result.schema));
      setSelectedId(current => (current === nodeId ? null : current));
    },
    [schema, slug, commit]
  );

  const move = useCallback(
    (nodeId: string, delta: number) => {
      const result = moveWithinParent(schema, slug, nodeId, delta);
      if (!result.ok) return;
      commit(makeCommand('MOVE_COMPONENT', `Reordenar ${nodeId}`, schema, result.schema));
    },
    [schema, slug, commit]
  );

  const setProp = useCallback(
    (nodeId: string, key: string, value: unknown): OpsError | null => {
      const result = setNodeProp(schema, slug, nodeId, key, value);
      if (!result.ok) return result;
      commit(makeCommand('UPDATE_PROPS', `Editar ${nodeId}.${key}`, schema, result.schema));
      return null;
    },
    [schema, slug, commit]
  );

  const setStyle = useCallback(
    (nodeId: string, property: string, value: string | number, breakpoint: EditorBreakpoint): OpsError | null => {
      const result = setNodeStyle(schema, slug, nodeId, property, value, breakpoint);
      if (!result.ok) return result;
      commit(makeCommand('UPDATE_STYLES', `Estilo ${nodeId}.${property}`, schema, result.schema));
      return null;
    },
    [schema, slug, commit]
  );

  const clearStyle = useCallback(
    (nodeId: string, property: string, breakpoint: EditorBreakpoint): OpsError | null => {
      const result = clearNodeStyle(schema, slug, nodeId, property, breakpoint);
      if (!result.ok) return result;
      commit(makeCommand('UPDATE_STYLES', `Heredar ${nodeId}.${property}`, schema, result.schema));
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
      if (result.ok) commit(makeCommand('UPDATE_PROPS', `Restablecer ${nodeId}.${key}`, schema, result.schema));
    },
    [schema, slug, commit, page]
  );

  const resetStyles = useCallback(
    (nodeId: string) => {
      const result = resetNodeStyles(schema, slug, nodeId);
      if (result.ok) commit(makeCommand('UPDATE_STYLES', `Restablecer estilos de ${nodeId}`, schema, result.schema));
    },
    [schema, slug, commit]
  );

  const resetComponent = useCallback(
    (nodeId: string) => {
      const location = page ? locateNode(page, nodeId) : undefined;
      if (!location) return;
      const defaults = getPageComponent(location.node.type)?.defaultProps ?? {};
      const result = resetNode(schema, slug, nodeId, defaults);
      if (result.ok) commit(makeCommand('UPDATE_PROPS', `Restablecer ${nodeId}`, schema, result.schema));
    },
    [schema, slug, commit, page]
  );

  const canUndo = historyRef.current.canUndo;
  const canRedo = historyRef.current.canRedo;

  const value: BuilderContextValue = useMemo(
    () => ({
      schema,
      page,
      slug,
      siteId,
      device,
      drag,
      selectedId,
      selected,
      canUndo,
      canRedo,
      saveStatus,
      saveFailure,
      isDirty: saveStatus === 'dirty' || saveStatus === 'error',
      setSlug,
      setDevice,
      setDrag,
      select: setSelectedId,
      previewInsert: (type, target) => canInsert(schema, slug, target, type),
      previewMove: (nodeId, target) => canMove(schema, slug, nodeId, target),
      addComponent,
      previewSectionInsert,
      insertSection,
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
      loadSchema,
      aiEditTarget,
      openAIEdit: setAIEditTarget,
      applyAIEdit,
    }),
    [
      schema,
      page,
      slug,
      siteId,
      device,
      drag,
      selectedId,
      selected,
      saveStatus,
      saveFailure,
      canUndo,
      canRedo,
      addComponent,
      previewSectionInsert,
      insertSection,
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
      loadSchema,
      aiEditTarget,
      applyAIEdit,
    ]
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

/** Etiqueta legible de un nodo, para el lienzo y los overlays. */
export function nodeLabel(node: PageNode): string {
  return getPageComponent(node.type)?.label ?? node.type;
}