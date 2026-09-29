import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const runbookPath = new URL(
  '../../docs/operaciones/runbook-incidentes-proveedores-ia.md',
  import.meta.url,
);
const indexPath = new URL('../../docs/operaciones/README.md', import.meta.url);
const runbook = readFileSync(runbookPath, 'utf8');
const index = readFileSync(indexPath, 'utf8');

test('provider incident runbook covers every configured provider', () => {
  const providers = [
    'google',
    'openai',
    'fal',
    'replicate',
    'runway',
    'veo',
    'kling',
    'luma',
    'pika',
    'hailuo',
    'sora',
    'anthropic',
    'deepseek',
  ];

  for (const provider of providers) {
    assert.match(runbook, new RegExp(`\\b${provider}\\b`));
  }
});

test('provider incident runbook documents diagnosis and safe recovery', () => {
  const requiredTerms = [
    'timeout',
    'rate_limit',
    'authentication',
    'content_policy',
    'provider_unavailable',
    'invalid_request',
    'provider_error',
    'unknown',
    'generation_completed',
    'generation_retry_scheduled',
    'generation_failed',
    'refundCredits',
    '/api/ai/jobs/[id]/retry',
    'Rollback',
    'postmortem',
  ];

  for (const term of requiredTerms) {
    assert.ok(runbook.includes(term), `missing operational term: ${term}`);
  }
});

test('operations index exposes the provider incident runbook', () => {
  assert.match(index, /\[runbook-incidentes-proveedores-ia\.md\]\(runbook-incidentes-proveedores-ia\.md\)/);
});
