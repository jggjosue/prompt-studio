#!/usr/bin/env node
/**
 * Adds 7 music web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { musicPages } from './music-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, features, chips, stats, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const featureList = features
    .map(f => `- **${f.title}** (${f.label}): ${f.detail} — ${f.meta}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a ${category}. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "Inter" + optional display font for headlines.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), primary CTA ("${page.cta}").
2. Split hero: pill "${page.tagline}", headline with one italic keyword, music subcopy, CTAs ("${page.cta}" + "Explore catalog"), **${page.mock} mockup** (player, waveform, vinyl, podcast episodes, stage lights, or playlist — music-specific).
3. Genre/product chips: ${chips.join(', ')}.
4. Features grid (3 cards):
${featureList}
5. Stats band: ${stats.map(s => `${s.value} ${s.label}`).join(', ')}.
6. Footer: newsletter + copyright.

Music aesthetic: album-art gradients, play buttons, waveform or track-list UI, vibrant or retro palettes, responsive (768px). Returns index.html only.`;
}

function buildMock(page) {
  switch (page.mock) {
    case 'player':
      return `<div class="mock-player">
        <div class="mock-art"></div>
        <p class="mock-track">Midnight Drive</p>
        <p class="mock-artist">Nova Ray</p>
        <div class="mock-progress"><span></span></div>
        <div class="mock-controls"><span>⏮</span><span class="play">▶</span><span>⏭</span></div>
      </div>`;
    case 'waveform':
      return `<div class="mock-wave">
        <p class="mock-bpm">128 BPM · Trap</p>
        <div class="mock-bars"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <p class="mock-price">Lease $29</p>
      </div>`;
    case 'vinyl':
      return `<div class="mock-vinyl">
        <div class="mock-disc"></div>
        <p>Kind of Blue</p>
        <p class="mock-meta">Miles Davis · 1959</p>
      </div>`;
    case 'podcast':
      return `<div class="mock-podcast">
        <div class="mock-ep"><span>Ep. 42</span><strong>Studio Stories</strong></div>
        <div class="mock-ep"><span>Ep. 41</span><strong>Tour Bus Diaries</strong></div>
        <div class="mock-ep"><span>Ep. 40</span><strong>Producer Breakdown</strong></div>
      </div>`;
    case 'stage':
      return `<div class="mock-stage">
        <div class="mock-lights"></div>
        <p class="mock-venue">Arena Tour 2026</p>
        <p class="mock-date">Sat · 8:00 PM</p>
      </div>`;
    case 'playlist':
      return `<div class="mock-playlist">
        <div class="mock-track-row"><span>1</span><strong>Piano Basics</strong><span>12 min</span></div>
        <div class="mock-track-row"><span>2</span><strong>Scales &amp; Rhythm</strong><span>18 min</span></div>
        <div class="mock-track-row"><span>3</span><strong>First Song</strong><span>24 min</span></div>
      </div>`;
    default:
      return `<div class="mock-player"><div class="mock-art"></div><p>Now playing</p></div>`;
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
      padding: 1.5rem;
      background: var(--art);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      min-height: 240px;
      color: ${page.dark ? '#fafafa' : '#1c1917'};
    }
    .mock-art {
      width: 100%;
      height: 100px;
      border-radius: 12px;
      background: color-mix(in srgb, #000 25%, transparent);
      margin-bottom: 0.75rem;
    }
    .mock-track { font-weight: 700; font-size: 1.1rem; }
    .mock-artist { font-size: 0.85rem; opacity: 0.85; margin-bottom: 0.75rem; }
    .mock-progress {
      height: 4px;
      background: rgba(255,255,255,0.25);
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }
    .mock-progress span {
      display: block;
      width: 42%;
      height: 100%;
      background: #fff;
      border-radius: 999px;
    }
    .mock-controls { display: flex; gap: 1rem; align-items: center; font-size: 1.1rem; }
    .mock-controls .play {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .mock-wave .mock-bpm { font-size: 0.8rem; opacity: 0.9; margin-bottom: 0.75rem; }
    .mock-wave .mock-bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 72px;
    }
    .mock-wave .mock-bars span {
      flex: 1;
      background: rgba(255,255,255,0.85);
      border-radius: 2px;
    }
    .mock-wave .mock-bars span:nth-child(1) { height: 30%; }
    .mock-wave .mock-bars span:nth-child(2) { height: 55%; }
    .mock-wave .mock-bars span:nth-child(3) { height: 40%; }
    .mock-wave .mock-bars span:nth-child(4) { height: 80%; }
    .mock-wave .mock-bars span:nth-child(5) { height: 60%; }
    .mock-wave .mock-bars span:nth-child(6) { height: 90%; }
    .mock-wave .mock-bars span:nth-child(7) { height: 45%; }
    .mock-wave .mock-bars span:nth-child(8) { height: 70%; }
    .mock-wave .mock-price { margin-top: 0.75rem; font-weight: 700; }
    .mock-vinyl { text-align: center; }
    .mock-disc {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      background: radial-gradient(circle at 30% 30%, #444, #111);
      border: 3px solid rgba(0,0,0,0.2);
    }
    .mock-vinyl .mock-meta { font-size: 0.85rem; opacity: 0.8; }
    .mock-podcast .mock-ep {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      font-size: 0.9rem;
    }
    .mock-podcast .mock-ep span { color: var(--accent); font-weight: 600; min-width: 3rem; }
    .mock-stage .mock-lights {
      height: 80px;
      border-radius: 12px;
      background: linear-gradient(180deg, var(--accent), transparent);
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    .mock-stage .mock-venue { font-weight: 700; font-size: 1.1rem; }
    .mock-stage .mock-date { font-size: 0.9rem; opacity: 0.85; }
    .mock-playlist .mock-track-row {
      display: grid;
      grid-template-columns: 1.5rem 1fr auto;
      gap: 0.5rem;
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-size: 0.88rem;
    }
    .mock-playlist .mock-track-row span:last-child { color: var(--muted); }
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
      <p class="sub">Stream, create, and experience music without friction.</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">${page.cta}</a>
        <a href="#" class="btn-ghost">Explore catalog</a>
      </div>
    </div>
    <div class="hero-mock" aria-hidden="true">${mockHtml}</div>
  </section>
  <div class="chips">${chips}</div>
  <section class="feature-grid container">${cards}</section>
  <section class="stats container">${stats}</section>
  <footer class="container">
    <p>© ${new Date().getFullYear()} ${page.brand}. Music landing demo.</p>
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

  for (const page of musicPages) {
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
