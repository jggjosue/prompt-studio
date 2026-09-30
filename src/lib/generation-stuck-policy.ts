import { canonicalGenerationState, type GenerationJobState } from '@/lib/generation-job-state';
import { generationRetryDecision } from '@/lib/generation-retry-policy';
import type { AIJobKind } from '@/models/AIGenerationJob';

const MINUTE = 60_000;

/**
 * Estados en los que un trabajo puede quedarse colgado. Son los únicos que
 * tienen un lease: si el estado es `queued` el trabajo aún no ha empezado, y si
 * ya es terminal no hay nada que recuperar.
 */
export const IN_FLIGHT_GENERATION_STATES = ['processing', 'uploading', 'finalizing'] as const;

/**
 * Umbral de inactividad por tipo de trabajo, medido desde la última señal de
 * vida (`updatedAt`, que también mueve el endpoint de progreso del worker).
 *
 * Todos superan con holgura el lease de 5 minutos del processor, y por debajo
 * está el peor caso del runner: `runAIJob` espera hasta 4 min 30 s. Ningún
 * barrido puede robarle un trabajo a un worker vivo, porque además exige el
 * lease vencido.
 *
 * El orden no es arbitrario: refleja cuánto tarda de verdad cada proveedor.
 * Un texto se resuelve en segundos y tardaría más de 10 min solo si algo se
 * rompió; un video puede tardar legitimamente varios minutos en el proveedor.
 */
export const STUCK_THRESHOLD_MS_BY_KIND: Record<AIJobKind, number> = {
  text: 10 * MINUTE,
  vision: 15 * MINUTE,
  image: 20 * MINUTE,
  project: 20 * MINUTE,
  videoUnderstanding: 30 * MINUTE,
  video: 45 * MINUTE,
};

/** Para un tipo que se añada al modelo sin decidir su umbral. */
export const DEFAULT_STUCK_THRESHOLD_MS = 30 * MINUTE;

export function stuckThresholdMsForKind(kind: string): number {
  return STUCK_THRESHOLD_MS_BY_KIND[kind as AIJobKind] ?? DEFAULT_STUCK_THRESHOLD_MS;
}

export type StuckGenerationJobFacts = {
  kind: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  creditsState: string;
  providerRequestId?: string | null;
  leaseExpiresAt?: Date | null;
  updatedAt?: Date | null;
  createdAt?: Date | null;
};

export type StuckGenerationJobDisposition = 'recover' | 'fail';

export type StuckGenerationJobReason =
  | 'lease_expired_within_attempts'
  | 'attempts_exhausted'
  | 'attempts_exhausted_with_provider_request';

/**
 * Un trabajo está atascado cuando lleva demasiado tiempo sin dar señales de
 * vida y su lease ya venció. El lease es la condición que evita recuperar un
 * trabajo vivo; el umbral por tipo evita recuperar uno que simplemente va lento.
 */
export function isStuckGenerationJob(job: StuckGenerationJobFacts, now: Date): boolean {
  const state = canonicalGenerationState(job.status as never);
  if (!(IN_FLIGHT_GENERATION_STATES as readonly string[]).includes(state)) return false;
  if (job.leaseExpiresAt && job.leaseExpiresAt.getTime() > now.getTime()) return false;
  const lastSignal = job.updatedAt ?? job.createdAt ?? null;
  if (!lastSignal) return true;
  return lastSignal.getTime() < now.getTime() - stuckThresholdMsForKind(job.kind);
}

/**
 * Qué hacer con un trabajo atascado.
 *
 * Un trabajo colgado se parece a un proveedor que no responde, así que la
 * decisión se delega en la misma política que usa el camino normal de reintentos
 * (categoría `timeout`, que sí es reintentable). Así no hay dos reglas que
 * puedan divergir: si el intento cabe, se reencola con su clave de idempotencia
 * intacta y el siguiente barrido vuelve a evaluarlo; si ya no cabe, se cierra.
 */
export function decideStuckGenerationJob(
  job: StuckGenerationJobFacts,
  now: Date,
): { disposition: StuckGenerationJobDisposition; reason: StuckGenerationJobReason; nextAttemptAt: Date | null } {
  const decision = generationRetryDecision({
    category: 'timeout',
    attempt: job.attempts,
    maxAttempts: job.maxAttempts,
    now,
  });
  if (decision.action === 'retry') {
    return { disposition: 'recover', reason: 'lease_expired_within_attempts', nextAttemptAt: decision.nextAttemptAt };
  }
  // Con `providerRequestId` el proveedor quizá sí terminó el trabajo y solo
  // perdimos la respuesta. Se distingue el motivo para que el operador pueda
  // ir a buscar ese resultado y reprocesarlo desde el panel.
  return {
    disposition: 'fail',
    reason: job.providerRequestId ? 'attempts_exhausted_with_provider_request' : 'attempts_exhausted',
    nextAttemptAt: null,
  };
}

/**
 * Los créditos reservados solo se sueltan al cerrar el trabajo. Reencolar no
 * toca el saldo: la reserva sigue siendo la misma y el trabajo que la consuma
 * la capturará al terminar, así que un reembolso aquí sería un cobro doble
 * desde el punto de vista del usuario.
 */
export function shouldReconcileReservedCredits(
  job: StuckGenerationJobFacts,
  disposition: StuckGenerationJobDisposition,
): boolean {
  return disposition === 'fail' && job.creditsState === 'reserved';
}

/** Estado al que lleva cada disposición. Ambos son legales desde los tres estados en vuelo. */
export function stuckGenerationJobTarget(disposition: StuckGenerationJobDisposition): GenerationJobState {
  return disposition === 'recover' ? 'queued' : 'dead_letter';
}

/**
 * Consulta del barrido. El umbral depende del tipo, así que se expresa como un
 * `$or` por tipo en vez de un único `updatedAt`; el índice
 * `{ status, nextAttemptAt, leaseExpiresAt }` sigue sirviendo para acotar por
 * estado y el barrido ordena por antigüedad, el más olvidado primero.
 */
export function stuckGenerationJobQuery(now: Date): Record<string, unknown> {
  return {
    status: { $in: [...IN_FLIGHT_GENERATION_STATES] },
    $and: [
      { $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }] },
      {
        $or: Object.entries(STUCK_THRESHOLD_MS_BY_KIND).map(([kind, thresholdMs]) => ({
          kind,
          updatedAt: { $lt: new Date(now.getTime() - thresholdMs) },
        })),
      },
    ],
  };
}
