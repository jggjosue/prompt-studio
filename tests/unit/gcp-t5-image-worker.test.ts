import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gcpWorkloadEnabled, gcpDispatchReady } from '../../src/lib/gcp-generation-policy';

test('image GCP canary is opt-in and kill-switchable',()=>{
 const base={GCP_AI_DISPATCH_ENABLED:'true',GCP_AI_IMAGE_ENABLED:'true'} as NodeJS.ProcessEnv;
 assert.equal(gcpWorkloadEnabled('image',base),true);
 assert.equal(gcpWorkloadEnabled('video',base),false);
 assert.equal(gcpWorkloadEnabled('image',{...base,GCP_AI_KILL_SWITCH:'true'}),false);
});
test('image dispatch requires infrastructure identifiers',()=>{
 const r=gcpDispatchReady('image',{GCP_AI_DISPATCH_ENABLED:'true',GCP_AI_IMAGE_ENABLED:'true'} as NodeJS.ProcessEnv);
 assert.equal(r.ready,false); assert.ok(r.missing.includes('GCP_AI_PROJECT_ID')); assert.equal(r.queue,'ps-ai-image');
});
test('Cloud Tasks payload is minimal and OIDC authenticated',()=>{
 const s=fs.readFileSync('src/lib/gcp-generation-dispatch.ts','utf8');
 for(const v of ['jobId','correlationId','workload','oidcToken','serviceAccountEmail']) assert.match(s,new RegExp(v));
 assert.doesNotMatch(s,/prompt:/); assert.doesNotMatch(s,/userEmail/); assert.doesNotMatch(s,/credits:/);
});
test('generation job stores dispatch provenance',()=>{
 const s=fs.readFileSync('src/models/AIGenerationJob.ts','utf8');
 assert.match(s,/gcp-cloud-tasks/); assert.match(s,/dispatchedAt/); assert.match(s,/messageId/);
});
