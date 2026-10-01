import assert from 'node:assert/strict';
import test from 'node:test';

import { getEmailStreamConfig } from '../../src/lib/email-streams.ts';

const KEYS = [
  'RESEND_EMAIL',
  'RESEND_TRANSACTIONAL_EMAIL',
  'RESEND_TRANSACTIONAL_REPLY_TO',
  'RESEND_LIFECYCLE_EMAIL',
  'RESEND_LIFECYCLE_REPLY_TO',
  'RESEND_OUTREACH_EMAIL',
  'RESEND_OUTREACH_REPLY_TO',
] as const;

function withEnv(values: Partial<Record<(typeof KEYS)[number], string>>, fn: () => void) {
  const previous = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  for (const key of KEYS) delete process.env[key];
  Object.assign(process.env, values);
  try { fn(); } finally {
    for (const key of KEYS) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('transactional stream supports the legacy RESEND_EMAIL fallback', () => {
  withEnv({ RESEND_EMAIL: 'legacy@example.com' }, () => {
    assert.deepEqual(getEmailStreamConfig('transactional'), {
      stream: 'transactional',
      from: 'legacy@example.com',
      replyTo: undefined,
    });
  });
});

test('lifecycle and outreach require dedicated sender identities', () => {
  withEnv({ RESEND_EMAIL: 'legacy@example.com' }, () => {
    assert.equal(getEmailStreamConfig('lifecycle'), null);
    assert.equal(getEmailStreamConfig('outreach'), null);
  });
});

test('each stream resolves its own sender and reply-to', () => {
  withEnv({
    RESEND_TRANSACTIONAL_EMAIL: 'receipts@example.com',
    RESEND_TRANSACTIONAL_REPLY_TO: 'support@example.com',
    RESEND_LIFECYCLE_EMAIL: 'updates@example.com',
    RESEND_LIFECYCLE_REPLY_TO: 'hello@example.com',
    RESEND_OUTREACH_EMAIL: 'founder@example.com',
    RESEND_OUTREACH_REPLY_TO: 'founder@example.com',
  }, () => {
    assert.equal(getEmailStreamConfig('transactional')?.from, 'receipts@example.com');
    assert.equal(getEmailStreamConfig('lifecycle')?.from, 'updates@example.com');
    assert.equal(getEmailStreamConfig('outreach')?.from, 'founder@example.com');
  });
});
