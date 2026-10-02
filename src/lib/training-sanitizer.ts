export const TRAINING_SANITIZER_VERSION = 'sanitizer-v1';

export const TRAINING_REJECTION_REASONS = [
  'secret_detected',
  'high_risk_pii_detected',
  'malformed_record',
  'payload_too_large',
] as const;
export type TrainingRejectionReason = (typeof TRAINING_REJECTION_REASONS)[number];

type Finding = { kind: string; path: string; action: 'redacted' | 'rejected' };
export type SanitizationResult =
  | { accepted: true; value: unknown; findings: Finding[]; version: typeof TRAINING_SANITIZER_VERSION }
  | { accepted: false; reasonCodes: TrainingRejectionReason[]; findings: Finding[]; version: typeof TRAINING_SANITIZER_VERSION };

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /(?<!\d)(?:\+?\d[\d .()-]{7,}\d)(?!\d)/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const SECRET_PATTERNS = [
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/g,
];
const HIGH_RISK_KEY = /(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key)/i;
const MAX_JSON_BYTES = 256 * 1024;

function redactString(value: string, path: string, findings: Finding[]) {
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(value)) {
      findings.push({ kind: 'secret', path, action: 'rejected' });
      return { rejected: true, value };
    }
  }
  let next = value;
  const replacements: Array<[RegExp, string, string]> = [
    [EMAIL, '[REDACTED_EMAIL]', 'email'],
    [PHONE, '[REDACTED_PHONE]', 'phone'],
    [IPV4, '[REDACTED_IP]', 'ip_address'],
  ];
  for (const [pattern, replacement, kind] of replacements) {
    pattern.lastIndex = 0;
    if (pattern.test(next)) {
      findings.push({ kind, path, action: 'redacted' });
      pattern.lastIndex = 0;
      next = next.replace(pattern, replacement);
    }
  }
  return { rejected: false, value: next };
}

export function sanitizeTrainingValue(input: unknown): SanitizationResult {
  let encoded: string;
  try { encoded = JSON.stringify(input); } catch { return { accepted: false, reasonCodes: ['malformed_record'], findings: [], version: TRAINING_SANITIZER_VERSION }; }
  if (encoded === undefined) return { accepted: false, reasonCodes: ['malformed_record'], findings: [], version: TRAINING_SANITIZER_VERSION };
  if (Buffer.byteLength(encoded, 'utf8') > MAX_JSON_BYTES) return { accepted: false, reasonCodes: ['payload_too_large'], findings: [], version: TRAINING_SANITIZER_VERSION };

  const findings: Finding[] = [];
  let secret = false;
  let highRisk = false;
  const walk = (value: unknown, path: string): unknown => {
    if (typeof value === 'string') {
      const result = redactString(value, path, findings);
      secret ||= result.rejected;
      return result.value;
    }
    if (Array.isArray(value)) return value.map((item, i) => walk(item, `${path}[${i}]`));
    if (value && typeof value === 'object') {
      const output: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const childPath = path ? `${path}.${key}` : key;
        if (HIGH_RISK_KEY.test(key) && child != null && String(child).trim() !== '') {
          highRisk = true;
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
  if (highRisk) reasons.push('high_risk_pii_detected');
  return reasons.length
    ? { accepted: false, reasonCodes: reasons, findings, version: TRAINING_SANITIZER_VERSION }
    : { accepted: true, value, findings, version: TRAINING_SANITIZER_VERSION };
}
