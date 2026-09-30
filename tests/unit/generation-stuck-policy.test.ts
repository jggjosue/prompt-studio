import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  DEFAULT_STUCK_THRESHOLD_MS,
  IN_FLIGHT_GENERATION_STATES,
  STUCK_THRESHOLD_MS_BY_KIND,
  decideStuckGenerationJob,
  isStuckGenerationJob,
  shouldReconcileReservedCredits,
  stuckGenerationJobQuery,
  stuckThresholdMsForKind,
  type StuckGenerationJobFacts,
} from '../../src/lib/generation-stuck-policy.ts';

const MINUTE = 60_000;
const NOW = new Date('2026-09-28T12:00:00.000Z');

const job = (overrides: Partial<StuckGenerationJobFacts> = {}): StuckGenerationJobFacts => ({
  kind: 'image',
  status: 'processing',
  attempts: 1,
  maxAttempts: 3,
  creditsState: 'reserved',
  providerRequestId: null,
  leaseExpiresAt: new Date(NOW.getTime() - MINUTE),
  updatedAt: new Date(NOW.getTime() - 60 * MINUTE),
  createdAt: new Date(NOW.getTime() - 90 * MINUTE),
  ...overrides,
});

test('ningún umbral es más corto que el lease del processor ni que el runner', () => {
  // El processor toma un lease de 5 min y el runner espera hasta 4 min 30 s. Un
  // umbral por debajo de eso haría que el barrido contemplate trabajos que el
  // worker normal todavía está procesando.
  for (const [kind, thresholdMs] of Object.entries(STUCK_THRESHOLD_MS_BY_KIND)) {
    assert.ok(thresholdMs > 5 * MINUTE, `${kind}: ${thresholdMs}ms no supera el lease de 5 min`);
    assert.ok(thresholdMs >= 10 * MINUTE, `${kind}: un umbral de ${thresholdMs}ms es demasiado agresivo`);
  }
  // Ordenado por lo que de verdad tarda cada proveedor: un texto que tarda 10
  // min está roto, un video puede tardar 45 min legítimamente.
  assert.ok(STUCK_THRESHOLD_MS_BY_KIND.text < STUCK_THRESHOLD_MS_BY_KIND.image);
  assert.ok(STUCK_THRESHOLD_MS_BY_KIND.image < STUCK_THRESHOLD_MS_BY_KIND.video);
  assert.equal(stuckThresholdMsForKind('kind-inventado'), DEFAULT_STUCK_THRESHOLD_MS);
});

test('cubrir los seis tipos del modelo obliga a decidir un umbral para cada uno', async () => {
  const model = await readFile(new URL('../../src/models/AIGenerationJob.ts', import.meta.url), 'utf8');
  const kinds = model.match(/export type AIJobKind = ([^;]+);/)?.[1] ?? '';
  const declared = [...kinds.matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(Object.keys(STUCK_THRESHOLD_MS_BY_KIND).sort(), declared.sort());
});

test('un trabajo con el lease vivo no se toca aunque esté muy viejo', () => {
  // Es el invariante que impide robarle el trabajo a un worker que sigue vivo.
  const ancient = new Date(NOW.getTime() - 10 * 60 * MINUTE);
  assert.equal(isStuckGenerationJob(job({ updatedAt: ancient, leaseExpiresAt: new Date(NOW.getTime() + MINUTE) }), NOW), false);
  // Con el lease vencido, el mismo trabajo sí entra.
  assert.equal(isStuckGenerationJob(job({ updatedAt: ancient, leaseExpiresAt: new Date(NOW.getTime() - 1) }), NOW), true);
  assert.equal(isStuckGenerationJob(job({ updatedAt: ancient, leaseExpiresAt: null }), NOW), true);
});

test('el umbral es por tipo, no uno global', () => {
  const age = 25 * MINUTE;
  const last = new Date(NOW.getTime() - age);
  // 25 min: para un texto es intolerable, para un video es pronto.
  assert.equal(isStuckGenerationJob(job({ kind: 'text', updatedAt: last }), NOW), true);
  assert.equal(isStuckGenerationJob(job({ kind: 'video', updatedAt: last }), NOW), false);
  assert.equal(isStuckGenerationJob(job({ kind: 'video', updatedAt: new Date(NOW.getTime() - 50 * MINUTE) }), NOW), true);
});

test('solo se barren los estados en vuelo', () => {
  for (const status of ['queued', 'retrying', 'completed', 'failed', 'dead_letter', 'cancelled']) {
    assert.equal(isStuckGenerationJob(job({ status }), NOW), false, `${status} no se barre`);
  }
  for (const status of IN_FLIGHT_GENERATION_STATES) {
    assert.equal(isStuckGenerationJob(job({ status }), NOW), true, `${status} sí se barre`);
  }
});

test('un trabajo vivo no se reencola en el acto, espera su turno', () => {
  const decision = decideStuckGenerationJob(job({ attempts: 1, maxAttempts: 3 }), NOW);
  assert.equal(decision.disposition, 'recover');
  assert.equal(decision.reason, 'lease_expired_within_attempts');
  // Sin este backoff, el cron del minuto siguiente volvería a reclamarlo y
  // quemaría los tres intentos en tres minutos.
  assert.ok(decision.nextAttemptAt, 'un trabajo recuperado debe tener próxima ejecución');
  assert.ok(decision.nextAttemptAt.getTime() > NOW.getTime(), 'no puede reintentarse en el mismo instante');
});

test('agotados los intentos se cierra y se distingue si había proveedor implicado', () => {
  const exhausted = decideStuckGenerationJob(job({ attempts: 3, maxAttempts: 3 }), NOW);
  assert.equal(exhausted.disposition, 'fail');
  assert.equal(exhausted.reason, 'attempts_exhausted');
  assert.equal(exhausted.nextAttemptAt, null, 'cerrar no programa otra ejecución');

  // Si el proveedor llegó a recibir la petición, el motivo cambia: puede que
  // tenga el resultado y solo perdamos la respuesta.
  const withProvider = decideStuckGenerationJob(
    job({ attempts: 3, maxAttempts: 3, providerRequestId: 'req-runway-9' }),
    NOW,
  );
  assert.equal(withProvider.disposition, 'fail');
  assert.equal(withProvider.reason, 'attempts_exhausted_with_provider_request');
});

test('reencolar nunca toca el saldo; cerrar suelta la reserva', () => {
  const reserved = job({ creditsState: 'reserved' });
  assert.equal(shouldReconcileReservedCredits(reserved, 'recover'), false, 'recover no debe reembolsar');
  assert.equal(shouldReconcileReservedCredits(reserved, 'fail'), true);
  // Sin reserva no hay nada que liberar, y con la reserva ya cobrada o
  // devuelta tampoco: reembolsar ahí sería mover dinero dos veces.
  for (const creditsState of ['pending', 'captured', 'refunded']) {
    assert.equal(shouldReconcileReservedCredits(job({ creditsState }), 'fail'), false, `${creditsState} no se toca`);
  }
});

test('la consulta exige estado en vuelo, lease vencido y antigüedad por tipo', () => {
  const query = stuckGenerationJobQuery(NOW) as {
    status: { $in: string[] };
    $and: Array<{ $or: unknown[] }>;
  };
  assert.deepEqual(query.status.$in.sort(), [...IN_FLIGHT_GENERATION_STATES].sort());
  const [lease, age] = query.$and;
  assert.equal((lease.$or[0] as { leaseExpiresAt: null }).leaseExpiresAt, null);
  const kindClauses = age.$or as Array<{ kind: string; updatedAt: { $lt: Date } }>;
  assert.equal(kindClauses.length, Object.keys(STUCK_THRESHOLD_MS_BY_KIND).length);
  for (const clause of kindClauses) {
    const expected = NOW.getTime() - STUCK_THRESHOLD_MS_BY_KIND[clause.kind as keyof typeof STUCK_THRESHOLD_MS_BY_KIND];
    assert.equal(clause.updatedAt.$lt.getTime(), expected, `${clause.kind} debe filtrar por su propio umbral`);
  }
});
