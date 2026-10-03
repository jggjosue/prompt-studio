/**
 * Platform-wide non-AI cost registry.
 *
 * These values are planning/list-price inputs, not invoices. Fixed/shared costs
 * must be amortized from measured monthly spend; variable costs can be attributed
 * directly to jobs. Never place credentials or account identifiers here.
 */
export type PlatformCostClass = 'fixed' | 'usage' | 'transaction' | 'hybrid';
export type PlatformCostEntry = {
  id: string;
  provider: string;
  service: string;
  costClass: PlatformCostClass;
  unit: string;
  unitCostUsd?: number;
  monthlyBaseUsd?: number;
  includedUnits?: number;
  notes: string;
  verifiedAt: string;
};

export const PLATFORM_COST_REGISTRY: PlatformCostEntry[] = [
  { id: 'vercel-pro', provider: 'Vercel', service: 'Pro', costClass: 'hybrid', unit: 'month', monthlyBaseUsd: 20, notes: '$20 monthly plan with $20 included usage credit; usage beyond inclusions is metered.', verifiedAt: '2026-10-03' },
  { id: 'vercel-function-invocation', provider: 'Vercel', service: 'Functions', costClass: 'usage', unit: 'invocation', unitCostUsd: 0.0000006, notes: 'Pro per-unit invocation list rate; other compute dimensions can also apply.', verifiedAt: '2026-10-03' },
  { id: 'mongodb-flex-base', provider: 'MongoDB Atlas', service: 'Flex', costClass: 'hybrid', unit: 'month', monthlyBaseUsd: 8, notes: 'Flex usage starts around $8/month and is capped at $30/month; actual invoice depends on workload.', verifiedAt: '2026-10-03' },
  { id: 'mongodb-dedicated-start', provider: 'MongoDB Atlas', service: 'Dedicated', costClass: 'fixed', unit: 'month', monthlyBaseUsd: 56.94, notes: 'Published starting monthly equivalent; region, cloud, storage and tier change actual cost.', verifiedAt: '2026-10-03' },
  { id: 'r2-storage', provider: 'Cloudflare', service: 'R2 Standard Storage', costClass: 'usage', unit: 'GB-month', unitCostUsd: 0.015, notes: 'Standard storage list price.', verifiedAt: '2026-10-03' },
  { id: 'r2-class-a', provider: 'Cloudflare', service: 'R2 Class A', costClass: 'usage', unit: 'request', unitCostUsd: 4.5 / 1_000_000, notes: 'Class A operations.', verifiedAt: '2026-10-03' },
  { id: 'r2-class-b', provider: 'Cloudflare', service: 'R2 Class B', costClass: 'usage', unit: 'request', unitCostUsd: 0.36 / 1_000_000, notes: 'Class B operations.', verifiedAt: '2026-10-03' },
  { id: 'cloudflare-queue-op', provider: 'Cloudflare', service: 'Queues', costClass: 'usage', unit: 'operation', unitCostUsd: 0.4 / 1_000_000, includedUnits: 1_000_000, notes: 'Paid Workers monthly included operations; typical delivery is about 3 operations.', verifiedAt: '2026-10-03' },
  { id: 'resend-pro', provider: 'Resend', service: 'Pro', costClass: 'hybrid', unit: 'month', monthlyBaseUsd: 20, includedUnits: 50_000, notes: '50k emails/month; overage $0.90/1k.', verifiedAt: '2026-10-03' },
  { id: 'resend-email-overage', provider: 'Resend', service: 'Email overage', costClass: 'usage', unit: 'email', unitCostUsd: 0.9 / 1000, notes: 'Overage rate.', verifiedAt: '2026-10-03' },
  { id: 'upstash-redis-command', provider: 'Upstash', service: 'Redis PAYG', costClass: 'usage', unit: 'command', unitCostUsd: 0.2 / 100_000, notes: 'PAYG command rate.', verifiedAt: '2026-10-03' },
  { id: 'upstash-qstash-message', provider: 'Upstash', service: 'QStash', costClass: 'usage', unit: 'message', unitCostUsd: 1 / 100_000, notes: 'Published message rate; actual billing can depend on product configuration.', verifiedAt: '2026-10-03' },
  { id: 'clerk-pro-annualized', provider: 'Clerk', service: 'Pro', costClass: 'hybrid', unit: 'month', monthlyBaseUsd: 20, includedUnits: 50_000, notes: 'Annual-billing monthly equivalent; includes 50k retained users per app, then graduated overage.', verifiedAt: '2026-10-03' },
  { id: 'clerk-mru-first-band', provider: 'Clerk', service: 'MRU overage', costClass: 'usage', unit: 'retained-user-month', unitCostUsd: 0.02, notes: 'First published overage band above 50k MRU.', verifiedAt: '2026-10-03' },
  { id: 'gcp-cloud-run-cpu', provider: 'Google Cloud', service: 'Cloud Run CPU', costClass: 'usage', unit: 'vCPU-second', unitCostUsd: 0.000018, notes: 'Tier-1 list rate after free allowance.', verifiedAt: '2026-10-03' },
  { id: 'gcp-cloud-run-memory', provider: 'Google Cloud', service: 'Cloud Run Memory', costClass: 'usage', unit: 'GiB-second', unitCostUsd: 0.000002, notes: 'Tier-1 list rate after free allowance.', verifiedAt: '2026-10-03' },
  { id: 'gcp-cloud-tasks', provider: 'Google Cloud', service: 'Cloud Tasks', costClass: 'usage', unit: 'operation', unitCostUsd: 0.4 / 1_000_000, includedUnits: 1_000_000, notes: 'First million operations/month free, then list rate.', verifiedAt: '2026-10-03' },
  { id: 'firestore-read', provider: 'Firebase / Google Cloud', service: 'Firestore Standard read', costClass: 'usage', unit: 'document-read', unitCostUsd: 0.03 / 100_000, notes: 'us-central1 reference price; daily free quota applies.', verifiedAt: '2026-10-03' },
  { id: 'firestore-write', provider: 'Firebase / Google Cloud', service: 'Firestore Standard write', costClass: 'usage', unit: 'document-write', unitCostUsd: 0.09 / 100_000, notes: 'us-central1 reference price; daily free quota applies.', verifiedAt: '2026-10-03' },
];

export const STRIPE_MX_DOMESTIC_PERCENT = 3.6;
export const STRIPE_MX_DOMESTIC_FIXED_MXN = 3;

export type PlatformUsage = Record<string, number>;

export function estimatePlatformVariableCostUsd(usage: PlatformUsage) {
  return PLATFORM_COST_REGISTRY.reduce((total, entry) => {
    if (entry.unitCostUsd == null) return total;
    const units = Math.max(0, usage[entry.id] ?? 0);
    const billableUnits = entry.includedUnits == null ? units : Math.max(0, units - entry.includedUnits);
    return total + billableUnits * entry.unitCostUsd;
  }, 0);
}

export function calculateTrueCreditEconomics(input: {
  creditsConsumed: number;
  aiProviderCostUsd: number;
  platformVariableCostUsd?: number;
  platformSharedMonthlyCostUsd?: number;
  paymentFeesUsd?: number;
  grossCreditRevenueUsd?: number;
}) {
  const credits = Math.max(0, input.creditsConsumed);
  const platformCostUsd = Math.max(0, input.platformVariableCostUsd ?? 0) + Math.max(0, input.platformSharedMonthlyCostUsd ?? 0);
  const totalCogsUsd = Math.max(0, input.aiProviderCostUsd) + platformCostUsd + Math.max(0, input.paymentFeesUsd ?? 0);
  const trueCostPerCreditUsd = credits > 0 ? totalCogsUsd / credits : 0;
  const grossRevenueUsd = Math.max(0, input.grossCreditRevenueUsd ?? credits * 0.01);
  const contributionUsd = grossRevenueUsd - totalCogsUsd;
  return {
    creditsConsumed: credits,
    platformCostUsd,
    totalCogsUsd,
    trueCostPerCreditUsd,
    grossRevenueUsd,
    contributionUsd,
    contributionMarginPercent: grossRevenueUsd > 0 ? (contributionUsd / grossRevenueUsd) * 100 : 0,
  };
}
