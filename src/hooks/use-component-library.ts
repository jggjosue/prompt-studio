'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { SIGN_UP_PATH } from '@/lib/membership-access';

export type ComponentGroup = { id: string; name: string; componentIds: string[]; createdAt: string };
export type RecentComponent = { id: string; seenAt: string };
export type ComponentLibraryState = {
  favorites: string[];
  recent: RecentComponent[];
  collections: ComponentGroup[];
  projects: ComponentGroup[];
};

const STORAGE_KEY = 'prompt-studio-component-library-v1';
const EVENT_NAME = 'prompt-studio-component-library-change';
const API = '/api/component-library';
const SAVE_DEBOUNCE_MS = 500;

const empty: ComponentLibraryState = { favorites: [], recent: [], collections: [], projects: [] };
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function normalize(value: Partial<ComponentLibraryState> | null): ComponentLibraryState {
  return {
    favorites: Array.isArray(value?.favorites) ? value.favorites : [],
    recent: Array.isArray(value?.recent) ? value.recent : [],
    collections: Array.isArray(value?.collections) ? value.collections : [],
    projects: Array.isArray(value?.projects) ? value.projects : [],
  };
}

/**
 * Caché local. **No** es la fuente de verdad: sirve para pintar sin esperar a la
 * red y para que dos pestañas abiertas no se contradigan. Lo que se conserva
 * vive en `component_libraries`, en la base de datos.
 */
function readCache(): ComponentLibraryState {
  try {
    return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return empty;
  }
}

function writeCache(state: ComponentLibraryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* modo privado o almacenamiento lleno: seguimos con el estado en memoria */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

/**
 * Favoritos, recientes, colecciones y proyectos del usuario.
 *
 * Requiere sesión: sin ella no se guarda nada y `requiresAuth` queda en `true`
 * para que quien llame mande a crear cuenta (`requestAccount`). Antes todo vivía
 * en `localStorage`, así que la biblioteca se perdía al cambiar de navegador y
 * no había forma de recuperarla.
 */
export function useComponentLibrary() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ComponentLibraryState>(empty);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<ComponentLibraryState>(empty);
  const saveTimer = useRef<number | null>(null);
  const pendingSave = useRef(false);

  const setBoth = useCallback((next: ComponentLibraryState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /** Sincronización entre pestañas y con la caché local. */
  useEffect(() => {
    const sync = (event: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as ComponentLibraryState | null) : null;
      setBoth(detail ? normalize(detail) : readCache());
    };
    setBoth(readCache());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [setBoth]);

  /** Carga desde la base de datos en cuanto se conoce la sesión. */
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // Sin sesión no se muestra la caché: daría la impresión de estar guardado.
      setBoth(empty);
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(API, { cache: 'no-store' });
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as { library?: Partial<ComponentLibraryState> };
        if (cancelled) return;
        const remote = normalize(body.library ?? null);
        setBoth(remote);
        writeCache(remote);
      } catch {
        // La red puede fallar; se sigue con la caché local para no dejar la
        // pantalla vacía, y el siguiente cambio reintenta el guardado.
        if (!cancelled) setBoth(readCache());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setBoth]);

  const flush = useCallback(() => {
    if (!pendingSave.current) return;
    pendingSave.current = false;
    void fetch(API, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(stateRef.current),
      keepalive: true,
    }).catch(() => {
      /* se reintenta con el siguiente cambio */
    });
  }, []);

  /** Guardado diferido: arrastrar o teclear no debe disparar una petición por pulsación. */
  const scheduleSave = useCallback(() => {
    pendingSave.current = true;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      flush();
    }, SAVE_DEBOUNCE_MS);
  }, [flush]);

  /** Si el usuario cierra o cambia de pestaña con cambios sin enviar, se envían. */
  useEffect(() => {
    const onHide = () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      flush();
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });
    return () => window.removeEventListener('pagehide', onHide);
  }, [flush]);

  /** Manda a crear cuenta conservando el destino. */
  const requestAccount = useCallback(
    (returnTo?: string) => {
      const target = returnTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/my-components');
      router.push(`${SIGN_UP_PATH}?redirect_url=${encodeURIComponent(target)}`);
    },
    [router]
  );

  const update = useCallback(
    (recipe: (current: ComponentLibraryState) => ComponentLibraryState): boolean => {
      if (!isSignedIn) {
        requestAccount();
        return false;
      }
      const next = recipe(stateRef.current);
      setBoth(next);
      writeCache(next);
      scheduleSave();
      return true;
    },
    [isSignedIn, requestAccount, scheduleSave, setBoth]
  );

  const toggleFavorite = (id: string) => {
    const adding = !stateRef.current.favorites.includes(id);
    const applied = update(current => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter(value => value !== id)
        : [id, ...current.favorites],
    }));
    if (applied && adding) {
      trackAnalyticsEvent('component_favorite_add', {
        item_id: id,
        item_category: id.split('-')[0],
        action_source: 'component-library',
      });
    }
  };

  /**
   * «Visto recientemente» no debe empujar a registrarse: se dispara al abrir un
   * componente, no al pulsar un botón. Sin sesión simplemente no se registra.
   */
  const markRecent = (id: string) => {
    if (!isSignedIn) return;
    update(current => ({
      ...current,
      recent: [{ id, seenAt: new Date().toISOString() }, ...current.recent.filter(item => item.id !== id)].slice(0, 24),
    }));
  };

  const createGroup = (kind: 'collections' | 'projects', name: string) => {
    const clean = name.trim().slice(0, 60);
    if (!clean) return;
    update(current => ({
      ...current,
      [kind]: [...current[kind], { id: uid(), name: clean, componentIds: [], createdAt: new Date().toISOString() }],
    }));
  };

  const addToGroup = (kind: 'collections' | 'projects', groupId: string, componentId: string) => {
    const group = stateRef.current[kind].find(value => value.id === groupId);
    const adding = !group?.componentIds.includes(componentId);
    const applied = update(current => ({
      ...current,
      [kind]: current[kind].map(item =>
        item.id === groupId
          ? {
              ...item,
              componentIds: item.componentIds.includes(componentId)
                ? item.componentIds
                : [...item.componentIds, componentId],
            }
          : item
      ),
    }));
    if (applied && adding) {
      trackAnalyticsEvent('component_project_add', {
        item_id: componentId,
        item_category: componentId.split('-')[0],
        group_type: kind,
        group_id: groupId,
        action_source: 'component-library',
      });
    }
  };

  const removeFromGroup = (kind: 'collections' | 'projects', groupId: string, componentId: string) =>
    update(current => ({
      ...current,
      [kind]: current[kind].map(item =>
        item.id === groupId
          ? { ...item, componentIds: item.componentIds.filter(id => id !== componentId) }
          : item
      ),
    }));

  const deleteGroup = (kind: 'collections' | 'projects', groupId: string) =>
    update(current => ({ ...current, [kind]: current[kind].filter(group => group.id !== groupId) }));

  return {
    state,
    ready,
    /** `true` cuando hace falta cuenta para que estas acciones hagan algo. */
    requiresAuth: isLoaded && !isSignedIn,
    requestAccount,
    toggleFavorite,
    markRecent,
    createGroup,
    addToGroup,
    removeFromGroup,
    deleteGroup,
  };
}
