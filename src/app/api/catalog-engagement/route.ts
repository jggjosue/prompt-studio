import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isCatalogContentKey, type CatalogKind } from '@/lib/catalog-ranking';
import connectToDatabase from '@/lib/mongoose';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import CatalogEngagement from '@/models/CatalogEngagement';
import CatalogLike from '@/models/CatalogLike';
import ProductReview from '@/models/ProductReview';

const headers = { 'Cache-Control': 'private, no-store' };
const VALID_KINDS = new Set<CatalogKind>(['image', 'video', 'web', 'animation']);
const ANON_COOKIE = 'ps_catalog_visitor';

function anonymousId(request: Request): string | null {
  const cookie = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${ANON_COOKIE}=([^;]+)`))?.[1];
  return cookie && /^[a-z0-9-]{16,80}$/i.test(cookie) ? `anon:${cookie}` : null;
}

function withAnonymousCookie(response: NextResponse, id: string | null) {
  if (id?.startsWith('anon:')) response.cookies.set(ANON_COOKIE, id.slice(5), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 365, path: '/' });
  return response;
}

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const visitorId = userId ?? anonymousId(request);
  const keys = [...new Set((new URL(request.url).searchParams.get('keys') ?? '').split(','))]
    .filter(isCatalogContentKey)
    .slice(0, 100);
  if (!keys.length) return NextResponse.json({ metrics: [] }, { headers });

  try {
    await connectToDatabase();
    const [engagements, ownLikes, likeTotals] = await Promise.all([
      CatalogEngagement.find({ contentKey: { $in: keys } })
        .select('contentKey views clicks likes reviewProductId')
        .lean(),
      visitorId
        ? CatalogLike.find({ contentKey: { $in: keys }, userId: visitorId }).select('contentKey').lean()
        : Promise.resolve([]),
      CatalogLike.aggregate([
        { $match: { contentKey: { $in: keys } } },
        { $group: { _id: '$contentKey', likes: { $sum: 1 } } },
      ]),
    ]);
    const reviewIds = engagements.map(item => item.reviewProductId).filter(Boolean);
    const ratings = reviewIds.length ? await ProductReview.aggregate([
      { $match: { productId: { $in: reviewIds }, status: 'published' } },
      { $group: { _id: '$productId', rating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } },
    ]) : [];
    const ratingById = new Map(ratings.map(item => [String(item._id), item]));
    const likesByKey = new Map(likeTotals.map(item => [String(item._id), Number(item.likes)]));
    const liked = new Set(ownLikes.map(item => item.contentKey));
    const byKey = new Map(engagements.map(item => [item.contentKey, item]));

    return NextResponse.json({
      metrics: keys.map(contentKey => {
        const item = byKey.get(contentKey);
        const rating = item?.reviewProductId ? ratingById.get(item.reviewProductId) : undefined;
        return {
          contentKey,
          views: item?.views ?? 0,
          clicks: item?.clicks ?? 0,
          likes: likesByKey.get(contentKey) ?? 0,
          rating: rating?.rating ?? 0,
          ratingCount: rating?.ratingCount ?? 0,
          likedByMe: liked.has(contentKey),
        };
      }),
    }, { headers });
  } catch {
    // El catálogo conserva su orden editorial si la telemetría no está disponible.
    return NextResponse.json({ metrics: [], available: false }, { headers });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = clean(body?.action, 20);
  const contentKey = clean(body?.contentKey, 200);
  const kind = clean(body?.kind, 20) as CatalogKind;
  const contentId = clean(body?.contentId, 180);
  const reviewProductId = clean(body?.reviewProductId, 200);

  if (!['view', 'click', 'like', 'unlike'].includes(action)
    || !isCatalogContentKey(contentKey)
    || !VALID_KINDS.has(kind)
    || !contentKey.startsWith(`${kind}:`)
    || !contentId) {
    return NextResponse.json({ error: 'Evento de catálogo inválido.' }, { status: 400, headers });
  }

  const { userId } = await auth();
  // Visitantes reciben un identificador aleatorio HttpOnly: permite deshacer
  // su voto sin asociar correo, cuenta ni otros datos personales.
  const visitorId = userId ?? anonymousId(request) ?? `anon:${crypto.randomUUID()}`;

  const subject = userId || visitorId || clientIp(request);
  const quota = await rateLimit({
    key: `catalog-engagement:${action}:${subject}`,
    limit: action === 'view' ? 120 : action === 'click' ? 60 : 30,
    windowMs: 60_000,
  });
  if (!quota.ok) return tooManyRequests(quota);

  await connectToDatabase();
  const identity = { contentKey, kind, contentId, ...(reviewProductId ? { reviewProductId } : {}) };
  const now = new Date();

  if (action === 'view' || action === 'click') {
    const field = action === 'view' ? 'views' : 'clicks';
    const item = await CatalogEngagement.findOneAndUpdate(
      { contentKey },
      { $set: { ...identity, updatedAt: now }, $setOnInsert: { createdAt: now }, $inc: { [field]: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('views clicks likes').lean();
    return NextResponse.json(item, { headers });
  }

  if (action === 'like') {
    try {
      const inserted = await CatalogLike.updateOne(
        { contentKey, userId: visitorId },
        { $setOnInsert: { contentKey, userId: visitorId, createdAt: now } },
        { upsert: true }
      );
      if (inserted.upsertedCount > 0) {
        await CatalogEngagement.updateOne(
          { contentKey },
          { $set: { ...identity, updatedAt: now }, $setOnInsert: { createdAt: now }, $inc: { likes: 1 } },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error;
    }
  } else {
    const deleted = await CatalogLike.deleteOne({ contentKey, userId: visitorId });
    if (deleted.deletedCount > 0) {
      await CatalogEngagement.updateOne(
        { contentKey },
        [{ $set: { likes: { $max: [0, { $subtract: [{ $ifNull: ['$likes', 0] }, 1] }] }, updatedAt: now } }]
      );
    }
  }

  const [item, likes] = await Promise.all([
    CatalogEngagement.findOne({ contentKey }).select('views clicks').lean(),
    CatalogLike.countDocuments({ contentKey }),
  ]);
  return withAnonymousCookie(NextResponse.json({
    views: item?.views ?? 0,
    clicks: item?.clicks ?? 0,
    likes,
    likedByMe: action === 'like',
  }, { headers }), userId ? null : visitorId);
}
