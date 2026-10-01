/**
 * Canonical Prompt Studio product analytics taxonomy.
 *
 * Rules:
 * - New product instrumentation MUST use CANONICAL_ANALYTICS_EVENTS.
 * - LEGACY_ANALYTICS_EVENTS remain temporarily accepted for backwards compatibility only.
 * - Event names are snake_case and describe a completed/observable action.
 * - Never send email, prompt text, credentials, tokens, names, or other direct PII.
 * - IDs must be opaque product/resource identifiers, never email addresses.
 *
 * Parent: #233
 * Contract: #234
 */

export const CANONICAL_ANALYTICS_EVENTS = [
  'view_home',
  'search',
  'view_prompt',
  'copy_prompt',
  'use_prompt',
  'generate_image',
  'generate_video',
  'generate_web',
  'signup_started',
  'sign_up',
  'login',
  'identity_linked',
  'save_prompt',
  'first_activation',
  'view_premium',
  'view_pricing',
  'select_plan',
  'begin_checkout',
  'purchase',
  'site_created',
  'template_selected',
  'component_added',
  'ai_site_generated',
  'ai_component_edited',
  'preview_opened',
  'site_published',
  'custom_domain_started',
  'custom_domain_connected',
  'domain_search',
  'domain_checkout_started',
  'domain_purchased',
  'newsletter_signup',
  'marketing_consent_updated',
  'user_library_return',
] as const;

export const LEGACY_ANALYTICS_EVENTS = [
  'web_open_demo_URL',
  'web_buy_button_premium',
  'web_view_prompt',
  'web_download_free',
  'web_download_premium',
  'web_demo_view',
  'web_checkout_start',
  'web_return_to_product',
  'web_preview_customize',
  'component_preview_view',
  'component_prompt_copy',
  'component_purchase_click',
  'credit_topup_click',
  'smart_search_no_results',
  'component_category_view',
  'component_favorite_add',
  'component_project_add',
  'free_to_premium_conversion',
  'next_project_download',
] as const;

export type CanonicalAnalyticsEvent = (typeof CANONICAL_ANALYTICS_EVENTS)[number];
export type LegacyAnalyticsEvent = (typeof LEGACY_ANALYTICS_EVENTS)[number];
export type AnalyticsEvent = CanonicalAnalyticsEvent | LegacyAnalyticsEvent;

export const KEY_CONVERSION_EVENTS = [
  'sign_up',
  'save_prompt',
  'begin_checkout',
  'purchase',
] as const satisfies readonly CanonicalAnalyticsEvent[];

export const PROHIBITED_ANALYTICS_PROPERTIES = [
  'email',
  'user_email',
  'name',
  'full_name',
  'prompt',
  'prompt_text',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'authorization',
] as const;

export const STANDARD_ANALYTICS_PROPERTIES = [
  'page_id',
  'page_title',
  'page_path',
  'page_location',
  'document_title',
  'item_id',
  'item_name',
  'item_category',
  'membership',
  'value',
  'currency',
  'action_source',
  'auth_state',
  'anonymous_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
] as const;

export function isCanonicalAnalyticsEvent(value: string): value is CanonicalAnalyticsEvent {
  return (CANONICAL_ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function isLegacyAnalyticsEvent(value: string): value is LegacyAnalyticsEvent {
  return (LEGACY_ANALYTICS_EVENTS as readonly string[]).includes(value);
}
