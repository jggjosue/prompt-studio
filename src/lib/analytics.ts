'use client';

import {
  logFirebaseEvent,
  type FirebaseAnalyticsEvent,
  type FirebaseAnalyticsParams,
} from '@/lib/firebase';
import { trackObservabilityEvent } from '@/lib/observability-client';
import { KEY_CONVERSION_EVENTS } from '@/lib/analytics-taxonomy';

type AnalyticsEventParams = FirebaseAnalyticsParams & {
  page_id?: string;
  page_title?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  membership?: string;
  value?: number;
  currency?: string;
  action_source?: string;
};

const SESSION_EVENT_PREFIX = 'promptstudio:analytics:event:';
const KEY_CONVERSIONS = new Set<FirebaseAnalyticsEvent>(KEY_CONVERSION_EVENTS);

type GoogleAnalyticsWindow = Window & {
  gtag?: (command: 'event', eventName: string, params: AnalyticsEventParams) => void;
};

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

  const search = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
  const browserContext =
    typeof window === 'undefined'
      ? {}
      : {
          document_title: document.title,
          page_path: window.location.pathname,
          page_location: window.location.href,
          auth_state: params.auth_state ?? 'unknown',
          utm_source: search?.get('utm_source') ?? undefined,
          utm_medium: search?.get('utm_medium') ?? undefined,
          utm_campaign: search?.get('utm_campaign') ?? undefined,
          utm_content: search?.get('utm_content') ?? undefined,
        };
  const eventParams = {
    ...browserContext,
    ...params,
  };

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
