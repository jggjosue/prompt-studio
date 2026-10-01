export const FOUNDER_OUTREACH_SEGMENTS = [
  'creative_agency',
  'ecommerce_brand',
  'saas_marketing_team',
  'independent_creator',
] as const;

export type FounderOutreachSegment = typeof FOUNDER_OUTREACH_SEGMENTS[number];
export type OutreachStage = 'sent' | 'delivered' | 'reply' | 'positive_reply' | 'demo_trial' | 'activation' | 'checkout' | 'paid';

export type OutreachCandidate = {
  prospectId: string;
  segment: FounderOutreachSegment;
  humanReviewed: boolean;
  personalizationNote: string;
  doNotContact: boolean;
  recurringMarketingPermission: boolean;
};

export function canSendInitialFounderOutreach(candidate: OutreachCandidate) {
  return !candidate.doNotContact &&
    candidate.humanReviewed &&
    candidate.personalizationNote.trim().length >= 10;
}

export function canAddColdProspectToBroadcast(candidate: OutreachCandidate) {
  return candidate.recurringMarketingPermission && !candidate.doNotContact;
}

export function reviewCheckpoint(prospectOrdinal: number) {
  return prospectOrdinal > 0 && prospectOrdinal <= 100 && prospectOrdinal % 25 === 0;
}

export function optOutInstruction() {
  return 'Si prefieres no recibir más mensajes, responde “no gracias” y no volveremos a contactarte.';
}
