'use server';

import connectToDatabase from '@/lib/mongoose';
import RegisteredUser from '@/models/RegisteredUser';

export async function syncRegisteredUser(email: string) {
  if (!email) return;
  try {
    await connectToDatabase();
    // $setOnInsert ensures that we only create the document if it does not exist.
    // If it already exists, no fields are modified.
    await RegisteredUser.updateOne(
      { email },
      { $setOnInsert: { email } },
      { upsert: true }
    );
  } catch (error) {
    console.error('Failed to sync registered user:', error);
  }
}
