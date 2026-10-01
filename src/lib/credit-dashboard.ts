import 'server-only';

import { getCreditBalance } from '@/lib/ai-job-service';
import connectToDatabase from '@/lib/mongoose';
import AICreditLedger from '@/models/AICreditLedger';

export async function getCreditDashboard(userId: string, limit = 50) {
  await connectToDatabase();
  const [balances, transactions] = await Promise.all([
    getCreditBalance(userId),
    AICreditLedger.find({ userId }).sort({ createdAt: -1 }).limit(Math.min(Math.max(limit, 1), 100)).lean(),
  ]);

  const usage = transactions
    .filter((entry) => entry.operation === 'capture')
    .reduce((sum, entry) => sum + (entry.creditsCharged ?? entry.amount ?? 0), 0);
  const grants = transactions
    .filter((entry) => entry.operation === 'grant')
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);

  return {
    balances,
    summary: { usage, grants, lifetimeSpent: balances.lifetimeSpent },
    transactions: transactions.map((entry) => ({
      id: String(entry._id),
      operation: entry.operation,
      type: entry.type ?? null,
      amount: entry.amount,
      balanceImpact: entry.balanceImpact ?? 0,
      source: entry.source ?? 'system',
      operationName: entry.operationName ?? null,
      expiresAt: entry.expiresAt?.toISOString?.() ?? null,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}
