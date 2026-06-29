import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const UserActivitySchema = new Schema(
  {
    userId: { type: String, index: true, unique: true, required: true },
    email: { type: String, index: true, required: true },
    lastActiveAt: { type: Date, index: true, required: true },
    firstSeenAt: { type: Date, required: true },
    inactivityNotifiedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export type UserActivityRecord = InferSchemaType<typeof UserActivitySchema>;

const UserActivity =
  mongoose.models.UserActivity ||
  mongoose.model('UserActivity', UserActivitySchema);

export default UserActivity;
