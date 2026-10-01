import assert from 'node:assert/strict';
import test from 'node:test';
import { prospectDedupeKey, validateProspect } from '../../src/lib/b2b-prospect.ts';

const base = { company: 'Acme Inc', website: 'https://www.acme.test', publicBusinessContact: 'sales@acme.test', sourceUrl: 'https://acme.test/contact', sourceType: 'company_site' as const };

test('deduplicates normalized company/contact identities', () => {
  assert.equal(prospectDedupeKey(base), prospectDedupeKey({ ...base, company: ' acme INC ', website: 'https://acme.test', publicBusinessContact: 'SALES@ACME.TEST' }));
});

test('requires provenance and a business-email-shaped contact when contact is stored', () => {
  assert.deepEqual(validateProspect(base), []);
  assert.ok(validateProspect({ ...base, sourceUrl: '' }).includes('missing_provenance'));
  assert.ok(validateProspect({ ...base, publicBusinessContact: 'not-an-email' }).includes('contact_must_be_public_business_email'));
});
