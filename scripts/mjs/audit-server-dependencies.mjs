import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const heavyPackages = [
  'genkit',
  '@genkit-ai/google-genai',
  '@aws-sdk/client-s3',
  'mongoose',
  '@opentelemetry/exporter-jaeger',
  '@opentelemetry/sdk-node',
  'sharp',
  'stripe',
  'firebase',
  'firebase-admin',
  'cloudflare',
];

const sourceExtensions = ['.ts', '.tsx', '.js', '.mjs'];
const staticImportRe = /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const dynamicImportRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

async function resolveSource(specifier, importer) {
  if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return null;
  const base = specifier.startsWith('@/')
    ? path.join(srcRoot, specifier.slice(2))
    : path.resolve(path.dirname(importer), specifier);
  const candidates = [
    ...sourceExtensions.map(extension => `${base}${extension}`),
    ...sourceExtensions.map(extension => path.join(base, `index${extension}`)),
    base,
  ];
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next supported source form.
    }
  }
  return null;
}

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

async function importsFor(file) {
  const source = await readFile(file, 'utf8');
  const runtimeSource = source.replace(
    /(?:import|export)\s+type\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?/g,
    ''
  );
  return {
    static: [...runtimeSource.matchAll(staticImportRe)].map(match => match[1]),
    dynamic: [...source.matchAll(dynamicImportRe)].map(match => match[1]),
  };
}

async function traceEntry(entry) {
  const queue = [entry];
  const visited = new Set();
  const eager = new Set();
  const deferred = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const imports = await importsFor(file);
    for (const specifier of imports.static) {
      const dependency = await resolveSource(specifier, file);
      if (dependency) queue.push(dependency);
      else {
        const packageRoot = packageName(specifier);
        if (heavyPackages.includes(packageRoot)) eager.add(packageRoot);
      }
    }
    for (const specifier of imports.dynamic) {
      const packageRoot = packageName(specifier);
      if (heavyPackages.includes(packageRoot)) deferred.add(packageRoot);
      const dependency = await resolveSource(specifier, file);
      if (dependency) {
        const nested = await importsFor(dependency);
        for (const child of [...nested.static, ...nested.dynamic]) {
          const childPackage = packageName(child);
          if (heavyPackages.includes(childPackage)) deferred.add(childPackage);
        }
      }
    }
  }
  return { eager: [...eager].sort(), deferred: [...deferred].sort() };
}

const allSource = await walk(path.join(srcRoot, 'app'));
const entries = allSource.filter(file => file.endsWith('/route.ts'));
entries.push(path.join(srcRoot, 'app/actions.ts'));
const report = [];
for (const entry of entries.sort()) {
  const traced = await traceEntry(entry);
  if (traced.eager.length || traced.deferred.length) {
    report.push({ entry: path.relative(root, entry), ...traced });
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ heavyPackages, entries: report }, null, 2));
} else {
  console.log('Vercel server dependency audit (static source graph)');
  for (const item of report) {
    console.log(`\n${item.entry}`);
    console.log(`  eager: ${item.eager.join(', ') || '-'}`);
    console.log(`  deferred: ${item.deferred.join(', ') || '-'}`);
  }
}
