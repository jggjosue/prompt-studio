import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTrainingQuality, qualitySignalsFromEventNames, qualityThreshold, TRAINING_QUALITY_VERSION } from '../../src/lib/training-quality';

test('quality score is explainable from explicit outcome signals', () => {
  const signals = qualitySignalsFromEventNames(['generation_completed', 'output_saved', 'feedback_positive']);
  const result = calculateTrainingQuality('image-generation', signals, {});
  assert.equal(result.version, TRAINING_QUALITY_VERSION);
  assert.equal(result.score, 0.75);
  assert.equal(result.passes, true);
  assert.equal(result.contributions.generationSucceeded, 0.30);
  assert.equal(result.contributions.saved, 0.20);
  assert.equal(result.contributions.positiveFeedback, 0.25);
});

test('negative/regenerate signals reduce but never make score negative', () => {
  const signals = qualitySignalsFromEventNames(['feedback_negative', 'regenerate_clicked']);
  const result = calculateTrainingQuality('prompt-enhancement', signals, {});
  assert.equal(result.score, 0);
  assert.equal(result.passes, false);
});

test('threshold is configurable per dataset', () => {
  assert.equal(qualityThreshold('preference', { TRAINING_QUALITY_THRESHOLD_PREFERENCE: '0.8' } as NodeJS.ProcessEnv), 0.8);
  assert.throws(() => qualityThreshold('image-generation', { TRAINING_QUALITY_THRESHOLD_IMAGE_GENERATION: '1.2' } as NodeJS.ProcessEnv), /INVALID_TRAINING_QUALITY_THRESHOLD/);
});

test('unknown events do not affect quality', () => {
  const result = calculateTrainingQuality('preference', qualitySignalsFromEventNames(['unknown_event']), {});
  assert.equal(result.score, 0);
});
