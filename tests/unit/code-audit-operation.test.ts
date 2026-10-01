import test from 'node:test';
import assert from 'node:assert/strict';

const { isCodeAuditTier, resolveCodeAuditOperation } =
  await import('../../src/lib/code-audit-operation');

test('maps fixed Code Auditor tiers to authoritative Prompt Credit prices', () => {
  const cases = [
    ['small', 'CODE_AUDIT_SMALL', 5],
    ['standard', 'CODE_AUDIT_STANDARD', 15],
    ['advanced', 'CODE_AUDIT_ADVANCED', 30],
  ] as const;

  for (const [tier, code, credits] of cases) {
    const resolved = resolveCodeAuditOperation({ codeAuditTier: tier });
    assert.equal(resolved.operation.code, code);
    assert.equal(resolved.creditCost, credits);
  }
});

test('project audit starts at 50 credits and scales server-side with workload', () => {
  const base = resolveCodeAuditOperation({ codeAuditTier: 'project', fileCount: 10, lineCount: 5000 });
  const larger = resolveCodeAuditOperation({ codeAuditTier: 'project', fileCount: 31, lineCount: 12000 });

  assert.equal(base.operation.code, 'CODE_AUDIT_PROJECT');
  assert.equal(base.creditCost, 50);
  assert.equal(larger.creditCost, 100);
});

test('ignores client price fields and rejects unsupported tiers', () => {
  const resolved = resolveCodeAuditOperation({ codeAuditTier: 'small', creditCost: 1 });
  assert.equal(resolved.creditCost, 5);
  assert.equal(isCodeAuditTier('enterprise'), false);
  assert.throws(() => resolveCodeAuditOperation({}), /CODE_AUDIT_TIER_REQUIRED/);
});
