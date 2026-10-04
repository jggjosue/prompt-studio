import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CLOUD_EXECUTION_BACKENDS,
  cloudBackendRolloutPercent,
  rolloutBucket,
  executionWorkloadForKind,
  requestedExecutionBackend,
  selectExecutionBackend,
  workerMayExecute,
} from '../../src/lib/ai-execution-backend-policy';
import { gcpDispatchReady, gcpWorkloadEnabled } from '../../src/lib/gcp-generation-policy';

const env = (value: Record<string, string>) => value as unknown as NodeJS.ProcessEnv;

const GCP_CONFIG = {
  GCP_AI_PROJECT_ID: 'synthetic-project',
  GCP_AI_REGION: 'us-central1',
  GCP_AI_WORKER_URL: 'https://worker.invalid',
  GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT: 'ps-ai-queue-invoker@synthetic-project.iam.gserviceaccount.com',
};
const GCP_ON = {
  AI_EXECUTION_BACKEND: 'gcp', GCP_AI_DISPATCH_ENABLED: 'true', GCP_AI_IMAGE_ENABLED: 'true', GCP_AI_VIDEO_ENABLED: 'true', GCP_AI_WEB_ENABLED: 'true',
  GCP_AI_IMAGE_ROLLOUT_PERCENT: '100', GCP_AI_VIDEO_ROLLOUT_PERCENT: '100', GCP_AI_WEB_ROLLOUT_PERCENT: '100', ...GCP_CONFIG,
};
const USER = 'user_synthetic';

test('default with no configuration is legacy for every workload', () => {
  for (const kind of ['image', 'video', 'project', 'text', 'vision']) {
    const selection = selectExecutionBackend({ routingKey: USER, kind, env: env({}) });
    assert.equal(selection.backend, 'legacy');
    assert.equal(selection.reason, 'default_legacy');
  }
});

test('all cloud flags false keeps legacy even when a cloud is selected', () => {
  for (const backend of CLOUD_EXECUTION_BACKENDS) {
    const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ AI_EXECUTION_BACKEND: backend, ...GCP_CONFIG }) });
    assert.equal(selection.backend, 'legacy', backend);
    assert.equal(selection.reason, 'dispatch_disabled', backend);
  }
});

test('the committed .env.example keeps every execution backend off', () => {
  const example = readFileSync('.env.example', 'utf8');
  assert.match(example, /^AI_EXECUTION_BACKEND=legacy$/m);
  for (const prefix of ['GCP_AI', 'AWS_AI', 'CLOUDFLARE_AI']) {
    for (const flag of ['DISPATCH_ENABLED', 'KILL_SWITCH', 'IMAGE_ENABLED', 'VIDEO_ENABLED', 'WEB_ENABLED']) {
      assert.match(example, new RegExp(`^${prefix}_${flag}=false$`, 'm'), `${prefix}_${flag}`);
    }
  }
});

test('invalid selector fails safe to legacy', () => {
  for (const value of ['GCP-ONLY', 'qstash', 'gcp,aws', ' both ']) {
    const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ ...GCP_ON, AI_EXECUTION_BACKEND: value }) });
    assert.equal(selection.backend, 'legacy', value);
    assert.equal(selection.reason, 'invalid_selector', value);
  }
  assert.equal(requestedExecutionBackend(env({ AI_EXECUTION_BACKEND: 'nope' })), 'invalid');
});

test('selector is case-insensitive and recovery never dispatches to a cloud', () => {
  assert.equal(selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ ...GCP_ON, AI_EXECUTION_BACKEND: ' GCP ' }) }).backend, 'gcp');
  const recovery = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ ...GCP_ON, AI_EXECUTION_BACKEND: 'recovery' }) });
  assert.equal(recovery.backend, 'legacy');
  assert.equal(recovery.reason, 'recovery_selected');
});

test('kill switch wins over every other GCP flag', () => {
  const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ ...GCP_ON, GCP_AI_KILL_SWITCH: 'true' }) });
  assert.equal(selection.backend, 'legacy');
  assert.equal(selection.reason, 'kill_switch');
  assert.equal(gcpWorkloadEnabled('image', env({ ...GCP_ON, GCP_AI_KILL_SWITCH: 'true' })), false);
});

test('missing GCP configuration falls back to legacy and names what is missing', () => {
  const { GCP_AI_WORKER_URL: _url, ...partial } = GCP_ON;
  const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env(partial) });
  assert.equal(selection.backend, 'legacy');
  assert.equal(selection.reason, 'configuration_missing');
  assert.deepEqual(selection.missing, ['GCP_AI_WORKER_URL']);
  assert.deepEqual(gcpDispatchReady('image', env(partial)).missing, ['GCP_AI_WORKER_URL']);
});

test('image, video and web are gated independently on GCP', () => {
  for (const [kind, flag] of [['image', 'GCP_AI_IMAGE_ENABLED'], ['video', 'GCP_AI_VIDEO_ENABLED'], ['project', 'GCP_AI_WEB_ENABLED']] as const) {
    const disabled = selectExecutionBackend({ routingKey: USER, kind, env: env({ ...GCP_ON, [flag]: 'false' }) });
    assert.equal(disabled.backend, 'legacy', kind);
    assert.equal(disabled.reason, 'workload_disabled', kind);
    assert.equal(selectExecutionBackend({ routingKey: USER, kind, env: env(GCP_ON) }).backend, 'gcp', kind);
  }
});

test('light workloads never leave legacy', () => {
  for (const kind of ['text', 'vision', 'videoUnderstanding']) {
    const selection = selectExecutionBackend({ routingKey: USER, kind, env: env(GCP_ON) });
    assert.equal(selection.backend, 'legacy');
    assert.equal(selection.reason, 'workload_not_eligible');
  }
  assert.equal(executionWorkloadForKind('project'), 'web');
});

test('AWS stays disabled: off by default and refused even if every flag is flipped', () => {
  assert.equal(selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ AI_EXECUTION_BACKEND: 'aws' }) }).reason, 'dispatch_disabled');
  const flipped = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({
    AI_EXECUTION_BACKEND: 'aws', AWS_AI_DISPATCH_ENABLED: 'true', AWS_AI_IMAGE_ENABLED: 'true',
    AWS_AI_REGION: 'us-east-1', AWS_AI_IMAGE_QUEUE_URL: 'q', AWS_AI_VIDEO_QUEUE_URL: 'q', AWS_AI_WEB_QUEUE_URL: 'q',
  }) });
  assert.equal(flipped.backend, 'legacy');
  assert.equal(flipped.reason, 'adapter_not_implemented');
});

test('Cloudflare execution stays disabled and is independent from R2 storage', () => {
  const r2Only = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({
    AI_EXECUTION_BACKEND: 'cloudflare', CLOUDFLARE_ACCOUNT_ID: 'acc', CLOUDFLARE_R2_BUCKET_NAME: 'bucket', R2_ACCESS_KEY_ID: 'k',
  }) });
  assert.equal(r2Only.backend, 'legacy');
  assert.equal(r2Only.reason, 'dispatch_disabled');
  const flipped = selectExecutionBackend({ routingKey: USER, kind: 'video', env: env({
    AI_EXECUTION_BACKEND: 'cloudflare', CLOUDFLARE_AI_DISPATCH_ENABLED: 'true', CLOUDFLARE_AI_VIDEO_ENABLED: 'true',
  }) });
  assert.equal(flipped.backend, 'legacy');
  assert.equal(flipped.reason, 'adapter_not_implemented');
});

test('two clouds with dispatch enabled is ambiguous and never picks one', () => {
  for (const other of ['AWS_AI_DISPATCH_ENABLED', 'CLOUDFLARE_AI_DISPATCH_ENABLED']) {
    const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env({ ...GCP_ON, [other]: 'true' }) });
    assert.equal(selection.backend, 'legacy', other);
    assert.equal(selection.reason, 'ambiguous_configuration', other);
  }
});

test('a fully configured GCP selection returns exactly one backend', () => {
  const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env(GCP_ON) });
  assert.deepEqual(selection, { backend: 'gcp', requested: 'gcp', workload: 'image', reason: 'selected', missing: [] });
});

test('workers only execute jobs pinned to their own backend', () => {
  assert.deepEqual(workerMayExecute({ workerBackend: 'gcp', jobBackend: 'gcp', workload: 'image', env: env({}) }), { allowed: true });
  for (const jobBackend of ['legacy', 'aws', 'cloudflare', null, undefined]) {
    assert.deepEqual(workerMayExecute({ workerBackend: 'gcp', jobBackend, workload: 'image', env: env({}) }), { allowed: false, reason: 'backend_mismatch' });
  }
  assert.deepEqual(
    workerMayExecute({ workerBackend: 'gcp', jobBackend: 'gcp', workload: 'video', env: env({ GCP_AI_KILL_SWITCH: 'true' }) }),
    { allowed: false, reason: 'kill_switch' },
  );
  assert.deepEqual(workerMayExecute({ workerBackend: 'gcp', jobBackend: 'gcp', workload: null, env: env({}) }), { allowed: false, reason: 'workload_not_eligible' });
});

test('canary percentage defaults to 0: flags alone send no traffic', () => {
  const { GCP_AI_IMAGE_ROLLOUT_PERCENT: _p, ...noPercent } = GCP_ON;
  const selection = selectExecutionBackend({ routingKey: USER, kind: 'image', env: env(noPercent) });
  assert.equal(selection.backend, 'legacy');
  assert.equal(selection.reason, 'rollout_excluded');
  assert.equal(selectExecutionBackend({ routingKey: null, kind: 'image', env: env(GCP_ON) }).reason, 'rollout_excluded', 'no routing key, no canary');
});

test('canary buckets are deterministic per user and roughly proportional', () => {
  const canary = env({ ...GCP_ON, GCP_AI_IMAGE_ROLLOUT_PERCENT: '10' });
  const users = Array.from({ length: 2000 }, (_, i) => `user_${i}`);
  const onGcp = users.filter(user => selectExecutionBackend({ routingKey: user, kind: 'image', env: canary }).backend === 'gcp');
  assert.ok(onGcp.length > 120 && onGcp.length < 280, `~10% expected, got ${onGcp.length}`);
  for (const user of onGcp.slice(0, 20)) assert.equal(selectExecutionBackend({ routingKey: user, kind: 'image', env: canary }).backend, 'gcp');
  assert.equal(rolloutBucket('same'), rolloutBucket('same'));
  for (const value of ['-5', 'abc', '']) assert.equal(cloudBackendRolloutPercent('gcp', 'image', env({ GCP_AI_IMAGE_ROLLOUT_PERCENT: value })), 0);
  assert.equal(cloudBackendRolloutPercent('gcp', 'image', env({ GCP_AI_IMAGE_ROLLOUT_PERCENT: '250' })), 100);
});
