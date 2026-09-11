'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createEditorStore, useEditorSelector, type EditorState, type EditorStore } from '@/lib/editor/store';
import { incrementalIds } from '@/lib/editor/document';

/**
 * Una sola instancia del store por editor montado.
 *
 * El store vive fuera de React (`useSyncExternalStore`), así que el contexto
 * solo transporta la referencia: cambiar el documento **no** re-renderiza a los
 * consumidores del contexto, solo a quienes tengan un selector afectado. Ese es
 * justo el comportamiento que el editor necesita con cientos de nodos.
 */
const EditorStoreContext = createContext<EditorStore | null>(null);

export function EditorStoreProvider({ children, store }: { children: ReactNode; store?: EditorStore }) {
  const value = useMemo(() => store ?? createEditorStore(incrementalIds()), [store]);
  return <EditorStoreContext.Provider value={value}>{children}</EditorStoreContext.Provider>;
}

export function useEditorStore(): EditorStore {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('useEditorStore debe usarse dentro de <EditorStoreProvider>');
  return store;
}

/** Azúcar: selector sobre el store del contexto. */
export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useEditorSelector(useEditorStore(), selector);
}
