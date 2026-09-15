import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

type DownloadTokenPayload = { purchaseId: string; userId: string; exp: number; nonce: string };

function secret(): string {
  const value = process.env.PURCHASE_DOWNLOAD_SECRET ?? process.env.GUEST_DOWNLOAD_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) throw new Error('Missing PURCHASE_DOWNLOAD_SECRET');
  return value;
}

function signature(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createPurchaseDownloadToken(purchaseId: string, userId: string): string {
  const payload: DownloadTokenPayload = { purchaseId, userId, exp: Math.floor(Date.now() / 1000) + 10 * 60, nonce: randomUUID() };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signature(encoded)}`;
}

export function verifyPurchaseDownloadToken(token: string): DownloadTokenPayload | null {
  const [encoded, provided, extra] = token.split('.');
  if (!encoded || !provided || extra) return null;
  const expected = Buffer.from(signature(encoded));
  const received = Buffer.from(provided);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as DownloadTokenPayload;
    if (!payload.purchaseId || !payload.userId || !payload.nonce || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
