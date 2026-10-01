import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import { reconcilePromptCreditFinances } from '@/lib/prompt-credit-reconciliation';
import { NextResponse } from 'next/server';

export async function GET() {
  const headers = cacheHeaders('private-no-store');
  if (!(await isPremiumJoAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
  return NextResponse.json({ reconciliation: await reconcilePromptCreditFinances() }, { headers });
}
