#!/usr/bin/env node
/**
 * Adds 7 gaming web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gamingPages } from './gaming-web-pages-data.mjs';

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
**Typography:** Google Fonts — "Inter" for UI; bold display headlines with gaming energy.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), primary CTA ("${page.cta}").
2. Split hero: pill "${page.tagline}", headline with one italic keyword, gaming subcopy, CTAs ("${page.cta}" + "Watch trailer"), **${mock} mockup** (game launcher, leaderboard, loot cards, live stream overlay, guild roster, indie game grid, or VR headset — gaming-specific).
3. Genre/platform chips: ${chips.join(', ')}.
4. Features grid (3 cards):
${featureList}
5. Stats band: ${stats.map(s => `${s.value} ${s.label}`).join(', ')}.
6. Footer: newsletter + copyright.

Gaming aesthetic: neon accents, HUD-style UI, pixel or cinematic gradients, controller/stream icons, responsive (768px). Returns index.html only.`;
}

function buildMock(page) {
  switch (page.mock) {
    case 'launcher':
      return `<div class="mock-launcher">
        <div class="mock-cover"></div>
        <p class="mock-title">${page.brand}</p>
        <p class="mock-status">Ready to play</p>
        <button type="button" class="mock-play">▶ PLAY</button>
      </div>`;
    case 'leaderboard':
      return `<div class="mock-board">
        <div class="mock-row gold"><span>1</span><strong>Team Nova</strong><span>2,840</span></div>
        <div class="mock-row"><span>2</span><strong>Phoenix Esports</strong><span>2,710</span></div>
        <div class="mock-row"><span>3</span><strong>Shadow Clan</strong><span>2,655</span></div>
      </div>`;
    case 'loot':
      return `<div class="mock-loot">
        <div class="mock-skin legendary"></div>
        <div class="mock-skin epic"></div>
        <div class="mock-skin rare"></div>
        <p class="mock-price">From 1,200 credits</p>
      </div>`;
    case 'stream':
      return `<div class="mock-stream">
        <div class="mock-live"><span>LIVE</span> 12.4k viewers</div>
        <div class="mock-chat"><p>Nova: clutch play!</p><p>Mod: welcome raid</p></div>
      </div>`;
    case 'guild':
      return `<div class="mock-guild">
        <div class="mock-member"><span class="mock-role">Tank</span><strong>Aelric</strong><span>Lv. 80</span></div>
        <div class="mock-member"><span class="mock-role">Heal</span><strong>Mira</strong><span>Lv. 79</span></div>
        <div class="mock-member"><span class="mock-role">DPS</span><strong>Kael</strong><span>Lv. 80</span></div>
      </div>`;
    case 'indie':
      return `<div class="mock-indie">
        <div class="mock-game"><span>NEW</span><strong>Pixel Quest</strong></div>
        <div class="mock-game"><span>SALE</span><strong>Dungeon Loop</strong></div>
        <div class="mock-game"><span>HOT</span><strong>Star Harbor</strong></div>
      </div>`;
    case 'headset':
      return `<div class="mock-vr">
        <div class="mock-vis"></div>
        <p class="mock-room">Room-scale · 4×4m</p>
        <p class="mock-fps">120Hz · hand tracking</p>
      </div>`;
    default:
      return `<div class="mock-launcher"><div class="mock-cover"></div><p>Play now</p></div>`;
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
    .mock-cover {
      width: 100%;
      height: 90px;
      border-radius: 10px;
      background: color-mix(in srgb, #000 35%, transparent);
      margin-bottom: 0.75rem;
    }
    .mock-title { font-weight: 700; font-size: 1.1rem; }
    .mock-status { font-size: 0.8rem; opacity: 0.85; margin: 0.25rem 0 0.75rem; }
    .mock-play {
      width: 100%;
      padding: 0.55rem;
      border: none;
      border-radius: 8px;
      background: var(--accent);
      color: #0f172a;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .mock-board .mock-row {
      display: grid;
      grid-template-columns: 1.5rem 1fr auto;
      gap: 0.5rem;
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 0.88rem;
    }
    .mock-board .mock-row.gold { color: #fbbf24; }
    .mock-loot { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
    .mock-skin {
      width: 56px;
      height: 72px;
      border-radius: 8px;
      border: 2px solid rgba(255,255,255,0.3);
    }
    .mock-skin.legendary { background: linear-gradient(180deg,#fbbf24,#b45309); }
    .mock-skin.epic { background: linear-gradient(180deg,#a855f7,#6b21a8); }
    .mock-skin.rare { background: linear-gradient(180deg,#3b82f6,#1e3a8a); }
    .mock-loot .mock-price { width: 100%; font-size: 0.8rem; font-weight: 600; margin-top: 0.5rem; }
    .mock-stream .mock-live { font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem; }
    .mock-stream .mock-live span {
      background: #ef4444;
      color: #fff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      margin-right: 0.35rem;
    }
    .mock-chat {
      background: rgba(0,0,0,0.35);
      border-radius: 8px;
      padding: 0.75rem;
      font-size: 0.8rem;
    }
    .mock-chat p { opacity: 0.9; margin-bottom: 0.35rem; }
    .mock-guild .mock-member {
      display: grid;
      grid-template-columns: 3rem 1fr auto;
      gap: 0.5rem;
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 0.85rem;
    }
    .mock-role {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
    }
    .mock-indie .mock-game {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      padding: 0.5rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.5);
      margin-bottom: 0.4rem;
      font-size: 0.88rem;
    }
    .mock-indie .mock-game span {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent);
    }
    .mock-vr { text-align: center; }
    .mock-vis {
      width: 100px;
      height: 60px;
      margin: 0 auto 1rem;
      border-radius: 40px 40px 12px 12px;
      background: color-mix(in srgb, #000 40%, transparent);
      border: 3px solid var(--accent);
    }
    .mock-vr p { font-size: 0.85rem; font-weight: 600; }
    .mock-vr .mock-fps { font-size: 0.8rem; opacity: 0.8; margin-top: 0.25rem; }
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
        <a href="#" class="btn-ghost">Watch trailer</a>
      </div>
    </div>
    <div class="hero-mock" aria-hidden="true">${mockHtml}</div>
  </section>
  <div class="chips">${chips}</div>
  <section class="feature-grid container">${cards}</section>
  <section class="stats container">${statsFixed}</section>
  <footer class="container">
    <p>© ${new Date().getFullYear()} ${page.brand}. Gaming landing demo.</p>
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

  for (const page of gamingPages) {
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
