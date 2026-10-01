'use client';

import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { AnalyticsEvent } from '@/lib/analytics-taxonomy';

export type FirebaseAnalyticsEvent = AnalyticsEvent;
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
