#!/usr/bin/env node
/**
 * Adds 15 freelance web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { freelancePages } from './freelance-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, role, cards, skills, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const cardList = cards
    .map(c => `- **${c.title}** (${c.price}): ${c.body}`)
    .join('\n');

  return `Create a single-page ${mode} landing for "${brand}", a freelance ${role} personal brand / service site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** Google Fonts — "${theme.sans}"${theme.serif ? ` + "${theme.serif}" for headlines` : ''}.

**Sections (in order):**
1. Sticky nav: logo "${brand}", links (${page.sections.join(', ')}), prominent "Hire me" CTA button in accent color.
2. Hero: availability pill "${page.tagline}", large headline with one italic keyword, role subtitle "${role}", short value prop, dual CTAs ("Book a call" + "View work").
3. Skills row: chips for ${skills.join(', ')}.
4. Services grid (3 cards):
${cardList}
Each card: title, price badge, description, "Get quote" link.
5. Social proof band: 3 stats (e.g. "50+ clients", "4.9★ rating", "8 yrs experience") or a short testimonial quote.
6. Footer: contact email, social links placeholder, copyright.

Freelance marketplace aesthetic: trustworthy, personal, clear pricing signals. Responsive (768px). Subtle hover on cards. Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    'Playfair Display': 'Playfair+Display:ital,wght@0,400;0,700;1,400',
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
    Fraunces: 'Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400',
    'Libre Baskerville': 'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    Lora: 'Lora:ital,wght@0,400;0,600;1,400',
    'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
    'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500',
    Inter: 'Inter:wght@400;500;600;700',
  };
  return map[name] || 'Inter:wght@400;500;600;700';
}

function buildHtml(page) {
  const t = page.theme;
  const heroHtml = page.hero.replace(
    /<em>(.*?)<\/em>/g,
    '<em style="font-style:italic;color:var(--accent)">$1</em>'
  );
  const headlineFont = t.serif || t.sans;
  const fonts = t.serif
    ? `${fontParam(t.serif)}&family=${fontParam(t.sans)}`
    : fontParam(t.sans);
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
  const btnStyle = page.dark
    ? 'background:var(--accent);color:var(--bg);border:none;'
    : 'background:var(--accent);color:#fff;border:none;';

  const skillChips = page.skills
    .map(s => `<span class="chip">${s}</span>`)
    .join('');
  const sectionLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cardHtml = page.cards
    .map(
      c => `<article class="service-card">
      <div class="price">${c.price}</motion>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
      <a href="#" class="card-link">Get quote →</a>
    </article>`
    )
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.brand} — ${page.role}</title>
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
    .headline { font-family: "${headlineFont}", Georgia, serif; }
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
      backdrop-filter: blur(8px);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    nav .brand { font-weight: 700; font-size: 1.1rem; }
    nav .links { display: flex; gap: 1.75rem; align-items: center; font-size: 0.9rem; }
    nav .links a:hover { color: var(--accent); }
    .btn-hire {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      ${btnStyle}
    }
    .hero {
      padding: 3.5rem 1.5rem 2.5rem;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    .pill {
      display: inline-block;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
      color: var(--accent);
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 400;
      line-height: 1.15;
      margin-bottom: 0.5rem;
    }
    .role { color: var(--muted); font-size: 1rem; margin-bottom: 1rem; }
    .hero .sub { color: var(--muted); max-width: 42ch; margin: 0 auto 1.5rem; }
    .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.7rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      ${btnStyle}
    }
    .btn-ghost {
      padding: 0.7rem 1.25rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
      font-size: 0.9rem;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      padding: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .chip {
      font-size: 0.8rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--text);
    }
    .services {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding: 2rem 0 3rem;
    }
    .service-card {
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
      background: color-mix(in srgb, var(--bg) 80%, var(--accent) 5%);
      transition: transform 0.2s, border-color 0.2s;
    }
    .service-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .service-card .price {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    .service-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .service-card p { font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem; }
    .card-link { font-size: 0.85rem; font-weight: 600; color: var(--accent); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      padding: 2.5rem 0;
      border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    .stats strong { display: block; font-size: 1.75rem; margin-bottom: 0.25rem; }
    .stats span { font-size: 0.85rem; color: var(--muted); }
    footer {
      padding: 2.5rem 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--muted);
    }
    footer a { color: var(--accent); margin: 0 0.5rem; }
    @media (max-width: 768px) {
      nav .links a:not(.btn-hire) { display: none; }
      .services, .stats { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${sectionLinks}
      <a href="#" class="btn-hire">Hire me</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1 class="headline">${heroHtml}</h1>
    <p class="role">${page.role}</p>
    <p class="sub">Freelance specialist for teams that need senior output without full-time headcount.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Book a call</a>
      <a href="#" class="btn-ghost">View work</a>
    </div>
  </section>
  <div class="skills">${skillChips}</div>
  <section class="services container">
    ${cardHtml}
  </section>
  <section class="stats container">
    <div><strong>50+</strong><span>Clients shipped</span></div>
    <div><strong>4.9★</strong><span>Average rating</span></div>
    <div><strong>8 yrs</strong><span>Freelance experience</span></div>
  </section>
  <footer class="container">
    <p><a href="mailto:hello@${page.slug.replace(/-/g, '')}.com">hello@${page.slug.split('-')[0]}.com</a></p>
    <p style="margin-top:0.75rem">
      <a href="#">LinkedIn</a>
      <a href="#">Dribbble</a>
      <a href="#">Calendly</a>
    </p>
    <p style="margin-top:1rem">© ${new Date().getFullYear()} ${page.brand}. Freelance landing demo.</p>
  </footer>
</body>
</html>`;
}

function sanitizeHtml(html) {
  return html
    .replace(/<\/motion>/g, '</div>')
    .replace(/<motion>/g, '<motion>')
    .replace(/<motion>/g, '<div>')
    .replace(/<\/motion>/g, '</div>')
    .replace(/<div class="price">([^<]*)<\/motion>/g, '<div class="price">$1</motion>')
    .replace(/<div class="price">([^<]*)<\/div>/g, '<div class="price">$1</div>')
    .replace(/<span><\/motion>/g, '<span></div>')
    .replace(/rating<\/motion>/g, 'rating</span>');
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

  for (const page of freelancePages) {
    if (existingIds.has(page.id)) {
      console.log(`skip id ${page.id} (already exists)`);
      continue;
    }

    const slugDir = path.join(webpagesDir, page.slug);
    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(
      path.join(slugDir, 'index.html'),
      sanitizeHtml(buildHtml(page))
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
