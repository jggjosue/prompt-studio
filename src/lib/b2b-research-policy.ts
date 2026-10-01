export type ProspectResearchSource = {
  url: string;
  publicAccess: boolean;
  permittedForResearch: boolean;
  robotsAllowed: boolean;
  rateLimitPerMinute: number;
  requiresAuthentication?: boolean;
  requiresCaptcha?: boolean;
  behindPaywall?: boolean;
};

export type CompanyResearchCandidate = {
  company: string;
  website?: string | null;
  segment?: string | null;
  region?: string | null;
  useCase: string;
  qualificationReason: string;
  source: ProspectResearchSource;
  publicBusinessContact?: string | null;
};

export function researchSourceEligible(source: ProspectResearchSource) {
  return source.publicAccess &&
    source.permittedForResearch &&
    source.robotsAllowed &&
    source.rateLimitPerMinute > 0 &&
    !source.requiresAuthentication &&
    !source.requiresCaptcha &&
    !source.behindPaywall;
}

export function validateResearchCandidate(candidate: CompanyResearchCandidate) {
  const errors: string[] = [];
  if (!candidate.company.trim()) errors.push('missing_company');
  if (!candidate.useCase.trim()) errors.push('missing_use_case');
  if (!candidate.qualificationReason.trim()) errors.push('missing_qualification_reason');
  if (!candidate.source.url.trim()) errors.push('missing_source_url');
  if (!researchSourceEligible(candidate.source)) errors.push('source_not_permitted');
  return errors;
}

export function researchRateLimitMs(source: ProspectResearchSource) {
  if (!researchSourceEligible(source)) return null;
  return Math.ceil(60_000 / source.rateLimitPerMinute);
}
