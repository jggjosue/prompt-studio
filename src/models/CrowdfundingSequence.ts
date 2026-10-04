import mongoose, { Document, Schema } from 'mongoose';

export interface ICrowdfundingSequence extends Document {
  _id: string;
  value: number;
  updatedAt: Date;
}

const CrowdfundingSequenceSchema = new Schema<ICrowdfundingSequence>({
  _id: { type: String, required: true },
  value: { type: Number, required: true, min: 0, default: 0 },
  updatedAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false });

export default mongoose.models.CrowdfundingSequence ||
  mongoose.model<ICrowdfundingSequence>('CrowdfundingSequence', CrowdfundingSequenceSchema, 'crowdfunding_sequences');
