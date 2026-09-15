'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { EditorStore } from '@/lib/editor/store';

const DEBOUNCE_MS = 1200;

/**
 * Autoguardado del editor.
 *
 * Debounce de 1,2 s: arrastrar un nodo genera decenas de comandos y no puede
 * salir una petición por cada uno. Al ocultar la pestaña se fuerza el envío con
 * `keepalive`, porque el caso real de pérdida de trabajo es cerrar el portátil,
 * no esperar dos segundos.
 *
 * El estado de guardado vive en `runtime.save` y lo pinta la barra de estado:
 * «cambios sin guardar» → «guardando…» → «guardado».
 */
export function useEditorAutosave(store: EditorStore, options: { name: string; projectId?: string | null; sourcePageId?: string | null; enabled?: boolean }) {
  const timer = useRef<number | null>(null);
  const idRef = useRef<string | null>(options.projectId ?? null);
  const enabled = options.enabled !== false;

  const save = useCallback(
    async (snapshot?: string) => {
      const state = store.getState();
      if (state.runtime.save === 'saving') return;
      store.setRuntime({ save: 'saving' });
      try {
        const response = await fetch('/api/editor/projects', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: idRef.current,
            name: options.name,
            document: state.document,
            ...(options.sourcePageId ? { sourcePageId: options.sourcePageId } : {}),
            ...(snapshot ? { snapshot } : {}),
          }),
          keepalive: true,
        });
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as { id?: string };
        if (body.id) idRef.current = body.id;
        store.setRuntime({ save: 'saved', lastError: null });
      } catch {
        // No se pierde nada: el documento sigue en memoria y el siguiente
        // cambio reintenta. Lo que no se puede es decir «guardado» sin serlo.
        store.setRuntime({ save: 'error' });
      }
    },
    [options.name, options.sourcePageId, store]
  );

  useEffect(() => {
    if (!enabled) return;
    const schedule = () => {
      if (store.getState().runtime.save !== 'dirty') return;
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void save();
      }, DEBOUNCE_MS);
    };
    // El documento inicial puede marcarse como dirty antes de que este efecto
    // se suscriba; comprobarlo al montar garantiza que una copia de plantilla
    // también se persista sin una edición manual adicional.
    schedule();
    return store.subscribe(schedule);
  }, [enabled, save, store]);

  useEffect(() => {
    if (!enabled) return;
    const flush = () => {
      if (store.getState().runtime.save !== 'dirty') return;
      if (timer.current !== null) window.clearTimeout(timer.current);
      void save();
    };
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, save, store]);

  return { saveNow: save, projectId: idRef };
}
