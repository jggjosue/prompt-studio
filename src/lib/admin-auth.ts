import { auth, currentUser } from '@clerk/nextjs/server';

export async function isPremiumJoAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const targetEmail = process.env.PROMPT_STUDIO_PREMIUM_JO?.trim().toLowerCase();
  if (!targetEmail) return false;

  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() === targetEmail;
}
