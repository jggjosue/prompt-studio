#!/usr/bin/env node
/**
 * Adds 5 DevOps web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { devopsPages } from './devops-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, features, chips } = page;
  const featureList = features
    .map(f => `- **${f.title}** (${f.label}): ${f.detail} — ${f.meta}`)
    .join('\n');

  return `Create a single-page dark mode landing for "${brand}", a ${category} DevOps / platform engineering product site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.sans}" (monospace for headings and UI).

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), accent CTA ("Start free" / "Request demo").
2. Hero: integration pill "${page.tagline}", monospace-style headline with one italic/accent keyword, technical subcopy, CTAs ("Start building" + "View docs").
3. Tech stack chips: ${chips.join(', ')}.
4. Features grid (3 cards):
${featureList}
Each card: uppercase label, title, detail, meta line, "Learn more" link. Optional terminal-style decorative line in card header.
5. Stats band: 3 metrics (e.g. "99.99% uptime", "10k+ teams", "< 50ms deploy").
6. Footer: developer-focused signup, GitHub link placeholder, copyright.

DevOps aesthetic: dark UI, terminal hints, grid lines, accent glow on hover, crisp borders. Optional fake CLI snippet in hero. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  return 'IBM+Plex+Mono:wght@400;500;600;700';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<span class="accent-word">$1</span>'
  );
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam(t.sans)}&display=swap`;

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.features
    .map(
      f => `<article class="feature-card">
      <motion class="card-bar"></div>
      <span class="feature-label">${f.label}</span>
      <h3>${f.title}</h3>
      <p class="feature-detail">${f.detail}</p>
      <p class="feature-meta">${f.meta}</p>
      <a href="#" class="learn-link">Learn more →</a>
    </article>`
    )
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.brand} — ${page.category}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <style>
    :root {
      --bg: ${t.bg};
      --text: ${t.text};
      --muted: ${t.muted};
      --accent: ${t.accent};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "${t.sans}", ui-monospace, monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 14px;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image: linear-gradient(color-mix(in srgb, var(--accent) 6%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--accent) 6%, transparent) 1px, transparent 1px);
      background-size: 48px 48px;
      opacity: 0.4;
      pointer-events: none;
    }
    body > * { position: relative; z-index: 1; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .accent-word { color: var(--accent); font-style: italic; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
      position: sticky;
      top: 0;
      z-index: 10;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    }
    nav .brand { font-weight: 700; font-size: 1.1rem; color: var(--accent); }
    nav .links { display: flex; gap: 1.5rem; align-items: center; font-size: 0.85rem; }
    nav .links a:hover { color: var(--accent); }
    .btn-cta {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      background: var(--accent);
      color: var(--bg);
      border: none;
    }
    .hero {
      padding: 3.5rem 1.5rem 2rem;
      max-width: 780px;
      margin: 0 auto;
      text-align: center;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
      color: var(--accent);
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-size: clamp(1.85rem, 4.5vw, 2.75rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }
    .hero .sub { color: var(--muted); max-width: 46ch; margin: 0 auto 1rem; }
    .cli {
      display: inline-block;
      text-align: left;
      font-size: 0.8rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      background: color-mix(in srgb, var(--bg) 50%, #000);
      color: var(--accent);
    }
    .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.7rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      background: var(--accent);
      color: var(--bg);
      border: none;
    }
    .btn-ghost {
      padding: 0.7rem 1.25rem;
      border-radius: 6px;
      border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
      color: var(--accent);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      padding: 1rem 1.5rem 0;
    }
    .chip {
      font-size: 0.75rem;
      padding: 0.3rem 0.65rem;
      border-radius: 4px;
      border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
      color: var(--muted);
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 2.5rem 0 3rem;
    }
    .feature-card {
      padding: 1.25rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
      background: color-mix(in srgb, var(--bg) 80%, #000);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover {
      border-color: var(--accent);
      box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .card-bar {
      height: 3px;
      width: 100%;
      background: var(--accent);
      border-radius: 2px;
      margin-bottom: 1rem;
    }
    .feature-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      color: var(--accent);
      display: block;
      margin-bottom: 0.5rem;
    }
    .feature-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.4rem; }
    .feature-detail { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.35rem; }
    .feature-meta { font-size: 0.8rem; color: var(--text); margin-bottom: 1rem; }
    .learn-link { font-size: 0.8rem; font-weight: 600; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    }
    .stats strong {
      display: block;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .stats span { font-size: 0.8rem; color: var(--muted); }
    footer {
      padding: 2rem 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--muted);
    }
    footer input {
      margin-top: 0.75rem;
      padding: 0.5rem 0.85rem;
      border-radius: 6px;
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      background: color-mix(in srgb, var(--bg) 60%, #000);
      color: var(--text);
      font-family: inherit;
      width: min(300px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-cta) { display: none; }
      .features-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-cta">Start free</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Platform engineering tools built for teams who ship daily.</p>
    <code class="cli">$ ${page.brand.toLowerCase()} deploy --env production ✓</code>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Start building</a>
      <a href="#" class="btn-ghost">View docs</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="features-grid container">
    ${cards}
  </section>
  <section class="stats container">
    <div><strong>99.99%</strong><span>Uptime SLA</span></div>
    <div><strong>10k+</strong><span>Engineering teams</span></div>
    <div><strong>&lt;50ms</strong><span>Pipeline trigger</span></div>
  </section>
  <footer class="container">
    <p>Start free — connect your repo in 2 minutes</p>
    <input type="email" placeholder="you@company.com" aria-label="Email" />
    <p style="margin-top:1rem">© ${new Date().getFullYear()} ${page.brand}. DevOps landing demo.</p>
  </footer>
</body>
</html>`;
}

async function generatePreviews(pages) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.warn('playwright not installed; skipping PNG previews.');
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch();
  } catch (err) {
    console.warn('Could not launch Chromium:', err.message);
    return;
  }

  const context = await browser.newContext({ viewport: { width: 1536, height: 1024 } });

  for (const page of pages) {
    const htmlPath = path.join(webpagesDir, page.slug, 'index.html');
    const pngPath = path.join(
      webpagesDir,
      `placeholder-web-${page.id}-${page.slug}.png`
    );
    const tab = await context.newPage();
    await tab.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await tab.waitForTimeout(500);
    await tab.screenshot({ path: pngPath, type: 'png' });
    await tab.close();
    console.log(`preview: ${path.basename(pngPath)}`);
  }

  await browser.close();
}

async function main() {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const existingIds = new Set((data.webPages || []).map(p => p.id));
  const added = [];

  for (const page of devopsPages) {
    if (existingIds.has(page.id)) {
      console.log(`skip id ${page.id} (already exists)`);
      continue;
    }

    const slugDir = path.join(webpagesDir, page.slug);
    fs.mkdirSync(slugDir, { recursive: true });
    let html = buildHtml(page);
    html = html
      .replace(/<div class="card-bar"><\/motion>/g, '<div class="card-bar"></div>')
      .replace(/<div><strong>/g, '<div><strong>')
      .replace(/<\/motion>/g, '</div>');
    fs.writeFileSync(path.join(slugDir, 'index.html'), html);

    added.push(page);
    console.log(`html: ${page.slug}/index.html`);
  }

  if (added.length === 0) {
    console.log('No new entries to add.');
    return;
  }

  await generatePreviews(added);

  const newEntries = added.map(page => ({
    id: page.id,
    title: page.title,
    description: buildDescription(page),
    imageUrl: `/webpages/placeholder-web-${page.id}-${page.slug}.png`,
    imageHint: page.imageHint,
    demoUrl: `/webpages/${page.slug}/index.html`,
    stack: page.stack,
    tags: page.tags,
    membership: 'Premium',
  }));

  data.webPages.push(...newEntries);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Added ${newEntries.length} entries to web-pages.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
