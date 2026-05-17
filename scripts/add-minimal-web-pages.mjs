#!/usr/bin/env node
/**
 * Adds 4 minimal web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minimalPages } from './minimal-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, items, layout } = page;
  const mode = layout === 'dark' ? 'dark mode' : 'light mode';
  const itemList = items
    .map(i => `- **${i.title}** (${i.num}): ${i.detail}`)
    .join('\n');
  const typo = page.serif
    ? `Google Fonts — "${theme.sans}" + "${page.serif}" for headlines (italic accent words)`
    : `Google Fonts — "${theme.sans}" (400–500 weights only)`;

  return `Create a single-page ${mode} landing for "${brand}", a ${category}. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** ${typo}.

**Minimal design rules:** no box shadows, no gradients, border-radius 0–4px max, 1px borders only, abundant whitespace, max-width ~720px for hero text, text-only nav with thin bottom rule.

**Sections (in order):**
1. Minimal nav: brand text only (no logo icon), links (${page.sections.join(', ')}), understated text CTA ("${page.cta}").
2. Hero: small caps pill "${page.tagline}", large headline with one italic keyword, one-line subcopy, single underlined or bordered CTA.
3. Numbered feature list (not cards):
${itemList}
Large orange/black numbers on the left, title + one line detail, separated by 1px horizontal rules.
4. Optional thin full-width placeholder block (dashboard or mockup) with 1px border only.
5. Footer: single line copyright + one email input, no multi-column footer.

Aesthetic: Stripe / Linear / Vercel docs inspired — editorial, calm, grid-aligned. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    Inter: 'Inter:wght@400;500',
    'Instrument Serif': 'Instrument+Serif:ital,wght@0,400;1,400',
    Fraunces: 'Fraunces:ital,wght@0,400;1,400',
  };
  return map[name] || 'Inter:wght@400;500';
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
  const borderColor =
    page.layout === 'dark'
      ? 'color-mix(in srgb, var(--text) 12%, transparent)'
      : 'color-mix(in srgb, var(--text) 10%, transparent)';
  const ctaBorder =
    page.layout === 'dark'
      ? 'border:1px solid var(--text);color:var(--text);'
      : 'border:1px solid var(--text);color:var(--text);';

  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const listItems = page.items
    .map(
      i => `<li class="feature-row">
      <span class="feature-num">${i.num}</span>
      <div class="feature-body">
        <h3>${i.title}</h3>
        <p>${i.detail}</p>
      </div>
    </li>`
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
      --border: ${borderColor};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "${t.sans}", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 15px;
      font-weight: 400;
    }
    a { color: inherit; text-decoration: none; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 0 1.5rem; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      max-width: 960px;
      margin: 0 auto;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }
    .brand {
      font-weight: 500;
      letter-spacing: -0.02em;
    }
    nav .links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    nav .links a { color: var(--muted); }
    nav .links a:hover { color: var(--text); }
    .nav-cta {
      ${ctaBorder}
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .hero {
      padding: 4.5rem 0 3rem;
      text-align: left;
    }
    .pill {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 1.5rem;
      display: block;
    }
    .hero h1 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: clamp(2.25rem, 5vw, 3.25rem);
      font-weight: 400;
      line-height: 1.12;
      letter-spacing: -0.03em;
      margin-bottom: 1.25rem;
      max-width: 18ch;
    }
    .hero .sub {
      color: var(--muted);
      max-width: 36ch;
      margin-bottom: 2rem;
      font-size: 1rem;
    }
    .hero-cta {
      display: inline-block;
      font-size: 0.9rem;
      font-weight: 500;
      border-bottom: 1px solid var(--accent);
      padding-bottom: 2px;
      color: var(--accent);
    }
    .mock {
      max-width: 960px;
      margin: 0 auto 3rem;
      padding: 0 1.5rem;
    }
    .mock-inner {
      height: 220px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: color-mix(in srgb, var(--text) 3%, var(--bg));
    }
    .features {
      list-style: none;
      padding: 2rem 0 4rem;
      border-top: 1px solid var(--border);
    }
    .feature-row {
      display: grid;
      grid-template-columns: 3rem 1fr;
      gap: 1.5rem;
      padding: 1.75rem 0;
      border-bottom: 1px solid var(--border);
      align-items: start;
    }
    .feature-num {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.5rem;
      color: var(--accent);
      font-weight: 400;
    }
    .feature-body h3 {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }
    .feature-body p {
      font-size: 0.9rem;
      color: var(--muted);
    }
    footer {
      padding: 2rem 0 3rem;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--muted);
    }
    footer input {
      display: block;
      margin-top: 1rem;
      padding: 0.5rem 0;
      border: none;
      border-bottom: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      width: min(240px, 100%);
      font: inherit;
    }
    footer input::placeholder { color: var(--muted); }
    @media (max-width: 768px) {
      nav .links a:not(.nav-cta) { display: none; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <a href="#" class="nav-cta">${page.cta}</a>
    </div>
  </nav>
  <section class="hero wrap">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Less interface. More intention.</p>
    <a href="#" class="hero-cta">${page.cta} →</a>
  </section>
  <div class="mock">
    <div class="mock-inner" aria-hidden="true"></div>
  </div>
  <ul class="features wrap">
    ${listItems}
  </ul>
  <footer class="wrap">
    <p>© ${new Date().getFullYear()} ${page.brand}</p>
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

  for (const page of minimalPages) {
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
