/**
 * Compatibility entry point for the /generate training taxonomy. The contract
 * lives in `training/event-contract` and capture in `training/capture`.
 */
export {
  CLIENT_TRAINING_EVENTS,
  GENERATION_TRAINING_EVENTS,
  SERVER_TRAINING_EVENTS,
  type GenerationTrainingEventName,
} from '@/lib/training/event-contract';
