import 'server-only';
import connectToDatabase from '@/lib/mongoose';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';
import { getSiteUrl } from '@/lib/site-url';
import { reportOperationalError } from '@/lib/observability-server';

const initialCredits = Math.max(0, Number(process.env.AI_INITIAL_CREDITS ?? 12));

export async function ensureCreditAccount(userId: string) {
  await AICreditAccount.updateOne(
    { userId },
    { $setOnInsert: { userId, balance: initialCredits, reserved: 0, lifetimeSpent: 0, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function reserveCredits(job: IAIGenerationJob): Promise<number | null> {
  await ensureCreditAccount(job.userId);
  const account = await AICreditAccount.findOneAndUpdate(
    { userId: job.userId, balance: { $gte: job.creditCost } },
    { $inc: { balance: -job.creditCost, reserved: job.creditCost }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!account) return null;
  await AICreditLedger.updateOne(
    { jobId: job._id, operation: 'reserve' },
    { $inc: { amount: job.creditCost }, $setOnInsert: { userId: job.userId, jobId: job._id, operation: 'reserve', createdAt: new Date() } },
    { upsert: true }
  );
  return account.balance;
}

export async function captureCredits(job: IAIGenerationJob) {
  if (job.creditsState !== 'reserved') return;
  const ledger = await AICreditLedger.updateOne(
    { jobId: job._id, operation: 'capture' },
    { $setOnInsert: { userId: job.userId, jobId: job._id, operation: 'capture', amount: job.creditCost, createdAt: new Date() } },
    { upsert: true }
  );
  if (!ledger.upsertedCount) return;
  await AICreditAccount.updateOne(
    { userId: job.userId },
    { $inc: { reserved: -job.creditCost, lifetimeSpent: job.creditCost }, $set: { updatedAt: new Date() } }
  );
  job.creditsState = 'captured';
}

export async function refundCredits(job: IAIGenerationJob) {
  if (job.creditsState !== 'reserved') return;
  const ledger = await AICreditLedger.updateOne(
    { jobId: job._id, operation: 'refund' },
    { $setOnInsert: { userId: job.userId, jobId: job._id, operation: 'refund', amount: job.creditCost, createdAt: new Date() } },
    { upsert: true }
  );
  if (!ledger.upsertedCount) return;
  await AICreditAccount.updateOne(
    { userId: job.userId },
    { $inc: { balance: job.creditCost, reserved: -job.creditCost }, $set: { updatedAt: new Date() } }
  );
  job.creditsState = 'refunded';
}

export async function getCreditBalance(userId: string) {
  await connectToDatabase();
  await ensureCreditAccount(userId);
  const account = await AICreditAccount.findOne({ userId }).lean();
  return { balance: account?.balance ?? 0, reserved: account?.reserved ?? 0, lifetimeSpent: account?.lifetimeSpent ?? 0 };
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
      metadata: { operation: 'notify_completion', provider: 'resend', jobId: String(job._id), correlationId: String(job._id), kind: job.kind, attempts: job.attempts },
    }, error);
  }
}

export { AIGenerationJob };
