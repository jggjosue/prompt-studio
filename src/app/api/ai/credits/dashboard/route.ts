import { getCreditDashboard } from '@/lib/credit-dashboard';
import { cacheHeaders } from '@/lib/cache-policy';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const headers = () => cacheHeaders('private-no-store');

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para consultar tu historial de créditos.' }, { status: 401, headers: headers() });
  return NextResponse.json({ dashboard: await getCreditDashboard(userId) }, { status: 200, headers: headers() });
}
