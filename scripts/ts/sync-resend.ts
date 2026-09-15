import 'dotenv/config';
import mongoose from 'mongoose';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
        console.error(`Error adding ${user.email}:`, response.error.message);
        errorCount++;
      } else {
        console.log(`Successfully added ${user.email}`);
        successCount++;
      }
    } catch (e) {
      console.error(`Exception adding ${user.email}:`, e);
      errorCount++;
    }
  }

  console.log(`\nSync complete. Added: ${successCount}, Errors: ${errorCount}`);
  await mongoose.disconnect();
}

main().catch(console.error);
