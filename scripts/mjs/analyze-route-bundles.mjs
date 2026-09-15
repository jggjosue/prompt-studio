import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
const exists = async file => stat(file).then(value => value.isFile()).catch(() => false);
async function resolveLocal(specifier, from) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  const base = specifier.startsWith('@/') ? path.join(src, specifier.slice(2)) : path.resolve(path.dirname(from), specifier);
  for (const candidate of [base, ...extensions.map(ext => base + ext), ...extensions.map(ext => path.join(base, `index${ext}`))]) if (await exists(candidate)) return candidate;
  return null;
}
const cache = new Map();
async function inspect(file) {
  if (cache.has(file)) return cache.get(file);
  const source = await readFile(file, 'utf8');
  const result = { file, bytes: Buffer.byteLength(source), client: /^\s*['"]use client['"];/m.test(source), locals: [], packages: [] };
  cache.set(file, result);
  // Excluye imports exclusivamente de tipos y chunks cargados con import().
  const matches = source.matchAll(/(?:import\s+(?!type\b)(?:[^'"]+?\s+from\s+)?|export\s+(?!type\b)[^'"]+?\s+from\s+)['"]([^'"]+)['"]/g);
  for (const match of matches) {
    const target = await resolveLocal(match[1], file);
    if (target) result.locals.push(target); else if (!match[1].startsWith('.')) result.packages.push(match[1]);
  }
  return result;
}
async function walk(dir) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await walk(full)); else output.push(full);
  }
  return output;
}
async function routeReport(entry) {
  const seen = new Set(), clientFiles = new Set(), packages = new Set();
  async function visit(file, clientBoundary = false) {
    if (seen.has(`${file}:${clientBoundary}`)) return;
    seen.add(`${file}:${clientBoundary}`);
    const moduleEntry = await inspect(file), isClient = clientBoundary || moduleEntry.client;
    if (isClient) clientFiles.add(file);
    if (isClient) moduleEntry.packages.forEach(pkg => packages.add(pkg.split('/')[0].startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]));
    await Promise.all(moduleEntry.locals.map(child => visit(child, isClient)));
  }
  await visit(entry);
  let clientSourceBytes = 0;
  for (const file of clientFiles) clientSourceBytes += (await inspect(file)).bytes;
  return { route: '/' + path.relative(path.join(src, 'app'), path.dirname(entry)).replaceAll(path.sep, '/').replace(/\/page$/, ''), clientSourceBytes, clientModules: clientFiles.size, packages: [...packages].sort() };
}

const pages = (await walk(path.join(src, 'app'))).filter(file => /\/page\.(?:ts|tsx|js|jsx)$/.test(file));
const routes = (await Promise.all(pages.map(routeReport))).sort((a, b) => b.clientSourceBytes - a.clientSourceBytes);
const packageUsage = new Map();
for (const route of routes) for (const dependency of route.packages) packageUsage.set(dependency, (packageUsage.get(dependency) ?? 0) + 1);
const report = { generatedAt: new Date().toISOString(), note: 'Source-level estimate. Run a production Next.js build for compressed chunk sizes.', routes, packageUsage: Object.fromEntries([...packageUsage].sort((a, b) => b[1] - a[1])) };
await mkdir(path.join(root, 'reports'), { recursive: true });
await writeFile(path.join(root, 'reports/route-bundle-analysis.json'), JSON.stringify(report, null, 2));
console.table(routes.slice(0, 20).map(item => ({ route: item.route, clientKB: (item.clientSourceBytes / 1024).toFixed(1), modules: item.clientModules, packages: item.packages.length })));
