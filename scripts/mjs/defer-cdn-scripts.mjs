import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');

const SCRIPT_PATTERNS = [
  /<script\s+src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[^"]+"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
  /<script\s+src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/[^"]+"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
  /<script\s+src="https:\/\/cdn\.jsdelivr\.net\/(?:gh|npm)\/[^"]+"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
  /<script\s+src="https:\/\/unpkg\.com\/[^"]+"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
  /<script\s+src="https:\/\/unpkg\.com\/lucide@latest"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
  /<script\s+src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]+"(?![^>]*\bdefer\b)([^>]*)><\/script>/g,
];

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !fullPath.endsWith('.html')) continue;
    let source = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    for (const pattern of SCRIPT_PATTERNS) {
      source = source.replace(pattern, match => {
        if (match.includes(' defer')) return match;
        changed = true;
        return match.replace(/<script\s+/, '<script defer ');
      });
    }
    if (changed) {
      fs.writeFileSync(fullPath, source);
    }
  }
}

walk(webpagesDir);
//console.log('Deferred eligible CDN scripts in public/webpages.');

