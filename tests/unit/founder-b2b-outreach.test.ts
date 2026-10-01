import assert from 'node:assert/strict';
import test from 'node:test';
import { canAddColdProspectToBroadcast, canSendInitialFounderOutreach, reviewCheckpoint } from '../../src/lib/founder-b2b-outreach.ts';
import { requiresPositioningReview, summarizeOutreachEvidence } from '../../src/lib/founder-b2b-outreach-review.ts';

const candidate = { prospectId: 'p1', segment: 'creative_agency' as const, humanReviewed: true, personalizationNote: 'Uses visual content for client campaigns.', doNotContact: false, recurringMarketingPermission: false };

test('requires human review, personalization and DNC clearance', () => {
  assert.equal(canSendInitialFounderOutreach(candidate), true);
  assert.equal(canSendInitialFounderOutreach({ ...candidate, humanReviewed: false }), false);
  assert.equal(canSendInitialFounderOutreach({ ...candidate, doNotContact: true }), false);
});

test('cold prospects cannot enter recurring broadcasts without permission', () => {
  assert.equal(canAddColdProspectToBroadcast(candidate), false);
  assert.equal(canAddColdProspectToBroadcast({ ...candidate, recurringMarketingPermission: true }), true);
});

test('forces evidence reviews every 25 prospects through the first 100', () => {
  for (const n of [25, 50, 75, 100]) assert.equal(reviewCheckpoint(n), true);
  assert.equal(requiresPositioningReview(26), false);
});

test('summarizes the full outreach funnel', () => {
  const result = summarizeOutreachEvidence({ attempted: 25, delivered: 24, replies: 8, positiveReplies: 4, demoTrials: 3, activations: 2, checkouts: 2, paid: 1 });
  assert.equal(result.replyRate, 8 / 25);
  assert.equal(result.paidRate, 1 / 25);
});
