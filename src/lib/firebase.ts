'use client';

import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

export type FirebaseAnalyticsEvent =
  | 'web_open_demo_URL'
  | 'web_buy_button_premium'
  | 'web_view_prompt'
  | 'web_download_free'
  | 'web_download_premium'
  | 'web_demo_view'
  | 'web_checkout_start'
  | 'web_return_to_product'
  | 'web_preview_customize'
  | 'component_preview_view'
  | 'component_prompt_copy'
  | 'component_purchase_click'
  | 'credit_topup_click'
  | 'smart_search_no_results'
  | 'component_category_view'
  | 'component_favorite_add'
  | 'component_project_add'
  | 'free_to_premium_conversion'
  | 'next_project_download'
  | 'view_premium'
  | 'view_pricing'
  | 'select_plan'
  | 'begin_checkout'
  | 'purchase'
  | 'site_created'
  | 'template_selected'
  | 'component_added'
  | 'ai_site_generated'
  | 'ai_component_edited'
  | 'preview_opened'
  | 'site_published'
  | 'custom_domain_started'
  | 'custom_domain_connected'
  | 'domain_search'
  | 'domain_checkout_started'
  | 'domain_purchased'
  | 'newsletter_signup'
  | 'marketing_consent_updated'
  | 'user_library_return';

export type FirebaseAnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Prevent initialization if the browser is offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  try {
    const supported = await isSupported();

    if (!supported) {
      return null;
    }

    return getAnalytics(getFirebaseApp());
  } catch (error) {
    console.warn('Firebase Analytics failed to initialize:', error);
    return null;
  }
}

export async function logFirebaseEvent(
  eventName: FirebaseAnalyticsEvent,
  params?: FirebaseAnalyticsParams
) {
  const analytics = await getFirebaseAnalytics();

  if (!analytics) {
    return;
  }

  logEvent(analytics, eventName as string, params);
}
