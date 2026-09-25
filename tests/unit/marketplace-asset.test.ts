import test from 'node:test';
import assert from 'node:assert/strict';
import { marketplaceEligibility, marketplaceLedger } from '../../src/lib/marketplace-asset.ts';

const provenance = {
  id: 'asset-1', creatorUserId: 'creator-1', contentHash: 'sha256:asset',
  promptVersionId: 'prompt-v1', promptVersionNumber: 1, provider: 'google', model: 'gemini',
  licenseStatus: 'verified' as const, commercialUse: true,
};

test('eligible AI assets require owned, intact and commercially verified provenance', () => {
  assert.deepEqual(marketplaceEligibility({ creatorUserId: 'creator-1', kind: 'prompt', contentHash: 'sha256:asset', provenance, qualityScore: 90, previewUrl: null, reproducibility: null }), { eligible: true, reasons: [] });
  const invalid = marketplaceEligibility({ creatorUserId: 'other', kind: 'prompt', contentHash: 'tampered', provenance, qualityScore: 90, previewUrl: null, reproducibility: null });
  assert.equal(invalid.eligible, false);
  assert.deepEqual(invalid.reasons, ['provenance_owner_mismatch', 'content_integrity_mismatch']);
});

test('generated templates require reproducibility and preview metadata', () => {
  const result = marketplaceEligibility({ creatorUserId: 'creator-1', kind: 'template', contentHash: 'sha256:asset', provenance, qualityScore: null, previewUrl: null, reproducibility: null });
  assert.deepEqual(result.reasons, ['missing_preview', 'missing_reproducibility_metadata']);
});

test('creator, platform and affiliate ledger preserves every cent', () => {
  const entries = marketplaceLedger(1999, .2, .1);
  assert.deepEqual(entries, [{ account: 'creator', amountCents: 1399 }, { account: 'platform', amountCents: 400 }, { account: 'affiliate', amountCents: 200 }]);
  assert.equal(entries.reduce((sum, entry) => sum + entry.amountCents, 0), 1999);
});

test('invalid commission rates cannot create negative creator balances', () => {
  assert.throws(() => marketplaceLedger(1000, .8, .3), /INVALID_COMMISSION_RATE/);
});
