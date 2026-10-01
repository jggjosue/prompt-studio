import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('GCP T2 IAM bootstrap preserves least privilege',()=>{
 const s=fs.readFileSync('scripts/gcp/bootstrap-ai-worker-iam.sh','utf8');
 assert.match(s,/ps-ai-worker/); assert.match(s,/ps-ai-queue-invoker/);
 assert.match(s,/roles\/secretmanager\.secretAccessor/); assert.match(s,/roles\/run\.invoker/);
 assert.doesNotMatch(s,/roles\/owner/); assert.doesNotMatch(s,/roles\/editor/);
 assert.doesNotMatch(s,/service-accounts keys create/);
});
test('GCP T2 documents identity, secrets and no-key policy',()=>{
 const s=fs.readFileSync('docs/GCP_T2_IAM_SECRET_MANAGER.md','utf8');
 for(const v of ['MONGODB_URI','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','OIDC','least-privilege','service-account']) assert.match(s,new RegExp(v,'i'));
 assert.match(s,/Do not create\/download long-lived JSON service-account keys/i);
});
