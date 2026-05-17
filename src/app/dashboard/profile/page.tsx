import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  return (
    <ProfileClient
      user={{
        id: user?.id ?? '',
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        givenName: user?.firstName ?? '',
        familyName: user?.lastName ?? '',
        picture: user?.imageUrl ?? null,
      }}
    />
  );
}
