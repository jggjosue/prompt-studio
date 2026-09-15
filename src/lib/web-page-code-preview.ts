import fs from 'fs';
import path from 'path';

export type CodeLanguage = 'html' | 'css' | 'javascript';
export type CodePreview = { language: CodeLanguage; snippet: string; totalLines: number };

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const PREVIEW_LINES = 14;

function lines(value: string) {
  return value.trim().split(/\r?\n/).filter((line, index, all) => line.trim() || (index > 0 && index < all.length - 1));
}

function preview(language: CodeLanguage, source: string): CodePreview | null {
  const allLines = lines(source);
  if (allLines.length === 0) return null;
  return { language, snippet: allLines.slice(0, PREVIEW_LINES).join('\n'), totalLines: allLines.length };
}

export function getWebPageCodePreview(slug: string): CodePreview[] {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return [];
  const root = path.join(process.cwd(), 'public', 'webpages', slug);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];

  const files = fs.readdirSync(root).filter(name => /\.(html?|css|js)$/i.test(name));
  const read = (name: string) => {
    const filePath = path.join(root, name);
    const stats = fs.statSync(filePath);
    return stats.isFile() && stats.size <= MAX_FILE_BYTES ? fs.readFileSync(filePath, 'utf8') : '';
  };
  const htmlSource = files.filter(name => /\.html?$/i.test(name)).map(read).join('\n');
  const cssSource = [
    ...files.filter(name => /\.css$/i.test(name)).map(read),
    ...Array.from(htmlSource.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi), match => match[1]),
  ].join('\n');
  const jsSource = [
    ...files.filter(name => /\.js$/i.test(name) && name !== 'demo-purchase-button.js').map(read),
    ...Array.from(htmlSource.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi), match => match[1]),
  ].join('\n');
  const cleanHtml = htmlSource
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<style>…</style>')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<script>…</script>');

  return [preview('html', cleanHtml), preview('css', cssSource), preview('javascript', jsSource)]
    .filter((item): item is CodePreview => item !== null);
}
