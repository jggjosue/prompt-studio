import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import CreditPurchase from '@/models/CreditPurchase';
import AnalyticsEventReceipt from '@/models/AnalyticsEventReceipt';

export async function reconcilePromptCreditFinances() {
  await connectToDatabase();
  const [purchases, accounts, purchasedGrants, purchaseAnalytics] = await Promise.all([
    CreditPurchase.find({}).lean<Array<Record<string, any>>>(),
    AICreditAccount.find({}).lean<Array<Record<string, any>>>(),
    AICreditLedger.find({ type: 'TOPUP_PURCHASE', operation: 'grant' }).lean<Array<Record<string, any>>>(),
    AnalyticsEventReceipt.find({ eventName: 'purchase', source: 'stripe' }).lean<Array<Record<string, any>>>(),
  ]);

  const accountByUser = new Map(accounts.map((row) => [String(row.userId), row]));
  const grantByRequest = new Map(purchasedGrants.map((row) => [String(row.requestId), row]));
  const analyticsBySession = new Map(purchaseAnalytics.map((row) => [String(row.key).replace(/^stripe:purchase:/, ''), row]));
  const issues: Array<Record<string, unknown>> = [];

  for (const purchase of purchases) {
    const requestId = `topup:${purchase.stripeCheckoutSessionId}`;
    const grant = grantByRequest.get(requestId);
    const expectedCredits = Number(purchase.credits ?? 0);
    const analyticsReceipt = analyticsBySession.get(String(purchase.stripeCheckoutSessionId));

    if (!analyticsReceipt) {
      issues.push({ severity: 'warning', code: 'STRIPE_PURCHASE_MISSING_ANALYTICS', purchaseId: String(purchase._id), userId: purchase.userId, stripeCheckoutSessionId: purchase.stripeCheckoutSessionId, amountPaidCents: purchase.amountPaidCents });
    }

    if (purchase.status === 'pending') {
      issues.push({ severity: 'critical', code: 'PAID_NOT_CREDITED', purchaseId: String(purchase._id), userId: purchase.userId, amountPaidCents: purchase.amountPaidCents, expectedCredits });
      continue;
    }
    if (purchase.status === 'credited' && !grant) {
      issues.push({ severity: 'critical', code: 'CREDITED_WITHOUT_LEDGER_GRANT', purchaseId: String(purchase._id), userId: purchase.userId, expectedCredits });
    }
    if (grant && Number(grant.amount) !== expectedCredits) {
      issues.push({ severity: 'critical', code: 'PURCHASE_LEDGER_AMOUNT_MISMATCH', purchaseId: String(purchase._id), userId: purchase.userId, expectedCredits, ledgerCredits: Number(grant.amount) });
    }
    if (purchase.status === 'refunded' && grant) {
      const account = accountByUser.get(String(purchase.userId));
      issues.push({
        severity: 'warning',
        code: 'REFUNDED_CREDITS_EXPOSURE',
        purchaseId: String(purchase._id),
        userId: purchase.userId,
        refundedCredits: expectedCredits,
        currentPurchasedBalance: Number(account?.purchasedBalance ?? 0),
        exposureCredits: Math.max(0, expectedCredits - Number(account?.purchasedBalance ?? 0)),
      });
    }
  }

  for (const account of accounts) {
    const bucketTotal = Number(account.subscriptionBalance ?? 0) + Number(account.purchasedBalance ?? 0) + Number(account.founderBalance ?? 0) + Number(account.promotionalBalance ?? 0);
    const reservedTotal = Number(account.reservedSubscription ?? 0) + Number(account.reservedPurchased ?? 0) + Number(account.reservedFounder ?? 0) + Number(account.reservedPromotional ?? 0);
    if (bucketTotal !== Number(account.balance ?? 0)) issues.push({ severity: 'critical', code: 'ACCOUNT_BUCKET_BALANCE_MISMATCH', userId: account.userId, balance: account.balance, bucketTotal });
    if (reservedTotal !== Number(account.reserved ?? 0)) issues.push({ severity: 'critical', code: 'ACCOUNT_RESERVED_MISMATCH', userId: account.userId, reserved: account.reserved, reservedTotal });
    if (Number(account.reserved ?? 0) > Number(account.balance ?? 0)) issues.push({ severity: 'critical', code: 'RESERVED_EXCEEDS_BALANCE', userId: account.userId, balance: account.balance, reserved: account.reserved });
  }

  return {
    generatedAt: new Date(),
    counts: {
      purchases: purchases.length,
      purchaseAnalytics: purchaseAnalytics.length,
      accounts: accounts.length,
      issues: issues.length,
      critical: issues.filter((issue) => issue.severity === 'critical').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
    },
    issues,
  };
}
