import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { processDueOnboardingBatch } from '@/lib/onboarding-lifecycle-processor';

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  await connectToDatabase();
  const origin = new URL(request.url).origin;
  const results = await processDueOnboardingBatch({ origin });

  return NextResponse.json({
    processed: results.length,
    sent: results.filter(result => result.processed && result.send.sent).length,
  });
}
