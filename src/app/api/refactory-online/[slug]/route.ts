import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const COMPONENT_FILES = ['index.html', 'styles.css', 'script.js'] as const;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

type Bundle = {
  slug: string;
  html: string;
  css: string | null;
  js: string | null;
  components: string[];
};

function readDemoBundle(slug: string): Bundle | null {
  if (!SLUG_RE.test(slug) || slug === 'refactory-online') {
    return null;
  }

  const dir = path.join(process.cwd(), 'public/webpages', slug);
  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const components: string[] = [];
  let html = '';
  let css: string | null = null;
  let js: string | null = null;

  for (const file of COMPONENT_FILES) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    components.push(file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (file === 'index.html') html = content;
    if (file === 'styles.css') css = content;
    if (file === 'script.js') js = content;
  }

  return { slug, html, css, js, components };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const bundle = readDemoBundle(slug);

  if (!bundle) {
    return NextResponse.json(
      { error: `Demo no encontrada: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json(bundle, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}
