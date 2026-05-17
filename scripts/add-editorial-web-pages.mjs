#!/usr/bin/env node
/**
 * Adds 15 editorial web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { editorialPages } from './editorial-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, brutalist, dark } = page;
  const mode = dark ? 'dark editorial' : 'light editorial';
  const styleNote = brutalist
    ? 'Brutalist layout: thick 2px borders, hard offset shadows (6px 6px 0), no border-radius, numbered sections.'
    : 'Magazine-style editorial layout: generous whitespace, serif headlines, thin rules, asymmetric grids where appropriate.';

  return `Create a single-page ${mode} landing for "${brand}" with a refined magazine / publishing aesthetic. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.serif}" for headlines (mix regular + italic emphasis) and "${theme.sans}" for UI and body.
${styleNote}

**Sections (in order):**
1. Minimal top nav: brand name, links (${page.sections.join(', ')}), subtle underline on hover.
2. Hero: small caps label "${page.tagline}", large serif headline with italic emphasis on one keyword, short subcopy, primary CTA.
3. Featured grid: 3 editorial cards with large numbers (01–03), serif titles, short descriptions, separated by 1px rules.
4. Quote band: centered italic serif pull-quote about craft, design, or storytelling.
5. Footer: 3 columns (brand, links, newsletter email field with underline input), copyright.

Fully responsive (breakpoint 768px). Smooth hover transitions. Semantic HTML, accessible contrast. Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    'Playfair Display': 'Playfair+Display:ital,wght@0,400;0,700;1,400',
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
    'Instrument Serif': 'Instrument+Serif:ital@0;1',
    'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500',
    Fraunces: 'Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400',
    'Libre Baskerville': 'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    Lora: 'Lora:ital,wght@0,400;0,600;1,400',
    'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
    Inter: 'Inter:wght@400;500;600',
  };
  return map[name] || 'Inter:wght@400;500;600';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const border = page.brutalist
    ? '2px solid var(--text)'
    : '1px solid color-mix(in srgb, var(--text) 15%, transparent)';
  const radius = page.brutalist ? '0' : '4px';
  const shadow = page.brutalist ? 'box-shadow:6px 6px 0 var(--text);' : '';
  const btnStyle = page.dark
    ? 'background:var(--accent);color:var(--bg);'
    : 'background:var(--text);color:var(--bg);';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam(t.serif)}&family=${fontParam(t.sans)}&display=swap`;

  const cards = [
    { n: '01', title: 'Editorial systems', body: 'Typographic rhythm and grid discipline for long-form reading.' },
    { n: '02', title: 'Visual narrative', body: 'Photography and layout that guide the eye with intention.' },
    { n: '03', title: 'Print & screen', body: 'Assets that translate from page to responsive web without losing voice.' },
  ];

  const sectionLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const footerLinks = page.sections.map(s => `<li><a href="#">${s}</a></li>`).join('');
  const cardHtml = cards
    .map(
      c => `<article>
      <div class="num">${c.n}</div>
      <h3 class="serif">${c.title}</h3>
      <p>${c.body}</p>
    </article>`
    )
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.brand}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <style>
    :root {
      --bg: ${t.bg};
      --text: ${t.text};
      --muted: ${t.muted};
      --accent: ${t.accent};
      --border: ${border};
      --radius: ${radius};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "${t.sans}", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      font-size: 15px;
    }
    .serif { font-family: "${t.serif}", Georgia, serif; }
    a { color: inherit; text-decoration: none; }
    a:hover { color: var(--accent); }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: var(--border);
      font-size: 0.875rem;
      font-weight: 500;
      max-width: 1100px;
      margin: 0 auto;
    }
    nav .links { display: flex; gap: 2rem; }
    nav .brand { font-family: "${t.serif}", serif; font-size: 1.25rem; }
    .hero {
      padding: 4rem 1.5rem 3rem;
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
    }
    .hero .label {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 1rem;
    }
    .hero h1 {
      font-family: "${t.serif}", serif;
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 400;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .hero p { color: var(--muted); max-width: 40ch; margin: 0 auto 1.5rem; }
    .btn {
      display: inline-block;
      padding: 0.65rem 1.35rem;
      border: var(--border);
      border-radius: var(--radius);
      ${btnStyle}
      font-size: 0.875rem;
      font-weight: 500;
      ${shadow}
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      border-top: var(--border);
      border-bottom: var(--border);
    }
    .grid article {
      padding: 2rem 1.5rem;
      border-right: var(--border);
    }
    .grid article:last-child { border-right: none; }
    .grid .num {
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }
    .grid h3 {
      font-family: "${t.serif}", serif;
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
      font-weight: 400;
    }
    .grid p { font-size: 0.9rem; color: var(--muted); }
    .quote {
      padding: 4rem 1.5rem;
      text-align: center;
      font-family: "${t.serif}", serif;
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      font-style: italic;
      max-width: 28ch;
      margin: 0 auto;
      color: var(--muted);
    }
    footer {
      padding: 3rem 1.5rem 2rem;
      border-top: var(--border);
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2rem;
      font-size: 0.875rem;
    }
    footer h4 { font-family: "${t.serif}", serif; font-size: 1rem; margin-bottom: 0.75rem; }
    footer ul { list-style: none; }
    footer li { margin-bottom: 0.35rem; color: var(--muted); }
    footer input {
      width: 100%;
      border: none;
      border-bottom: var(--border);
      background: transparent;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
      color: var(--text);
    }
    .copy {
      grid-column: 1 / -1;
      padding-top: 1.5rem;
      color: var(--muted);
      font-size: 0.75rem;
    }
    @media (max-width: 768px) {
      nav .links { display: none; }
      .grid { grid-template-columns: 1fr; }
      .grid article { border-right: none; border-bottom: var(--border); }
      footer { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">${sectionLinks}</div>
  </nav>
  <section class="hero">
    <p class="label">${page.tagline}</p>
    <h1 class="serif">${heroHtml}</h1>
    <p>An editorial landing experience built for readers who care about craft, pacing, and typographic detail.</p>
    <a class="btn" href="#">Explore the issue</a>
  </section>
  <section class="grid container">
    ${cardHtml}
  </section>
  <p class="quote serif">"Good design is invisible until you try to live without it."</p>
  <footer class="container">
    <div>
      <h4 class="serif">${page.brand}</h4>
      <p style="color:var(--muted);max-width:28ch">${page.tagline}. Independent editorial studio.</p>
    </div>
    <div>
      <h4>Explore</h4>
      <ul>${footerLinks}</ul>
    </div>
    <div>
      <h4>Newsletter</h4>
      <p style="color:var(--muted)">Weekly digest.</p>
      <input type="email" placeholder="you@email.com" aria-label="Email" />
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${page.brand}. Editorial landing demo.</p>
  </footer>
</body>
</html>`;
}

async function generatePreviews(pages) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.warn(
      'playwright not installed; skipping PNG previews. Run: npm i -D playwright && npx playwright install chromium'
    );
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch();
  } catch (err) {
    console.warn('Could not launch Chromium:', err.message);
    console.warn('Run: npx playwright install chromium');
    return;
  }
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
  });

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

  for (const page of editorialPages) {
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
