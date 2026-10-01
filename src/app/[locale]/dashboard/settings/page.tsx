import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongoose';
import UserProfile from '@/models/UserProfile';
import EmailPreferencesForm from './email-preferences-form';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await connectToDatabase();
  const profile = await UserProfile.findOne({ userId }).lean<{
    marketingOptIn?: boolean;
    emailPreferenceTopics?: string[];
  } | null>();

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account settings and preferences.</p>
      </div>
      <EmailPreferencesForm
        initialOptIn={profile?.marketingOptIn === true}
        initialTopics={profile?.emailPreferenceTopics ?? []}
      />
    </div>
  );
}
