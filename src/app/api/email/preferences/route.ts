import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserProfile from '@/models/UserProfile';
import { EMAIL_PREFERENCE_TOPICS, updateEmailPreferences } from '@/lib/email-preferences';

const CONSENT_VERSION = 'marketing-v1';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const profile = await UserProfile.findOne({ userId }).lean();
  return NextResponse.json({
    marketingOptIn: profile?.marketingOptIn === true,
    topics: profile?.emailPreferenceTopics ?? [],
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null) as { marketingOptIn?: unknown; topics?: unknown } | null;
  if (!body || typeof body.marketingOptIn !== 'boolean' || !Array.isArray(body.topics)) {
    return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
  }

  const allowed = new Set<string>(EMAIL_PREFERENCE_TOPICS);
  const topics = body.topics.filter((value): value is (typeof EMAIL_PREFERENCE_TOPICS)[number] =>
    typeof value === 'string' && allowed.has(value)
  );
  if (topics.length !== body.topics.length) {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  }

  await connectToDatabase();
  const profile = await updateEmailPreferences({
    userId,
    marketingOptIn: body.marketingOptIn,
    topics,
    source: 'dashboard_settings',
    consentVersion: CONSENT_VERSION,
  });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json({ marketingOptIn: profile.marketingOptIn, topics: profile.emailPreferenceTopics });
}
