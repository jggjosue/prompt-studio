import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

test('R2 verification never equates authenticated access with private access', () => {
  const lib = fs.readFileSync('src/lib/training-r2.ts', 'utf8');
  const script = fs.readFileSync('scripts/ts/verify-training-r2.ts', 'utf8');
  assert.ok(lib.includes('authenticatedAccessVerified: true'));
  assert.equal(lib.includes('privateAccessVerified: true'), false);
  assert.ok(script.includes('publicAccessVerified: false'));
  assert.ok(script.includes('publicAccessVerificationRequired: true'));
});

test('R2 runbook requires production privacy and least-privilege checks', () => {
  const doc = fs.readFileSync('docs/training-r2.md', 'utf8');
  assert.ok(doc.includes('R2.dev public development URL is disabled'));
  assert.ok(doc.includes('No public custom domain'));
  assert.ok(doc.includes('scoped only to the training bucket'));
  assert.ok(doc.includes('no automatic expiration'));
});
