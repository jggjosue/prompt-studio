import 'server-only';

import { prospectDedupeKey, validateProspect, type B2BProspectInput } from '@/lib/b2b-prospect';
import B2BProspect from '@/models/B2BProspect';

export async function upsertB2BProspect(input: B2BProspectInput) {
  const errors = validateProspect(input);
  if (errors.length) throw new Error(`INVALID_PROSPECT:${errors.join(',')}`);
  const dedupeKey = prospectDedupeKey(input);
  return B2BProspect.findOneAndUpdate(
    { dedupeKey },
    { $setOnInsert: { ...input, dedupeKey, discoveredAt: new Date(), outreachStatus: 'new', replyStatus: 'none', doNotContact: false } },
    { upsert: true, new: true }
  );
}

export async function markB2BDoNotContact(id: string) {
  return B2BProspect.findByIdAndUpdate(id, { $set: { doNotContact: true, doNotContactAt: new Date(), outreachStatus: 'closed' } }, { new: true });
}

export async function deleteB2BProspect(id: string) {
  return B2BProspect.findByIdAndUpdate(id, { $set: { deletedAt: new Date(), outreachStatus: 'deleted', doNotContact: true, doNotContactAt: new Date(), publicBusinessContact: null, personalizationNote: null, qualificationNotes: null } }, { new: true });
}
