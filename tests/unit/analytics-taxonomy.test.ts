import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CANONICAL_ANALYTICS_EVENTS,
  KEY_CONVERSION_EVENTS,
  LEGACY_ANALYTICS_EVENTS,
  PROHIBITED_ANALYTICS_PROPERTIES,
  isCanonicalAnalyticsEvent,
  isLegacyAnalyticsEvent,
} from '../../src/lib/analytics-taxonomy';

test('canonical analytics event names are unique snake_case identifiers', () => {
  assert.equal(new Set(CANONICAL_ANALYTICS_EVENTS).size, CANONICAL_ANALYTICS_EVENTS.length);
  for (const event of CANONICAL_ANALYTICS_EVENTS) {
    assert.match(event, /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
  }
});

test('legacy and canonical event namespaces do not overlap', () => {
  const canonical = new Set<string>(CANONICAL_ANALYTICS_EVENTS);
  for (const event of LEGACY_ANALYTICS_EVENTS) assert.equal(canonical.has(event), false);
});

test('key conversions are canonical events', () => {
  for (const event of KEY_CONVERSION_EVENTS) assert.equal(isCanonicalAnalyticsEvent(event), true);
});

test('taxonomy recognizes canonical and legacy events', () => {
  assert.equal(isCanonicalAnalyticsEvent('purchase'), true);
  assert.equal(isCanonicalAnalyticsEvent('made_up_event'), false);
  assert.equal(isLegacyAnalyticsEvent('web_checkout_start'), true);
  assert.equal(isLegacyAnalyticsEvent('purchase'), false);
});

test('privacy denylist covers high-risk analytics properties', () => {
  for (const key of ['email', 'prompt', 'password', 'token', 'api_key', 'authorization']) {
    assert.equal((PROHIBITED_ANALYTICS_PROPERTIES as readonly string[]).includes(key), true);
  }
});
