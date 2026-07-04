import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(apiKey);



/**
 * Replace `re_xxxxxxxxx` with your real Resend API key in `RESEND_API_KEY`.
 * Example local env value:
 * RESEND_API_KEY=re_xxxxxxxxx
 */

export async function upsertResendContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  const contact = {
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    unsubscribed: false,
    ...(audienceId ? { audienceId } : {}),
  };

  const created = await resend.contacts.create(contact);
  if (!created.error) return created;

  // Resend returns an error when the email already exists. Updating by email
  // makes Clerk user.created/user.updated events safely replayable.
  const updated = await resend.contacts.update(contact);
  return updated.error ? created : updated;
}
