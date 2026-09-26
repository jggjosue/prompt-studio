import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';

export const NEWSLETTER_CONFIRMATION_TTL_MS = 48 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.NEWSLETTER_CONFIRMATION_SECRET?.trim();
  if (!value) throw new Error('Missing NEWSLETTER_CONFIRMATION_SECRET');
  return value;
}

function digest(token: string): Buffer {
  return createHmac('sha256', secret()).update(token).digest();
}

export function createNewsletterConfirmation(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: digest(token).toString('hex'),
    expiresAt: new Date(Date.now() + NEWSLETTER_CONFIRMATION_TTL_MS),
  };
}

export function newsletterTokenHash(token: string): string | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return digest(token).toString('hex');
}
