import 'server-only';
import { createHmac } from 'node:crypto';

/**
 * Pseudonymous, stable group id for a user, used to keep all of a user's
 * examples in the same train/validation/test split without publishing the
 * user id. HMAC-SHA256 with a server-only secret: without the secret the id
 * cannot be linked back to (or recomputed from) a user id.
 *
 * Rotating TRAINING_PSEUDONYM_SECRET changes every group id, so it must stay
 * fixed for the lifetime of a dataset family (it is recorded by fingerprint,
 * never by value, in manifests).
 */
export class TrainingPseudonymError extends Error {
  constructor() {
    super('TRAINING_PSEUDONYM_SECRET_MISSING');
  }
}

export function trainingPseudonymSecret(env: Record<string, string | undefined> = process.env) {
  const secret = env.TRAINING_PSEUDONYM_SECRET?.trim() ?? '';
  if (secret.length < 32) throw new TrainingPseudonymError();
  return secret;
}

export function splitGroupIdForUser(userId: string, secret: string) {
  return `grp_${createHmac('sha256', secret).update(`split-group-v1\u0000${userId}`).digest('hex').slice(0, 32)}`;
}

/** Non-reversible fingerprint of the secret, safe to record in manifests. */
export function pseudonymSecretFingerprint(secret: string) {
  return createHmac('sha256', secret).update('fingerprint').digest('hex').slice(0, 16);
}
