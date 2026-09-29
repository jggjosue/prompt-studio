import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

type QStashClaims = { aud?: unknown; body?: unknown; exp?: unknown; nbf?: unknown };

const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url');

export function verifyQStashJwt(token: string, body: string, url: string, key: string, now = Date.now()): boolean {
  const segments = token.split('.');
  if (segments.length !== 3) return false;
  const [headerPart, payloadPart, signaturePart] = segments;
  try {
    const header = JSON.parse(base64UrlDecode(headerPart).toString('utf8')) as { alg?: unknown };
    const claims = JSON.parse(base64UrlDecode(payloadPart).toString('utf8')) as QStashClaims;
    if (header.alg !== 'HS256') return false;
    const expected = createHmac('sha256', key).update(`${headerPart}.${payloadPart}`).digest();
    const received = base64UrlDecode(signaturePart);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

    const currentSeconds = Math.floor(now / 1000);
    const tolerance = 5;
    if (typeof claims.exp !== 'number' || claims.exp < currentSeconds - tolerance) return false;
    if (typeof claims.nbf === 'number' && claims.nbf > currentSeconds + tolerance) return false;
    if (claims.aud !== url) return false;
    return claims.body === createHash('sha256').update(body).digest('base64url');
  } catch {
    return false;
  }
}
