import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const RetentionActivitySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    activityDateUtc: { type: String, required: true, index: true },
    firstActivityAt: { type: Date, required: true },
    lastActivityAt: { type: Date, required: true },
  },
  { versionKey: false, timestamps: true }
);

RetentionActivitySchema.index({ userId: 1, activityDateUtc: 1 }, { unique: true });

export type RetentionActivityRecord = InferSchemaType<typeof RetentionActivitySchema>;

export default mongoose.models.RetentionActivity ||
  mongoose.model('RetentionActivity', RetentionActivitySchema, 'retention_activity_days');
