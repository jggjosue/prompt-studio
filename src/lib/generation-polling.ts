/**
 * Política de sondeo del estado de una generación.
 *
 * Antes cada generador repetía un bucle propio con intervalo fijo: 2-3 s
 * durante todo el trabajo, sin parar nunca antes de agotar los intentos. Eso
 * castiga igual a una imagen que tarda 4 s y a un video de 2 minutos, y mantiene
 * el sondeo activo aunque la pestaña esté en segundo plano.
 *
 * Aquí se concentran las tres decisiones que antes estaban duplicadas:
 * 1. qué estados son terminales y por tanto cortan el sondeo,
 * 2. cuánto se espera entre peticiones (empieza rápido y se aleja),
 * 3. que una pestaña oculta no genere peticiones.
 */

export const TERMINAL_GENERATION_STATUSES = [
  'completed',
  'failed',
  'cancelled',
  'dead_letter',
] as const;

export type TerminalGenerationStatus = (typeof TERMINAL_GENERATION_STATUSES)[number];

export function isTerminalGenerationStatus(status: unknown): boolean {
  return typeof status === 'string' && (TERMINAL_GENERATION_STATUSES as readonly string[]).includes(status);
}

/**
 * Mensaje para un trabajo que ya no va a cambiar. `lastError` solo se serializa
 * para `failed`, así que `cancelled` y `dead_letter` reciben su propio texto:
 * en ambos casos los créditos fueron devueltos y conviene decirlo.
 */
export function terminalGenerationMessage(job: Record<string, unknown> | null | undefined, status: unknown): string {
  const lastError = job?.lastError;
  if (typeof lastError === 'string' && lastError) return lastError;
  if (status === 'cancelled') return 'La generación se canceló y los créditos fueron devueltos.';
  if (status === 'dead_letter') return 'La generación se detuvo y los créditos fueron devueltos.';
  return 'El trabajo falló en el servidor.';
}

export interface GenerationPollSchedule {
  /** Espera del primer sondeo: casi todas las imágenes están listas enseguida. */
  firstDelayMs: number;
  /** Techo del intervalo: un trabajo largo no puede exigir peticiones cada 3 s. */
  maxDelayMs: number;
  /** Crecimiento por intento. */
  factor: number;
  /** Techo total; al alcanzarlo se informa de tiempo de espera agotado. */
  maxElapsedMs: number;
}

/** 180 s es el techo que ya usaba el generador de imágenes (90 × 2 s). */
export const DEFAULT_GENERATION_POLL_SCHEDULE: GenerationPollSchedule = {
  firstDelayMs: 1_500,
  maxDelayMs: 15_000,
  factor: 1.6,
  maxElapsedMs: 180_000,
};

/** Conserva el presupuesto total original de cada flujo, cambiando solo el espaciado. */
export function withGenerationPollBudget(maxElapsedMs: number, overrides: Partial<GenerationPollSchedule> = {}): GenerationPollSchedule {
  return { ...DEFAULT_GENERATION_POLL_SCHEDULE, maxElapsedMs, ...overrides };
}

/** Texto y visión: antes 25 × 2 s = 50 s. */
export const TEXT_GENERATION_POLL_SCHEDULE = withGenerationPollBudget(50_000);

/** Video, web y comprensión de video: antes 40 × 3 s = 120 s. */
export const LONG_GENERATION_POLL_SCHEDULE = withGenerationPollBudget(120_000);

export function nextGenerationPollDelayMs(attempt: number, schedule: GenerationPollSchedule = DEFAULT_GENERATION_POLL_SCHEDULE): number {
  if (attempt <= 0) return schedule.firstDelayMs;
  return Math.min(schedule.maxDelayMs, Math.round(schedule.firstDelayMs * schedule.factor ** attempt));
}

/**
 * Cuántas peticiones costaría un trabajo de `elapsedMs` con esta política.
 * Sirve para medir el ahorro: con intervalo fijo un video de 120 s gastaba 40
 * peticiones, con backoff adaptativo gastamos unas 12.
 */
export function plannedGenerationPollRequests(elapsedMs: number, schedule: GenerationPollSchedule = DEFAULT_GENERATION_POLL_SCHEDULE): number {
  let requests = 0;
  let cumulative = 0;
  let attempt = 0;
  while (cumulative < Math.min(elapsedMs, schedule.maxElapsedMs)) {
    cumulative += nextGenerationPollDelayMs(attempt, schedule);
    attempt += 1;
    requests += 1;
  }
  return requests;
}

/** Las peticiones de una pestaña oculta no aportan nada: el proveedor no avanza más rápido. */
export function isGenerationPollingPaused(target: { hidden?: boolean } | null | undefined = typeof document === 'undefined' ? null : document): boolean {
  return target?.hidden === true;
}

export interface GenerationPollWaitOptions {
  signal?: AbortSignal;
  sleep?: (ms: number) => Promise<void>;
  isPaused?: () => boolean;
  /** Cortes de espera antes de devolver el control al llamante. */
  maxSlices?: number;
  onResume?: () => void;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Espera la ventana del siguiente sondeo. Si la pestaña está oculta no se
 * consume el intervalo: se espera a que vuelva a estar visible, de modo que al
 * regresar el usuario ve el estado real sin acumular peticiones en segundo plano.
 * Devuelve `false` si se abortó mientras esperaba.
 */
export async function waitForGenerationPollWindow(delayMs: number, options: GenerationPollWaitOptions = {}): Promise<boolean> {
  const sleep = options.sleep ?? defaultSleep;
  const isPaused = options.isPaused ?? (() => isGenerationPollingPaused());
  const maxSlices = options.maxSlices ?? 200;
  let remaining = delayMs;
  let wasPaused = false;
  for (let slice = 0; slice <= maxSlices; slice += 1) {
    if (options.signal?.aborted) return false;
    const paused = isPaused();
    if (paused) {
      wasPaused = true;
      await sleep(1_000);
      continue;
    }
    if (wasPaused) {
      wasPaused = false;
      options.onResume?.();
    }
    if (remaining <= 0) return true;
    const step = Math.min(remaining, 1_000);
    await sleep(step);
    remaining -= step;
  }
  return !options.signal?.aborted;
}
