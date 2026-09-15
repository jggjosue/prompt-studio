import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_JOB_COSTS, isAIJobKind, isProviderForKind } from '../../src/lib/ai-job-config.ts';

process.env.PURCHASE_DOWNLOAD_SECRET = 'test-secret-at-least-32-characters-long';

test('signed download token is bound to purchase/user and rejects tampering', async () => {
  const { createPurchaseDownloadToken, verifyPurchaseDownloadToken } = await import('../../src/lib/purchase-download-token.ts');
  const token = createPurchaseDownloadToken('507f1f77bcf86cd799439011', 'user_1');
  const payload = verifyPurchaseDownloadToken(token);
  assert.equal(payload?.purchaseId, '507f1f77bcf86cd799439011');
  assert.equal(payload?.userId, 'user_1');
  assert.equal(verifyPurchaseDownloadToken(`${token.slice(0, -1)}x`), null);
  assert.equal(verifyPurchaseDownloadToken('invalid'), null);
});

test('AI queue permits only known kind/provider pairs and server-owned costs', () => {
  assert.equal(isAIJobKind('image'), true);
  assert.equal(isAIJobKind('audio'), false);
  assert.equal(isProviderForKind('video', 'runway'), true);
  assert.equal(isProviderForKind('video', 'openai'), false);
  assert.deepEqual(AI_JOB_COSTS, { image: { credits: 1, estimatedUsd: 0.04 }, video: { credits: 3, estimatedUsd: 0.35 }, project: { credits: 2, estimatedUsd: 0.08 } });
});
