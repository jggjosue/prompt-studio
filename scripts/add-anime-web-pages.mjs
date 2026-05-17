#!/usr/bin/env node
/**
 * Adds 5 anime web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { animePages } from './anime-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, series, chips, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const seriesList = series
    .map(s => `- **${s.title}** (${s.label}): ${s.detail} — ${s.meta}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a ${category} site inspired by modern anime / otaku product design. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.sans}" (bold headlines, optional subtle gradient text on hero keyword).

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), accent CTA ("Watch free" / "Get tickets" / "Join").
2. Hero: pill "${page.tagline}", large headline with one italic accent-colored keyword, subcopy, dual CTAs (primary gradient button + ghost outline).
3. Genre chips: ${chips.join(', ')}.
4. Featured grid (3 cards):
${seriesList}
Each card: label badge, title, genre/detail line, meta line (rating/episodes), "Watch" or "View" link.
5. Stats band: 3 metrics (e.g. "10k+ titles", "Simulcast", "HD streaming").
6. Footer: email signup, social links, copyright.

Anime aesthetic: vibrant accent gradients, poster-card grids with rounded corners, energetic but clean UI. Optional CSS gradient hero glow. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    Inter: 'Inter:wght@400;500;600;700;800',
    'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  };
  return map[name] || 'Inter:wght@400;500;600;700;800';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<span class="accent-word">$1</span>'
  );
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam(t.sans)}&display=swap`;
  const ctaLabel = page.category.includes('Convention')
    ? 'Get tickets'
    : page.category.includes('Studio')
      ? 'View work'
      : 'Watch free';

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.series
    .map(
      s => `<article class="series-card">
      <span class="series-label">${s.label}</span>
      <h3>${s.title}</h3>
      <p class="series-detail">${s.detail}</p>
      <p class="series-meta">${s.meta}</p>
      <a href="#" class="card-link">View →</a>
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
      line-height: 1.6;
      font-size: 15px;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--accent) 25%, transparent), transparent);
      pointer-events: none;
      z-index: 0;
    }
    body > * { position: relative; z-index: 1; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .accent-word { font-style: italic; color: var(--accent); }
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
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    }
    nav .brand { font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; }
    nav .links { display: flex; gap: 1.5rem; align-items: center; font-size: 0.9rem; font-weight: 500; }
    nav .links a:hover { color: var(--accent); }
    .btn-cta {
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.875rem;
      background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #fff));
      color: ${page.dark ? 'var(--bg)' : '#fff'};
      border: none;
    }
    .hero {
      padding: 3.5rem 1.5rem 2rem;
      max-width: 820px;
      margin: 0 auto;
      text-align: center;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
      color: var(--accent);
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-size: clamp(2.1rem, 5vw, 3.2rem);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
    }
    .hero .sub { color: var(--muted); max-width: 44ch; margin: 0 auto 1.5rem; }
    .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.8rem 1.5rem;
      border-radius: 999px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #a855f7));
      color: ${page.dark ? 'var(--bg)' : '#fff'};
      border: none;
    }
    .btn-ghost {
      padding: 0.8rem 1.5rem;
      border-radius: 999px;
      font-weight: 600;
      border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      padding: 1.25rem 1.5rem 0;
    }
    .chip {
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    }
    .series-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding: 2.5rem 0 3rem;
    }
    .series-card {
      padding: 1.35rem;
      border-radius: 16px;
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      background: color-mix(in srgb, var(--bg) 60%, var(--accent) 10%);
      min-height: 200px;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .series-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .series-card::before {
      content: "";
      display: block;
      height: 72px;
      border-radius: 10px;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 50%, #000), color-mix(in srgb, var(--accent) 20%, var(--bg)));
    }
    .series-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: var(--accent);
      margin-bottom: 0.4rem;
    }
    .series-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.35rem; }
    .series-detail { font-size: 0.88rem; color: var(--muted); margin-bottom: 0.35rem; }
    .series-meta { font-size: 0.85rem; font-weight: 600; margin-bottom: auto; padding-bottom: 0.75rem; }
    .card-link { font-size: 0.9rem; font-weight: 700; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      padding: 2.5rem 0;
      border-top: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .stats strong {
      display: block;
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .stats span { font-size: 0.85rem; color: var(--muted); }
    footer {
      padding: 2.5rem 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--muted);
    }
    footer input {
      margin-top: 0.75rem;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
      background: transparent;
      color: var(--text);
      width: min(280px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-cta) { display: none; }
      .series-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-cta">${ctaLabel}</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Discover series, creators, and events built for anime fans.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">${ctaLabel}</a>
      <a href="#" class="btn-ghost">Browse catalog</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="series-grid container">
    ${cards}
  </section>
  <section class="stats container">
    <div><strong>10k+</strong><span>Titles</span></div>
    <div><strong>Simulcast</strong><span>Same-day Japan</span></div>
    <div><strong>HD</strong><span>Streaming</span></div>
  </section>
  <footer class="container">
    <p>Get weekly picks for new anime & manga</p>
    <input type="email" placeholder="your@email.com" aria-label="Email" />
    <p style="margin-top:1.25rem">© ${new Date().getFullYear()} ${page.brand}. Anime landing demo.</p>
  </footer>
</body>
</html>`;
}

function fixHtml(html) {
  return html
    .replace(/<div class="links">/g, '<div class="links">')
    .replace(/<\/motion>/g, '</div>')
    .replace(/class="hero-actions">[\s\S]*?<\/motion>/g, match =>
      match.replace(/<\/motion>/, '</div>')
    );
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

  for (const page of animePages) {
    if (existingIds.has(page.id)) {
      console.log(`skip id ${page.id} (already exists)`);
      continue;
    }

    const slugDir = path.join(webpagesDir, page.slug);
    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(
      path.join(slugDir, 'index.html'),
      buildHtml(page)
    );

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
