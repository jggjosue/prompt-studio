import { NextRequest, NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { freeAccessGranted } from '@/lib/free-access';

export const runtime = 'nodejs';

/** El gate pregunta aquí si este visitante ya registró su correo en la BD. */
export async function GET(request: NextRequest) {
  const { granted } = await freeAccessGranted(request);
  return NextResponse.json({ registered: granted }, { headers: cacheHeaders('private-no-store') });
}