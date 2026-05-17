#!/usr/bin/env node
/**
 * Adds 5 fitness web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fitnessPages } from './fitness-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, plans, chips, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const planList = plans
    .map(p => `- **${p.title}** (${p.label}): ${p.detail} — ${p.price}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a ${category} fitness brand site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.sans}".

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), "Join now" or "Start trial" CTA in accent.
2. Hero: location/hours pill "${page.tagline}", large bold headline with one italic keyword, motivational subcopy, CTAs ("Start free trial" + "View schedule").
3. Category chips: ${chips.join(', ')}.
4. Programs / pricing grid (3 cards):
${planList}
Each card: label badge, title, detail, price, "Sign up" link.
5. Stats band: 3 metrics (e.g. "2k+ members", "40 classes/week", "15 coaches").
6. Footer: trial signup email, social links, copyright.

Fitness / gym aesthetic: energetic, bold typography, high contrast CTAs. Responsive (768px). Returns index.html only.`;
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
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam(t.sans)}&display=swap`;
  const btnStyle = page.dark
    ? 'background:var(--accent);color:var(--bg);'
    : 'background:var(--accent);color:#fff;';

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.plans
    .map(
      p => `<article class="plan-card">
      <span class="plan-label">${p.label}</span>
      <h3>${p.title}</h3>
      <p class="plan-detail">${p.detail}</p>
      <p class="plan-price">${p.price}</p>
      <a href="#" class="signup-link">Sign up →</a>
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
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
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
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
    }
    nav .brand { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; }
    nav .links { display: flex; gap: 1.5rem; align-items: center; font-size: 0.9rem; font-weight: 500; }
    nav .links a:hover { color: var(--accent); }
    .btn-join {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.875rem;
      ${btnStyle}
      border: none;
    }
    .hero {
      padding: 3.5rem 1.5rem 2rem;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    .pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
      color: var(--accent);
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-size: clamp(2.1rem, 5vw, 3.25rem);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
    }
    .hero .sub { color: var(--muted); max-width: 42ch; margin: 0 auto 1.5rem; font-size: 1.05rem; }
    .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.8rem 1.4rem;
      border-radius: 10px;
      font-weight: 700;
      ${btnStyle}
      border: none;
    }
    .btn-ghost {
      padding: 0.8rem 1.4rem;
      border-radius: 10px;
      font-weight: 600;
      border: 1px solid color-mix(in srgb, var(--text) 22%, transparent);
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
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding: 2.5rem 0 3rem;
    }
    .plan-card {
      padding: 1.5rem;
      border-radius: 14px;
      border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
      background: color-mix(in srgb, var(--bg) 75%, var(--accent) 8%);
      transition: transform 0.2s, border-color 0.2s;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .plan-label {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--accent);
      margin-bottom: 0.65rem;
    }
    .plan-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.4rem; }
    .plan-detail { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.75rem; }
    .plan-price { font-weight: 800; font-size: 1.1rem; margin-bottom: 1rem; }
    .signup-link { font-size: 0.9rem; font-weight: 700; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      padding: 2.5rem 0;
      border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
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
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
      background: transparent;
      color: var(--text);
      width: min(280px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-join) { display: none; }
      .plans-grid, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="btn-join">Join now</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Train smarter with programs built for real results.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Start free trial</a>
      <a href="#" class="btn-ghost">View schedule</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="plans-grid container">
    ${cards}
  </section>
  <section class="stats container">
    <div><strong>2k+</strong><span>Active members</span></div>
    <div><strong>40</strong><span>Classes per week</span></div>
    <div><strong>15</strong><span>Expert coaches</span></div>
  </section>
  <footer class="container">
    <p>Start your 7-day free trial — no card required</p>
    <input type="email" placeholder="your@email.com" aria-label="Email" />
    <p style="margin-top:1.25rem">© ${new Date().getFullYear()} ${page.brand}. Fitness landing demo.</p>
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

  for (const page of fitnessPages) {
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
