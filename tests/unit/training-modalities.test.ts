import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVE_TRAINING_MODALITIES,
  RESERVED_TRAINING_MODALITIES,
  normalizeTrainingModality,
  trainingModalityForJobKind,
} from '../../src/lib/training/modalities';

test('text, image, video and web are active; future modalities are reserved', () => {
  assert.deepEqual([...ACTIVE_TRAINING_MODALITIES], ['text', 'image', 'video', 'web']);
  for (const modality of ['audio', '3d', 'document', 'agent', 'code', 'multimodal']) {
    assert.ok((RESERVED_TRAINING_MODALITIES as readonly string[]).includes(modality));
  }
});

test('job kinds map to modalities; legacy stored values are normalized', () => {
  assert.equal(trainingModalityForJobKind('project'), 'web');
  assert.equal(trainingModalityForJobKind('videoUnderstanding'), 'multimodal');
  assert.equal(trainingModalityForJobKind('unknown'), null);
  assert.equal(normalizeTrainingModality('project'), 'web');
  assert.equal(normalizeTrainingModality('vision'), 'multimodal');
  assert.equal(normalizeTrainingModality('audio'), 'audio');
  assert.equal(normalizeTrainingModality('hologram'), null);
});
