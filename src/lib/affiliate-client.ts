'use client';

import { AFFILIATE_FIRST_REF_STORAGE_KEY, AFFILIATE_LAST_TOUCH_STORAGE_KEY, AFFILIATE_OWNER_STORAGE_KEY, AFFILIATE_REF_STORAGE_KEY } from '@/lib/affiliate';

const AFFILIATE_VISITOR_STORAGE_KEY = 'prompt_studio_affiliate_visitor_id';

function readVisitorKey(): string {
  const stored = window.localStorage.getItem(AFFILIATE_VISITOR_STORAGE_KEY);
  if (stored) return stored;

  const generated =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(AFFILIATE_VISITOR_STORAGE_KEY, generated);
  return generated;
}

function readReferrer(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref')?.trim() || window.localStorage.getItem(AFFILIATE_OWNER_STORAGE_KEY) || window.localStorage.getItem(AFFILIATE_REF_STORAGE_KEY);
  if (ref) {
    window.localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, ref);
    window.localStorage.setItem(AFFILIATE_OWNER_STORAGE_KEY, ref);
    if (!window.localStorage.getItem(AFFILIATE_FIRST_REF_STORAGE_KEY)) {
      window.localStorage.setItem(AFFILIATE_FIRST_REF_STORAGE_KEY, ref);
    }
    window.localStorage.setItem(AFFILIATE_LAST_TOUCH_STORAGE_KEY, ref);
  }
  return ref;
}

export async function trackAffiliateClick(params: {
  productId: string;
  productName?: string;
  productPriceCents?: number | null;
  source: 'landing-page' | 'campaign-card' | 'buy-button' | 'demo' | 'affiliate-program';
  buyerKey?: string | null;
}) {
  const referrerUserId = readReferrer();
  if (!referrerUserId) return;

  const visitorId = params.buyerKey ?? readVisitorKey();
  const visitorKey = `${visitorId}:${params.productId}:${params.source}:${referrerUserId}`;

  try {
    const response = await fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerUserId,
        productId: params.productId,
        productName: params.productName ?? params.productId,
        productPriceCents: params.productPriceCents ?? null,
        source: params.source,
        visitorKey,
      }),
    });
    if (!response.ok) {
      console.error('Affiliate click tracking failed:', response.status);
    }
  } catch {
    // Best-effort only.
  }
}
