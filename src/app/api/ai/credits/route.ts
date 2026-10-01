import { getCreditBalance } from '@/lib/ai-job-service';
import { cacheHeaders } from '@/lib/cache-policy';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const headers = () => cacheHeaders('private-no-store');

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para consultar tus créditos.' }, { status: 401, headers: headers() });
  }

  const credits = await getCreditBalance(userId);
  return NextResponse.json({ credits }, { status: 200, headers: headers() });
}
