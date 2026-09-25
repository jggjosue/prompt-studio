export type MarketplaceAssetKind = 'prompt' | 'kit' | 'template';

export type MarketplaceProvenance = {
  id: string;
  creatorUserId: string;
  contentHash: string;
  promptVersionId: string | null;
  promptVersionNumber: number | null;
  provider: string;
  model: string | null;
  licenseStatus: 'unspecified' | 'verified' | 'restricted';
  commercialUse: boolean | null;
};

export type MarketplaceAssetCandidate = {
  creatorUserId: string;
  kind: MarketplaceAssetKind;
  contentHash: string;
  provenance: MarketplaceProvenance | null;
  qualityScore: number | null;
  previewUrl: string | null;
  reproducibility: { seed: number | null; parameters: Record<string, unknown> } | null;
};

export type EligibilityResult = { eligible: boolean; reasons: string[] };

/** Domain policy applied by creator submission and admin approval. */
export function marketplaceEligibility(candidate: MarketplaceAssetCandidate): EligibilityResult {
  const reasons: string[] = [];
  const provenance = candidate.provenance;
  if (!provenance) reasons.push('missing_provenance');
  else {
    if (provenance.creatorUserId !== candidate.creatorUserId) reasons.push('provenance_owner_mismatch');
    if (provenance.contentHash !== candidate.contentHash) reasons.push('content_integrity_mismatch');
    if (!provenance.promptVersionId || provenance.promptVersionNumber == null) reasons.push('missing_prompt_lineage');
    if (!provenance.provider || !provenance.model) reasons.push('missing_generation_configuration');
    if (provenance.licenseStatus !== 'verified' || provenance.commercialUse !== true) reasons.push('commercial_license_unverified');
  }
  if (candidate.qualityScore != null && candidate.qualityScore < 60) reasons.push('quality_below_minimum');
  if (candidate.kind !== 'prompt') {
    if (!candidate.previewUrl) reasons.push('missing_preview');
    if (!candidate.reproducibility) reasons.push('missing_reproducibility_metadata');
  }
  return { eligible: reasons.length === 0, reasons };
}

export type MarketplaceLedgerEntry = {
  account: 'creator' | 'platform' | 'affiliate';
  amountCents: number;
};

export function marketplaceLedger(grossCents: number, platformRate = .2, affiliateRate = 0): MarketplaceLedgerEntry[] {
  if (!Number.isInteger(grossCents) || grossCents < 0) throw new Error('INVALID_GROSS_AMOUNT');
  if (platformRate < 0 || affiliateRate < 0 || platformRate + affiliateRate > 1) throw new Error('INVALID_COMMISSION_RATE');
  const platform = Math.round(grossCents * platformRate);
  const affiliate = Math.round(grossCents * affiliateRate);
  return [
    { account: 'creator', amountCents: grossCents - platform - affiliate },
    { account: 'platform', amountCents: platform },
    { account: 'affiliate', amountCents: affiliate },
  ];
}
