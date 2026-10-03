import {
    AFFILIATE_COMMISSION_RATE,
    appendUniqueCommission,
    createCommissionRecord,
    normalizeCommissionRecords,
    type AffiliatePrivateMetadata,
} from '@/lib/affiliate';
import {
    syncAffiliateDashboardStats,
    upsertAffiliateSaleFromCommission,
} from '@/lib/affiliate-mongo';
import { registerAffiliateConversion } from '@/lib/affiliate-referral';
import { extractSubscriptionMeta, resolveSubscriptionPlan, stripe, type StripeUserMetadata } from '@/lib/stripe';

import { expireSubscriptionCredits, grantSubscriptionCredits } from '@/lib/ai-job-service';
import { getComponentProductContent } from '@/lib/component-content-store';
import { isValidComponentPurchase } from '@/lib/component-purchase-validation';
import { marketplaceSplit } from '@/lib/creator-marketplace';
import { marketplaceLedger } from '@/lib/marketplace-asset';
import { getCreditPack, isValidCreditTopUp } from '@/lib/credit-packs';
import { applyCreditTopUp, markCreditPurchaseRefunded } from '@/lib/credit-topup';
import connectToDatabase from '@/lib/mongoose';
import { errorFingerprint, recordObservabilityEvent, reportOperationalError } from '@/lib/observability-server';
import { getPlanCredits, normalizeExistingPlan, type PlanId } from '@/lib/subscription-plans';
import { recordConfirmedPurchase } from '@/lib/payment-analytics';
import { areCrowdfundingCreditsActive, recordPendingSubscriptionCredits } from '@/lib/pending-subscription-credits';
import AffiliateApplication from '@/models/AffiliateApplication';
import ComponentPurchase from '@/models/ComponentPurchase';
import CrowdfundingContribution from '@/models/CrowdfundingContribution';
import MarketplaceListing from '@/models/MarketplaceListing';
import MarketplaceRelease from '@/models/MarketplaceRelease';
import MarketplaceAttributionEvent from '@/models/MarketplaceAttributionEvent';
import MarketplaceSale from '@/models/MarketplaceSale';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

async function updateUserSubscription(
  clerkUserId: string,
  subscription: Stripe.Subscription,
  stripeCustomerId: string
) {
  const client = await clerkClient();
  const plan = resolveSubscriptionPlan(subscription);
  const user = await client.users.getUser(clerkUserId);
  const meta = user.privateMetadata as AffiliatePrivateMetadata;
  await client.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      ...meta,
      ...extractSubscriptionMeta(subscription, stripeCustomerId, plan),
    },
  });
}

async function getClerkUserIdFromCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return (customer.metadata?.clerkUserId as string) ?? null;
}

async function recordAffiliateCommission(params: {
  buyerUserId: string;
  referrerUserId: string;
  originalReferrerUserId?: string | null;
  affiliateProductId?: string | null;
  productId: string;
  productName: string;
  amountPaidCents: number;
  currency: string;
  source: 'checkout' | 'invoice';
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
}) {
  if (!params.referrerUserId || params.referrerUserId === params.buyerUserId) {
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(params.referrerUserId);
  const referrerEmail =
    user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
  const buyerIdentity = params.buyerUserId.trim().toLowerCase();

  // También bloquea autorreferidos de invitados, cuyo buyerUserId es el email.
  if (referrerEmail && buyerIdentity === referrerEmail) {
    return;
  }

  // Una referencia solo genera comisión si pertenece a un afiliado aprobado.
  if (!referrerEmail) {
    return;
  }
  await connectToDatabase();
  const approvedAffiliate = await AffiliateApplication.exists({
    email: referrerEmail,
    status: 'approved',
  });
  if (!approvedAffiliate) {
    return;
  }

  const meta = user.privateMetadata as AffiliatePrivateMetadata;
  const commission = createCommissionRecord({
    ...params,
    commissionRate: AFFILIATE_COMMISSION_RATE,
    status: params.source === 'invoice' ? 'paid' : 'pending_settlement',
  });
  const updatedCommissions = appendUniqueCommission(
    normalizeCommissionRecords(meta.affiliateCommissions),
    commission
  );
  await client.users.updateUserMetadata(params.referrerUserId, {
    privateMetadata: {
      ...meta,
      affiliateReferralCode: meta.affiliateReferralCode ?? params.referrerUserId,
      affiliateCommissions: updatedCommissions,
      affiliateOriginalReferrerId:
        params.originalReferrerUserId ?? meta.affiliateReferrerId ?? null,
    },
  });
  await upsertAffiliateSaleFromCommission(commission);
  await registerAffiliateConversion({
    clerkUserId: params.referrerUserId,
    referralCode: meta.affiliateReferralCode ?? params.referrerUserId,
    productId: params.productId,
    productName: params.productName,
    amountPaidCents: params.amountPaidCents,
    commissionCents: commission.commissionCents,
    source: params.source,
    priceCents: params.amountPaidCents,
  });
  await syncAffiliateDashboardStats(params.referrerUserId, meta.affiliateReferralCode ?? params.referrerUserId);
}



function parseClientReference(value: string | null | undefined): { buyerKey: string | null; productId: string | null } {
  if (!value) return { buyerKey: null, productId: null };
  const [buyerKey, productId] = value.split('___');
  return {
    buyerKey: buyerKey?.trim() || null,
    productId: productId?.trim() || null,
  };
}


function normalizePaymentLinkUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/$/, '');
  } catch {
    return value.split('?')[0]?.replace(/\/$/, '') ?? value;
  }
}

async function isCrowdfundingPaymentLink(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.metadata?.purchaseType === 'founder_crowdfunding') return true;

  const configuredUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_CROWFUNDING?.trim();
  if (!configuredUrl || !session.payment_link) return false;

  const paymentLinkId =
    typeof session.payment_link === 'string'
      ? session.payment_link
      : session.payment_link.id;

  const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
  return normalizePaymentLinkUrl(paymentLink.url) === normalizePaymentLinkUrl(configuredUrl);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    void recordObservabilityEvent({ category: 'stripe', name: 'invalid_webhook_signature', route: '/api/webhooks/stripe', status: 'error', fingerprint: errorFingerprint(error, 'stripe_signature') });
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment' && session.payment_status !== 'paid') {
          break;
        }
        // Compra de dominio: la orden tiene su propio state machine idempotente.
        const domainSession = session as Stripe.Checkout.Session & { metadata?: Record<string, string> };
        if (domainSession.metadata?.type === 'domain_order') {
          const { handleCheckoutCompleted } = await import('@/lib/domain-order');
          await handleCheckoutCompleted(session.id);
          break;
        }
        const customerId = session.customer as string;
        const sessionAny = session as Stripe.Checkout.Session & { metadata?: Record<string, string>; payment_intent_data?: { metadata?: Record<string, string> } };
        const affiliateRef =
          sessionAny.metadata?.affiliate_ref ||
          sessionAny.metadata?.affiliateRef ||
          sessionAny.metadata?.affiliate_last_touch_ref ||
          sessionAny.payment_intent_data?.metadata?.affiliate_ref;
        const originalAffiliateRef =
          sessionAny.metadata?.affiliate_first_ref ||
          sessionAny.payment_intent_data?.metadata?.affiliate_first_ref;
        const sharedAffiliateProductId =
          sessionAny.metadata?.affiliate_product_id ||
          sessionAny.payment_intent_data?.metadata?.affiliate_product_id;
        const clientRef = parseClientReference(session.client_reference_id);
        const inferredProductId =
          clientRef.productId ||
          sharedAffiliateProductId ||
          sessionAny.metadata?.pageId ||
          sessionAny.metadata?.productId ||
          null;
        const buyerKey = clientRef.buyerKey || 'guest';

        await recordConfirmedPurchase({
          transactionId: session.id,
          productId: inferredProductId ?? sessionAny.metadata?.packId ?? sessionAny.metadata?.plan ?? null,
          productCategory: sessionAny.metadata?.purchaseType ?? session.mode ?? 'checkout',
          amountCents: session.amount_total,
          currency: session.currency,
          userId: sessionAny.metadata?.purchaserUserId ?? clientRef.buyerKey ?? null,
        });

        const founderCrowdfundingPayment =
          session.mode === 'payment' && await isCrowdfundingPaymentLink(session);

        if (founderCrowdfundingPayment) {
          const amountPaidCents = session.amount_total ?? 0;
          const currency = (session.currency ?? '').toUpperCase();
          if (amountPaidCents <= 0 || currency !== 'USD') {
            throw new Error(`Invalid crowdfunding payment for ${session.id}`);
          }
          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null;
          const purchaserEmail = sessionAny.customer_details?.email || session.customer_email || null;

          await connectToDatabase();
          await CrowdfundingContribution.findOneAndUpdate(
            { stripeCheckoutSessionId: session.id },
            {
              $set: {
                stripePaymentIntentId: paymentIntentId,
                purchaserUserId: sessionAny.metadata?.purchaserUserId ?? null,
                purchaserEmail,
                amountPaidCents,
                currency: 'USD',
                status: 'paid',
                paidAt: new Date(),
                refundedAt: null,
                updatedAt: new Date(),
              },
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, returnDocument: 'after' },
          );
          break;
        }

        // Recarga de créditos: se resuelve aquí y se sale del case, porque no
        // es la compra de una página y no debe entrar en la lógica de
        // `purchasedPages` ni de comisiones de afiliado.
        if (session.mode === 'payment' && sessionAny.metadata?.purchaseType === 'credit_topup') {
          const pack = getCreditPack(sessionAny.metadata.packId);
          const purchaserUserId = sessionAny.metadata.purchaserUserId;
          if (!pack || !purchaserUserId || !isValidCreditTopUp({
            expectedPackId: pack?.id ?? '',
            expectedUserId: purchaserUserId ?? '',
            expectedAmountCents: pack?.priceCents ?? -1,
            expectedCurrency: pack?.currency ?? '',
            metadataPackId: sessionAny.metadata?.packId,
            metadataUserId: purchaserUserId,
            buyerKey,
            amountTotal: session.amount_total,
            currency: session.currency,
          })) {
            throw new Error(`Invalid credit top-up metadata for ${session.id}`);
          }
          const purchaserEmail = sessionAny.customer_details?.email || session.customer_email;
          if (!purchaserEmail) throw new Error(`Credit top-up ${session.id} has no purchaser email`);
          const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
          let receiptUrl: string | null = null;
          if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
            const charge = typeof paymentIntent.latest_charge === 'object' ? paymentIntent.latest_charge : null;
            receiptUrl = charge?.receipt_url ?? null;
          }
          await applyCreditTopUp({
            userId: purchaserUserId,
            userEmail: purchaserEmail,
            pack,
            amountPaidCents: session.amount_total ?? pack.priceCents,
            currency: session.currency ?? pack.currency,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId ?? null,
            receiptUrl,
          });
          break;
        }

        if (session.mode === 'payment' && inferredProductId) {
          // One-time purchase
          const pageId = inferredProductId;
          if (sessionAny.metadata?.purchaseType === 'marketplace') {
            const listingId = sessionAny.metadata.listingId;
            const releaseId = sessionAny.metadata.releaseId;
            const purchaserUserId = sessionAny.metadata.purchaserUserId;
            const listing = listingId ? await MarketplaceListing.findOne({ _id: listingId, status: 'approved' }).lean() : null;
            const release = releaseId ? await MarketplaceRelease.findOne({ _id: releaseId, listingId }).lean() : null;
            if (!listing || !release || !purchaserUserId || listing.creatorUserId === purchaserUserId || session.amount_total !== listing.priceCents || session.currency !== listing.currency) {
              throw new Error(`Invalid marketplace purchase metadata for ${session.id}`);
            }
            const purchaserEmail = sessionAny.customer_details?.email || session.customer_email;
            if (!purchaserEmail) throw new Error(`Marketplace checkout ${session.id} has no purchaser email`);
            const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            await connectToDatabase();
            const purchase = await ComponentPurchase.findOneAndUpdate(
              { stripeCheckoutSessionId: session.id },
              { $set: { status: 'paid', stripePaymentIntentId: paymentIntentId ?? null, updatedAt: new Date() }, $setOnInsert: { purchaserUserId, purchaserEmail, productId: `marketplace:${listingId}`, productName: listing.title, productKind: listing.kind, marketplaceReleaseId: release._id, amountPaidCents: listing.priceCents, currency: listing.currency, downloadCount: 0, maxDownloads: 5, purchasedAt: new Date() } },
              { upsert: true, returnDocument: 'after' }
            );
            const split = marketplaceSplit(listing.priceCents);
            await MarketplaceSale.findOneAndUpdate(
              { stripeCheckoutSessionId: session.id },
              { $setOnInsert: { listingId: listing._id, releaseId: release._id, creatorUserId: listing.creatorUserId, buyerUserId: purchaserUserId, purchaseId: purchase._id, ...split, currency: listing.currency, status: 'pending', createdAt: new Date() } },
              { upsert: true }
            );
            await MarketplaceAttributionEvent.findOneAndUpdate(
              { stripeCheckoutSessionId: session.id },
              { $setOnInsert: { listingId: listing._id, releaseId: release._id, purchaseId: purchase._id, creatorUserId: listing.creatorUserId, affiliateId: sessionAny.metadata.affiliateId ?? null, grossCents: listing.priceCents, entries: marketplaceLedger(listing.priceCents), currency: listing.currency, createdAt: new Date() } },
              { upsert: true }
            );
          }
          if (sessionAny.metadata?.purchaseType === 'component') {
            const component = await getComponentProductContent(sessionAny.metadata.productId ?? '');
            const purchaserUserId = sessionAny.metadata.purchaserUserId;
            if (!component || !purchaserUserId || !isValidComponentPurchase({ expectedProductId: component.id, expectedUserId: purchaserUserId, expectedAmountCents: component.priceCents, expectedCurrency: component.currency, metadataProductId: sessionAny.metadata?.productId, metadataUserId: purchaserUserId, buyerKey, amountTotal: session.amount_total, currency: session.currency })) {
              throw new Error(`Invalid component purchase metadata for ${session.id}`);
            }
            const purchaserEmail = sessionAny.customer_details?.email || session.customer_email;
            if (!purchaserEmail) throw new Error(`Component checkout ${session.id} has no purchaser email`);
            let receiptUrl: string | null = null;
            const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            if (paymentIntentId) {
              const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
              const charge = typeof paymentIntent.latest_charge === 'object' ? paymentIntent.latest_charge : null;
              receiptUrl = charge && !charge.refunded ? charge.receipt_url : charge?.receipt_url ?? null;
            }
            await connectToDatabase();
            await ComponentPurchase.findOneAndUpdate(
              { stripeCheckoutSessionId: session.id },
              {
                $set: { status: 'paid', receiptUrl, stripePaymentIntentId: paymentIntentId ?? null, updatedAt: new Date() },
                $setOnInsert: { purchaserUserId, purchaserEmail, productId: component.id, productName: component.name.es, productKind: component.kind, amountPaidCents: component.priceCents, currency: component.currency, downloadCount: 0, maxDownloads: 5, purchasedAt: new Date() },
              },
              { upsert: true, returnDocument: 'after' }
            );
            /**
             * Recibo por correo. La marca se reclama en la misma fila de la
             * compra, así que un reintento del webhook no envía un segundo
             * correo. El envío va sin `await` y sin propagar el fallo: si
             * Resend está caído, la compra ya está registrada y devolver un
             * error a Stripe solo provocaría más reintentos.
             */
            const claimReceipt = await ComponentPurchase.updateOne(
              { stripeCheckoutSessionId: session.id, receiptEmailSentAt: null },
              { $set: { receiptEmailSentAt: new Date() } }
            );
            if (claimReceipt.modifiedCount) {
              const { sendPurchaseReceipt } = await import('@/lib/transactional-email');
              void sendPurchaseReceipt({
                to: purchaserEmail,
                userId: purchaserUserId,
                productName: component.name.es,
                productId: component.id,
                amountPaidCents: component.priceCents,
                currency: component.currency,
                receiptUrl,
              });
            }
            void recordObservabilityEvent({ category: 'commerce', name: 'component_purchase_completed', route: '/api/webhooks/stripe', userId: purchaserUserId, productId: component.id, status: 'completed', value: component.priceCents, unit: component.currency, metadata: { stripeSessionId: session.id, productKind: component.kind } });
          }
          if (sessionAny.metadata?.purchaseType === 'component_bundle') {
            const productIds = (sessionAny.metadata.productIds || '').split(',');
            const purchaserUserId = sessionAny.metadata.purchaserUserId;
            if (!purchaserUserId) throw new Error(`Invalid component bundle purchase metadata for ${session.id}`);
            const purchaserEmail = sessionAny.customer_details?.email || session.customer_email;
            if (!purchaserEmail) throw new Error(`Component bundle checkout ${session.id} has no purchaser email`);

            let receiptUrl: string | null = null;
            const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            if (paymentIntentId) {
              const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
              const charge = typeof paymentIntent.latest_charge === 'object' ? paymentIntent.latest_charge : null;
              receiptUrl = charge && !charge.refunded ? charge.receipt_url : charge?.receipt_url ?? null;
            }

            await connectToDatabase();
            for (const productId of productIds) {
              if (!productId) continue;
              const component = await getComponentProductContent(productId);
              if (!component) continue;
              const uniqueSessionId = `${session.id}_${component.id}`;
              const amountPaidCents = Math.round(component.priceCents * 0.8);
              await ComponentPurchase.findOneAndUpdate(
                { stripeCheckoutSessionId: uniqueSessionId },
                {
                  $set: { status: 'paid', receiptUrl, stripePaymentIntentId: paymentIntentId ?? null, updatedAt: new Date() },
                  $setOnInsert: { purchaserUserId, purchaserEmail, productId: component.id, productName: component.name.es, productKind: component.kind, amountPaidCents, currency: component.currency, downloadCount: 0, maxDownloads: 5, purchasedAt: new Date() },
                },
                { upsert: true }
              );
            }
            void recordObservabilityEvent({ category: 'commerce', name: 'component_bundle_purchase_completed', route: '/api/webhooks/stripe', userId: purchaserUserId, productId: 'bundle', status: 'completed', value: session.amount_total ?? 0, unit: session.currency ?? 'usd', metadata: { stripeSessionId: session.id } });
          }
          if (buyerKey !== 'guest') {
            const clerkUserId = buyerKey;
            const client = await clerkClient();
            const user = await client.users.getUser(clerkUserId);
            const meta = (user.privateMetadata || {}) as Partial<StripeUserMetadata> & { purchasedPages?: string[] };
            const purchasedPages = Array.isArray(meta.purchasedPages) ? [...meta.purchasedPages] : [];

            if (!purchasedPages.includes(pageId)) {
              purchasedPages.push(pageId);
              await client.users.updateUserMetadata(clerkUserId, {
                privateMetadata: {
                  ...meta,
                  purchasedPages,
                },
              });
            }

            if (customerId && !meta.stripeCustomerId) {
              await stripe.customers.update(customerId, {
                metadata: {
                  clerkUserId,
                  ...(affiliateRef ? { affiliateReferrerId: affiliateRef } : {}),
                  ...(originalAffiliateRef ? { affiliateOriginalReferrerId: originalAffiliateRef } : {}),
                  ...(sharedAffiliateProductId ? { affiliateProductId: sharedAffiliateProductId } : {}),
                },
              });
            }
            const referrerToRecord = affiliateRef || originalAffiliateRef;
            if (referrerToRecord && referrerToRecord !== clerkUserId && inferredProductId === pageId) {
              await recordAffiliateCommission({
                buyerUserId: clerkUserId,
                referrerUserId: referrerToRecord,
                originalReferrerUserId: originalAffiliateRef ?? affiliateRef,
                affiliateProductId: inferredProductId,
                productId: pageId,
                productName: pageId,
                amountPaidCents: session.amount_total ?? 0,
                currency: session.currency ?? 'usd',
                source: 'checkout',
                stripeCustomerId: customerId ?? null,
                stripeCheckoutSessionId: session.id,
              });
            }
          } else {
            const guestEmail =
              sessionAny.customer_details?.email ||
              session.customer_email;
            if (!guestEmail) {
              throw new Error(
                `Guest checkout ${session.id} completed without an email address`
              );
            }

            const referrerToRecord = affiliateRef || originalAffiliateRef;
            const guestBuyerId = guestEmail;
            if (
              referrerToRecord &&
              inferredProductId === pageId &&
              referrerToRecord !== guestBuyerId
            ) {
              await recordAffiliateCommission({
                buyerUserId: guestBuyerId,
                referrerUserId: referrerToRecord,
                originalReferrerUserId: originalAffiliateRef ?? affiliateRef,
                affiliateProductId: inferredProductId,
                productId: pageId,
                productName: sessionAny.metadata?.productName ?? pageId,
                amountPaidCents: session.amount_total ?? 0,
                currency: session.currency ?? 'usd',
                source: 'checkout',
                stripeCustomerId: customerId ?? null,
                stripeCheckoutSessionId: session.id,
              });
            }
          }
          break;
        }

        const clerkUserId = clientRef.buyerKey;
        const subscriptionId = session.subscription as string;

        if (!clerkUserId || !customerId || !subscriptionId) break;

        // Tag the Stripe customer with the Clerk user ID for future events
        await stripe.customers.update(customerId, {
          metadata: {
            clerkUserId,
            ...(affiliateRef ? { affiliateReferrerId: affiliateRef } : {}),
            ...(originalAffiliateRef ? { affiliateOriginalReferrerId: originalAffiliateRef } : {}),
            ...(sharedAffiliateProductId ? { affiliateProductId: sharedAffiliateProductId } : {}),
          },
        });

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await updateUserSubscription(clerkUserId, subscription, customerId);
        const referrerToRecord = affiliateRef || originalAffiliateRef;
        const purchasedProductId = subscription.metadata?.productId ?? subscription.metadata?.plan ?? 'subscription';
        if (
          referrerToRecord &&
          referrerToRecord !== clerkUserId &&
          (!inferredProductId || inferredProductId === purchasedProductId)
        ) {
          await recordAffiliateCommission({
            buyerUserId: clerkUserId,
            referrerUserId: referrerToRecord,
            originalReferrerUserId: originalAffiliateRef ?? affiliateRef,
            affiliateProductId: inferredProductId,
            productId: purchasedProductId,
            productName: subscription.metadata?.productName ?? subscription.metadata?.plan ?? 'Subscription',
            amountPaidCents: session.amount_total ?? 0,
            currency: session.currency ?? 'usd',
            source: 'checkout',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripeCheckoutSessionId: session.id,
          });
        }
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        // No access or subscription state is granted for unsuccessful checkouts.
        const failedSession = event.data.object as Stripe.Checkout.Session;
        void recordObservabilityEvent({ category: 'stripe', name: event.type, route: '/api/webhooks/stripe', productId: failedSession.metadata?.productId ?? failedSession.metadata?.pageId ?? null, status: 'failed', value: failedSession.amount_total ?? null, unit: failedSession.currency ?? null, metadata: { sessionId: failedSession.id } });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const clerkUserId = await getClerkUserIdFromCustomer(customerId);
        if (!clerkUserId) break;
        await updateUserSubscription(clerkUserId, subscription, customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const clerkUserId = await getClerkUserIdFromCustomer(customerId);
        if (!clerkUserId) break;
        await updateUserSubscription(clerkUserId, subscription, customerId);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceAny = invoice as Stripe.Invoice & { subscription?: string | null };
        const customerId = invoice.customer as string;
        const clerkUserId = await getClerkUserIdFromCustomer(customerId);
        if (!clerkUserId) break;
        const subscriptionId = typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const plan = normalizeExistingPlan(resolveSubscriptionPlan(subscription)) as PlanId;
          if (plan !== 'free') {
            const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';
            const credits = getPlanCredits(plan, billingCycle);
            if (areCrowdfundingCreditsActive()) {
              await expireSubscriptionCredits(clerkUserId, invoice.id);
              await grantSubscriptionCredits(clerkUserId, credits, invoice.id, {
                stripeInvoiceId: invoice.id,
                stripeSubscriptionId: subscriptionId,
                plan,
                billingReason: invoice.billing_reason,
                billingCycle,
              });
            } else {
              await recordPendingSubscriptionCredits({
                userId: clerkUserId,
                plan,
                credits,
                stripeInvoiceId: invoice.id,
                stripeSubscriptionId: subscriptionId,
                metadata: {
                  billingReason: invoice.billing_reason,
                  billingCycle,
                  campaignStatus: 'pending_activation',
                },
              });
            }
          }
        }
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;
        const affiliateReferrerId = customer.metadata?.affiliateReferrerId as string | undefined;
        const affiliateOriginalReferrerId = customer.metadata?.affiliateOriginalReferrerId as string | undefined;
        const affiliateProductId = customer.metadata?.affiliateProductId as string | undefined;
        const purchasedProductId = invoiceAny.subscription ? String(invoiceAny.subscription) : invoice.id;
        if (!affiliateReferrerId || affiliateReferrerId === clerkUserId) break;
        if (affiliateProductId && affiliateProductId !== purchasedProductId) break;
        await recordAffiliateCommission({
          buyerUserId: clerkUserId,
          referrerUserId: affiliateReferrerId,
          originalReferrerUserId: affiliateOriginalReferrerId ?? affiliateReferrerId,
          affiliateProductId: affiliateProductId ?? null,
          productId: purchasedProductId,
          productName: invoice.lines.data[0]?.description ?? 'Subscription renewal',
          amountPaidCents: invoice.amount_paid ?? 0,
          currency: invoice.currency ?? 'usd',
          source: 'invoice',
          stripeCustomerId: customerId,
          stripeSubscriptionId: invoiceAny.subscription ? String(invoiceAny.subscription) : null,
          stripeInvoiceId: invoice.id,
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (paymentIntentId && charge.refunded) {
          await connectToDatabase();
          await ComponentPurchase.updateMany({ stripePaymentIntentId: paymentIntentId }, { $set: { status: 'refunded', updatedAt: new Date() } });
          // Las recargas reembolsadas quedan marcadas pero no se descuenta el
          // saldo: los créditos pueden estar ya gastados y restarlos dejaría la
          // cuenta en negativo.
          await markCreditPurchaseRefunded(paymentIntentId);
          await CrowdfundingContribution.updateMany(
            { stripePaymentIntentId: paymentIntentId, status: 'paid' },
            { $set: { status: 'refunded', refundedAt: new Date(), updatedAt: new Date() } },
          );
        }
        break;
      }
    }
  } catch (err) {
    reportOperationalError({ category: 'stripe', name: 'webhook_handler_error', route: '/api/webhooks/stripe', metadata: { operation: 'process_webhook', provider: 'stripe', eventId: event.id, eventType: event.type, correlationId: event.id } }, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  void recordObservabilityEvent({ category: 'stripe', name: 'webhook_processed', route: '/api/webhooks/stripe', status: 'success', metadata: { eventId: event.id, eventType: event.type } });

  return NextResponse.json({ received: true });
}
