import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly for the script
config({ path: path.resolve(process.cwd(), '.env') });

import connectToDatabase from '../src/lib/mongoose';
import NewUser from '../src/models/NewUser';

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    const testEmail = process.env.PROMPT_STUDIO_PREMIUM_JO;

    const newUser = new NewUser({
      email: testEmail
    });

    await newUser.save();
    console.log(`Successfully inserted example email (${testEmail}) into new_users collection.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
