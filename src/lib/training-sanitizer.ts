/**
 * PII and secret sanitization for training content.
 *
 * Policy:
 * - Credentials and secrets reject the whole example. A redacted secret still
 *   proves the content handled credentials, and partial redaction can leak.
 * - Personal data that is not a credential (email, phone, IP, card number) is
 *   redacted with a typed placeholder.
 * - Findings record the kind and JSON path only. Matched values are never
 *   stored, logged or returned.
 *
 * sanitizer-v2 (this version) adds JWT/Bearer, Stripe, Google, Slack, GitHub,
 * Cloudflare and AWS secret detection, connection strings with credentials,
 * IPv6, Luhn-checked card numbers, and fixes the v1 phone pattern that matched
 * ISO dates and long digit runs inside identifiers.
 */
export const TRAINING_SANITIZER_VERSION = 'sanitizer-v2';

export const TRAINING_REJECTION_REASONS = [
  'secret_detected',
  'high_risk_pii_detected',
  'malformed_record',
  'payload_too_large',
] as const;
export type TrainingRejectionReason = (typeof TRAINING_REJECTION_REASONS)[number];

export type SanitizerFinding = { kind: string; path: string; action: 'redacted' | 'rejected' };
export type SanitizationResult =
  | { accepted: true; value: unknown; findings: SanitizerFinding[]; version: typeof TRAINING_SANITIZER_VERSION }
  | { accepted: false; reasonCodes: TrainingRejectionReason[]; findings: SanitizerFinding[]; version: typeof TRAINING_SANITIZER_VERSION };

/** Secrets: any match rejects the example. Order matters only for the reported kind. */
const SECRET_PATTERNS: Array<[kind: string, pattern: RegExp]> = [
  ['private_key', /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/],
  ['aws_access_key_id', /\b(?:AKIA|ASIA|AGPA|AIDA|AROA|ANPA)[A-Z0-9]{16}\b/],
  ['aws_secret_access_key', /aws.{0,24}(?:secret|session).{0,24}[:=]\s*["']?[A-Za-z0-9/+=]{40}\b/i],
  ['anthropic_key', /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ['openai_key', /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}\b/],
  ['stripe_key', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b|\bwhsec_[A-Za-z0-9]{24,}\b/],
  ['google_api_key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['slack_token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['github_token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})\b/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['bearer_token', /\bbearer\s+[A-Za-z0-9._~+/-]{20,}=*/i],
  ['basic_auth_header', /\bauthorization\s*[:=]\s*basic\s+[A-Za-z0-9+/]{12,}=*/i],
  ['cloudflare_token', /(?:cloudflare|cf)[_-]?(?:api[_-]?)?(?:token|key|secret)\s*[:=]\s*["']?[A-Za-z0-9_-]{32,}/i],
  ['r2_secret', /r2.{0,24}secret.{0,24}[:=]\s*["']?[a-f0-9]{64}\b/i],
  ['connection_string_credentials', /\b[a-z][a-z0-9+.-]{1,20}:\/\/[^\s:/@]{1,64}:[^\s@/]{3,128}@[^\s/]+/i],
  ['credential_assignment', /\b(?:password|passwd|pwd|passphrase|secret|client[_-]?secret|api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token)\b\s*[:=]\s*["']?[^\s"',;]{8,}/i],
];

/** Object keys whose (non-empty) values are credentials by definition. */
const CREDENTIAL_KEY = /^(?:password|passwd|pwd|passphrase|secret|client_?secret|api_?key|apikey|access_?token|refresh_?token|auth_?token|token|private_?key|authorization|cookie|set-cookie|credentials?|session_?token|x-api-key)$/i;

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
// Grouped digits with separators; never matches ISO dates (2026-10-02) or bare digit runs.
const PHONE = /(?<![\w./-])(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d{2,4}[\s.-]\d{3,4}(?:[\s.-]?\d{3,4})?(?![\w/-])/g;
const IPV4 = /(?<![\w.])(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)(?![\w.])/g;
const IPV6 = /(?<![\w:])(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}(?![\w:])|(?<![\w:])(?:[A-F0-9]{1,4}:){1,6}:(?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4}){0,5})?(?![\w:])/gi;
const CARD_CANDIDATE = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g;

/** Default cap; callers handling large artifacts (generated HTML) pass a higher maxBytes. */
const MAX_JSON_BYTES = 256 * 1024;

function luhn(digits: string) {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function sanitizeString(value: string, path: string, findings: SanitizerFinding[]): { rejected: boolean; value: string } {
  for (const [kind, pattern] of SECRET_PATTERNS) {
    if (pattern.test(value)) {
      findings.push({ kind, path, action: 'rejected' });
      return { rejected: true, value: '' };
    }
  }
  let next = value;
  const redact = (pattern: RegExp, kind: string, replacement: string, accept: (match: string) => boolean = () => true) => {
    let hit = false;
    next = next.replace(pattern, (match) => {
      if (!accept(match)) return match;
      hit = true;
      return replacement;
    });
    if (hit) findings.push({ kind, path, action: 'redacted' });
  };
  redact(EMAIL, 'email', '[REDACTED_EMAIL]');
  redact(CARD_CANDIDATE, 'payment_card', '[REDACTED_CARD]', (match) => {
    const digits = match.replace(/\D/g, '');
    return digits.length >= 13 && digits.length <= 19 && luhn(digits);
  });
  redact(IPV6, 'ip_address', '[REDACTED_IP]', (match) => match.split(':').length >= 3 && /[a-f0-9]/i.test(match));
  redact(IPV4, 'ip_address', '[REDACTED_IP]');
  redact(PHONE, 'phone', '[REDACTED_PHONE]', (match) => match.replace(/\D/g, '').length >= 8);
  return { rejected: false, value: next };
}

export function sanitizeTrainingValue(input: unknown, options: { maxBytes?: number } = {}): SanitizationResult {
  let encoded: string | undefined;
  try {
    encoded = JSON.stringify(input);
  } catch {
    return { accepted: false, reasonCodes: ['malformed_record'], findings: [], version: TRAINING_SANITIZER_VERSION };
  }
  if (encoded === undefined) return { accepted: false, reasonCodes: ['malformed_record'], findings: [], version: TRAINING_SANITIZER_VERSION };
  if (new TextEncoder().encode(encoded).byteLength > (options.maxBytes ?? MAX_JSON_BYTES)) {
    return { accepted: false, reasonCodes: ['payload_too_large'], findings: [], version: TRAINING_SANITIZER_VERSION };
  }

  const findings: SanitizerFinding[] = [];
  let secret = false;
  let credentialField = false;
  const walk = (value: unknown, path: string): unknown => {
    if (typeof value === 'string') {
      const result = sanitizeString(value, path, findings);
      secret ||= result.rejected;
      return result.value;
    }
    if (Array.isArray(value)) return value.map((item, index) => walk(item, `${path}[${index}]`));
    if (value && typeof value === 'object') {
      const output: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const childPath = `${path}.${key}`;
        if (CREDENTIAL_KEY.test(key) && child != null && String(child).trim() !== '') {
          credentialField = true;
          findings.push({ kind: 'credential_field', path: childPath, action: 'rejected' });
          continue;
        }
        output[key] = walk(child, childPath);
      }
      return output;
    }
    return value;
  };
  const value = walk(input, '$');
  const reasons: TrainingRejectionReason[] = [];
  if (secret) reasons.push('secret_detected');
  if (credentialField) reasons.push('high_risk_pii_detected');
  return reasons.length
    ? { accepted: false, reasonCodes: reasons, findings, version: TRAINING_SANITIZER_VERSION }
    : { accepted: true, value, findings, version: TRAINING_SANITIZER_VERSION };
}
