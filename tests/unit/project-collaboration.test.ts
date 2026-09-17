import test from 'node:test';
import assert from 'node:assert/strict';
import { canEditProject, canManageTeam, canTransitionReview, createClientToken, hashClientToken, normalizeCollaboratorEmail } from '../../src/lib/project-collaboration.ts';

test('project roles enforce editing and team management boundaries',()=>{assert.equal(canEditProject('editor'),true);assert.equal(canEditProject('reviewer'),false);assert.equal(canManageTeam('editor'),false);assert.equal(canManageTeam('owner'),true)});
test('review transitions require review before approval and owner before publishing',()=>{assert.equal(canTransitionReview('reviewer','review','approved'),true);assert.equal(canTransitionReview('reviewer','approved','published'),false);assert.equal(canTransitionReview('owner','approved','published'),true);assert.equal(canTransitionReview('editor','draft','approved'),false)});
test('client tokens are random and only hashes need persistence',()=>{const a=createClientToken(),b=createClientToken();assert.notEqual(a,b);assert.equal(hashClientToken(a).length,64);assert.notEqual(hashClientToken(a),a)});
test('collaborator emails are normalized and validated',()=>{assert.equal(normalizeCollaboratorEmail(' user@example.com '),'user@example.com');assert.equal(normalizeCollaboratorEmail('bad'),null)});
