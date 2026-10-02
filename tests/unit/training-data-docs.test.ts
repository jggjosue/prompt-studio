import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

test('training architecture documents immutable version pinning and critical runbooks', () => {
  const doc = fs.readFileSync('docs/TRAINING_DATA_ARCHITECTURE.md', 'utf8');
  for (const required of ['training_data_records','Amazon SQS','Cloudflare R2','datasets/{dataset}/{v000001}/','npm run dataset:release','npm run dataset:rebuild-revoked','Never train from `latest`','manifest.json','checksums.json','DLQ']) assert.ok(doc.includes(required), `missing: ${required}`);
});

test('incident runbook preserves privacy gates during recovery', () => {
  const doc = fs.readFileSync('docs/TRAINING_DATA_INCIDENT_RUNBOOK.md', 'utf8');
  assert.ok(doc.includes('Do not lower sanitizer/privacy gates'));
  assert.ok(doc.includes('Redrive only eligible messages'));
  assert.ok(doc.includes('never overwrite/reuse it'));
});
