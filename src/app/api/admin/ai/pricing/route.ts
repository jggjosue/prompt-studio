import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { listAdminPricing, updateOperationPricing } from '@/lib/admin-ai-pricing';
import { cacheHeaders } from '@/lib/cache-policy';
import { NextResponse } from 'next/server';

const headers = () => cacheHeaders('private-no-store');

export async function GET() {
  if (!(await isPremiumJoAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: headers() });
  return NextResponse.json({ pricing: await listAdminPricing() }, { headers: headers() });
}

export async function PATCH(request: Request) {
  if (!(await isPremiumJoAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: headers() });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  try {
    await updateOperationPricing({
      operationCode: typeof body?.operationCode === 'string' ? body.operationCode : '',
      creditCost: Number(body?.creditCost),
      enabled: body?.enabled !== false,
      minimumMarginPercent: Number(body?.minimumMarginPercent),
    });
    return NextResponse.json({ pricing: await listAdminPricing() }, { headers: headers() });
  } catch (error) {
    return NextResponse.json({ error: { code: error instanceof Error ? error.message : 'PRICING_UPDATE_FAILED' } }, { status: 400, headers: headers() });
  }
}
