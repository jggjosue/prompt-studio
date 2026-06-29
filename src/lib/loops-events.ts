export const LOOPS_EVENTS = {
  welcome: 'prompt_studio_welcome',
  resources: 'prompt_studio_resources',
  landing_pages: 'prompt_studio_landing_pages',
  prompts: 'prompt_studio_prompts',
  premium_offer: 'prompt_studio_premium_offer',
  startup_offer: 'prompt_studio_startup_offer',
  download: 'prompt_studio_download',
  upgrade: 'prompt_studio_upgrade',
  affiliate_interest: 'prompt_studio_affiliate_interest',
  affiliate_share: 'prompt_studio_affiliate_share',
  cart_abandonment: 'prompt_studio_cart_abandonment',
  inactive_30d: 'prompt_studio_inactive_30d',
  new_product: 'prompt_studio_new_product',
  birthday: 'prompt_studio_birthday',
} as const;

export type LoopsEventKey = keyof typeof LOOPS_EVENTS;

export async function trackLoopsEvent(
  eventKey: LoopsEventKey,
  payload: Record<string, unknown> = {}
) {
  try {
    await fetch('/api/loops/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventKey,
        payload,
      }),
    });
  } catch {
    // Best-effort tracking only.
  }
}
