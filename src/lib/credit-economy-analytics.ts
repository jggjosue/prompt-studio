import 'server-only';

import { PROMPT_CREDIT_COMMERCIAL_VALUE_USD } from '@/lib/ai-provider-pricing-engine';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';

export async function getCreditEconomyAnalytics(days = 30) {
  await connectToDatabase();
  const safeDays = Math.min(90, Math.max(1, Math.floor(days)));
  const since = new Date(Date.now() - safeDays * 86_400_000);
  const rows = await AIGenerationJob.aggregate([
    { $match: { createdAt: { $gte: since }, operationCode: { $ne: null } } },
    { $group: {
      _id: { operationCode: '$operationCode', provider: '$provider', modelId: { $ifNull: ['$modelId', 'unknown'] } },
      jobs: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      failed: { $sum: { $cond: [{ $in: ['$status', ['failed', 'dead_letter']] }, 1, 0] } },
      creditsCharged: { $sum: { $ifNull: ['$creditsCharged', 0] } },
      providerCostUsd: { $sum: { $ifNull: ['$actualCostUsd', 0] } },
      jobsWithActualCost: { $sum: { $cond: [{ $ne: ['$actualCostUsd', null] }, 1, 0] } },
      avgDurationMs: { $avg: '$actualDurationMs' },
    } },
    { $sort: { creditsCharged: -1 } },
  ]);

  const metrics = rows.map((row) => {
    const commercialValueUsd = row.creditsCharged * PROMPT_CREDIT_COMMERCIAL_VALUE_USD;
    const marginUsd = commercialValueUsd - row.providerCostUsd;
    const marginPercent = commercialValueUsd > 0 ? (marginUsd / commercialValueUsd) * 100 : null;
    return { ...row, commercialValueUsd, marginUsd, marginPercent };
  });

  const totals = metrics.reduce((acc, row) => ({
    jobs: acc.jobs + row.jobs,
    completed: acc.completed + row.completed,
    failed: acc.failed + row.failed,
    creditsCharged: acc.creditsCharged + row.creditsCharged,
    providerCostUsd: acc.providerCostUsd + row.providerCostUsd,
    commercialValueUsd: acc.commercialValueUsd + row.commercialValueUsd,
    jobsWithActualCost: acc.jobsWithActualCost + row.jobsWithActualCost,
  }), { jobs: 0, completed: 0, failed: 0, creditsCharged: 0, providerCostUsd: 0, commercialValueUsd: 0, jobsWithActualCost: 0 });

  const marginUsd = totals.commercialValueUsd - totals.providerCostUsd;
  return {
    days: safeDays,
    totals: { ...totals, marginUsd, marginPercent: totals.commercialValueUsd > 0 ? (marginUsd / totals.commercialValueUsd) * 100 : null },
    operations: metrics,
  };
}
