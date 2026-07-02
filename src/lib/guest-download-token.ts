import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

type GuestDownloadPayload = {
  exp: number;
  pageId: string;
  sessionId: string;
};

function getSigningSecret(): string {
  const secret =
    process.env.GUEST_DOWNLOAD_SECRET ??
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      'Missing GUEST_DOWNLOAD_SECRET or STRIPE_WEBHOOK_SECRET environment variable'
    );
  }

  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getSigningSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createGuestDownloadToken(
  pageId: string,
  sessionId: string
): string {
  const payload: GuestDownloadPayload = {
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    pageId,
    sessionId,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyGuestDownloadToken(
  token: string,
  expectedPageId: string
): boolean {
  const [encodedPayload, providedSignature, extra] = token.split('.');
  if (!encodedPayload || !providedSignature || extra) return false;

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<GuestDownloadPayload>;

    return (
      payload.pageId === expectedPageId &&
      typeof payload.sessionId === 'string' &&
      payload.sessionId.startsWith('cs_') &&
      typeof payload.exp === 'number' &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
