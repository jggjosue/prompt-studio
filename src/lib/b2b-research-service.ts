import 'server-only';

import { validateResearchCandidate, type CompanyResearchCandidate } from '@/lib/b2b-research-policy';
import B2BResearchCandidate from '@/models/B2BResearchCandidate';

export async function stageResearchCandidate(candidate: CompanyResearchCandidate, sourceType: string) {
  const errors = validateResearchCandidate(candidate);
  if (errors.length) throw new Error(`INVALID_RESEARCH_CANDIDATE:${errors.join(',')}`);

  return B2BResearchCandidate.findOneAndUpdate(
    { company: candidate.company.trim(), sourceUrl: candidate.source.url },
    { $setOnInsert: {
      company: candidate.company.trim(),
      website: candidate.website ?? null,
      segment: candidate.segment ?? null,
      region: candidate.region ?? null,
      useCase: candidate.useCase.trim(),
      qualificationReason: candidate.qualificationReason.trim(),
      sourceUrl: candidate.source.url,
      sourceType,
      publicBusinessContact: candidate.publicBusinessContact ?? null,
      discoveredAt: new Date(),
      reviewStatus: 'pending',
      outreachAllowed: false,
    } },
    { upsert: true, new: true }
  );
}

export async function reviewResearchCandidate(id: string, reviewer: string, approved: boolean) {
  return B2BResearchCandidate.findByIdAndUpdate(id, { $set: {
    reviewStatus: approved ? 'approved' : 'rejected',
    reviewedAt: new Date(),
    reviewedBy: reviewer,
    outreachAllowed: approved,
  } }, { new: true });
}
