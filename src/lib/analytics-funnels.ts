import type { CanonicalAnalyticsEvent } from '@/lib/analytics-taxonomy';

export const OFFICIAL_ANALYTICS_FUNNELS = {
  acquisitionToPurchase: [
    'view_home',
    'signup_started',
    'sign_up',
    'first_activation',
    'view_pricing',
    'begin_checkout',
    'purchase',
  ],
  promptEngagement: [
    'view_prompt',
    'copy_prompt',
    'use_prompt',
    'save_prompt',
  ],
  generationActivation: [
    'sign_up',
    'first_activation',
  ],
} as const satisfies Record<string, readonly CanonicalAnalyticsEvent[]>;

export type OfficialFunnelName = keyof typeof OFFICIAL_ANALYTICS_FUNNELS;

export const OFFICIAL_COHORTS = {
  signupDate: {
    anchorEvent: 'sign_up',
    grain: 'calendar_day',
    description: 'Users grouped by the UTC calendar date of completed registration.',
  },
  activationDate: {
    anchorEvent: 'first_activation',
    grain: 'calendar_day',
    description: 'Registered users grouped by the UTC date of their first successful activation.',
  },
  acquisitionSource: {
    anchorEvent: 'sign_up',
    grain: 'utm_source',
    description: 'Registrations grouped by first-party persisted UTM source at signup.',
  },
  payingDate: {
    anchorEvent: 'purchase',
    grain: 'calendar_day',
    description: 'Customers grouped by the UTC date of their first confirmed purchase.',
  },
} as const satisfies Record<string, {
  anchorEvent: CanonicalAnalyticsEvent;
  grain: 'calendar_day' | 'utm_source';
  description: string;
}>;

export type OfficialCohortName = keyof typeof OFFICIAL_COHORTS;

export const OFFICIAL_FUNNEL_RULES = {
  timezone: 'UTC',
  identity: 'anonymous_id before signup; authenticated product identity after registration',
  ordering: 'first occurrence of each stage at or after the previous stage',
  denominator: 'unique journey/user identities entering the first stage in the selected analysis window',
  purchaseSource: 'signed Stripe webhook only',
} as const;
