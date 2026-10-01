import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('GCP T3 selects private OIDC Cloud Tasks with minimal payload',()=>{
 const s=fs.readFileSync('docs/GCP_T3_CLOUD_TASKS_QUEUE.md','utf8');
 for(const v of ['Google Cloud Tasks','OIDC','jobId','correlationId','image','video','web','at-least-once']) assert.match(s,new RegExp(v,'i'));
 assert.match(s,/MUST NOT contain:[\s\S]*prompt\/input body/i);
 assert.match(s,/Do not dispatch the same job to both QStash and Cloud Tasks/i);
});
test('GCP T3 queue bootstrap has bounded retries and workload isolation',()=>{
 const s=fs.readFileSync('scripts/gcp/bootstrap-ai-worker-queues.sh','utf8');
 for(const q of ['ps-ai-image','ps-ai-video','ps-ai-web']) assert.match(s,new RegExp(q));
 assert.match(s,/--max-attempts=5/); assert.match(s,/--min-backoff=10s/); assert.match(s,/--max-backoff=300s/);
});
