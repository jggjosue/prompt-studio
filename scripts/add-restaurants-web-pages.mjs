#!/usr/bin/env node
/**
 * Adds 4 restaurants web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { restaurantPages } from './restaurants-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, dishes, chips, dark, serif } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const dishList = dishes
    .map(d => `- **${d.title}** (${d.label}): ${d.detail} — ${d.meta}`)
    .join('\n');
  const typo = serif
    ? `Google Fonts — "${theme.sans}" + "${serif}" for elegant headlines`
    : `Google Fonts — "${theme.sans}"`;

  return `Create a single-page ${mode} landing for "${brand}", a ${category} restaurant site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** ${typo}.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), prominent CTA ("${page.cta}").
2. Hero: pill "${page.tagline}", headline with one italic keyword, appetizing subcopy, CTAs ("${page.cta}" + "View menu").
3. Cuisine chips: ${chips.join(', ')}.
4. Menu highlights grid (3 cards):
${dishList}
Each card: label badge, dish name, description, price/meta, "Order" or "Reserve" link. Food photography placeholders or warm gradient blocks.
5. Stats band: ${page.stats.map(s => `${s.value} ${s.label}`).join(', ')}.
6. Footer: reservation/delivery line, email or phone input, hours note, copyright.

Restaurant aesthetic: appetizing imagery areas, OpenNowBadge-style pill, MichelinStars or rating stars optional, warm lighting on dark steakhouses, clean minimal for omakase. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    Inter: 'Inter:wght@400;500;600;700',
    'DM Sans': 'DM+Sans:wght@400;500;600;700',
    'Cormorant Garamond': 'Cormorant+Garamond:wght@500;600;700',
    'Noto Serif JP': 'Noto+Serif+JP:wght@400;500;600',
    'Playfair Display': 'Playfair+Display:wght@500;600;700',
  };
  return map[name] || 'Inter:wght@400;500;600;700';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const headlineFont = page.serif || t.sans;
  const fonts = page.serif
    ? `family=${fontParam(page.serif)}&family=${fontParam(t.sans)}`
    : `family=${fontParam(t.sans)}`;
  const fontUrl = `https://fonts.googleapis.com/css2?${fonts}&display=swap`;
  const btnStyle = page.dark
    ? 'background:var(--accent);color:#1a1210;'
    : 'background:var(--accent);color:#fff;';

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.dishes
    .map(
      d => `<article class="dish-card">
      <span class="dish-label">${d.label}</span>
      <div class="dish-visual" aria-hidden="true"></div>
      <h3>${d.title}</h3>
      <p class="dish-detail">${d.detail}</p>
      <p class="dish-meta">${d.meta}</p>
      <a href="#" class="dish-link">${page.cta} →</a>
    </article>`
    )
    .join('\n    ');
  const stats = page.stats
    .map(s => `<div><strong>${s.value}</strong><span>${s.label}</span></div>`)
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
      line-height: 1.65;
      font-size: 15px;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent);
      pointer-events: none;
    }
    body > * { position: relative; z-index: 1; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      max-width: 1080px;
      margin: 0 auto;
      position: sticky;
      top: 0;
      z-index: 10;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .brand {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    nav .links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.9rem;
    }
    nav .links a { color: var(--muted); }
    nav .links a:hover { color: var(--text); }
    .btn-reserve {
      ${btnStyle}
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .hero {
      text-align: center;
      padding: 3.5rem 1.5rem 2rem;
      max-width: 720px;
      margin: 0 auto;
    }
    .pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 20%, transparent);
      color: var(--accent);
      margin-bottom: 1.25rem;
    }
    .open-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-left: 0.5rem;
      font-size: 0.7rem;
      color: #22c55e;
      font-weight: 600;
    }
    .open-badge::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }
    .hero h1 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .hero .sub { color: var(--muted); max-width: 32rem; margin: 0 auto 1.5rem; }
    .hero-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      ${btnStyle}
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
    }
    .btn-ghost {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
      font-weight: 500;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      padding: 0 1.5rem 2.5rem;
      max-width: 640px;
      margin: 0 auto;
    }
    .chip {
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.8rem;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
      color: var(--muted);
    }
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding-bottom: 3rem;
    }
    .dish-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
      background: color-mix(in srgb, var(--bg) 95%, var(--accent) 5%);
    }
    .dish-label {
      display: block;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.75rem 1rem 0;
      color: var(--accent);
    }
    .dish-visual {
      height: 120px;
      margin: 0.5rem 1rem;
      border-radius: 10px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 35%, #000), color-mix(in srgb, var(--muted) 40%, var(--bg)));
    }
    .dish-card h3 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.2rem;
      padding: 0 1rem;
      margin-bottom: 0.35rem;
    }
    .dish-detail, .dish-meta {
      padding: 0 1rem;
      font-size: 0.88rem;
      color: var(--muted);
    }
    .dish-meta { font-weight: 600; color: var(--accent); margin: 0.35rem 0 0.75rem; }
    .dish-link {
      display: block;
      padding: 0.85rem 1rem;
      border-top: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
      padding: 2rem 0 3rem;
      border-top: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    }
    .stats strong {
      display: block;
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.75rem;
      color: var(--accent);
    }
    .stats span { font-size: 0.85rem; color: var(--muted); }
    footer {
      text-align: center;
      padding: 2rem 0 3rem;
      border-top: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
    }
    footer input {
      margin-top: 0.85rem;
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      background: color-mix(in srgb, var(--bg) 90%, #fff);
      color: var(--text);
      width: min(280px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-reserve) { display: none; }
      .menu-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-reserve">${page.cta}</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}<span class="open-badge">Open now</span></span>
    <h1>${heroHtml}</h1>
    <p class="sub">Seasonal ingredients, crafted with care for every guest.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">${page.cta}</a>
      <a href="#" class="btn-ghost">View menu</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="menu-grid container">
    ${cards}
  </section>
  <section class="stats container">
    ${stats}
  </section>
  <footer class="container">
    <p>Reserve your table — we reply within the hour</p>
    <input type="email" placeholder="you@email.com" aria-label="Email" />
    <p style="margin-top:1.25rem">© ${new Date().getFullYear()} ${page.brand}. Restaurant landing demo.</p>
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

  for (const page of restaurantPages) {
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
