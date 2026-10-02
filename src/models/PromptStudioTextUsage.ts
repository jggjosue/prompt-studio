import mongoose, { Document, Schema } from "mongoose";

export type PromptStudioTextUsageState =
  | "reserved"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface IPromptStudioTextUsage extends Document {
  generationId: string;
  userId: string;
  plan: "free" | "creator" | "pro" | "studio";
  logicalModel: "promptstudio-fast";
  provider: string;
  state: PromptStudioTextUsageState;
  monthKey: string;
  reservedCredits: number;
  creditsCharged: number;
  inputTokens?: number | null;
  outputTokens?: number | null;
  runtimeSeconds?: number | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  errorCode?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
  updatedAt: Date;
}

const PromptStudioTextUsageSchema = new Schema<IPromptStudioTextUsage>(
  {
    generationId: { type: String, required: true, unique: true, maxlength: 120 },
    userId: { type: String, required: true, index: true },
    plan: {
      type: String,
      required: true,
      enum: ["free", "creator", "pro", "studio"],
      index: true,
    },
    logicalModel: {
      type: String,
      required: true,
      enum: ["promptstudio-fast"],
      index: true,
    },
    provider: { type: String, required: true, maxlength: 40, index: true },
    state: {
      type: String,
      required: true,
      enum: ["reserved", "completed", "failed", "cancelled", "refunded"],
      index: true,
    },
    monthKey: { type: String, required: true, maxlength: 7, index: true },
    reservedCredits: { type: Number, required: true, min: 0 },
    creditsCharged: { type: Number, required: true, min: 0, default: 0 },
    inputTokens: { type: Number, default: null, min: 0 },
    outputTokens: { type: Number, default: null, min: 0 },
    runtimeSeconds: { type: Number, default: null, min: 0 },
    estimatedCostUsd: { type: Number, default: null, min: 0 },
    actualCostUsd: { type: Number, default: null, min: 0 },
    errorCode: { type: String, default: null, maxlength: 100 },
    createdAt: { type: Date, default: Date.now, index: true },
    completedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

PromptStudioTextUsageSchema.index({ userId: 1, monthKey: 1, createdAt: -1 });
PromptStudioTextUsageSchema.index({ plan: 1, monthKey: 1, logicalModel: 1 });
PromptStudioTextUsageSchema.index({ logicalModel: 1, provider: 1, createdAt: -1 });

export default mongoose.models.PromptStudioTextUsage ||
  mongoose.model<IPromptStudioTextUsage>(
    "PromptStudioTextUsage",
    PromptStudioTextUsageSchema,
    "promptstudio_text_usage",
  );
