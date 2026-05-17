#!/usr/bin/env node
/**
 * Adds 7 travel web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { travelPages } from './travel-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, features, chips, stats, dark, mock } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const featureList = features
    .map(f => `- **${f.title}** (${f.label}): ${f.detail} — ${f.meta}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a ${category}. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "Inter" for UI; elegant headlines with travel wanderlust energy.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), primary CTA ("${page.cta}").
2. Split hero: pill "${page.tagline}", headline with one italic keyword, travel subcopy, CTAs ("${page.cta}" + "Explore destinations"), **${mock} mockup** (trip search, hotel suite, trail map, hostel beds, cruise itinerary, local experiences, or flight ticket — travel-specific).
3. Destination/experience chips: ${chips.join(', ')}.
4. Features grid (3 cards):
${featureList}
5. Stats band: ${stats.map(s => `${s.value} ${s.label}`).join(', ')}.
6. Footer: newsletter + copyright.

Travel aesthetic: destination photography placeholders, map routes, booking cards, warm or ocean palettes, responsive (768px). Returns index.html only.`;
}

function buildMock(page) {
  switch (page.mock) {
    case 'search':
      return `<div class="mock-search">
        <label>Where to?</label>
        <p class="mock-dest">Santorini, Greece</p>
        <div class="mock-dates"><span>Jun 12</span><span>→</span><span>Jun 19</span></div>
        <button type="button" class="mock-btn">Search</button>
      </div>`;
    case 'hotel':
      return `<div class="mock-hotel">
        <div class="mock-room"></div>
        <p class="mock-name">Horizon Suite · Ocean View</p>
        <p class="mock-price">$420 <span>/ night</span></p>
      </div>`;
    case 'map':
      return `<div class="mock-map">
        <svg viewBox="0 0 200 100" aria-hidden="true">
          <path d="M20,70 Q60,20 100,50 T180,40" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="20" cy="70" r="4" fill="var(--accent)"/>
          <circle cx="180" cy="40" r="4" fill="var(--accent)"/>
        </svg>
        <p>Patagonia · 7 days · Moderate</p>
      </div>`;
    case 'hostel':
      return `<div class="mock-hostel">
        <div class="mock-bed"><span>Bed A</span><strong>$18</strong></div>
        <div class="mock-bed"><span>Bed B</span><strong>$18</strong></div>
        <div class="mock-bed taken"><span>Bed C</span><strong>Booked</strong></div>
      </div>`;
    case 'cruise':
      return `<div class="mock-cruise">
        <div class="mock-port"><span>Day 1</span><strong>Barcelona</strong></div>
        <div class="mock-port"><span>Day 3</span><strong>Nice</strong></div>
        <div class="mock-port"><span>Day 5</span><strong>Rome</strong></div>
      </div>`;
    case 'experiences':
      return `<div class="mock-exp">
        <article><span>3h</span><strong>Street food walk</strong><p>$45</p></article>
        <article><span>2h</span><strong>Pottery workshop</strong><p>$38</p></article>
      </div>`;
    case 'flight':
      return `<div class="mock-flight">
        <p class="mock-route">NYC → Lisbon</p>
        <p class="mock-time">Direct · 7h 20m</p>
        <p class="mock-fare">From <strong>$289</strong></p>
      </div>`;
    default:
      return `<div class="mock-search"><p class="mock-dest">Explore</p></div>`;
  }
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const fontUrl =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  const btnText = page.dark ? 'color:#0f172a;' : 'color:#fff;';
  const mockHtml = buildMock(page);

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.features
    .map(
      f => `<article class="feature-card">
      <span class="feature-label">${f.label}</span>
      <h3>${f.title}</h3>
      <p class="feature-detail">${f.detail}</p>
      <p class="feature-meta">${f.meta}</p>
    </article>`
    )
    .join('\n    ');
  const statsFixed = page.stats
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
      --art: ${t.art};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Inter", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 15px;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 55% 45% at 85% 5%, color-mix(in srgb, var(--accent) 22%, transparent), transparent);
      pointer-events: none;
    }
    body > * { position: relative; z-index: 1; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    .brand { font-weight: 700; font-size: 1.1rem; letter-spacing: -0.02em; }
    nav .links { display: flex; align-items: center; gap: 1.25rem; font-size: 0.88rem; }
    nav .links a { color: var(--muted); }
    .btn-cta {
      background: var(--accent);
      ${btnText}
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .hero-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
      padding: 3rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      color: var(--accent);
      margin-bottom: 1rem;
    }
    .hero h1 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 700;
      line-height: 1.12;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    .hero .sub { color: var(--muted); margin-bottom: 1.5rem; max-width: 28rem; }
    .hero-actions { display: flex; gap: 0.65rem; flex-wrap: wrap; }
    .btn-primary {
      background: var(--accent);
      ${btnText}
      padding: 0.7rem 1.25rem;
      border-radius: 999px;
      font-weight: 600;
    }
    .btn-ghost {
      padding: 0.7rem 1.25rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
    }
    .hero-mock {
      border-radius: 20px;
      padding: 1.25rem;
      background: var(--art);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      min-height: 240px;
      color: ${page.dark ? '#fafafa' : '#1c1917'};
    }
    .mock-search label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.8; }
    .mock-dest { font-weight: 700; font-size: 1.1rem; margin: 0.35rem 0; }
    .mock-dates { display: flex; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.75rem; opacity: 0.9; }
    .mock-btn {
      width: 100%;
      padding: 0.55rem;
      border: none;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    .mock-hotel .mock-room {
      width: 100%;
      height: 80px;
      border-radius: 10px;
      background: color-mix(in srgb, #000 30%, transparent);
      margin-bottom: 0.5rem;
    }
    .mock-hotel .mock-name { font-weight: 600; font-size: 0.9rem; }
    .mock-hotel .mock-price { font-size: 1.1rem; font-weight: 700; margin-top: 0.25rem; }
    .mock-hotel .mock-price span { font-size: 0.8rem; font-weight: 400; opacity: 0.8; }
    .mock-map svg { width: 100%; margin-bottom: 0.5rem; opacity: 0.9; }
    .mock-map p { font-size: 0.85rem; font-weight: 600; }
    .mock-hostel .mock-bed {
      display: flex;
      justify-content: space-between;
      padding: 0.45rem 0.6rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.45);
      margin-bottom: 0.35rem;
      font-size: 0.88rem;
    }
    .mock-hostel .mock-bed.taken { opacity: 0.55; }
    .mock-cruise .mock-port {
      display: grid;
      grid-template-columns: 3.5rem 1fr;
      gap: 0.5rem;
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 0.88rem;
    }
    .mock-cruise .mock-port span { font-size: 0.75rem; color: var(--accent); font-weight: 600; }
    .mock-exp article {
      padding: 0.6rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.5);
      margin-bottom: 0.4rem;
      font-size: 0.88rem;
    }
    .mock-exp span { font-size: 0.7rem; font-weight: 700; color: var(--accent); margin-right: 0.35rem; }
    .mock-exp p { font-size: 0.85rem; font-weight: 700; margin-top: 0.2rem; }
    .mock-flight .mock-route { font-weight: 700; font-size: 1.05rem; }
    .mock-flight .mock-time { font-size: 0.85rem; opacity: 0.85; margin: 0.25rem 0 0.5rem; }
    .mock-flight .mock-fare { font-size: 0.9rem; }
    .mock-flight .mock-fare strong { font-size: 1.25rem; color: var(--accent); }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      justify-content: center;
      padding: 0 1.5rem 2rem;
    }
    .chip {
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.78rem;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
      color: var(--muted);
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding-bottom: 2.5rem;
    }
    .feature-card {
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
      background: color-mix(in srgb, var(--bg) 92%, var(--accent) 8%);
    }
    .feature-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent);
    }
    .feature-card h3 { font-size: 1.05rem; margin: 0.5rem 0 0.35rem; }
    .feature-detail { font-size: 0.88rem; color: var(--muted); }
    .feature-meta { font-size: 0.8rem; margin-top: 0.5rem; font-weight: 600; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    .stats strong { display: block; font-size: 1.5rem; font-weight: 700; }
    .stats span { font-size: 0.85rem; color: var(--muted); }
    footer {
      text-align: center;
      padding: 2rem 0 3rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
    footer input {
      margin-top: 0.75rem;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
      background: transparent;
      color: var(--text);
      width: min(260px, 100%);
    }
    @media (max-width: 768px) {
      .hero-wrap { grid-template-columns: 1fr; }
      nav .links a:not(.btn-cta) { display: none; }
      .feature-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-cta">${page.cta}</a>
    </div>
  </nav>
  <section class="hero-wrap">
    <div class="hero">
      <span class="pill">${page.tagline}</span>
      <h1>${heroHtml}</h1>
      <p class="sub">${page.sub}</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">${page.cta}</a>
        <a href="#" class="btn-ghost">Explore destinations</a>
      </div>
    </div>
    <div class="hero-mock" aria-hidden="true">${mockHtml}</div>
  </section>
  <div class="chips">${chips}</div>
  <section class="feature-grid container">${cards}</section>
  <section class="stats container">${statsFixed}</section>
  <footer class="container">
    <p>© ${new Date().getFullYear()} ${page.brand}. Travel landing demo.</p>
    <input type="email" placeholder="Email" aria-label="Email" />
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

  for (const page of travelPages) {
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
