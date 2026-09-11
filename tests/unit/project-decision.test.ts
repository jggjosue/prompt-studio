import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decisionReferenceRequirements, isDecisionStatus, isDecisionType } from '../../src/lib/project-decision.ts';

test('decision taxonomy accepts only supported values', () => {
  assert.equal(isDecisionType('prompt'), true);
  assert.equal(isDecisionType('user'), false);
  assert.equal(isDecisionStatus('published'), true);
  assert.equal(isDecisionStatus('deleted'), false);
});

test('published decisions require both an asset and publication', () => {
  const requirements = decisionReferenceRequirements('result', 'published');
  assert.equal(requirements.jobRequired, true);
  assert.equal(requirements.publicationRequired, true);
});

test('decision actor and linked records are verified by the server', () => {
  const source = readFileSync(new URL('../../src/app/api/projects/[id]/route.ts', import.meta.url), 'utf8');
  assert.match(source, /clerkClient/);
  assert.match(source, /projectId:id/);
  assert.match(source, /LandingPublication\.findOne\(\{_id:publicationId,userId:\{\$in:\[userId,project\.userId\]\}\}\)/);
  assert.doesNotMatch(source, /actorName=cleanText\(body/);
});
