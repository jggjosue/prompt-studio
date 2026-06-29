import connectToDatabase from '@/lib/mongoose';
import AffiliateSale, { type IAffiliateSale } from '@/models/AffiliateSale';
import AffiliateUserStats, { type IAffiliateUserStats } from '@/models/AffiliateUserStats';
import AffiliateDailyStats from '@/models/AffiliateDailyStats';
import AffiliateClick from '@/models/AffiliateClick';
import AffiliateReferralStats from '@/models/AffiliateReferralStats';
import {
  AFFILIATE_MIN_PAYOUT_CENTS,
  type AffiliateCommissionRecord,
} from '@/lib/affiliate';

export type AffiliateDashboardStats = {
  clerkUserId: string;
  referralCode: string;
  totalRevenueCents: number;
  paidRevenueCents: number;
  availablePayoutCents: number;
  canRequestManualPayout: boolean;
  clicks: number;
  salesRegistered: number;
  conversionRate: number;
  productClicks: { productId: string; clicks: number }[];
  commissions: AffiliateCommissionRecord[];
  history: { dateKey: string; totalRevenueCents: number; paidRevenueCents: number; salesCount: number }[];
};

function buildCommission(record: IAffiliateSale): AffiliateCommissionRecord {
  return {
    id: record.stripeCheckoutSessionId || record.stripeInvoiceId || `${record.source}_${record._id.toString()}`,
    buyerUserId: record.buyerUserId,
    referrerUserId: record.referrerUserId,
    productId: record.productId,
    productName: record.productName,
    source: record.source,
    amountPaidCents: record.amountPaidCents,
    commissionRate: record.commissionRate,
    commissionCents: record.commissionCents,
    currency: record.currency,
    status: record.status,
    payoutStatus: record.payoutStatus ?? 'available',
    payoutMethod: record.payoutMethod ?? null,
    payoutReference: record.payoutReference ?? null,
    createdAt: record.createdAt.getTime(),
    stripeCustomerId: record.stripeCustomerId ?? null,
    stripeSubscriptionId: record.stripeSubscriptionId ?? null,
    stripeCheckoutSessionId: record.stripeCheckoutSessionId ?? null,
    stripeInvoiceId: record.stripeInvoiceId ?? null,
  };
}

async function loadProductClicks(clerkUserId: string) {
  const rows = await AffiliateClick.aggregate<{ _id: string; clicks: number }>([
    { $match: { referrerUserId: clerkUserId } },
    { $group: { _id: '$productId', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
  ]);

  return rows.map(row => ({ productId: row._id, clicks: row.clicks }));
}

export async function upsertAffiliateSaleFromCommission(record: AffiliateCommissionRecord) {
  await connectToDatabase();

  const query =
    record.stripeCheckoutSessionId
      ? { stripeCheckoutSessionId: record.stripeCheckoutSessionId }
      : record.stripeInvoiceId
        ? { stripeInvoiceId: record.stripeInvoiceId }
        : { id: record.id };

  await AffiliateSale.findOneAndUpdate(
    query,
    {
      $set: {
        buyerUserId: record.buyerUserId,
        referrerUserId: record.referrerUserId,
        productId: record.productId,
        productName: record.productName,
        source: record.source,
        amountPaidCents: record.amountPaidCents,
        commissionRate: record.commissionRate,
        commissionCents: record.commissionCents,
        currency: record.currency,
        status: record.status,
        payoutStatus: record.payoutStatus ?? 'available',
        payoutMethod: record.payoutMethod ?? null,
        payoutReference: record.payoutReference ?? null,
        stripeCustomerId: record.stripeCustomerId ?? null,
        stripeSubscriptionId: record.stripeSubscriptionId ?? null,
        stripeCheckoutSessionId: record.stripeCheckoutSessionId ?? null,
        stripeInvoiceId: record.stripeInvoiceId ?? null,
      },
      $setOnInsert: {
        createdAt: new Date(record.createdAt),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function syncAffiliateDashboardStats(clerkUserId: string, referralCode: string) {
  await connectToDatabase();
  const sales = await AffiliateSale.find({ referrerUserId: clerkUserId }).sort({ createdAt: -1 }).lean();

  const clicks = await AffiliateClick.countDocuments({ referrerUserId: clerkUserId });
  const totalRevenueCents = sales.reduce((sum, sale) => sum + sale.commissionCents, 0);
  const paidRevenueCents = sales.filter(sale => sale.status === 'paid').reduce((sum, sale) => sum + sale.commissionCents, 0);
  const availablePayoutCents = sales
    .filter(sale => sale.status !== 'pending' && sale.payoutStatus !== 'paid_out')
    .reduce((sum, sale) => sum + sale.commissionCents, 0);
  const canRequestManualPayout = availablePayoutCents >= AFFILIATE_MIN_PAYOUT_CENTS;
  const salesRegistered = sales.length;
  const conversionRate = clicks > 0 ? Math.min(100, Number(((salesRegistered / clicks) * 100).toFixed(2))) : 0;
  const productClicks = await loadProductClicks(clerkUserId);

  await AffiliateUserStats.findOneAndUpdate(
    { clerkUserId },
    {
      $set: {
        referralCode,
        totalRevenueCents,
        paidRevenueCents,
        availablePayoutCents,
        canRequestManualPayout,
        clicks,
        salesRegistered,
        conversionRate,
        updatedAt: new Date(),
      },
      $setOnInsert: {
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
          conversionRate: dayClicks > 0 ? Math.min(100, Number(((bucket.salesCount / dayClicks) * 100).toFixed(2))) : 0,
          salesCount: bucket.salesCount,
          updatedAt: new Date(),
          createdAt: new Date(),
        };
      })
    );
  }

  return {
    clerkUserId,
    referralCode,
    totalRevenueCents,
    paidRevenueCents,
    availablePayoutCents,
    canRequestManualPayout,
    clicks,
    salesRegistered,
    conversionRate,
    productClicks,
    commissions: sales.map(buildCommission),
    history: Array.from(dailyBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, bucket]) => ({
        dateKey,
        totalRevenueCents: bucket.totalRevenueCents,
        paidRevenueCents: bucket.paidRevenueCents,
        salesCount: bucket.salesCount,
      })),
  } satisfies AffiliateDashboardStats;
}

export async function loadAffiliateDashboardStats(clerkUserId: string, referralCode: string) {
  await connectToDatabase();
  const referralStats = await AffiliateReferralStats.findOne({ clerkUserId }).lean();
  const stats = await AffiliateUserStats.findOne({ clerkUserId }).lean<IAffiliateUserStats>();
  const sales = await AffiliateSale.find({ referrerUserId: clerkUserId }).sort({ createdAt: -1 }).lean();
  const history = await AffiliateDailyStats.find({ clerkUserId }).sort({ dateKey: 1 }).lean();
  const productClicks = await loadProductClicks(clerkUserId);

  const clicks =
    referralStats?.totalClicks ??
    stats?.clicks ??
    (await AffiliateClick.countDocuments({ referrerUserId: clerkUserId }));
  const totalRevenueCents =
    referralStats?.totalRevenueCents ?? stats?.totalRevenueCents ?? sales.reduce((sum, sale) => sum + sale.commissionCents, 0);
  const paidRevenueCents =
    referralStats?.paidRevenueCents ?? stats?.paidRevenueCents ?? sales.filter(sale => sale.status === 'paid').reduce((sum, sale) => sum + sale.commissionCents, 0);
  const availablePayoutCents =
    referralStats?.availablePayoutCents ??
    stats?.availablePayoutCents ??
    sales.filter(sale => sale.status !== 'pending' && sale.payoutStatus !== 'paid_out').reduce((sum, sale) => sum + sale.commissionCents, 0);
  const canRequestManualPayout = stats?.canRequestManualPayout ?? availablePayoutCents >= AFFILIATE_MIN_PAYOUT_CENTS;
  const salesRegistered = referralStats?.totalConversions ?? stats?.salesRegistered ?? sales.length;
  const conversionRate =
    referralStats?.conversionRate ??
    stats?.conversionRate ??
    (clicks > 0 ? Math.min(100, Number(((salesRegistered / clicks) * 100).toFixed(2))) : 0);

  return {
    clerkUserId,
    referralCode: stats?.referralCode ?? referralCode,
    totalRevenueCents,
    paidRevenueCents,
    availablePayoutCents,
    canRequestManualPayout,
    clicks,
    salesRegistered,
    conversionRate,
    productClicks,
    commissions: sales.map(buildCommission),
    history: history.map(item => ({
      dateKey: item.dateKey,
      totalRevenueCents: item.totalRevenueCents,
      paidRevenueCents: item.paidRevenueCents,
      salesCount: item.salesRegistered,
    })),
  } satisfies AffiliateDashboardStats;
}
