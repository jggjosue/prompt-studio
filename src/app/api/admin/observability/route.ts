import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import ObservabilityEvent from '@/models/ObservabilityEvent';

export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const user = await (await clerkClient()).users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email || email !== process.env.PROMPT_STUDIO_PREMIUM_JO?.trim().toLowerCase()) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
  const requestedDays = Number(new URL(request.url).searchParams.get('days') ?? 7);
  const days = Math.min(30, Math.max(1, Number.isFinite(requestedDays) ? Math.floor(requestedDays) : 7));
  const since = new Date(Date.now() - days * 86_400_000);
  await connectToDatabase();
  const match = { createdAt: { $gte: since } };
  const [summary, routes, failures, aiCosts] = await Promise.all([
    ObservabilityEvent.aggregate([{ $match: match }, { $group: { _id: { category: '$category', name: '$name' }, count: { $sum: 1 }, avgValue: { $avg: '$value' }, avgDurationMs: { $avg: '$durationMs' }, totalCostUsd: { $sum: { $ifNull: ['$costUsd', 0] } } } }, { $sort: { count: -1 } }]),
    ObservabilityEvent.aggregate([{ $match: match }, { $group: { _id: { route: '$route', productId: '$productId' }, samples: { $sum: 1 }, lcpMs: { $avg: { $cond: [{ $eq: ['$name', 'LCP'] }, '$value', null] } }, previewMs: { $avg: { $cond: [{ $eq: ['$name', 'preview_load'] }, '$durationMs', null] } }, checkoutStarts: { $sum: { $cond: [{ $regexMatch: { input: '$name', regex: 'checkout|purchase_click' } }, 1, 0] } }, conversions: { $sum: { $cond: [{ $regexMatch: { input: '$name', regex: 'conversion|purchase_complete|download' } }, 1, 0] } }, browserErrors: { $sum: { $cond: [{ $eq: ['$category', 'browser_error'] }, 1, 0] } } } }, { $sort: { samples: -1 } }, { $limit: 50 }]),
    ObservabilityEvent.aggregate([{ $match: { ...match, status: { $in: ['error', 'failed'] } } }, { $group: { _id: { category: '$category', name: '$name', fingerprint: '$fingerprint' }, count: { $sum: 1 }, lastSeen: { $max: '$createdAt' }, route: { $last: '$route' } } }, { $sort: { count: -1 } }, { $limit: 30 }]),
    ObservabilityEvent.aggregate([{ $match: { ...match, category: 'ai_generation' } }, { $group: { _id: { userId: '$userId', productId: '$productId' }, jobs: { $sum: 1 }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }, costUsd: { $sum: { $ifNull: ['$costUsd', 0] } }, credits: { $sum: { $ifNull: ['$value', 0] } } } }, { $sort: { costUsd: -1 } }, { $limit: 50 }]),
  ]);
  return NextResponse.json({ days, generatedAt: new Date(), summary, routes, failures, aiCosts }, { headers });
}
