import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeTrainingValue, TRAINING_SANITIZER_VERSION } from '../../src/lib/training-sanitizer';

test('redacts common contact PII deterministically', () => {
  const result = sanitizeTrainingValue({ text: 'Contact jane@example.com or +1 (415) 555-0123 from 192.168.1.10' });
  assert.equal(result.accepted, true);
  if (!result.accepted) return;
  const text = (result.value as any).text;
  assert.match(text, /REDACTED_EMAIL/);
  assert.match(text, /REDACTED_PHONE/);
  assert.match(text, /REDACTED_IP/);
  assert.equal(text.includes('jane@example.com'), false);
  assert.equal(result.version, TRAINING_SANITIZER_VERSION);
});

test('rejects recognized credentials without returning them in rejection metadata', () => {
  const secret = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456';
  const result = sanitizeTrainingValue({ message: `token ${secret}` });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.deepEqual(result.reasonCodes, ['secret_detected']);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('rejects credential-shaped fields even when value pattern is unknown', () => {
  const result = sanitizeTrainingValue({ nested: { apiKey: 'vendor-specific-value' } });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.ok(result.reasonCodes.includes('high_risk_pii_detected'));
});

test('rejects oversized JSON before processing', () => {
  const result = sanitizeTrainingValue({ text: 'x'.repeat(300 * 1024) });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.deepEqual(result.reasonCodes, ['payload_too_large']);
});

// Fixtures are assembled at runtime so no real-looking secret sits verbatim in the repo.
const fake = (...parts: string[]) => parts.join('');

test('sanitizer-v2 rejects every high-risk credential family', () => {
  const cases: Array<[string, string]> = [
    ['aws_access_key_id', `key ${fake('AKIA', 'IOSFODNN7EXAMPLE')}`],
    ['aws_secret_access_key', `aws_secret_access_key = ${fake('wJalrXUtnFEMI/K7MDENG/', 'bPxRfiCYEXAMPLEKEY')}`],
    ['private_key', fake('-----BEGIN ', 'OPENSSH PRIVATE KEY-----\nabc')],
    ['stripe_key', fake('sk_', 'live_', '4eC39HqLyjWDarjtT1zdp7dc')],
    ['google_api_key', fake('AIza', 'SyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY')],
    ['slack_token', fake('xox', 'b-', '1234567890-abcdefghij')],
    ['github_token', fake('ghp_', 'a'.repeat(36))],
    ['jwt', fake('eyJhbGciOiJIUzI1NiJ9', '.', 'eyJzdWIiOiIxMjM0NTY3ODkwIn0', '.', 'dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U')],
    ['bearer_token', `Authorization: Bearer ${fake('abcdefghijklmnop', 'qrstuvwxyz012345')}`],
    ['cloudflare_token', `CLOUDFLARE_API_TOKEN=${fake('Ab3dEf6hIj9kLm2nOp5qRs8tUv1wXy4zAb7c')}`],
    ['connection_string_credentials', fake('mongodb+srv://', 'admin:hunter22@', 'cluster0.example.net/db')],
    ['credential_assignment', 'my password: Tr0ub4dor&3xyz'],
  ];
  for (const [kind, text] of cases) {
    const result = sanitizeTrainingValue({ prompt: text });
    assert.equal(result.accepted, false, kind);
    if (result.accepted) continue;
    assert.ok(result.reasonCodes.includes('secret_detected'), kind);
    assert.ok(result.findings.some((finding) => finding.kind === kind), `${kind} reported`);
    assert.equal(JSON.stringify(result).includes(text.slice(-12)), false, `${kind} value never echoed`);
  }
});

test('credential-named fields are rejected regardless of value shape', () => {
  for (const key of ['authorization', 'cookie', 'token', 'client_secret', 'x-api-key']) {
    const result = sanitizeTrainingValue({ headers: { [key]: 'opaque-value' } });
    assert.equal(result.accepted, false, key);
  }
});

test('v1 false positives are gone: ISO dates, UUIDs, hashes and versions survive', () => {
  const text = 'On 2026-10-02 job 3f2c7a1e-9b4d-4c2a-8e6f-1a2b3c4d5e6f hash a3f5c09e81b2 v1.2.3 at 12:30';
  const result = sanitizeTrainingValue({ prompt: text });
  assert.equal(result.accepted, true);
  if (!result.accepted) return;
  assert.equal((result.value as { prompt: string }).prompt, text);
  assert.deepEqual(result.findings, []);
});

test('redacts IPv6 and Luhn-valid card numbers but not arbitrary long numbers', () => {
  const result = sanitizeTrainingValue({ prompt: 'server 2001:db8:85a3::8a2e:370:7334 card 4111 1111 1111 1111 order 1234567890123' });
  assert.equal(result.accepted, true);
  if (!result.accepted) return;
  const prompt = (result.value as { prompt: string }).prompt;
  assert.match(prompt, /\[REDACTED_IP\]/);
  assert.match(prompt, /\[REDACTED_CARD\]/);
  assert.match(prompt, /order 1234567890123/);
  assert.deepEqual(result.findings.map((finding) => finding.kind).sort(), ['ip_address', 'payment_card']);
});

test('findings carry kind and path only', () => {
  const result = sanitizeTrainingValue({ outputs: [{ text: 'mail me: ana@example.com' }] });
  assert.equal(result.accepted, true);
  assert.deepEqual(result.findings, [{ kind: 'email', path: '$.outputs[0].text', action: 'redacted' }]);
});

test('callers can raise the size cap for large artifacts', () => {
  const html = `<html>${'x'.repeat(400 * 1024)}</html>`;
  assert.equal(sanitizeTrainingValue({ html }).accepted, false);
  assert.equal(sanitizeTrainingValue({ html }, { maxBytes: 2 * 1024 * 1024 }).accepted, true);
});
