import { randomUUID } from 'node:crypto';
import {
  assertGenerationJobTransition,
  canonicalGenerationState,
} from '@/lib/generation-job-state';
import {
  decideStuckGenerationJob,
  isStuckGenerationJob,
  shouldReconcileReservedCredits,
  stuckGenerationJobQuery,
  stuckGenerationJobTarget,
  type StuckGenerationJobDisposition,
  type StuckGenerationJobFacts,
  type StuckGenerationJobReason,
} from '@/lib/generation-stuck-policy';

/** El barrido tarda milisegundos, no minutos: un lease corto cierra la ventana de carrera. */
export const SWEEPER_LEASE_MS = 60_000;

export const DEFAULT_SWEEP_MAX_JOBS = 25;

export const STUCK_JOB_FAILURE_MESSAGE =
  'La generación se detuvo sin recibir respuesta del proveedor y los créditos fueron devueltos.';

export type StuckGenerationJobDocument = StuckGenerationJobFacts & {
  _id: unknown;
  recovery?: { attempts?: number | null } | null;
};

export type GenerationRecoveryAudit = {
  attempts: number;
  lastReason: StuckGenerationJobReason;
  lastAt: Date;
  lastBy: string;
  lastSweepId: string;
  lastFromStatus: string;
  lastCreditsState: string;
  lastProviderRequestId: string | null;
};

export type SweepJobStore<T> = {
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<T | null>;
};

export type SweepEvent<T> = {
  name: 'generation_recovered' | 'generation_sweep_closed' | 'generation_sweep_error';
  job: T;
  reason: StuckGenerationJobReason | 'sweep_error';
  disposition: StuckGenerationJobDisposition | null;
  sweepId: string;
};

export type SweepTransitionInput = {
  jobId: string;
  from: ReturnType<typeof canonicalGenerationState>;
  to: ReturnType<typeof stuckGenerationJobTarget>;
  lockToken: string;
  patch: Record<string, unknown>;
};

export type SweepDependencies<T> = {
  store: SweepJobStore<T>;
  /** Idempotente y sin efecto si el trabajo no tiene créditos reservados. */
  refund: (job: T) => Promise<void>;
  transition: (input: SweepTransitionInput) => Promise<unknown>;
  recordEvent: (event: SweepEvent<T>) => Promise<void> | void;
  owner: string;
  leaseMs?: number;
  maxJobs?: number;
  sweepId?: string;
  now?: () => Date;
  newLockToken?: () => string;
};

export type SweepAction = {
  jobId: string;
  kind: string;
  from: string;
  disposition: StuckGenerationJobDisposition;
  reason: StuckGenerationJobReason;
  sweepId: string;
};

export type SweepSummary = {
  sweepId: string;
  examined: number;
  recovered: number;
  failed: number;
  creditsReconciled: number;
  errors: number;
  actions: SweepAction[];
};

/**
 * Reclama un trabajo atascado con un solo compare-and-swap.
 *
 * El lease es lo que impide que dos barridos concurrentes se peleen el mismo
 * trabajo: el segundo no lo ve porque el primero acaba de extenderlo. Devuelve
 * el documento *anterior* al canje, que es la imagen consistente con la que se
 * decide la disposición.
 *
 * `updatedAt` no se toca a propósito. Si el barrido se cae a mitad, el trabajo
 * sigue siendo detectable en cuanto vence el lease, en lugar de tener que esperar
 * otro umbral completo para volver a mirarlo.
 */
export async function claimStuckGenerationJob<T extends StuckGenerationJobDocument>(
  deps: Pick<SweepDependencies<T>, 'store' | 'owner' | 'leaseMs'>,
  now: Date,
  lockToken: string,
): Promise<{ job: T; lockToken: string } | null> {
  const job = await deps.store.findOneAndUpdate(
    stuckGenerationJobQuery(now),
    {
      $set: {
        lockOwner: deps.owner,
        lockToken,
        lockAcquiredAt: now,
        leaseExpiresAt: new Date(now.getTime() + (deps.leaseMs ?? SWEEPER_LEASE_MS)),
      },
    },
    { sort: { updatedAt: 1, createdAt: 1 }, returnDocument: 'before' },
  );
  return job ? { job, lockToken } : null;
}

async function applyDisposition<T extends StuckGenerationJobDocument>(
  deps: SweepDependencies<T>,
  input: { job: T; lockToken: string; at: Date; sweepId: string; summary: SweepSummary },
): Promise<void> {
  const { job, lockToken, at, sweepId, summary } = input;
  // Se vuelve a comprobar tras el canje: entre la consulta y el canje otro actor
  // pudo tocar el trabajo, y un `updatedAt` fresco significa que ya no está atascado.
  if (!isStuckGenerationJob(job, at)) return;

  const { disposition, reason, nextAttemptAt } = decideStuckGenerationJob(job, at);
  const from = canonicalGenerationState(job.status as never);
  const to = stuckGenerationJobTarget(disposition);
  assertGenerationJobTransition(from, to);

  const recovery: GenerationRecoveryAudit = {
    attempts: (job.recovery?.attempts ?? 0) + 1,
    lastReason: reason,
    lastAt: at,
    lastBy: deps.owner,
    lastSweepId: sweepId,
    lastFromStatus: job.status,
    lastCreditsState: job.creditsState,
    lastProviderRequestId: job.providerRequestId ?? null,
  };

  if (shouldReconcileReservedCredits(job, disposition)) {
    // Solo al cerrar. `refundCredits` no hace nada si el trabajo no está
    // `reserved` y el ledger tiene un índice único por (jobId, operation), así
    // que ni un reintento del barrido ni el camino normal pueden reembolsar dos veces.
    await deps.refund(job);
    summary.creditsReconciled += 1;
  }

  await deps.transition({
    jobId: String(job._id),
    from,
    to,
    lockToken,
    patch: {
      recovery,
      nextAttemptAt: nextAttemptAt ?? at,
      progressMessage:
        disposition === 'recover'
          ? 'Reanudado por el barrido de recuperación'
          : 'Cerrado por el barrido de recuperación',
      ...(disposition === 'fail' ? { lastError: STUCK_JOB_FAILURE_MESSAGE } : {}),
    },
  });

  if (disposition === 'recover') summary.recovered += 1;
  else summary.failed += 1;
  summary.actions.push({
    jobId: String(job._id),
    kind: job.kind,
    from: job.status,
    disposition,
    reason,
    sweepId,
  });
  await deps.recordEvent({
    name: disposition === 'recover' ? 'generation_recovered' : 'generation_sweep_closed',
    job,
    reason,
    disposition,
    sweepId,
  });
}

/**
 * Barre los trabajos atascados y los recupera o los cierra.
 *
 * Si un trabajo falla a mitad, el error se cuenta y se sigue: el trabajo conserva
 * el lease del barrido, así que nadie más lo toca hasta que venza, y el
 * siguiente barrido lo reevalúa desde el principio. Un trabajo nunca se queda a
 * medias con los créditos cobrados sin capturar.
 */
export async function sweepStuckGenerationJobs<T extends StuckGenerationJobDocument>(
  deps: SweepDependencies<T>,
): Promise<SweepSummary> {
  const now = deps.now ?? (() => new Date());
  const sweepId = deps.sweepId ?? randomUUID();
  const newLockToken = deps.newLockToken ?? (() => randomUUID());
  const maxJobs = deps.maxJobs ?? DEFAULT_SWEEP_MAX_JOBS;
  const summary: SweepSummary = {
    sweepId,
    examined: 0,
    recovered: 0,
    failed: 0,
    creditsReconciled: 0,
    errors: 0,
    actions: [],
  };

  for (let index = 0; index < maxJobs; index += 1) {
    const at = now();
    const lockToken = newLockToken();
    const claimed = await claimStuckGenerationJob(deps, at, lockToken);
    if (!claimed) break;
    summary.examined += 1;
    try {
      await applyDisposition(deps, { job: claimed.job, lockToken, at, sweepId, summary });
    } catch (error) {
      summary.errors += 1;
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'generation_sweep_failed',
          jobId: String(claimed.job._id),
          sweepId,
          error: error instanceof Error ? error.message : 'UNKNOWN',
        }),
      );
      await deps.recordEvent({
        name: 'generation_sweep_error',
        job: claimed.job,
        reason: 'sweep_error',
        disposition: null,
        sweepId,
      });
    }
  }
  return summary;
}
