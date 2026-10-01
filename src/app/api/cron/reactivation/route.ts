import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import { processInactiveReactivationBatch } from '@/lib/reactivation-processor';

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;
  const results = await processInactiveReactivationBatch({ origin: new URL(request.url).origin });
  return NextResponse.json({
    processed: results.length,
    sent: results.filter(result => result.sent).length,
  });
}
