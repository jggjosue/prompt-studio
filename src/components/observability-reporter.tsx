'use client';

import { useEffect } from 'react';
import { flushObservabilityEvents, trackObservabilityEvent } from '@/lib/observability-client';

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type EventTimingEntry = PerformanceEntry & { interactionId?: number };

function observe(type: string, callback: PerformanceObserverCallback) {
  try {
    const observer = new PerformanceObserver(callback);
    observer.observe({ type, buffered: true });
    return observer;
  } catch { return null; }
}

export function ObservabilityReporter() {
  useEffect(() => {
    const observers: PerformanceObserver[] = [];
    let cls = 0;
    const error = (event: ErrorEvent) => trackObservabilityEvent({ category: 'browser_error', name: event.error?.name || 'window_error', status: 'error', metadata: { message: event.message.slice(0, 500), source: event.filename?.split('/').pop() || '', line: event.lineno, column: event.colno } });
    const rejection = (event: PromiseRejectionEvent) => { const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason)); trackObservabilityEvent({ category: 'browser_error', name: reason.name || 'unhandled_rejection', status: 'error', metadata: { message: reason.message.slice(0, 500) } }); };
    window.addEventListener('error', error);
    window.addEventListener('unhandledrejection', rejection);

    const paint = observe('paint', list => list.getEntries().forEach(entry => trackObservabilityEvent({ category: 'web_vital', name: entry.name === 'first-contentful-paint' ? 'FCP' : entry.name, value: Math.round(entry.startTime), unit: 'ms' })));
    if (paint) observers.push(paint);
    const lcp = observe('largest-contentful-paint', list => { const entry = list.getEntries().at(-1); if (entry) trackObservabilityEvent({ category: 'web_vital', name: 'LCP', value: Math.round(entry.startTime), unit: 'ms' }); });
    if (lcp) observers.push(lcp);
    const shifts = observe('layout-shift', list => { for (const raw of list.getEntries()) { const entry = raw as LayoutShiftEntry; if (!entry.hadRecentInput) cls += entry.value; } });
    if (shifts) observers.push(shifts);
    const events = observe('event', list => { const entry = list.getEntries().filter(item => (item as EventTimingEntry).interactionId).sort((a, b) => b.duration - a.duration)[0]; if (entry) trackObservabilityEvent({ category: 'web_vital', name: 'INP', value: Math.round(entry.duration), unit: 'ms' }); });
    if (events) observers.push(events);
    const resources = observe('resource', list => list.getEntries().forEach(raw => { const entry = raw as PerformanceResourceTiming; const isMedia = entry.initiatorType === 'img' || entry.initiatorType === 'video' || entry.initiatorType === 'iframe'; if (!isMedia) return; trackObservabilityEvent({ category: 'resource_timing', name: entry.initiatorType === 'iframe' ? 'preview_load' : `${entry.initiatorType}_load`, durationMs: Math.round(entry.duration), value: Math.round(entry.transferSize || 0), unit: 'bytes', metadata: { host: (() => { try { return new URL(entry.name).hostname; } catch { return ''; } })(), cached: entry.transferSize === 0 } }); }));
    if (resources) observers.push(resources);

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) trackObservabilityEvent({ category: 'web_vital', name: 'TTFB', value: Math.round(navigation.responseStart), unit: 'ms' });
    const finish = () => { if (cls > 0) trackObservabilityEvent({ category: 'web_vital', name: 'CLS', value: Number(cls.toFixed(4)), unit: 'score' }); flushObservabilityEvents(); };
    window.addEventListener('pagehide', finish);
    return () => { finish(); observers.forEach(observer => observer.disconnect()); window.removeEventListener('error', error); window.removeEventListener('unhandledrejection', rejection); window.removeEventListener('pagehide', finish); };
  }, []);
  return null;
}
