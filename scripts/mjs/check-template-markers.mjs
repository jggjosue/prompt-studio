#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const forbiddenPatterns = [
  { pattern: /\bKINDE\b/i, label: 'Kinde authentication residue' },
  {
    pattern: /\bVisionary\s+Vault\b/i,
    label: 'Visionary Vault obsolete template identity',
  },
  { pattern: /\bKinde\s+Starter\s+Kit\b/i, label: 'Kinde starter kit identity' },
];

const scanDirectories = ['src', 'public/catalog', 'scripts'];
const scanFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  '.env.example',
  'README.md',
  'docs/README.md',
  'docs/ARCHITECTURE.md',
  'docs/AI_ARCHITECTURE.md',
  'docs/DATABASE.md',
  'docs/SECURITY.md',
  'docs/prd.md',
  'docs/dm.md',
];

const output = execFileSync(
  'git',
  ['ls-files', '--', ...scanDirectories, ...scanFiles],
  { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
);
const files = output.split('\n').filter(Boolean);
const violations = [];

for (const file of files) {
  if (file === 'scripts/mjs/check-template-markers.mjs') continue;

  let contents;
  try {
    contents = readFileSync(path.join(root, file), 'utf8');
  } catch {
    continue;
  }

  contents.split('\n').forEach((line, index) => {
    if (line.includes('does not use Kinde') || line.includes('no utiliza Kinde')) return;

    for (const { pattern, label } of forbiddenPatterns) {
      if (pattern.test(line)) {
        violations.push({ file, line: index + 1, label, snippet: line.trim() });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('\nFound obsolete starter-template markers in active repository files:\n');
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line} - [${violation.label}]`);
    console.error(`    ${violation.snippet}\n`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Template identity check passed (${files.length} active files checked). No obsolete markers found.`,
  );
}
