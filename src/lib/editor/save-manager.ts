/**
 * Gestor de autoguardado.
 *
 * Convierte una corriente de cambios en guardados serializados y debounced:
 *
 * - **Debounce**: los cambios seguidos (teclear, mover el ratón) se coalescen en
 *   un solo guardado cuando el documento lleva un momento quieto.
 * - **Sin carreras**: solo hay un guardado en vuelo; si llegan cambios mientras
 *   guarda, se agenda uno nuevo tras terminar y con el schema más reciente.
 * - **Sin peticiones duplicadas**: un mismo documento nunca se manda dos veces en
 *   paralelo; la ráfaga más reciente gana.
 * - **Actualizaciones obsoletas**: el `version` viaja con el schema; si el backend
 *   la rechaza (otra pestaña guardó antes), el gestor lo marca como `stale` y
 *   detiene el reintento automático en lugar de pisar datos ajenos.
 *
 * Es agnóstico de la UI para poder probarse con timers reales y un `save` falso.
 */

import type { SiteSchema } from './page-schema';

export type SaveStatus = 'clean' | 'dirty' | 'saving' | 'error';
export type SaveFailure = 'failed' | 'stale';

export type SaveResult = { version: number; id?: string };

export type SavePayload = { schema: SiteSchema; version: number | null };

export type SaveFn = (payload: SavePayload) => Promise<SaveResult>;

export type SaveManagerOptions = {
  /** Tiempo de espera tras el último cambio antes de guardar. */
  debounceMs?: number;
  /** Espera extra antes de reintentar un guardado fallido. */
  retryMs?: number;
  save: SaveFn;
  onStatus?: (status: SaveStatus) => void;
  onFailure?: (failure: SaveFailure | null) => void;
};

/** Error lanzado por `save` cuando el backend detecta una versión obsoleta. */
export class StaleSaveError extends Error {
  constructor(message = 'El documento cambió en otro lado.') {
    super(message);
    this.name = 'StaleSaveError';
  }
}

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

export class SaveManager {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private latest: SiteSchema | null = null;
  private pending: SiteSchema | null = null;
  private inFlight = false;
  private version: number | null = null;
  private status: SaveStatus = 'clean';
  private failure: SaveFailure | null = null;
  private disposed = false;
  private readonly debounceMs: number;
  private readonly retryMs: number;
  private readonly save: SaveFn;
  private readonly onStatus?: (status: SaveStatus) => void;
  private readonly onFailure?: (failure: SaveFailure | null) => void;

  constructor(options: SaveManagerOptions) {
    this.debounceMs = options.debounceMs ?? 1200;
    this.retryMs = options.retryMs ?? options.debounceMs ?? 1200;
    this.save = options.save;
    this.onStatus = options.onStatus;
    this.onFailure = options.onFailure;
  }

  getStatus(): SaveStatus {
    return this.status;
  }

  getFailure(): SaveFailure | null {
    return this.failure;
  }

  get isDirty(): boolean {
    return this.status === 'dirty' || this.status === 'error';
  }

  /** Versión con la que se cargó el documento; se avanza con cada guardado. */
  setVersion(version: number | null): void {
    this.version = version;
  }

  /** Un cambio de documento: agenda un guardado debounced. */
  markDirty(schema: SiteSchema): void {
    if (this.disposed) return;
    this.latest = schema;
    this.pending = schema;
    this.failure = null;
    this.onFailure?.(null);
    this.setStatus('dirty');
    this.schedule(this.debounceMs);
  }

  /** Fuerza un guardado inmediato (p. ej. al cerrar la pestaña). */
  flush(): void {
    this.cancelTimer();
    void this.runSave();
  }

  dispose(): void {
    this.disposed = true;
    this.cancelTimer();
  }

  /** Espera a que terminen los guardados en vuelo y los pendientes. Para tests. */
  async idle(): Promise<void> {
    while (this.inFlight || this.pending !== null || this.timer !== null) {
      await tick();
    }
  }

  private setStatus(status: SaveStatus): void {
    this.status = status;
    this.onStatus?.(status);
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(delay: number): void {
    if (this.disposed || this.timer !== null || this.inFlight) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.runSave();
    }, delay);
  }

  /** Reintento con backoff: se agenda aunque haya un guardado en vuelo. */
  private scheduleRetry(): void {
    if (this.disposed || this.timer !== null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.runSave();
    }, this.retryMs);
  }

  private async runSave(): Promise<void> {
    if (this.disposed || this.inFlight) return;
    const payload = this.pending;
    if (payload === null) return;
    this.pending = null;
    this.inFlight = true;
    this.setStatus('saving');

    try {
      const result = await this.save({ schema: payload, version: this.version });
      this.version = result.version;
      this.failure = null;
      this.onFailure?.(null);
      const changedDuringSave = this.pending !== null || this.latest !== payload;
      if (changedDuringSave) this.setStatus('dirty');
      else this.setStatus('clean');
    } catch (error) {
      const failure = error instanceof StaleSaveError ? 'stale' : 'failed';
      // El documento sigue sin guardar; no se pierde.
      this.pending = payload;
      this.failure = failure;
      this.onFailure?.(failure);
      this.setStatus('error');
      if (failure === 'failed') {
        // Error transitorio: reintentar con espera. Un `stale` no se reintenta.
        this.scheduleRetry();
      }
    } finally {
      this.inFlight = false;
      // Si hubo cambios durante el guardado y nadie agendó un reintento, se
      // guarda lo más reciente. El `stale` se deja quieto hasta re-sincronizar.
      if (this.pending !== null && this.failure !== 'stale' && this.timer === null) {
        this.schedule(0);
      }
    }
  }
}

/* ------------------------------------------------- persistencia al salir --- */

/**
 * Tope que aceptan los navegadores en una petición con `keepalive`.
 *
 * Por encima de este tamaño el navegador rechaza la petición entera, también en
 * el uso normal: no es solo un límite de la descarga. Por eso `keepalive` se
 * decide por tamaño y no se activa de forma incondicional.
 */
export const KEEPALIVE_MAX_BYTES = 64 * 1024;

const encoder = new TextEncoder();

/** Tamaño real en bytes: los acentos y los emoji ocupan más de un carácter. */
export function payloadBytes(body: string): number {
  return encoder.encode(body).length;
}

/** `true` si el cuerpo cabe en una petición `keepalive`. */
export function canUseKeepalive(body: string): boolean {
  return payloadBytes(body) <= KEEPALIVE_MAX_BYTES;
}

/** Superficie mínima del DOM que necesita el ciclo de salida, para poder testearlo. */
export type UnloadHost = {
  addEventListener(type: string, listener: (event: { preventDefault?: () => void }) => void): void;
  removeEventListener(type: string, listener: (event: { preventDefault?: () => void }) => void): void;
};

export type UnloadTarget = UnloadHost & {
  visibilityState?: string;
  /** `pagehide` no se dispara en todos los cierres; la visibilidad sí al cambiar de pestaña. */
  document?: UnloadHost & { visibilityState: string };
};

/**
 * Conecta el gestor a la salida de la página.
 *
 * - `pagehide` e `visibilitychange` fuerzan el guardado pendiente: son los
 *   eventos que llegan tanto al cerrar como al cambiar de pestaña o enviar la
 *   app a segundo plano en móvil. `beforeunload` no sirve para esto porque el
 *   navegador aborta la petición al descargar y bloquea el bfcache.
 * - `beforeunload` solo avisa: si quedan cambios sin guardar se cancela el
 *   cierre para que el navegador pregunte, en vez de perder el trabajo en
 *   silencio.
 *
 * Devuelve la función de limpieza.
 */
export function bindUnloadSave(
  target: UnloadTarget,
  actions: { flush: () => void; isDirty: () => boolean }
): () => void {
  const onPageHide = () => actions.flush();
  const onVisibility = () => {
    if (target.document?.visibilityState === 'hidden') actions.flush();
  };
  const onBeforeUnload = (event: { preventDefault?: () => void }) => {
    if (!actions.isDirty()) return;
    event.preventDefault?.();
  };

  target.addEventListener('pagehide', onPageHide);
  target.addEventListener('beforeunload', onBeforeUnload);
  target.document?.addEventListener('visibilitychange', onVisibility);

  return () => {
    target.removeEventListener('pagehide', onPageHide);
    target.removeEventListener('beforeunload', onBeforeUnload);
    target.document?.removeEventListener('visibilitychange', onVisibility);
  };
}