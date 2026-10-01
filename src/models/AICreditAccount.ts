import mongoose, { Document, Schema } from 'mongoose';

export interface IAICreditAccount extends Document {
  userId: string;
  balance: number;
  reserved: number;
  subscriptionBalance: number;
  purchasedBalance: number;
  founderBalance: number;
  promotionalBalance: number;
  reservedSubscription: number;
  reservedPurchased: number;
  reservedFounder: number;
  reservedPromotional: number;
  lifetimeSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const AICreditAccountSchema = new Schema<IAICreditAccount>({
  userId: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, required: true, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  subscriptionBalance: { type: Number, default: 0, min: 0 },
  purchasedBalance: { type: Number, default: 0, min: 0 },
  founderBalance: { type: Number, default: 0, min: 0 },
  promotionalBalance: { type: Number, default: 0, min: 0 },
  reservedSubscription: { type: Number, default: 0, min: 0 },
  reservedPurchased: { type: Number, default: 0, min: 0 },
  reservedFounder: { type: Number, default: 0, min: 0 },
  reservedPromotional: { type: Number, default: 0, min: 0 },
  lifetimeSpent: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.AICreditAccount || mongoose.model<IAICreditAccount>('AICreditAccount', AICreditAccountSchema, 'ai_credit_accounts');
