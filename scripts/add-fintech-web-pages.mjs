#!/usr/bin/env node
/**
 * Adds 7 fintech web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fintechPages } from './fintech-web-pages-data.mjs';

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

  return `Create a single-page ${mode} landing for "${brand}", a ${category} fintech product site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "Inter" (UI) + optional geometric sans for headlines.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), primary CTA ("${page.cta}").
2. Split hero: pill "${page.tagline}", headline with one italic keyword, trust subcopy, CTAs ("${page.cta}" + "See demo"), **${page.mock} mockup** on the right (card UI, dashboard, chart, or payment terminal — fintech-specific).
3. Product chips: ${chips.join(', ')}.
4. Features grid (3 cards):
${featureList}
Each card: label badge, title, detail, meta line, subtle border, no heavy shadows.
5. Trust/stats band: ${stats.map(s => `${s.value} ${s.label}`).join(', ')}.
6. Footer: compliance line (e.g. "Not a bank" / "Securities offered through…"), email signup, copyright.

Fintech aesthetic: clean grids, security badges, monospace accents for numbers, professional trust signals, responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  return name === 'IBM Plex Mono'
    ? 'IBM+Plex+Mono:wght@400;500;600'
    : 'Inter:wght@400;500;600;700';
}

function buildMock(page) {
  if (page.mock === 'card') {
    return `<div class="mock-card">
      <div class="mock-chip">VISA</div>
      <p class="mock-balance">$24,580.42</p>
      <p class="mock-label">Available balance</p>
      <p class="mock-num">•••• 4829</p>
    </div>`;
  }
  if (page.mock === 'dashboard') {
    return `<div class="mock-dashboard">
      <div class="mock-row"><span>Revenue</span><strong>$128,400</strong></div>
      <div class="mock-row"><span>Expenses</span><strong>$42,100</strong></div>
      <div class="mock-bars"><span></span><span></span><span></span><span></span></div>
    </div>`;
  }
  if (page.mock === 'chart') {
    return `<div class="mock-chart">
      <p class="mock-pair">BTC / USD</p>
      <p class="mock-price">$67,240 <span>+2.4%</span></p>
      <div class="mock-line"></div>
    </div>`;
  }
  if (page.mock === 'calculator') {
    return `<div class="mock-calc">
      <p>Loan amount</p>
      <strong>$25,000</strong>
      <p>Est. payment</p>
      <strong class="accent">$482/mo</strong>
    </div>`;
  }
  if (page.mock === 'policies') {
    return `<div class="mock-policies">
      <div class="mock-policy"><span>Auto</span><strong>$89/mo</strong></div>
      <div class="mock-policy"><span>Home</span><strong>$42/mo</strong></div>
    </div>`;
  }
  if (page.mock === 'portfolio') {
    return `<div class="mock-portfolio">
      <p>Portfolio value</p>
      <strong>$184,220</strong>
      <div class="mock-donut"></div>
    </div>`;
  }
  return `<div class="mock-terminal">
    <p>POST /v1/charges</p>
    <code>{ "amount": 4999, "currency": "usd" }</code>
    <span class="mock-ok">200 OK · 42ms</span>
  </div>`;
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam(page.mono ? 'IBM Plex Mono' : 'Inter')}&display=swap`;
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
      --card: ${t.card};
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
      background: radial-gradient(ellipse 60% 50% at 80% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent);
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
      border-radius: 8px;
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
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-ghost {
      padding: 0.7rem 1.25rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
    }
    .hero-mock {
      border-radius: 16px;
      padding: 1.5rem;
      background: var(--card);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      min-height: 220px;
      color: ${page.dark ? '#f8fafc' : '#0f172a'};
    }
    .mock-card .mock-balance { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.25rem; }
    .mock-card .mock-label, .mock-card .mock-num { font-size: 0.85rem; opacity: 0.85; }
    .mock-chip { font-size: 0.7rem; letter-spacing: 0.1em; opacity: 0.9; }
    .mock-dashboard .mock-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      font-size: 0.9rem;
    }
    .mock-bars {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      height: 80px;
      margin-top: 1rem;
    }
    .mock-bars span {
      flex: 1;
      background: color-mix(in srgb, var(--accent) 70%, #fff);
      border-radius: 4px 4px 0 0;
    }
    .mock-bars span:nth-child(1) { height: 45%; }
    .mock-bars span:nth-child(2) { height: 70%; }
    .mock-bars span:nth-child(3) { height: 55%; }
    .mock-bars span:nth-child(4) { height: 90%; }
    .mock-chart .mock-pair { font-size: 0.8rem; opacity: 0.8; }
    .mock-chart .mock-price { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
    .mock-chart .mock-price span { color: #4ade80; font-size: 0.9rem; }
    .mock-line {
      height: 60px;
      margin-top: 1rem;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 80%, #fff));
      clip-path: polygon(0 80%, 20% 60%, 40% 70%, 60% 30%, 80% 50%, 100% 10%, 100% 100%, 0 100%);
    }
    .mock-calc strong { display: block; font-size: 1.4rem; margin: 0.25rem 0 0.75rem; }
    .mock-calc .accent { color: var(--accent); }
    .mock-policies .mock-policy {
      display: flex;
      justify-content: space-between;
      padding: 0.65rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .mock-portfolio strong { font-size: 1.6rem; display: block; margin: 0.35rem 0 1rem; }
    .mock-donut {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 10px solid color-mix(in srgb, var(--accent) 60%, transparent);
      border-top-color: var(--accent);
    }
    .mock-terminal {
      font-family: ui-monospace, monospace;
      font-size: 0.8rem;
    }
    .mock-terminal code {
      display: block;
      margin: 0.75rem 0;
      padding: 0.5rem;
      background: rgba(0,0,0,0.06);
      border-radius: 6px;
    }
    .mock-ok { color: #22c55e; font-weight: 600; }
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
      font-size:  0.78rem;
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
      border-radius: 8px;
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
      <p class="sub">Bank-grade security, modern UX, built for regulated finance.</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">${page.cta}</a>
        <a href="#" class="btn-ghost">See demo</a>
      </div>
    </div>
    <div class="hero-mock" aria-hidden="true">${mockHtml}</div>
  </section>
  <div class="chips">${chips}</div>
  <section class="feature-grid container">${cards}</section>
  <section class="stats container">${stats}</section>
  <footer class="container">
    <p>Demo only · Not financial advice. © ${new Date().getFullYear()} ${page.brand}</p>
    <input type="email" placeholder="Work email" aria-label="Email" />
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

  for (const page of fintechPages) {
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
