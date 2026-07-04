import { stripe, extractSubscriptionMeta, type StripeUserMetadata } from '@/lib/stripe';
import {
  appendUniqueCommission,
  AFFILIATE_COMMISSION_RATE,
  createCommissionRecord,
  normalizeCommissionRecords,
  type AffiliatePrivateMetadata,
} from '@/lib/affiliate';
import {
  syncAffiliateDashboardStats,
  upsertAffiliateSaleFromCommission,
} from '@/lib/affiliate-mongo';
import { registerAffiliateConversion } from '@/lib/affiliate-referral';

import { createGuestDownloadToken } from '@/lib/guest-download-token';
import { getWebPageById } from '@/lib/web-pages';
import { addComponentPurchaseActivity, unlockPremiumComponentForGuest } from '@/lib/activity';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';
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
  const plan = (subscription.metadata?.plan as 'premium' | 'startup') ?? 'premium';
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
  } catch {
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

        if (session.mode === 'payment' && inferredProductId) {
          // One-time purchase
          const pageId = inferredProductId;
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

            const productName =
              sessionAny.metadata?.productName ||
              getWebPageById(pageId, 'es')?.title ||
              pageId;
            const siteUrl =
              process.env.NEXT_PUBLIC_SITE_URL ||
              process.env.NEXT_PUBLIC_APP_URL ||
              (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : 'process.env.DOMAIN_DEV');
            const downloadUrl = new URL(
              `/api/landing-pages/${encodeURIComponent(pageId)}/download`,
              siteUrl
            );
            downloadUrl.searchParams.set(
              'token',
              createGuestDownloadToken(pageId, session.id)
            );



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
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
