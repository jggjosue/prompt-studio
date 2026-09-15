'use client';

import { EditorShell } from '@/components/editor/editor-shell';
import { useEditorAutosave } from '@/hooks/use-editor-autosave';
import { createNode, incrementalIds, migrateDocument, type EditorDocument } from '@/lib/editor/document';
import { createEditorStore } from '@/lib/editor/store';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Editor listo para montar: store propio, documento inicial y autoguardado.
 *
 * Se separa del `EditorShell` para que el shell siga siendo una pieza tonta que
 * se puede montar en pruebas con un store de mentira, sin red ni persistencia.
 */
export function EditorWorkspace({
  name = 'Proyecto sin título',
  initialDocument,
  sourcePageId,
  showCanvasCoordinates = false,
  previewUrl,
  onSave,
}: {
  name?: string;
  initialDocument?: EditorDocument | null;
  sourcePageId?: string | null;
  showCanvasCoordinates?: boolean;
  previewUrl?: string | null;
  onSave?: () => void;
}) {
  const store = useMemo(() => createEditorStore(incrementalIds()), []);
  const [loaded, setLoaded] = useState(false);
  // La semilla pertenece a la instancia del editor. Referencias estables evitan
  // que Turbopack conserve un efecto con una lista de dependencias de otra
  // versión durante Fast Refresh (el aviso “changed size between renders”).
  const initialDocumentRef = useRef(initialDocument);
  const sourcePageIdRef = useRef(sourcePageId);
  useEditorAutosave(store, { name, sourcePageId, enabled: loaded });

  /** Carga el último proyecto o siembra una sección para no arrancar en blanco. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seedDocument = initialDocumentRef.current;
      const sourceId = sourcePageIdRef.current;
      // Una landing comprada primero intenta recuperar su copia previa. Si aún
      // no existe, se siembra desde el diseño de catálogo recibido por servidor.
      if (sourceId) {
        try {
          const response = await fetch(`/api/editor/projects?sourcePageId=${encodeURIComponent(sourceId)}`, { cache: 'no-store' });
          if (response.ok) {
            const body = (await response.json()) as { projects?: Array<{ document: unknown }> };
            const stored = body.projects?.[0]?.document;
            const migrated = stored ? migrateDocument(stored as Record<string, unknown>) : null;
            if (migrated && !cancelled) {
              store.replaceDocument(migrated, { resetHistory: true });
              setLoaded(true);
              return;
            }
          }
        } catch {
          /* sin red: se usa la semilla local */
        }
      }
      if (seedDocument) {
        store.replaceDocument(seedDocument, { resetHistory: true });
        // Una plantilla es una copia nueva, no un proyecto ya guardado. Marcarla
        // como dirty activa el autosave y evita que solo exista en memoria hasta
        // que el usuario haga su primera edición.
        store.setRuntime({ save: 'dirty' });
        setLoaded(true);
        return;
      }
      try {
        const response = await fetch('/api/editor/projects', { cache: 'no-store' });
        if (response.ok) {
          const body = (await response.json()) as { projects?: Array<{ document: unknown }> };
          const stored = body.projects?.[0]?.document;
          const migrated = stored ? migrateDocument(stored as Record<string, unknown>) : null;
          if (migrated && !cancelled) {
            store.replaceDocument(migrated, { resetHistory: true });
            setLoaded(true);
            return;
          }
        }
      } catch {
        /* sin red: se arranca con el documento en blanco */
      }
      if (cancelled) return;
      const state = store.getState();
      if (state.document.nodes[state.document.rootId].children.length === 0) {
        const section = createNode('section', store.nextId);
        store.run({ kind: 'insert', node: section, parentId: state.document.rootId, index: 0 });
        const container = createNode('container', store.nextId);
        store.run({ kind: 'insert', node: container, parentId: section.id, index: 0 });
        const heading = createNode('heading', store.nextId);
        store.run({ kind: 'insert', node: heading, parentId: container.id, index: 0 });
        const text = createNode('text', store.nextId);
        store.run({ kind: 'insert', node: text, parentId: container.id, index: 1 });
        store.select([]);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const { saveNow } = useEditorAutosave(store, { name, sourcePageId, enabled: loaded });

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      void saveNow(new Date().toLocaleString());
    }
  };

  return <EditorShell store={store} name={name} showCanvasCoordinates={showCanvasCoordinates} previewUrl={previewUrl} onSave={handleSave} />;
}

export default EditorWorkspace;
