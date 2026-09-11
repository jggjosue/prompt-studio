'use client';

import {
  logFirebaseEvent,
  type FirebaseAnalyticsEvent,
  type FirebaseAnalyticsParams,
} from '@/lib/firebase';
import { trackObservabilityEvent } from '@/lib/observability-client';

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

type GoogleAnalyticsWindow = Window & {
  gtag?: (command: 'event', eventName: string, params: AnalyticsEventParams) => void;
};

export function trackAnalyticsEvent(
  eventName: FirebaseAnalyticsEvent,
  params: AnalyticsEventParams = {}
) {
  const browserContext =
    typeof window === 'undefined'
      ? {}
      : {
          document_title: document.title,
          page_path: window.location.pathname,
          page_location: window.location.href,
        };
  const eventParams = {
    ...browserContext,
    ...params,
  };

  if (typeof window !== 'undefined') {
    (window as GoogleAnalyticsWindow).gtag?.('event', eventName, eventParams);
  }

  void logFirebaseEvent(eventName, eventParams);

  if (/purchase|checkout|conversion|download|preview|copy/.test(eventName)) {
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
