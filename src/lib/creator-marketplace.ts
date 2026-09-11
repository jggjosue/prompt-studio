import crypto from'crypto';
export const MARKETPLACE_COMMISSION_RATE=0.20;
export const MARKETPLACE_LICENSES=['personal','commercial','extended']as const;export type MarketplaceLicense=typeof MARKETPLACE_LICENSES[number];
export function normalizeMarketplaceContent(value:string){return value.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()}
export function contentFingerprint(value:string){return crypto.createHash('sha256').update(normalizeMarketplaceContent(value)).digest('hex')}
export function marketplaceSplit(grossCents:number){const platformFeeCents=Math.round(grossCents*MARKETPLACE_COMMISSION_RATE);return{grossCents,platformFeeCents,creatorNetCents:grossCents-platformFeeCents}}
export function validMarketplaceLicense(value:unknown):value is MarketplaceLicense{return MARKETPLACE_LICENSES.includes(value as MarketplaceLicense)}
