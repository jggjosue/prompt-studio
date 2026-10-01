import test from 'node:test';
import assert from 'node:assert/strict';

const { assertPaidGenerationReserved } = await import('../../src/lib/generation-credit-boundary');

const job = (creditCost: number, creditsState: 'pending' | 'reserved' | 'captured' | 'refunded') =>
  ({ creditCost, creditsState } as Parameters<typeof assertPaidGenerationReserved>[0]);

test('paid generation requires a reserved wallet state before provider execution', () => {
  assert.throws(
    () => assertPaidGenerationReserved(job(30, 'pending')),
    /PAID_GENERATION_REQUIRES_RESERVED_CREDITS/,
  );
  assert.doesNotThrow(() => assertPaidGenerationReserved(job(30, 'reserved')));
});

test('captured or refunded paid jobs cannot execute provider work again', () => {
  assert.throws(() => assertPaidGenerationReserved(job(30, 'captured')));
  assert.throws(() => assertPaidGenerationReserved(job(30, 'refunded')));
});

test('free operations do not require a wallet reservation', () => {
  assert.doesNotThrow(() => assertPaidGenerationReserved(job(0, 'pending')));
});
