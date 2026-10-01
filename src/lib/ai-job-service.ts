import { creditsForActualCost } from '@/lib/generation-pricing';
import { generationSubmissionKey } from '@/lib/generation-idempotency';
import connectToDatabase from '@/lib/mongoose';
import { reportOperationalError } from '@/lib/observability-server';
import { recordCreditReconciliationFailure, type CreditReconciliationOperation } from '@/lib/generation-telemetry';
import { getSiteUrl } from '@/lib/site-url';
import { allocateCreditReservation, refundCreditReservation, reservationSource, type CreditBucketReservation } from '@/lib/credit-wallet';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';
import mongoose from 'mongoose';
import 'server-only';

const initialCredits = Math.max(0, Number(process.env.AI_INITIAL_CREDITS ?? 0));

type CreditSession = mongoose.ClientSession;

/**
 * La reconciliación que falla es la peor pérdida de datos que no se ve: el
 * cobro no casa, el trabajo se pierde y el usuario ni entra ni sale del saldo.
 * Se registra de forma best-effort justo antes de relanzar el error original.
 */
function reportCreditReconciliationFailure(
  job: IAIGenerationJob,
  operation: CreditReconciliationOperation,
  errorCode: string,
) {
  void recordCreditReconciliationFailure({
    operation,
    jobId: String(job._id),
    correlationId: job.correlationId ?? null,
    provider: job.provider,
    modelId: job.modelId ?? null,
    userId: job.userId,
    credits: job.creditCost,
    errorCode,
    category: 'credit_reconciliation',
  }).catch(() => undefined);
}

export async function ensureCreditAccount(userId: string, session?: CreditSession) {
  await AICreditAccount.updateOne(
    { userId },
    { $setOnInsert: { userId, balance: initialCredits, subscriptionBalance: initialCredits, purchasedBalance: 0, founderBalance: 0, promotionalBalance: 0, reserved: 0, reservedSubscription: 0, reservedPurchased: 0, reservedFounder: 0, reservedPromotional: 0, lifetimeSpent: 0, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true, session }
  );

  const legacy = await AICreditAccount.findOne({ userId, subscriptionBalance: { $exists: false } }).session(session ?? null);
  if (legacy) {
    legacy.subscriptionBalance = legacy.balance;
    legacy.purchasedBalance = 0;
    legacy.founderBalance = 0;
    legacy.promotionalBalance = 0;
    legacy.reservedSubscription = legacy.reserved;
    legacy.reservedPurchased = 0;
    legacy.reservedFounder = 0;
    legacy.reservedPromotional = 0;
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
        const existing = await AICreditLedger.findOne({ jobId: job._id, operation: 'reserve' }).session(session).lean();
        if (existing) {
          const metadata = existing.metadata ?? {};
          job.reservedSubscriptionCredits = Number(metadata.subscriptionCredits ?? job.reservedSubscriptionCredits ?? 0);
          job.reservedPurchasedCredits = Number(metadata.purchasedCredits ?? job.reservedPurchasedCredits ?? 0);
          job.reservedFounderCredits = Number(metadata.founderCredits ?? job.reservedFounderCredits ?? 0);
          job.reservedPromotionalCredits = Number(metadata.promotionalCredits ?? job.reservedPromotionalCredits ?? 0);
          const current = await AICreditAccount.findOne({ userId: job.userId }).session(session).select('balance').lean();
          await AIGenerationJob.updateOne(
            { _id: job._id, creditsState: { $in: ['pending', 'refunded', 'reserved'] } },
            { $set: { creditsState: 'reserved', reservedSubscriptionCredits: job.reservedSubscriptionCredits, reservedPurchasedCredits: job.reservedPurchasedCredits, reservedFounderCredits: job.reservedFounderCredits, reservedPromotionalCredits: job.reservedPromotionalCredits, updatedAt: new Date() } },
            { session },
          );
          job.creditsState = 'reserved';
          remainingBalance = current?.balance ?? 0;
          return;
        }
        const account = await AICreditAccount.findOne({ userId: job.userId }).session(session).lean();
        if (!account) throw new Error('CREDIT_ACCOUNT_MISSING');
        const subscriptionBalance = account.subscriptionBalance ?? account.balance;
        const purchasedBalance = account.purchasedBalance ?? 0;
        const founderBalance = account.founderBalance ?? 0;
        const promotionalBalance = account.promotionalBalance ?? 0;
        const allocation = allocateCreditReservation({ promotional: promotionalBalance, subscription: subscriptionBalance, purchased: purchasedBalance, founder: founderBalance }, job.creditCost);
        if (!allocation) throw new Error('INSUFFICIENT_CREDITS');
        const subscriptionCredits = allocation.subscription;
        const purchasedCredits = allocation.purchased;
        const founderCredits = allocation.founder;
        const promotionalCredits = allocation.promotional;
        const updated = await AICreditAccount.findOneAndUpdate(
          { _id: account._id, balance: account.balance, subscriptionBalance, purchasedBalance, founderBalance, promotionalBalance },
          { $inc: { balance: -job.creditCost, reserved: job.creditCost, subscriptionBalance: -subscriptionCredits, purchasedBalance: -purchasedCredits, founderBalance: -founderCredits, promotionalBalance: -promotionalCredits, reservedSubscription: subscriptionCredits, reservedPurchased: purchasedCredits, reservedFounder: founderCredits, reservedPromotional: promotionalCredits }, $set: { updatedAt: new Date() } },
          { returnDocument: 'after', session }
        );
        if (!updated) throw new Error('CREDIT_RESERVATION_CONFLICT');
        await AICreditLedger.create([{
          userId: job.userId, jobId: job._id, operation: 'reserve', type: 'AI_RESERVATION', amount: job.creditCost,
          balanceImpact: -job.creditCost, source: reservationSource(allocation),
          provider: job.provider, modelId: job.modelId ?? null, operationName: job.operation ?? job.kind,
          estimatedApiCostUsd: job.estimatedCostUsd, creditsCharged: job.creditCost, requestId: `reserve:${generationSubmissionKey(job)}`,
          metadata: { subscriptionCredits, purchasedCredits, founderCredits, promotionalCredits }, createdAt: new Date(),
        }], { session });
        job.reservedSubscriptionCredits = subscriptionCredits;
        job.reservedPurchasedCredits = purchasedCredits;
        job.reservedFounderCredits = founderCredits;
        job.reservedPromotionalCredits = promotionalCredits;
        await AIGenerationJob.updateOne(
          { _id: job._id },
          { $set: { creditsState: 'reserved', reservedSubscriptionCredits: subscriptionCredits, reservedPurchasedCredits: purchasedCredits, reservedFounderCredits: founderCredits, reservedPromotionalCredits: promotionalCredits, updatedAt: new Date() } },
          { session },
        );
        job.creditsState = 'reserved';
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
      if (existing) {
        job.creditsCharged = existing.creditsCharged ?? existing.amount;
        job.creditsState = 'captured';
        return;
      }

      const reservation: CreditBucketReservation = {
        promotional: job.reservedPromotionalCredits ?? 0,
        subscription: job.reservedSubscriptionCredits ?? job.creditCost,
        purchased: job.reservedPurchasedCredits ?? 0,
        founder: job.reservedFounderCredits ?? 0,
        total: job.creditCost,
      };
      const requestedCredits = creditsForActualCost(job.provider, job.modelId, actualCostUsd, job.creditCost);
      const account = await AICreditAccount.findOne({ userId: job.userId }).session(session);
      if (!account) throw new Error('CREDIT_ACCOUNT_MISSING');

      const additionalRequested = Math.max(0, requestedCredits - job.creditCost);
      const additionalAllocation = allocateCreditReservation({
        promotional: account.promotionalBalance,
        subscription: account.subscriptionBalance,
        purchased: account.purchasedBalance,
        founder: account.founderBalance,
      }, Math.min(additionalRequested, account.balance)) ?? {
        promotional: 0, subscription: 0, purchased: 0, founder: 0, total: 0,
      };
      const additionalCharged = additionalAllocation.total;

      const refund = Math.max(0, job.creditCost - requestedCredits);
      const refundAllocation = refundCreditReservation(reservation, refund);
      const chargedCredits = job.creditCost + additionalCharged - refund;

      const claimed = await AIGenerationJob.updateOne(
        { _id: job._id, creditsState: 'reserved' },
        { $set: { creditsState: 'captured', creditsCharged: chargedCredits, updatedAt: new Date() } },
        { session },
      );
      if (claimed.modifiedCount !== 1) {
        reportCreditReconciliationFailure(job, 'capture', 'CREDIT_CAPTURE_CONFLICT');
        throw new Error('CREDIT_CAPTURE_CONFLICT');
      }

      await AICreditLedger.create([{
        userId: job.userId, jobId: job._id, operation: 'capture', type: 'AI_USAGE', amount: chargedCredits,
        balanceImpact: -additionalCharged + refund, source: reservationSource(reservation),
        provider: job.provider, modelId: job.modelId ?? null, operationName: job.operation ?? job.kind,
        inputTokens: job.actualInputTokens ?? job.estimatedInputTokens ?? null, outputTokens: job.actualOutputTokens ?? job.estimatedOutputTokens ?? null,
        estimatedApiCostUsd: job.estimatedCostUsd, actualApiCostUsd: actualCostUsd, creditsCharged: chargedCredits,
        requestId: `capture:${generationSubmissionKey(job)}`,
        metadata: { reservation, additionalAllocation, refundAllocation }, createdAt: new Date(),
      }], { session });

      await AICreditAccount.updateOne(
        { userId: job.userId },
        { $inc: {
          balance: -additionalCharged + refund,
          reserved: -job.creditCost,
          promotionalBalance: -additionalAllocation.promotional + refundAllocation.promotional,
          subscriptionBalance: -additionalAllocation.subscription + refundAllocation.subscription,
          purchasedBalance: -additionalAllocation.purchased + refundAllocation.purchased,
          founderBalance: -additionalAllocation.founder + refundAllocation.founder,
          reservedPromotional: -reservation.promotional,
          reservedSubscription: -reservation.subscription,
          reservedPurchased: -reservation.purchased,
          reservedFounder: -reservation.founder,
          lifetimeSpent: chargedCredits,
        }, $set: { updatedAt: new Date() } },
        { session },
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
      if (existing) {
        job.creditsState = 'refunded';
        return;
      }
      const reservation: CreditBucketReservation = {
        promotional: job.reservedPromotionalCredits ?? 0,
        subscription: job.reservedSubscriptionCredits ?? job.creditCost,
        purchased: job.reservedPurchasedCredits ?? 0,
        founder: job.reservedFounderCredits ?? 0,
        total: job.creditCost,
      };
      const claimed = await AIGenerationJob.updateOne(
        { _id: job._id, creditsState: 'reserved' },
        { $set: { creditsState: 'refunded', updatedAt: new Date() } },
        { session },
      );
      if (claimed.modifiedCount !== 1) {
        reportCreditReconciliationFailure(job, 'refund', 'CREDIT_REFUND_CONFLICT');
        throw new Error('CREDIT_REFUND_CONFLICT');
      }
      await AICreditLedger.create([{
        userId: job.userId, jobId: job._id, operation: 'refund', type: 'REFUND', amount: job.creditCost,
        balanceImpact: job.creditCost, source: reservationSource(reservation), provider: job.provider, modelId: job.modelId ?? null,
        operationName: job.operation ?? job.kind, requestId: `refund:${generationSubmissionKey(job)}`,
        metadata: { reservation }, createdAt: new Date(),
      }], { session });
      await AICreditAccount.updateOne(
        { userId: job.userId },
        { $inc: {
          balance: job.creditCost,
          reserved: -job.creditCost,
          promotionalBalance: reservation.promotional,
          subscriptionBalance: reservation.subscription,
          purchasedBalance: reservation.purchased,
          founderBalance: reservation.founder,
          reservedPromotional: -reservation.promotional,
          reservedSubscription: -reservation.subscription,
          reservedPurchased: -reservation.purchased,
          reservedFounder: -reservation.founder,
        }, $set: { updatedAt: new Date() } },
        { session },
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
    promotionalCredits: account?.promotionalBalance ?? 0,
    subscriptionCredits: account?.subscriptionBalance ?? account?.balance ?? 0,
    purchasedCredits: account?.purchasedBalance ?? 0,
    founderCredits: account?.founderBalance ?? 0,
    reserved: account?.reserved ?? 0,
    lifetimeSpent: account?.lifetimeSpent ?? 0,
  };
}

async function grantCredits(input: {
  userId: string;
  credits: number;
  requestId: string;
  source: 'subscription' | 'purchased' | 'founder' | 'promotional';
  type: 'SUBSCRIPTION_GRANT' | 'TOPUP_PURCHASE' | 'FOUNDER_GRANT' | 'PROMOTIONAL_GRANT';
  metadata?: Record<string, unknown>;
}) {
  if (!Number.isFinite(input.credits) || input.credits <= 0 || !input.requestId) throw new Error('INVALID_CREDIT_GRANT');
  const balanceField = {
    subscription: 'subscriptionBalance',
    purchased: 'purchasedBalance',
    founder: 'founderBalance',
    promotional: 'promotionalBalance',
  }[input.source];
  const session = await mongoose.startSession();
  try {
    let granted = false;
    await session.withTransaction(async () => {
      await ensureCreditAccount(input.userId, session);
      if (await AICreditLedger.exists({ requestId: input.requestId }).session(session)) return;
      await AICreditAccount.updateOne(
        { userId: input.userId },
        { $inc: { balance: input.credits, [balanceField]: input.credits }, $set: { updatedAt: new Date() } },
        { session },
      );
      await AICreditLedger.create([{
        userId: input.userId, operation: 'grant', type: input.type, amount: input.credits,
        balanceImpact: input.credits, source: input.source, requestId: input.requestId,
        metadata: input.metadata ?? {}, createdAt: new Date(),
      }], { session });
      granted = true;
    });
    return granted;
  } finally {
    await session.endSession();
  }
}

export function grantSubscriptionCredits(userId: string, credits: number, periodKey: string, metadata: Record<string, unknown> = {}) {
  if (!periodKey) throw new Error('INVALID_CREDIT_GRANT');
  return grantCredits({ userId, credits, requestId: `subscription:${userId}:${periodKey}`, source: 'subscription', type: 'SUBSCRIPTION_GRANT', metadata });
}

export function grantPurchasedCredits(userId: string, credits: number, requestId: string, metadata: Record<string, unknown> = {}) {
  return grantCredits({ userId, credits, requestId, source: 'purchased', type: 'TOPUP_PURCHASE', metadata });
}

export function grantFounderCredits(userId: string, credits: number, requestId: string, metadata: Record<string, unknown> = {}) {
  return grantCredits({ userId, credits, requestId, source: 'founder', type: 'FOUNDER_GRANT', metadata });
}

export function grantPromotionalCredits(userId: string, credits: number, requestId: string, metadata: Record<string, unknown> = {}) {
  return grantCredits({ userId, credits, requestId, source: 'promotional', type: 'PROMOTIONAL_GRANT', metadata });
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
