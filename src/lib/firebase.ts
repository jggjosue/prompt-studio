'use client';

import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

export type FirebaseAnalyticsEvent =
  | 'web_open_demo_URL'
  | 'web_buy_button_premium'
  | 'web_view_prompt'
  | 'web_download_free'
  | 'web_download_premium';

export type FirebaseAnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const firebaseConfig = {
  apiKey: 'AIzaSyDMcrtnjWsFm_psMPkbdKMh4kiwP85WFvE',
  authDomain: 'prompt-studio-prod.firebaseapp.com',
  projectId: 'prompt-studio-prod',
  storageBucket: 'prompt-studio-prod.firebasestorage.app',
  messagingSenderId: '142443136762',
  appId: '1:142443136762:web:a44a7128dc804d9ba46b43',
  measurementId: 'G-YGJVE5K58X',
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

  logEvent(analytics, eventName, params);
}
