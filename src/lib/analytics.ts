'use client';

import {
  logFirebaseEvent,
  type FirebaseAnalyticsEvent,
  type FirebaseAnalyticsParams,
} from '@/lib/firebase';
import {
  KEY_CONVERSION_EVENTS,
  PROHIBITED_ANALYTICS_PROPERTIES,
} from '@/lib/analytics-taxonomy';
import { trackObservabilityEvent } from '@/lib/observability-client';
import { getOrCreateAnonymousAnalyticsId } from '@/lib/analytics-identity';

export type AnalyticsEventParams = FirebaseAnalyticsParams & {
  page_id?: string;
  page_title?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  membership?: string;
  value?: number;
  currency?: string;
  action_source?: string;
  auth_state?: 'anonymous' | 'authenticated' | 'unknown';
};

const SESSION_EVENT_PREFIX = 'promptstudio:analytics:event:';
const ATTRIBUTION_STORAGE_KEY = 'promptstudio:analytics:attribution:v1';
const KEY_CONVERSIONS = new Set<FirebaseAnalyticsEvent>(KEY_CONVERSION_EVENTS);
const PROHIBITED_KEYS = new Set<string>(PROHIBITED_ANALYTICS_PROPERTIES);

type GoogleAnalyticsWindow = Window & {
  gtag?: (command: 'event', eventName: string, params: AnalyticsEventParams) => void;
};

type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

function sanitizeAnalyticsParams(params: AnalyticsEventParams): AnalyticsEventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => !PROHIBITED_KEYS.has(key.toLowerCase()))
  ) as AnalyticsEventParams;
}

function readAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  const search = new URLSearchParams(window.location.search);
  const current: Attribution = {
    utm_source: search.get('utm_source') ?? undefined,
    utm_medium: search.get('utm_medium') ?? undefined,
    utm_campaign: search.get('utm_campaign') ?? undefined,
    utm_content: search.get('utm_content') ?? undefined,
  };
  const hasCurrent = Object.values(current).some(Boolean);
  if (hasCurrent) {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(current));
    return current;
  }
  try {
    return JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? '{}') as Attribution;
  } catch {
    return {};
  }
}

export function trackAnalyticsEvent(
  eventName: FirebaseAnalyticsEvent,
  params: AnalyticsEventParams = {},
  options: { oncePerSessionKey?: string } = {}
) {
  if (typeof window !== 'undefined' && options.oncePerSessionKey) {
    const key = `${SESSION_EVENT_PREFIX}${eventName}:${options.oncePerSessionKey}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
  }

  const browserContext =
    typeof window === 'undefined'
      ? {}
      : {
          document_title: document.title,
          page_path: window.location.pathname,
          // Do not send the full URL: query strings may contain user-entered or sensitive values.
          page_location: `${window.location.origin}${window.location.pathname}`,
          auth_state: params.auth_state ?? 'unknown',
          ...(params.auth_state === 'anonymous' ? { anonymous_id: getOrCreateAnonymousAnalyticsId() ?? undefined } : {}),
          ...readAttribution(),
        };
  const eventParams = sanitizeAnalyticsParams({
    ...browserContext,
    ...params,
  });

  if (typeof window !== 'undefined') {
    (window as GoogleAnalyticsWindow).gtag?.('event', eventName, eventParams);
  }

  void logFirebaseEvent(eventName, eventParams);

  if (KEY_CONVERSIONS.has(eventName) || /purchase|checkout|conversion|download|preview|copy/.test(eventName)) {
    trackObservabilityEvent({
      category: 'commerce',
      name: eventName,
      productId: params.item_id ?? params.page_id ?? null,
      value: params.value,
      unit: params.currency,
      status: 'recorded',
      metadata: { item_category: params.item_category ?? null, action_source: params.action_source ?? null },
    });
  }
}

export function isKeyConversionEvent(eventName: FirebaseAnalyticsEvent): boolean {
  return KEY_CONVERSIONS.has(eventName);
}
