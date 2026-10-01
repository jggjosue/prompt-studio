import assert from 'node:assert/strict';
import test from 'node:test';
import { reactivationReason, reactivationUrl, reactivationWindow } from '../../src/lib/reactivation-campaign.ts';

const now = new Date('2026-10-01T00:00:00Z');
const base = { userId: 'u1', purchased: false, marketingEligible: true, previousReactivationCount: 0 };

test('uses separate 7 and 30 day paths', () => {
  assert.equal(reactivationWindow({ ...base, lastActiveAt: new Date('2026-09-23T00:00:00Z') }, now), '7d');
  assert.equal(reactivationWindow({ ...base, lastActiveAt: new Date('2026-08-01T00:00:00Z'), previousReactivationCount: 1 }, now), '30d');
});

test('excludes purchasers, ineligible and persistently inactive users', () => {
  const inactive = new Date('2026-08-01T00:00:00Z');
  assert.equal(reactivationWindow({ ...base, lastActiveAt: inactive, purchased: true }, now), null);
  assert.equal(reactivationWindow({ ...base, lastActiveAt: inactive, marketingEligible: false }, now), null);
  assert.equal(reactivationWindow({ ...base, lastActiveAt: inactive, previousReactivationCount: 2 }, now), null);
});

test('personalizes reason and return destination by prior behavior', () => {
  assert.match(reactivationReason('video'), /video/i);
  const url = new URL(reactivationUrl('https://app.promptstudio.com', '7d', 'video'));
  assert.equal(url.pathname, '/video');
  assert.equal(url.searchParams.get('email_trigger'), 'inactive_7d');
});
