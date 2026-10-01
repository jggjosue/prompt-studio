import 'server-only';

import { captureCredits, refundCredits, reserveCredits } from '@/lib/ai-job-service';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

export type PaidGenerationCreditGuard =
  | { allowed: true; remainingBalance: number | null }
  | { allowed: false; reason: 'INSUFFICIENT_CREDITS' };

export function assertPaidGenerationReserved(job: IAIGenerationJob): void {
  if (job.creditCost <= 0) return;
  if (job.creditsState !== 'reserved') {
    throw new Error('PAID_GENERATION_REQUIRES_RESERVED_CREDITS');
  }
}

export async function reserveGenerationCredits(job: IAIGenerationJob): Promise<PaidGenerationCreditGuard> {
  if (job.creditCost <= 0) return { allowed: true, remainingBalance: null };
  const remainingBalance = await reserveCredits(job);
  if (remainingBalance === null) return { allowed: false, reason: 'INSUFFICIENT_CREDITS' };
  assertPaidGenerationReserved(job);
  return { allowed: true, remainingBalance };
}

export async function captureGenerationCredits(job: IAIGenerationJob): Promise<void> {
  if (job.creditCost <= 0) return;
  assertPaidGenerationReserved(job);
  await captureCredits(job);
  if (job.creditsState !== 'captured') throw new Error('CREDIT_CAPTURE_INCOMPLETE');
}

export async function releaseGenerationCredits(job: IAIGenerationJob): Promise<void> {
  if (job.creditCost <= 0 || job.creditsState !== 'reserved') return;
  await refundCredits(job);
  if (job.creditsState !== 'refunded') throw new Error('CREDIT_RELEASE_INCOMPLETE');
}
