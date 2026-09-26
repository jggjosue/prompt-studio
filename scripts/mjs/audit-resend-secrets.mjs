import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.startsWith('docs/historial/'))
  .filter((file) => /(?:^|\/)(?:[^/]+\.(?:[cm]?[jt]sx?|json|ya?ml|md|txt|env|example)|Dockerfile)$/.test(file));

const findings = [];
const secretPattern = /\bre_[A-Za-z0-9_-]{20,}\b/g;
const publicVariablePattern = /\bNEXT_PUBLIC_RESEND_[A-Z0-9_]+\b/g;
const emailLogPattern = /console\.(?:log|error|warn)\([^\n]*(?:user\.email|\$\{email\})/g;

for (const file of tracked) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const checks = [
    ['Resend API key literal', secretPattern],
    ['public Resend environment variable', publicVariablePattern],
  ];
  if (file.startsWith('src/') || file.startsWith('scripts/')) {
    checks.push(['email address written to logs', emailLogPattern]);
  }

  for (const [label, pattern] of checks) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) findings.push(`${file}: ${label}`);
  }
}

const serverModule = readFileSync('src/lib/resend.ts', 'utf8');
if (!serverModule.startsWith("import 'server-only';")) {
  findings.push('src/lib/resend.ts: missing server-only boundary');
}

if (findings.length) {
  console.error('Resend secret audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Resend secret audit passed (${tracked.length} tracked files checked).`);
}
