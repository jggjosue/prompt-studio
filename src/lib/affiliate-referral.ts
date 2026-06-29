import connectToDatabase from '@/lib/mongoose';
import AffiliateReferralStats, { type AffiliateReferralProductStats, type IAffiliateReferralStats } from '@/models/AffiliateReferralStats';
import AffiliateUserStats from '@/models/AffiliateUserStats';
import AffiliateDailyStats from '@/models/AffiliateDailyStats';
import AffiliateSale from '@/models/AffiliateSale';
import AffiliateClick from '@/models/AffiliateClick';
import { AFFILIATE_MIN_PAYOUT_CENTS } from '@/lib/affiliate';

function ensureNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizePriceCents(priceCents?: number | null): number | null {
  if (typeof priceCents !== 'number' || !Number.isFinite(priceCents)) return null;
  return Math.max(0, Math.round(priceCents));
}

function upsertProductStats(
  current: AffiliateReferralProductStats[],
  params: {
    productId: string;
    productName: string;
    clicksDelta?: number;
    salesDelta?: number;
    revenueDeltaCents?: number;
    paidRevenueDeltaCents?: number;
    priceCents?: number | null;
  }
): AffiliateReferralProductStats[] {
  const index = current.findIndex(item => item.productId === params.productId);
  const next: AffiliateReferralProductStats =
    index >= 0
      ? {
          ...current[index]!,
          productName: params.productName || current[index]!.productName,
          clicks: current[index]!.clicks + (params.clicksDelta ?? 0),
          sales: current[index]!.sales + (params.salesDelta ?? 0),
          revenueCents: current[index]!.revenueCents + (params.revenueDeltaCents ?? 0),
          paidRevenueCents: current[index]!.paidRevenueCents + (params.paidRevenueDeltaCents ?? 0),
          lastPriceCents: normalizePriceCents(params.priceCents) ?? current[index]!.lastPriceCents,
          lastSeenAt: new Date(),
        }
      : {
          productId: params.productId,
          productName: params.productName,
          clicks: params.clicksDelta ?? 0,
          sales: params.salesDelta ?? 0,
          revenueCents: params.revenueDeltaCents ?? 0,
          paidRevenueCents: params.paidRevenueDeltaCents ?? 0,
          lastPriceCents: normalizePriceCents(params.priceCents),
          lastSeenAt: new Date(),
        };

  if (index >= 0) {
    return [...current.slice(0, index), next, ...current.slice(index + 1)];
  }

  return [next, ...current].slice(0, 50);
}

async function recalculateAffiliateRollups(clerkUserId: string) {
  const sales = await AffiliateSale.find({ referrerUserId: clerkUserId }).sort({ createdAt: -1 }).lean();
  const totalRevenueCents = sales.reduce((sum, sale) => sum + sale.commissionCents, 0);
  const paidRevenueCents = sales.filter(sale => sale.status === 'paid').reduce((sum, sale) => sum + sale.commissionCents, 0);
  const availablePayoutCents = sales
    .filter(sale => sale.status !== 'pending' && sale.payoutStatus !== 'paid_out')
    .reduce((sum, sale) => sum + sale.commissionCents, 0);
  const salesRegistered = sales.length;
  const clicks = await AffiliateClick.countDocuments({ referrerUserId: clerkUserId });
  const conversionRate = clicks > 0 ? Math.min(100, Number(((salesRegistered / clicks) * 100).toFixed(2))) : 0;

  await AffiliateUserStats.findOneAndUpdate(
    { clerkUserId },
    {
      $set: {
        totalRevenueCents,
        paidRevenueCents,
        availablePayoutCents,
        canRequestManualPayout: availablePayoutCents >= AFFILIATE_MIN_PAYOUT_CENTS,
        clicks,
        salesRegistered,
        conversionRate,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        clerkUserId,
        referralCode: clerkUserId,
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const dailyBuckets = new Map<string, { totalRevenueCents: number; paidRevenueCents: number; salesCount: number }>();
  for (const sale of sales) {
    const dateKey = sale.createdAt.toISOString().slice(0, 10);
    const bucket = dailyBuckets.get(dateKey) ?? { totalRevenueCents: 0, paidRevenueCents: 0, salesCount: 0 };
    bucket.totalRevenueCents += sale.commissionCents;
    if (sale.status === 'paid') bucket.paidRevenueCents += sale.commissionCents;
    bucket.salesCount += 1;
    dailyBuckets.set(dateKey, bucket);
  }

  const dailyClicks = await AffiliateClick.aggregate([
    { $match: { referrerUserId: clerkUserId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        clicks: { $sum: 1 },
      },
    },
  ]);
  const clicksByDate = new Map<string, number>(dailyClicks.map(item => [item._id as string, item.clicks as number]));

  await AffiliateDailyStats.deleteMany({ clerkUserId });
  if (dailyBuckets.size > 0 || clicksByDate.size > 0) {
    const keys = new Set([...dailyBuckets.keys(), ...clicksByDate.keys()]);
    await AffiliateDailyStats.insertMany(
      Array.from(keys).map(dateKey => {
        const bucket = dailyBuckets.get(dateKey) ?? { totalRevenueCents: 0, paidRevenueCents: 0, salesCount: 0 };
        const dayClicks = clicksByDate.get(dateKey) ?? 0;
        return {
          clerkUserId,
          dateKey,
          totalRevenueCents: bucket.totalRevenueCents,
          paidRevenueCents: bucket.paidRevenueCents,
          clicks: dayClicks,
          salesRegistered: bucket.salesCount,
          salesCount: bucket.salesCount,
          conversionRate: dayClicks > 0 ? Math.min(100, Number(((bucket.salesCount / dayClicks) * 100).toFixed(2))) : 0,
          updatedAt: new Date(),
          createdAt: new Date(),
        };
      })
    );
  }
}

export async function registerAffiliateClick(params: {
  clerkUserId: string;
  referralCode: string;
  productId: string;
  productName: string;
  source: 'landing-page' | 'campaign-card' | 'buy-button' | 'demo' | 'affiliate-program';
  visitorKey: string;
  productPriceCents?: number | null;
}) {
  await connectToDatabase();
  const now = new Date();
  const affiliateRefStats = await AffiliateReferralStats.findOneAndUpdate(
    { clerkUserId: params.clerkUserId },
    {
      $set: {
        clerkUserId: params.clerkUserId,
        referralCode: params.referralCode,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
      $inc: {
        totalClicks: 1,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const productStats = upsertProductStats(affiliateRefStats?.productStats ?? [], {
    productId: params.productId,
    productName: params.productName,
    clicksDelta: 1,
    priceCents: params.productPriceCents ?? null,
  });

  await AffiliateReferralStats.findOneAndUpdate(
    { clerkUserId: params.clerkUserId },
    {
      $set: {
        referralCode: params.referralCode,
        productStats,
        conversionRate:
          ensureNumber(affiliateRefStats?.totalClicks) > 0
            ? Math.min(
                100,
                Number(
                  (
                    ((affiliateRefStats?.totalConversions ?? 0) / ensureNumber(affiliateRefStats?.totalClicks)) *
                    100
                  ).toFixed(2)
                )
              )
            : 0,
        updatedAt: now,
      },
      $setOnInsert: {
        clerkUserId: params.clerkUserId,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await recalculateAffiliateRollups(params.clerkUserId);
}

export async function registerAffiliateConversion(params: {
  clerkUserId: string;
  referralCode: string;
  productId: string;
  productName: string;
  amountPaidCents: number;
  commissionCents: number;
  source: 'checkout' | 'invoice';
  priceCents?: number | null;
}) {
  await connectToDatabase();
  const now = new Date();
  const affiliateRefStats = await AffiliateReferralStats.findOneAndUpdate(
    { clerkUserId: params.clerkUserId },
    {
      $set: {
        clerkUserId: params.clerkUserId,
        referralCode: params.referralCode,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
      $inc: {
        totalConversions: 1,
        totalRevenueCents: params.commissionCents,
        paidRevenueCents: params.source === 'invoice' ? params.commissionCents : 0,
        availablePayoutCents: params.source === 'invoice' ? params.commissionCents : 0,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const productStats = upsertProductStats(affiliateRefStats?.productStats ?? [], {
    productId: params.productId,
    productName: params.productName,
    salesDelta: 1,
    revenueDeltaCents: params.commissionCents,
    paidRevenueDeltaCents: params.source === 'invoice' ? params.commissionCents : 0,
    priceCents: params.priceCents ?? params.amountPaidCents,
  });

  await AffiliateReferralStats.findOneAndUpdate(
    { clerkUserId: params.clerkUserId },
    {
      $set: {
        referralCode: params.referralCode,
        productStats,
        conversionRate:
          ensureNumber(affiliateRefStats?.totalClicks) > 0
            ? Math.min(
                100,
                Number(
                  (
                    ((affiliateRefStats?.totalConversions ?? 0) / ensureNumber(affiliateRefStats?.totalClicks)) *
                    100
                  ).toFixed(2)
                )
              )
            : 0,
        updatedAt: now,
      },
      $setOnInsert: {
        clerkUserId: params.clerkUserId,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await recalculateAffiliateRollups(params.clerkUserId);
}

export async function loadAffiliateReferralStats(clerkUserId: string) {
  return AffiliateReferralStats.findOne({ clerkUserId }).lean<IAffiliateReferralStats | null>();
}
