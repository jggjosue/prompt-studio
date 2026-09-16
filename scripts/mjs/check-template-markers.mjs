#!/usr/bin/env node
/**
 * Verifies that obsolete starter-template identity and boilerplate markers
 * (e.g. Kinde starter kit, Visionary Vault) are not reintroduced into active
 * product source code, configuration, or active documentation.
 *
 * Usage:
 *   node scripts/mjs/check-template-markers.mjs
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();

// Prohibited terms in active source, configuration, and product code
const FORBIDDEN_PATTERNS = [
  { pattern: /\bKINDE\b/i, label: 'Kinde authentication residue' },
  { pattern: /\bVisionary\s+Vault\b/i, label: 'Visionary Vault obsolete template identity' },
  { pattern: /\bKinde\s+Starter\s+Kit\b/i, label: 'Kinde starter kit identity' },
];

// Paths scanned: active product source, configuration, components, and primary documentation
const SCAN_DIRS = [
  'src',
  'public/catalog',
  'scripts',
];

const SCAN_FILES = [
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

function getTrackedFiles() {
  try {
    const stdout = execFileSync('git', ['ls-files', ...SCAN_DIRS, ...SCAN_FILES], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    return stdout.split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    console.error('Failed to list git tracked files:', err.message);
    process.exit(1);
  }
}

import { readFileSync } from 'node:fs';

const files = getTrackedFiles();
const violations = [];

for (const file of files) {
  // Allow check-template-markers.mjs itself to reference the patterns
  if (file === 'scripts/mjs/check-template-markers.mjs') continue;

  let content;
  try {
    content = readFileSync(path.join(root, file), 'utf8');
  } catch {
    continue; // binary or unreadable file
  }

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Exempt legitimate negative assertions, e.g. "It does not use Kinde."
    if (line.includes('does not use Kinde') || line.includes('no utiliza Kinde')) {
      return;
    }

    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file,
          line: index + 1,
          label,
          snippet: line.trim(),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('\n❌ Found obsolete starter-template markers in active repository files:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} - [${v.label}]`);
    console.error(`    ${v.snippet}\n`);
  }
  process.exit(1);
}

console.log(`✅ Template identity check passed (${files.length} active files checked). No obsolete markers found.`);
