import assert from 'node:assert/strict';
import test from 'node:test';
import { GENERATION_TRAINING_EVENTS } from '../../src/lib/generation-training-events';

test('training event taxonomy contains the /generate lifecycle signals', () => {
  assert.deepEqual(GENERATION_TRAINING_EVENTS, [
    'prompt_submitted',
    'generation_started',
    'generation_completed',
    'generation_failed',
    'output_viewed',
    'output_saved',
    'output_downloaded',
    'regenerate_clicked',
    'prompt_edited',
    'feedback_positive',
    'feedback_negative',
    'added_to_queue',
  ]);
});

test('taxonomy does not contain keystroke or prompt-change capture', () => {
  assert.equal(GENERATION_TRAINING_EVENTS.includes('keystroke' as never), false);
  assert.equal(GENERATION_TRAINING_EVENTS.includes('prompt_changed' as never), false);
});
