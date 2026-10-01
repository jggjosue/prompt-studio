import 'dotenv/config';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const UserProfileSchema = new mongoose.Schema({
  userId: String,
  email: String,
  marketingOptIn: Boolean,
  unsubscribeTimestamp: Date,
  emailSuppressedAt: Date,
  emailSuppressionReason: String,
  emailDoNotContact: Boolean,
}, { strict: false });
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema, 'user_profiles');

function unsubscribed(user: {
  marketingOptIn?: boolean;
  unsubscribeTimestamp?: Date | null;
  emailSuppressedAt?: Date | null;
  emailSuppressionReason?: string | null;
  emailDoNotContact?: boolean;
}) {
  return Boolean(
    user.marketingOptIn !== true ||
    user.unsubscribeTimestamp ||
    user.emailSuppressedAt ||
    user.emailSuppressionReason ||
    user.emailDoNotContact
  );
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.RESEND_API_KEY) {
    console.error('Missing MONGODB_URI or RESEND_API_KEY');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await UserProfile.find({ userId: { $type: 'string' }, email: { $type: 'string', $ne: '' } });

  let successCount = 0;
  let errorCount = 0;
  for (const user of users) {
    const contact = {
      email: user.email.trim().toLowerCase(),
      unsubscribed: unsubscribed(user),
      ...(process.env.RESEND_AUDIENCE_ID?.trim() ? { audienceId: process.env.RESEND_AUDIENCE_ID.trim() } : {}),
    };
    try {
      const created = await resend.contacts.create(contact);
      const result = created.error ? await resend.contacts.update(contact) : created;
      if (result.error) errorCount++;
      else successCount++;
    } catch {
      errorCount++;
    }
  }

  console.log(`Sync complete. Reconciled: ${successCount}, Errors: ${errorCount}`);
  await mongoose.disconnect();
}

main().catch(() => {
  console.error('Resend synchronization failed');
  process.exitCode = 1;
});
