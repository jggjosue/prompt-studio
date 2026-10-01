import mongoose, { Schema } from 'mongoose';

const CheckoutRecoverySchema = new Schema({
  userId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  checkoutId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true },
  planId: { type: String, default: null },
  beginCheckoutAt: { type: Date, required: true },
  scheduledFor: { type: Date, required: true, index: true },
  status: { type: String, enum: ['scheduled', 'sent', 'cancelled_purchase', 'cancelled_ineligible'], required: true, index: true },
  sentAt: { type: Date, default: null },
  purchasedAt: { type: Date, default: null },
  recoveredPurchaseAt: { type: Date, default: null },
  recoveredRevenueCents: { type: Number, default: null, min: 0 },
  currency: { type: String, default: null },
}, { timestamps: true, versionKey: false });

export default mongoose.models.CheckoutRecovery ||
  mongoose.model('CheckoutRecovery', CheckoutRecoverySchema, 'checkout_recoveries');
