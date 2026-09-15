'use client';

export type ClientObservabilityEvent = {
  category: 'browser_error' | 'web_vital' | 'resource_timing' | 'commerce';
  name: string;
  route?: string;
  sessionId?: string;
  productId?: string | null;
  value?: number;
  unit?: string;
  status?: string;
  durationMs?: number;
  metadata?: Record<string, string | number | boolean | null>;
  fingerprint?: string;
};

const queue: ClientObservabilityEvent[] = [];
let flushTimer: number | null = null;

export function observabilitySessionId() {
  const key = 'ps_observability_session';
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function context(event: ClientObservabilityEvent): ClientObservabilityEvent {
  const params = new URLSearchParams(location.search);
  const productId = event.productId || params.get('pageId') || location.pathname.match(/^\/landing-pages\/([^/]+)/)?.[1] || null;
  return { ...event, route: event.route || location.pathname, sessionId: event.sessionId || observabilitySessionId(), productId };
}

export function flushObservabilityEvents() {
  if (!queue.length) return;
  const events = queue.splice(0, 25);
  const body = JSON.stringify({ events });
  if (!navigator.sendBeacon?.('/api/observability/events', new Blob([body], { type: 'application/json' }))) {
    void fetch('/api/observability/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true, cache: 'no-store' });
  }
}

export function trackObservabilityEvent(event: ClientObservabilityEvent) {
  if (typeof window === 'undefined') return;
  queue.push(context(event));
  if (queue.length >= 10) return flushObservabilityEvents();
  if (flushTimer) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(flushObservabilityEvents, 3000);
}
