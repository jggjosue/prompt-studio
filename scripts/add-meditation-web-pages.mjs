#!/usr/bin/env node
/**
 * Adds 5 meditation web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { meditationPages } from './meditation-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, sessions, chips, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const sessionList = sessions
    .map(s => `- **${s.title}** (${s.label}): ${s.detail} — ${s.meta}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a ${category} wellness site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.sans}"${theme.serif ? ` + "${theme.serif}" for soft headlines` : ''} (light/medium weights, calm spacing).

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), soft rounded CTA ("Start free" / "Book retreat").
2. Hero: pill "${page.tagline}", gentle headline with one italic keyword, calming subcopy, CTAs ("Begin session" + "Explore library").
3. Practice chips: ${chips.join(', ')}.
4. Sessions grid (3 cards):
${sessionList}
Each card: label, title, duration/detail, meta, "Start" link. Soft rounded cards, plenty of padding.
5. Stats band: 3 calm metrics (e.g. "500+ sessions", "2M minutes", "Certified guides").
6. Footer: peaceful signup line, email input, copyright.

Meditation aesthetic: soft gradients, rounded corners (16–24px), low contrast borders, airy whitespace, no harsh shadows. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    Inter: 'Inter:wght@300;400;500;600',
    Lora: 'Lora:ital,wght@0,400;0,500;1,400',
  };
  return map[name] || 'Inter:wght@300;400;500;600';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent);font-weight:500">$1</em>'
  );
  const headlineFont = t.serif || t.sans;
  const fonts = t.serif
    ? `${fontParam(t.serif)}&family=${fontParam(t.sans)}`
    : fontParam(t.sans);
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
  const btnStyle = page.dark
    ? 'background:var(--accent);color:var(--bg);'
    : 'background:var(--accent);color:#fff;';

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.sessions
    .map(
      s => `<article class="session-card">
      <span class="session-label">${s.label}</span>
      <h3>${s.title}</h3>
      <p class="session-detail">${s.detail}</p>
      <p class="session-meta">${s.meta}</p>
      <a href="#" class="start-link">Start →</a>
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
      font-family: "${t.sans}", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      font-size: 15px;
      font-weight: 400;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 70% 45% at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent);
      pointer-events: none;
    }
    body > * { position: relative; z-index: 1; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 1.5rem; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.5rem;
      max-width: 1040px;
      margin: 0 auto;
      position: sticky;
      top: 0;
      z-index: 10;
      background: color-mix(in srgb, var(--bg) 90%, transparent);
      backdrop-filter: blur(12px);
    }
    nav .brand {
      font-family: "${headlineFont}", serif;
      font-weight: 500;
      font-size: 1.15rem;
      letter-spacing: -0.01em;
    }
    nav .links { display: flex; gap: 1.5rem; align-items: center; font-size: 0.9rem; font-weight: 500; }
    nav .links a:hover { color: var(--accent); }
    .btn-start {
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.875rem;
      ${btnStyle}
      border: none;
    }
    .hero {
      padding: 4rem 1.5rem 2.5rem;
      max-width: 640px;
      margin: 0 auto;
      text-align: center;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent);
      margin-bottom: 1.5rem;
    }
    .hero h1 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: clamp(2rem, 4.5vw, 2.85rem);
      font-weight: 400;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }
    .hero .sub { color: var(--muted); max-width: 40ch; margin: 0 auto 1.75rem; font-size: 1.05rem; }
    .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.85rem 1.5rem;
      border-radius: 999px;
      font-weight: 600;
      ${btnStyle}
      border: none;
    }
    .btn-ghost {
      padding: 0.85rem 1.5rem;
      border-radius: 999px;
      font-weight: 500;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
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
      font-size: 0.8rem;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--text);
    }
    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding: 2.5rem 0 3rem;
    }
    .session-card {
      padding: 1.75rem 1.5rem;
      border-radius: 20px;
      border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
      background: color-mix(in srgb, var(--bg) 85%, #fff 15%);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .session-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 48px color-mix(in srgb, var(--accent) 12%, transparent);
    }
    .session-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: var(--accent);
      margin-bottom: 0.65rem;
      display: block;
    }
    .session-card h3 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .session-detail { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.35rem; }
    .session-meta { font-size: 0.85rem; margin-bottom: 1.25rem; }
    .start-link { font-size: 0.9rem; font-weight: 600; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      padding: 2.5rem 0;
      border-top: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
    }
    .stats strong {
      display: block;
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.75rem;
      font-weight: 500;
      color: var(--accent);
      margin-bottom: 0.35rem;
    }
    .stats span { font-size: 0.85rem; color: var(--muted); }
    footer {
      padding: 2.5rem 1.5rem 3rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--muted);
    }
    footer input {
      margin-top: 0.85rem;
      padding: 0.6rem 1.1rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      background: color-mix(in srgb, var(--bg) 80%, #fff);
      color: var(--text);
      width: min(280px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-start) { display: none; }
      .sessions-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-start">Start free</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Gentle practices for calmer days and deeper rest.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Begin session</a>
      <a href="#" class="btn-ghost">Explore library</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="sessions-grid container">
    ${cards}
  </section>
  <section class="stats container">
    <div><strong>500+</strong><span>Guided sessions</span></div>
    <div><strong>2M</strong><span>Minutes of calm</span></div>
    <div><strong>40+</strong><span>Expert teachers</span></div>
  </section>
  <footer class="container">
    <p>Begin your practice — free for 14 days</p>
    <input type="email" placeholder="your@email.com" aria-label="Email" />
    <p style="margin-top:1.25rem">© ${new Date().getFullYear()} ${page.brand}. Meditation landing demo.</p>
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

  for (const page of meditationPages) {
    if (existingIds.has(page.id)) {
      console.log(`skip id ${page.id} (already exists)`);
      continue;
    }

    const slugDir = path.join(webpagesDir, page.slug);
    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(path.join(slugDir, 'index.html'), buildHtml(page));

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
