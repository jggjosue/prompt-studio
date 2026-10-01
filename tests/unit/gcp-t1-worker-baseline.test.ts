import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('GCP T1 baseline documents current worker and migration comparison contract', () => {
 const s=fs.readFileSync('docs/GCP_T1_CURRENT_WORKER_BASELINE.md','utf8');
 for(const expected of ['QStash','/api/ai/jobs/process','/api/ai/jobs/sweep','actualCostUsd','actualDurationMs','p50','p95','credit reconciliation','Image','Video','Web']) assert.match(s,new RegExp(expected,'i'));
 assert.match(s,/cannot honestly produce live volume/i);
 assert.match(s,/Dispatch provenance/);
});
