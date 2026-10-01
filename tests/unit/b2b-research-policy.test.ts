import assert from 'node:assert/strict';
import test from 'node:test';
import { researchRateLimitMs, researchSourceEligible, validateResearchCandidate } from '../../src/lib/b2b-research-policy.ts';

const source = { url: 'https://company.test/about', publicAccess: true, permittedForResearch: true, robotsAllowed: true, rateLimitPerMinute: 6 };

test('allows only explicitly public and permitted sources', () => {
  assert.equal(researchSourceEligible(source), true);
  assert.equal(researchSourceEligible({ ...source, robotsAllowed: false }), false);
  assert.equal(researchSourceEligible({ ...source, requiresAuthentication: true }), false);
  assert.equal(researchSourceEligible({ ...source, requiresCaptcha: true }), false);
  assert.equal(researchSourceEligible({ ...source, behindPaywall: true }), false);
});

test('derives a conservative request interval from the source limit', () => {
  assert.equal(researchRateLimitMs(source), 10_000);
});

test('requires company-first qualification and provenance', () => {
  const candidate = { company: 'Acme', useCase: 'Creative production', qualificationReason: 'Public product catalog matches the target segment', source };
  assert.deepEqual(validateResearchCandidate(candidate), []);
  assert.ok(validateResearchCandidate({ ...candidate, qualificationReason: '' }).includes('missing_qualification_reason'));
});
