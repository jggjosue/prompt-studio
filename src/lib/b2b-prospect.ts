export const B2B_OUTREACH_STATUSES = ['new', 'qualified', 'contacted', 'replied', 'closed', 'deleted'] as const;
export const B2B_REPLY_STATUSES = ['none', 'positive', 'neutral', 'negative'] as const;

export type B2BProspectInput = {
  company: string;
  website?: string | null;
  segment?: string | null;
  region?: string | null;
  publicBusinessContact?: string | null;
  contactRole?: string | null;
  sourceUrl: string;
  sourceType: 'company_site' | 'directory' | 'event' | 'referral' | 'manual';
  useCase?: string | null;
  personalizationNote?: string | null;
  qualificationNotes?: string | null;
};

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? '';

export function prospectDedupeKey(input: Pick<B2BProspectInput, 'company' | 'website' | 'publicBusinessContact'>) {
  let host = '';
  try { host = input.website ? new URL(input.website).hostname.replace(/^www\./, '').toLowerCase() : ''; } catch {}
  return [normalize(input.company), host, normalize(input.publicBusinessContact)].join('|');
}

export function validateProspect(input: B2BProspectInput) {
  const errors: string[] = [];
  if (!input.company.trim()) errors.push('missing_company');
  if (!input.sourceUrl.trim()) errors.push('missing_provenance');
  if (input.publicBusinessContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.publicBusinessContact)) errors.push('contact_must_be_public_business_email');
  return errors;
}
