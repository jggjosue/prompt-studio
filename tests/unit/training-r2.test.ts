import assert from 'node:assert/strict';
import test from 'node:test';
import { getTrainingR2Config, TRAINING_R2_PREFIXES } from '../../src/lib/training-r2';

test('training R2 uses the required canonical prefixes', () => {
  assert.deepEqual(TRAINING_R2_PREFIXES, ['raw/', 'assets/', 'processed/', 'datasets/', 'manifests/', 'rejected/']);
});

test('training R2 config fails closed when dedicated credentials are missing', () => {
  assert.throws(() => getTrainingR2Config({} as NodeJS.ProcessEnv), /TRAINING_R2_CONFIG_MISSING/);
});

test('training R2 config accepts dedicated server-only credentials', () => {
  const config = getTrainingR2Config({
    CLOUDFLARE_ACCOUNT_ID: 'account',
    CLOUDFLARE_R2_TRAINING_BUCKET: 'prompt-studio-ml',
    R2_TRAINING_ACCESS_KEY_ID: 'key',
    R2_TRAINING_SECRET_ACCESS_KEY: 'secret',
  } as NodeJS.ProcessEnv);
  assert.equal(config.bucket, 'prompt-studio-ml');
});
