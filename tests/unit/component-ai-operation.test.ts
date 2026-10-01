import test from 'node:test';
import assert from 'node:assert/strict';

const { isComponentOperation, resolveComponentOperation } =
  await import('../../src/lib/component-ai-operation');

test('keeps component preview free and prices AI component actions', () => {
  const cases = [
    ['preview', 'COMPONENT_PREVIEW', 0, true],
    ['analysis', 'COMPONENT_AI_ANALYSIS', 3, false],
    ['modification', 'COMPONENT_AI_MODIFICATION', 5, false],
    ['generation', 'COMPONENT_AI_GENERATION', 10, false],
  ] as const;

  for (const [action, code, credits, isFree] of cases) {
    const operation = resolveComponentOperation({ componentOperation: action });
    assert.equal(operation.code, code);
    assert.equal(operation.creditCost, credits);
    assert.equal(operation.isFree, isFree);
  }
});

test('rejects missing or unsupported component actions', () => {
  assert.equal(isComponentOperation('analysis'), true);
  assert.equal(isComponentOperation('delete'), false);
  assert.throws(() => resolveComponentOperation({}), /COMPONENT_OPERATION_REQUIRED/);
  assert.throws(() => resolveComponentOperation({ componentOperation: 'delete' }), /COMPONENT_OPERATION_REQUIRED/);
});
