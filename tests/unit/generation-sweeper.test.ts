import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STUCK_JOB_FAILURE_MESSAGE,
  sweepStuckGenerationJobs,
  type SweepEvent,
  type SweepTransitionInput,
  type StuckGenerationJobDocument,
  type SweepJobStore,
} from '../../src/lib/generation-sweeper.ts';
import { STUCK_THRESHOLD_MS_BY_KIND } from '../../src/lib/generation-stuck-policy.ts';

const MINUTE = 60_000;
const NOW = new Date('2026-09-28T12:00:00.000Z');

type FakeJob = StuckGenerationJobDocument & { _id: string };

const stuck = (overrides: Partial<FakeJob> = {}): FakeJob => ({
  _id: 'job-1',
  kind: 'video',
  status: 'processing',
  attempts: 1,
  maxAttempts: 3,
  creditsState: 'reserved',
  providerRequestId: null,
  leaseExpiresAt: new Date(NOW.getTime() - MINUTE),
  updatedAt: new Date(NOW.getTime() - 60 * MINUTE),
  createdAt: new Date(NOW.getTime() - 90 * MINUTE),
  recovery: null,
  ...overrides,
});

/**
 * Store falso que interpreta justo el filtro del barrido: estado en vuelo, lease
 * vencido y antigüedad por tipo. Lo justo para poder comprobar que la consulta
 * y el canje se combinan como deben.
 */
function sweepStore(records: FakeJob[]): SweepJobStore<FakeJob> & { calls: number } {
  const store = {
    calls: 0,
    async findOneAndUpdate(
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: Record<string, unknown>,
    ) {
      store.calls += 1;
      const { $and, status } = filter as {
        $and: Array<{ $or: unknown[] }>;
        status: { $in: string[] };
      };
      const [leaseClause, ageClause] = $and;
      const leaseAt = ((leaseClause.$or[1] as { leaseExpiresAt: { $lte: Date } }).leaseExpiresAt).$lte;
      const kindClauses = ageClause.$or as Array<{ kind: string; updatedAt: { $lt: Date } }>;

      const matches = (record: FakeJob) => {
        const lease = record.leaseExpiresAt;
        return status.$in.includes(record.status)
          && (lease == null || lease <= leaseAt)
          && kindClauses.some(
            clause => clause.kind === record.kind && record.updatedAt != null && (record.updatedAt as Date) < clause.updatedAt.$lt,
          );
      };

      const ordered = [...records].sort((a, b) => (a.updatedAt!.getTime() - b.updatedAt!.getTime()));
      const record = ordered.find(matches);
      if (!record) return null;
      const before = { ...record };
      Object.assign(record, (update.$set as Record<string, unknown>));
      assert.equal(options.returnDocument, 'before', 'el barrido decide sobre la imagen previa al canje');
      return before;
    },
  };
  return store;
}

function harness(records: FakeJob[], overrides: Partial<Parameters<typeof sweepStuckGenerationJobs<FakeJob>>[0]> = {}) {
  const calls = { refund: [] as string[], transitions: [] as SweepTransitionInput[], events: [] as SweepEvent<FakeJob>[] };
  const deps = {
    store: sweepStore(records),
    owner: 'sweeper:test',
    sweepId: 'sweep-1',
    now: () => NOW,
    newLockToken: () => `lock-${calls.transitions.length + 1}`,
    refund: async (job: FakeJob) => { calls.refund.push(job._id); },
    transition: async (input: SweepTransitionInput) => { calls.transitions.push(input); return null; },
    recordEvent: (event: SweepEvent<FakeJob>) => { calls.events.push(event); },
    ...overrides,
  };
  return { deps: deps as Parameters<typeof sweepStuckGenerationJobs<FakeJob>>[0], calls };
}

test('un trabajo atascado con intentos disponibles se reencola sin tocar el saldo', async () => {
  const { deps, calls } = harness([stuck()]);
  const summary = await sweepStuckGenerationJobs(deps);

  assert.equal(summary.recovered, 1);
  assert.equal(summary.failed, 0);
  assert.deepEqual(calls.refund, [], 'reencolar no puede mover créditos');
  const [transition] = calls.transitions;
  assert.equal(transition.from, 'processing');
  assert.equal(transition.to, 'queued');
  // La reserva sigue viva: es la misma que consumirá la ejecución que viene.
  assert.equal((transition.patch.recovery as { lastCreditsState: string }).lastCreditsState, 'reserved');
  assert.ok((transition.patch.nextAttemptAt as Date) > NOW, 'debe esperar su turno, no reintentarse ya');
});

test('la transición sale del estado real, no siempre de processing', async () => {
  // La rama de agotados del processor transiciona siempre desde `processing`; si
  // el documento estaba en `finalizing` el canje no casa y la reserva se queda
  // huérfana. El barrido usa el estado que encontró.
  for (const status of ['processing', 'uploading', 'finalizing'] as const) {
    const { deps, calls } = harness([stuck({ status })]);
    await sweepStuckGenerationJobs(deps);
    assert.equal(calls.transitions[0].from, status, `${status} debe usarse como origen`);
  }
});

test('agotados los intentos se cierra, se reembolsa una vez y se explica al usuario', async () => {
  const { deps, calls } = harness([stuck({ attempts: 3, maxAttempts: 3, providerRequestId: 'req-7' })]);
  const summary = await sweepStuckGenerationJobs(deps);

  assert.equal(summary.failed, 1);
  assert.equal(summary.creditsReconciled, 1);
  assert.deepEqual(calls.refund, ['job-1']);
  assert.equal(calls.transitions[0].to, 'dead_letter');
  assert.equal(calls.transitions[0].patch.lastError, STUCK_JOB_FAILURE_MESSAGE);
  const recovery = calls.transitions[0].patch.recovery as { lastReason: string; lastProviderRequestId: string };
  assert.equal(recovery.lastReason, 'attempts_exhausted_with_provider_request');
  // El id del proveedor queda a mano para que un operador pueda buscar el
  // resultado que quizá sí se terminó de producir.
  assert.equal(recovery.lastProviderRequestId, 'req-7');
});

test('un trabajo sin reserva no dispara un reembolso imposible', async () => {
  const { deps, calls } = harness([stuck({ attempts: 3, maxAttempts: 3, creditsState: 'captured' })]);
  const summary = await sweepStuckGenerationJobs(deps);
  assert.equal(summary.failed, 1);
  assert.equal(summary.creditsReconciled, 0);
  assert.deepEqual(calls.refund, []);
});

test('un segundo barrido no vuelve a recuperar el trabajo que el primero ya tomó', async () => {
  const records = [stuck()];
  const { deps, calls } = harness(records);
  await sweepStuckGenerationJobs(deps);
  const recovered = calls.transitions.length;
  assert.equal(recovered, 1);

  // El claim del primer barrido extiende el lease, así que la segunda pasada ya
  // no lo ve. Es lo que impide que dos instancias del cron curen el mismo trabajo.
  const second = await sweepStuckGenerationJobs(deps);
  assert.equal(second.examined, 0);
  assert.equal(calls.transitions.length, 1, 'no puede haber una segunda transición');
  assert.deepEqual(calls.refund, [], 'además, recuperar nunca reembolsó');
});

test('cada recuperación queda registrada con su motivo y su pasada', async () => {
  const { deps, calls } = harness([stuck({ recovery: { attempts: 2 } })]);
  await sweepStuckGenerationJobs(deps);
  const recovery = calls.transitions[0].patch.recovery as Record<string, unknown>;
  assert.equal(recovery.attempts, 3, 'las recuperaciones se acumulan');
  assert.equal(recovery.lastSweepId, 'sweep-1');
  assert.equal(recovery.lastBy, 'sweeper:test');
  assert.equal(recovery.lastReason, 'lease_expired_within_attempts');
  assert.equal(recovery.lastFromStatus, 'processing');
  assert.ok(recovery.lastAt instanceof Date);
});

test('un fallo a mitad no detiene el barrido ni cuenta una recuperación falsa', async () => {
  // El más olvidado se recupera; el otro agota intentos y falla al reembolsar.
  const records = [
    stuck({ _id: 'job-roto', attempts: 3, maxAttempts: 3 }),
    stuck({ _id: 'job-bueno', updatedAt: new Date(NOW.getTime() - 80 * MINUTE) }),
  ];
  const { deps, calls } = harness(records, {
    refund: async () => { throw new Error('CREDIT_REFUND_CONFLICT'); },
  });
  const summary = await sweepStuckGenerationJobs(deps);

  assert.equal(summary.examined, 2);
  assert.equal(summary.errors, 1);
  assert.equal(summary.recovered, 1);
  assert.deepEqual(calls.transitions.map(t => t.jobId), ['job-bueno']);
  assert.equal(calls.events.filter(event => event.name === 'generation_sweep_error').length, 1);
});

test('la antigüedad se filtra por el umbral del tipo de cada trabajo', async () => {
  // 25 min solo es «atascado» para un texto; para un video el trabajo sigue vivo.
  const last = new Date(NOW.getTime() - 25 * MINUTE);
  const { deps, calls } = harness([stuck({ kind: 'text', updatedAt: last }), stuck({ kind: 'video', updatedAt: last, _id: 'job-video' })]);
  const summary = await sweepStuckGenerationJobs(deps);
  assert.equal(summary.examined, 1);
  assert.equal(calls.transitions[0].jobId, 'job-1');
  assert.ok(STUCK_THRESHOLD_MS_BY_KIND.video > STUCK_THRESHOLD_MS_BY_KIND.text);
});

test('el barrido se detiene en cuanto no queda nada atascado', async () => {
  const { deps } = harness([stuck()]);
  const summary = await sweepStuckGenerationJobs(deps);
  assert.equal(summary.examined, 1);
  assert.equal(summary.errors, 0);
  assert.equal(summary.sweepId, 'sweep-1');
  assert.equal(summary.actions.length, 1);
  assert.equal(summary.actions[0].reason, 'lease_expired_within_attempts');
});
