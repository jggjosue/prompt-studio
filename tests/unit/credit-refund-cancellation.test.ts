import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { claimExhaustedGenerationJobAtomically, claimGenerationJobAtomically } from '../../src/lib/generation-job-claim';
import { canonicalGenerationState, isTerminalGenerationJobState } from '../../src/lib/generation-job-state';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

const CANCEL_ROUTE = 'src/app/api/ai/jobs/[id]/cancel/route.ts';

async function claimFilter(claim: (store: unknown, input: { owner: string; leaseMs: number }) => Promise<unknown>) {
  let captured: Record<string, unknown> | null = null;
  const store = {
    findOneAndUpdate: async (filter: Record<string, unknown>) => {
      captured = filter;
      return null;
    },
  };
  await claim(store, { owner: 'test', leaseMs: 1_000 });
  return captured as unknown as Record<string, unknown>;
}

test('cancelar es una transición legal desde cualquier estado activo', () => {
  for (const persisted of ['queued', 'retrying', 'processing', 'uploading', 'finalizing']) {
    const state = canonicalGenerationState(persisted as never);
    assert.equal(isTerminalGenerationJobState(state), false, `${persisted} no debería ser terminal`);
  }
  assert.equal(isTerminalGenerationJobState('cancelled'), true);
});

test('un trabajo cancelado no vuelve a reclamarse ni se regenera', async () => {
  for (const claim of [claimGenerationJobAtomically, claimExhaustedGenerationJobAtomically]) {
    const filter = await claimFilter(claim as never);
    const claimable = (filter.status as { $in: string[] }).$in;
    assert.ok(!claimable.includes('cancelled'), 'el reclaim nunca debe tomar un trabajo cancelado');
    assert.equal(filter.creditsState, 'reserved', 'solo se procesa trabajo con reserva vigente');
  }
});

test('la cancelación exige sesión y nunca toca un trabajo ajeno', async () => {
  const route = await source(CANCEL_ROUTE);
  assert.ok(route.includes("await auth()"), 'la cancelación exige sesión de usuario');
  assert.ok(
    route.includes('AIGenerationJob.findOne({ _id: id, userId })'),
    'debe buscar el trabajo por su propietario para no cancelar el de otro usuario'
  );
  assert.ok(
    route.includes("if (!/^[a-f0-9]{24}$/i.test(id))"),
    'debe validar el identificador antes de tocar la base de datos'
  );
  assert.ok(
    !/kind: '(image|video|project|web)'/.test(route),
    'la cancelación es igual para imagen, vídeo y web'
  );
});

test('la cancelación reembolsa antes de cerrar el trabajo', async () => {
  const route = await source(CANCEL_ROUTE);
  const refundAt = route.indexOf('await refundCredits(job)');
  const transitionAt = route.indexOf("to: 'cancelled'");
  assert.ok(refundAt > 0 && transitionAt > 0, 'debe reembolsar y transicionar a cancelado');
  assert.ok(refundAt < transitionAt, 'reembolsa antes de marcar el trabajo como cancelado');
  assert.ok(
    route.includes('creditsState: job.creditsState'),
    'persiste el estado de crédito ya liquidado en el trabajo cancelado'
  );
  assert.ok(
    route.includes('errorCategory: \'cancelled\''),
    'un trabajo cancelado queda trazable como tal'
  );
});

test('cancelar dos veces no devuelve los créditos dos veces', async () => {
  const route = await source(CANCEL_ROUTE);
  const idempotentAt = route.indexOf("state === 'cancelled'");
  const refundAt = route.indexOf('await refundCredits(job)');
  assert.ok(idempotentAt > 0 && idempotentAt < refundAt, 'un trabajo ya cancelado se resuelve antes de reembolsar');
  assert.ok(route.includes('duplicate: true'), 'la repetición se reporta como duplicada, no como un cobro nuevo');

  const service = await source('src/lib/ai-job-service.ts');
  const refund = service.split('export async function refundCredits')[1] ?? '';
  assert.ok(
    refund.includes("if (job.creditsState !== 'reserved') return;"),
    'reembolsar solo procede sobre una reserva vigente'
  );
  assert.ok(
    refund.includes("AICreditLedger.findOne({ jobId: job._id, operation: 'refund' })"),
    'el reembolso se registra una sola vez en el ledger'
  );
});

test('no se cancela ni se reembolsa una generación en vuelo', async () => {
  const route = await source(CANCEL_ROUTE);
  const leaseGuard = route.indexOf('leaseExpiresAt');
  const refundAt = route.indexOf('await refundCredits(job)');
  assert.ok(leaseGuard > 0 && leaseGuard < refundAt, 'el lease vigente se comprueba antes de reembolsar');
  assert.ok(
    route.includes('isTerminalGenerationJobState(state)'),
    'un trabajo ya liquidado no se cancela'
  );
});

test('el cliente no agota el tiempo de espera ante cancelaciones o dead letters', async () => {
  const hook = await source('src/hooks/use-image-generation.ts');
  const poll = hook.split('for (let attempts = 0')[1] ?? '';
  assert.ok(
    poll.includes("status === 'cancelled'"),
    'el sondeo debe resolver el estado cancelado'
  );
  assert.ok(
    poll.includes("status === 'dead_letter'"),
    'el sondeo debe resolver el estado dead_letter, que también es terminal'
  );
});
