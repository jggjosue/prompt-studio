import { creditsForActualCost } from '@/lib/generation-pricing';
import connectToDatabase from '@/lib/mongoose';
import { reportOperationalError } from '@/lib/observability-server';
import { getSiteUrl } from '@/lib/site-url';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';
import mongoose from 'mongoose';
import 'server-only';

const initialCredits = Math.max(0, Number(process.env.AI_INITIAL_CREDITS ?? 0));

type CreditSession = mongoose.ClientSession;

export async function ensureCreditAccount(userId: string, session?: CreditSession) {
  await AICreditAccount.updateOne(
    { userId },
    { $setOnInsert: { userId, balance: initialCredits, subscriptionBalance: initialCredits, purchasedBalance: 0, reserved: 0, reservedSubscription: 0, reservedPurchased: 0, lifetimeSpent: 0, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true, session }
  );

  // DEV HACK: Force 100,000 credits always so you can develop locally without limits
  await AICreditAccount.updateOne({ userId }, { $set: { balance: 100000, subscriptionBalance: 100000 } });
  const legacy = await AICreditAccount.findOne({ userId, subscriptionBalance: { $exists: false } }).session(session ?? null);
  if (legacy) {
    legacy.subscriptionBalance = legacy.balance;
    legacy.purchasedBalance = 0;
    legacy.reservedSubscription = legacy.reserved;
    legacy.reservedPurchased = 0;
    await legacy.save({ session });
  }
}

export async function reserveCredits(job: IAIGenerationJob): Promise<number | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const session = await mongoose.startSession();
    try {
      let remainingBalance: number | null = null;
      await session.withTransaction(async () => {
        await ensureCreditAccount(job.userId, session);
        const account = await AICreditAccount.findOne({ userId: job.userId }).session(session).lean();
        if (!account) throw new Error('CREDIT_ACCOUNT_MISSING');
        const subscriptionBalance = account.subscriptionBalance ?? account.balance;
        const purchasedBalance = account.purchasedBalance ?? 0;
        if (subscriptionBalance + purchasedBalance < job.creditCost) throw new Error('INSUFFICIENT_CREDITS');
        const subscriptionCredits = Math.min(subscriptionBalance, job.creditCost);
        const purchasedCredits = job.creditCost - subscriptionCredits;
        const updated = await AICreditAccount.findOneAndUpdate(
          { _id: account._id, balance: account.balance, subscriptionBalance, purchasedBalance },
          { $inc: { balance: -job.creditCost, reserved: job.creditCost, subscriptionBalance: -subscriptionCredits, purchasedBalance: -purchasedCredits, reservedSubscription: subscriptionCredits, reservedPurchased: purchasedCredits }, $set: { updatedAt: new Date() } },
          { returnDocument: 'after', session }
        );
        if (!updated) throw new Error('CREDIT_RESERVATION_CONFLICT');
        await AICreditLedger.create([{
          userId: job.userId, jobId: job._id, operation: 'reserve', type: 'AI_RESERVATION', amount: job.creditCost,
          balanceImpact: -job.creditCost, source: purchasedCredits ? (subscriptionCredits ? 'mixed' : 'purchased') : 'subscription',
          provider: job.provider, modelId: job.modelId ?? null, operationName: job.operation ?? job.kind,
          estimatedApiCostUsd: job.estimatedCostUsd, creditsCharged: job.creditCost, requestId: job.idempotencyKey,
          metadata: { subscriptionCredits, purchasedCredits }, createdAt: new Date(),
        }], { session });
        job.reservedSubscriptionCredits = subscriptionCredits;
        job.reservedPurchasedCredits = purchasedCredits;
        remainingBalance = updated.balance;
      });
      return remainingBalance;
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') return null;
      if (attempt === 2) throw error;
    } finally {
      await session.endSession();
    }
  }
  return null;
}

export async function captureCredits(job: IAIGenerationJob) {
  await reconcileCredits(job, job.actualCostUsd ?? null);
}

export async function reconcileCredits(job: IAIGenerationJob, actualCostUsd: number | null) {
  if (job.creditsState !== 'reserved') return;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await AICreditLedger.findOne({ jobId: job._id, operation: 'capture' }).session(session);
      if (existing) return;
      const reservedSubscription = job.reservedSubscriptionCredits ?? job.creditCost;
      const reservedPurchased = job.reservedPurchasedCredits ?? 0;
      const requestedCredits = creditsForActualCost(job.provider, job.modelId, actualCostUsd, job.creditCost);
      const account = await AICreditAccount.findOne({ userId: job.userId }).session(session);
      if (!account) throw new Error('CREDIT_ACCOUNT_MISSING');
      const additionalRequested = Math.max(0, requestedCredits - job.creditCost);
      const additionalSubscription = Math.min(account.subscriptionBalance, additionalRequested);
      const additionalAvailable = account.balance;
      const additionalCharged = Math.min(additionalRequested, additionalAvailable);
      const additionalSubCharged = Math.min(additionalSubscription, additionalCharged);
      const additionalPurchasedCharged = additionalCharged - additionalSubCharged;
      const refund = Math.max(0, job.creditCost - requestedCredits);
      const refundSubscription = Math.min(reservedSubscription, refund);
      const refundPurchased = refund - refundSubscription;
      const chargedCredits = job.creditCost + additionalCharged - refund;
      await AICreditLedger.create([{
        userId: job.userId, jobId: job._id, operation: 'capture', type: 'AI_USAGE', amount: chargedCredits,
        balanceImpact: 0, source: job.reservedPurchasedCredits ? (job.reservedSubscriptionCredits ? 'mixed' : 'purchased') : 'subscription',
        provider: job.provider, modelId: job.modelId ?? null, operationName: job.operation ?? job.kind,
        inputTokens: job.actualInputTokens ?? job.estimatedInputTokens ?? null, outputTokens: job.actualOutputTokens ?? job.estimatedOutputTokens ?? null,
        estimatedApiCostUsd: job.estimatedCostUsd, actualApiCostUsd: actualCostUsd, creditsCharged: chargedCredits,
        requestId: job.idempotencyKey, createdAt: new Date(),
      }], { session });
      await AICreditAccount.updateOne(
        { userId: job.userId },
        { $inc: { balance: -additionalCharged + refund, reserved: -job.creditCost, subscriptionBalance: -additionalSubCharged + refundSubscription, purchasedBalance: -additionalPurchasedCharged + refundPurchased, reservedSubscription: -reservedSubscription, reservedPurchased: -reservedPurchased, lifetimeSpent: chargedCredits }, $set: { updatedAt: new Date() } },
        { session }
      );
      job.creditsCharged = chargedCredits;
      job.creditsState = 'captured';
    });
  } finally {
    await session.endSession();
  }
}

export async function refundCredits(job: IAIGenerationJob) {
  if (job.creditsState !== 'reserved') return;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await AICreditLedger.findOne({ jobId: job._id, operation: 'refund' }).session(session);
      if (existing) return;
      await AICreditLedger.create([{
        userId: job.userId, jobId: job._id, operation: 'refund', type: 'REFUND', amount: job.creditCost,
        balanceImpact: job.creditCost, source: 'system', provider: job.provider, modelId: job.modelId ?? null,
        operationName: job.operation ?? job.kind, requestId: job.idempotencyKey, createdAt: new Date(),
      }], { session });
      await AICreditAccount.updateOne(
        { userId: job.userId },
        { $inc: { balance: job.creditCost, reserved: -job.creditCost, subscriptionBalance: job.reservedSubscriptionCredits ?? job.creditCost, purchasedBalance: job.reservedPurchasedCredits ?? 0, reservedSubscription: -(job.reservedSubscriptionCredits ?? job.creditCost), reservedPurchased: -(job.reservedPurchasedCredits ?? 0) }, $set: { updatedAt: new Date() } },
        { session }
      );
      job.creditsState = 'refunded';
    });
  } finally {
    await session.endSession();
  }
}

export async function getCreditBalance(userId: string) {
  await connectToDatabase();
  await ensureCreditAccount(userId);
  const account = await AICreditAccount.findOne({ userId }).lean();
  return {
    balance: account?.balance ?? 0,
    subscriptionCredits: account?.subscriptionBalance ?? account?.balance ?? 0,
    purchasedCredits: account?.purchasedBalance ?? 0,
    reserved: account?.reserved ?? 0,
    lifetimeSpent: account?.lifetimeSpent ?? 0,
  };
}

export async function grantSubscriptionCredits(userId: string, credits: number, periodKey: string, metadata: Record<string, unknown> = {}) {
  if (!Number.isFinite(credits) || credits <= 0 || !periodKey) throw new Error('INVALID_CREDIT_GRANT');
  const session = await mongoose.startSession();
  try {
    let granted = false;
    await session.withTransaction(async () => {
      await ensureCreditAccount(userId, session);
      const requestId = `subscription:${userId}:${periodKey}`;
      if (await AICreditLedger.exists({ requestId }).session(session)) return;
      await AICreditAccount.updateOne({ userId }, { $inc: { balance: credits, subscriptionBalance: credits }, $set: { updatedAt: new Date() } }, { session });
      await AICreditLedger.create([{ userId, operation: 'grant', type: 'SUBSCRIPTION_GRANT', amount: credits, balanceImpact: credits, source: 'subscription', requestId, metadata, createdAt: new Date() }], { session });
      granted = true;
    });
    return granted;
  } finally {
    await session.endSession();
  }
}

export async function grantPurchasedCredits(userId: string, credits: number, requestId: string, metadata: Record<string, unknown> = {}) {
  if (!Number.isFinite(credits) || credits <= 0 || !requestId) throw new Error('INVALID_CREDIT_GRANT');
  const session = await mongoose.startSession();
  try {
    let granted = false;
    await session.withTransaction(async () => {
      await ensureCreditAccount(userId, session);
      if (await AICreditLedger.exists({ requestId }).session(session)) return;
      await AICreditAccount.updateOne({ userId }, { $inc: { balance: credits, purchasedBalance: credits }, $set: { updatedAt: new Date() } }, { session });
      await AICreditLedger.create([{ userId, operation: 'grant', type: 'TOPUP_PURCHASE', amount: credits, balanceImpact: credits, source: 'purchased', requestId, metadata, createdAt: new Date() }], { session });
      granted = true;
    });
    return granted;
  } finally {
    await session.endSession();
  }
}

export async function expireSubscriptionCredits(userId: string, periodKey: string) {
  if (!periodKey) throw new Error('INVALID_CREDIT_PERIOD');
  const session = await mongoose.startSession();
  try {
    let expired = 0;
    await session.withTransaction(async () => {
      await ensureCreditAccount(userId, session);
      const requestId = `subscription-expiration:${userId}:${periodKey}`;
      if (await AICreditLedger.exists({ requestId }).session(session)) return;
      const account = await AICreditAccount.findOne({ userId }).session(session);
      if (!account) throw new Error('CREDIT_ACCOUNT_MISSING');
      expired = Math.max(0, account.subscriptionBalance - account.reservedSubscription);
      if (expired > 0) {
        await AICreditAccount.updateOne({ _id: account._id }, { $inc: { balance: -expired, subscriptionBalance: -expired }, $set: { updatedAt: new Date() } }, { session });
      }
      await AICreditLedger.create([{ userId, operation: 'expiration', type: 'EXPIRATION', amount: expired, balanceImpact: -expired, source: 'subscription', requestId, metadata: { periodKey }, createdAt: new Date() }], { session });
    });
    return expired;
  } finally {
    await session.endSession();
  }
}

export async function notifyJobFinished(job: IAIGenerationJob) {
  if (!job.notifyOnComplete || job.notificationSentAt || !process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL) return;
  try {
    const { resend } = await import('@/lib/resend');
    await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: job.userEmail,
      subject: job.status === 'completed' ? 'Tu creación está lista' : 'No pudimos completar tu creación',
      text: job.status === 'completed'
        ? `Tu trabajo de ${job.kind} terminó correctamente. Ábrelo en tu panel: ${getSiteUrl().replace(/\/$/, '')}/dashboard/generations`
        : `Tu trabajo de ${job.kind} no pudo completarse después de ${job.attempts} intentos. Los créditos reservados fueron devueltos.`,
    });
    job.notificationSentAt = new Date();
  } catch (error) {
    reportOperationalError({
      category: 'ai_generation',
      name: 'job_notification',
      route: 'ai-job-service',
      userId: job.userId,
      metadata: { operation: 'notify_completion', provider: 'resend', jobId: String(job._id), correlationId: job.correlationId || String(job._id), kind: job.kind, attempts: job.attempts },
    }, error);
  }
}

export { AIGenerationJob };
