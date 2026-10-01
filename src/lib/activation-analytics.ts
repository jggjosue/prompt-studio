'use client';

import { trackAnalyticsEvent } from '@/lib/analytics';

export type ActivationType =
  | 'save_prompt'
  | 'use_prompt'
  | 'generate_image'
  | 'generate_video'
  | 'generate_web';

/**
 * Records the server-authoritative first activation and emits the analytics
 * event only when the authenticated API confirms this is the user's first one.
 */
export async function recordFirstActivation(activationType: ActivationType): Promise<boolean> {
  const response = await fetch('/api/analytics/activation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationType }),
  });

  if (!response.ok) return false;
  const data = (await response.json().catch(() => null)) as { firstActivation?: boolean } | null;
  if (!data?.firstActivation) return false;

  trackAnalyticsEvent('first_activation', {
    item_category: activationType,
    action_source: 'authenticated_product_action',
    auth_state: 'authenticated',
  });
  return true;
}
