import {
  getServerSubscriptionStatus,
  type ServerSubscriptionStatus,
} from '@/lib/server-subscription-status';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

export type SubscriptionStatusResponse = ServerSubscriptionStatus;

function jsonResponse(body: SubscriptionStatusResponse) {
  return NextResponse.json(body, {
    headers: cacheHeaders('private-no-store'),
  });
}

export async function GET() {
  return jsonResponse(await getServerSubscriptionStatus());
}
