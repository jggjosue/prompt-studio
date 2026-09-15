#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const errors = [];

function filesUnder(dir, predicate = () => true) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  const walk = current => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (predicate(path)) out.push(relative(root, path));
    }
  };
  walk(abs);
  return out;
}

const source = filesUnder('src', p => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p));
const docs = filesUnder('docs', p => /\.(md|mdx)$/.test(p));

if (source.length === 0) errors.push('No readable application source files were found under src/.');
if (docs.length === 0) errors.push('No readable documentation files were found under docs/.');

const lcovPath = join(root, 'coverage', 'lcov.info');
if (!existsSync(lcovPath) || statSync(lcovPath).size === 0) {
  errors.push('coverage/lcov.info is missing or empty. Run npm run test:coverage before packaging the snapshot.');
} else {
  const lcov = readFileSync(lcovPath, 'utf8');
  for (const marker of ['SF:', 'LF:', 'LH:']) {
    if (!lcov.includes(marker)) errors.push(`coverage/lcov.info does not contain required ${marker} records.`);
  }
}

console.log(`Snapshot preflight: ${source.length} source files, ${docs.length} documentation files.`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log('Snapshot inputs are readable and coverage data is present.');
