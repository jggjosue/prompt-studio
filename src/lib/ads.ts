export const ADSENSE_CLIENT_ID = 'ca-pub-7082864972330769';

export function areAdsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_ADS?.trim().toLowerCase() === 'true';
}
