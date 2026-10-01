import mongoose, { Schema } from 'mongoose';
import { BEHAVIORAL_EMAIL_TRIGGERS } from '@/lib/behavioral-email-triggers';

const BehavioralEmailTriggerEventSchema = new Schema({
  userId: { type: String, required: true, index: true },
  trigger: { type: String, enum: BEHAVIORAL_EMAIL_TRIGGERS, required: true, index: true },
  sourceEventId: { type: String, required: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  objective: { type: String, required: true },
  occurredAt: { type: Date, required: true, index: true },
  processedAt: { type: Date, default: null, index: true },
  outcome: { type: String, enum: ['sent', 'skipped_duplicate', 'skipped_frequency_cap', 'cancelled_purchase', 'ineligible'], default: null },
}, { versionKey: false });

export default mongoose.models.BehavioralEmailTriggerEvent ||
  mongoose.model('BehavioralEmailTriggerEvent', BehavioralEmailTriggerEventSchema, 'behavioral_email_trigger_events');
