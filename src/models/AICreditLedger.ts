import mongoose, { Document, Schema } from 'mongoose';

export interface IAICreditLedger extends Document {
  userId: string;
  jobId: mongoose.Types.ObjectId;
  operation: 'reserve' | 'capture' | 'refund';
  amount: number;
  createdAt: Date;
}

const AICreditLedgerSchema = new Schema<IAICreditLedger>({
  userId: { type: String, required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, required: true, ref: 'AIGenerationJob', index: true },
  operation: { type: String, required: true, enum: ['reserve', 'capture', 'refund'] },
  amount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

AICreditLedgerSchema.index({ jobId: 1, operation: 1 }, { unique: true });

export default mongoose.models.AICreditLedger || mongoose.model<IAICreditLedger>('AICreditLedger', AICreditLedgerSchema, 'ai_credit_ledger');
