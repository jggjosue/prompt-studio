import 'dotenv/config';
import mongoose from 'mongoose';
import { Resend } from 'resend';

// Define NewUser schema manually to avoid Next.js module resolution issues
const NewUserSchema = new mongoose.Schema({
  email: String,
  createdAt: Date,
});
const NewUser = mongoose.models.NewUser || mongoose.model('NewUser', NewUserSchema, 'user_profiles');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const users = await NewUser.find({});
  console.log(`Found ${users.length} users in 'user_profiles' collection.`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    try {
      const response = await resend.contacts.create({
        email: user.email,
        unsubscribed: false,
      });

      if (response.error) {
        console.error('Error adding Resend contact');
        errorCount++;
      } else {
        console.log('Successfully added Resend contact');
        successCount++;
      }
    } catch {
      console.error('Exception adding Resend contact');
      errorCount++;
    }
  }

  console.log(`\nSync complete. Added: ${successCount}, Errors: ${errorCount}`);
  await mongoose.disconnect();
}

main().catch(() => {
  console.error('Resend synchronization failed');
  process.exitCode = 1;
});
