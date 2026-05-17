#!/usr/bin/env node
/**
 * Adds 4 e-commerce web pages: HTML demos, JSON entries, and PNG previews.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ecommercePages } from './ecommerce-web-pages-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');

function buildDescription(page) {
  const { brand, theme, category, products, chips, perks, dark } = page;
  const mode = dark ? 'dark mode' : 'light mode';
  const productList = products
    .map(p => `- **${p.title}** (${p.badge}): ${p.detail} — ${p.price}`)
    .join('\n');
  const typo = page.serif
    ? `Google Fonts — "${theme.sans}" + "${page.serif}" for headlines`
    : `Google Fonts — "${theme.sans}"`;

  return `Create a single-page ${mode} landing for "${brand}", a ${category} e-commerce site. Pure HTML + CSS in one index.html file (no frameworks).

**Palette:** background ${theme.bg}, text ${theme.text}, muted ${theme.muted}, accent ${theme.accent}.
**Typography:** ${typo}.

**Sections (in order):**
1. Sticky nav: logo "${brand}", category links (${page.sections.join(', ')}), cart icon placeholder + CTA ("${page.cta}").
2. Hero: pill "${page.tagline}", headline with one italic keyword, value subcopy, CTAs ("${page.cta}" + "Browse catalog").
3. Category chips: ${chips.join(', ')}.
4. Product grid (3 cards):
${productList}
Each card: sale/new badge, product image placeholder, title, variant line, price, "Add to cart" button.
5. Trust/perks band: ${perks.map(p => `${p.value} ${p.label}`).join(', ')}.
6. Footer: newsletter signup, payment icons row (text labels), copyright.

E-commerce aesthetic: clean product photography areas, price prominence, subtle card borders, mobile-friendly grid. Responsive (768px). Returns index.html only.`;
}

function fontParam(name) {
  const map = {
    Inter: 'Inter:wght@400;500;600;700',
    'Playfair Display': 'Playfair+Display:wght@500;600;700',
    Lora: 'Lora:wght@400;500;600',
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
  const btnText = page.dark ? 'color:#0f172a;' : 'color:#fff;';

  const chips = page.chips.map(c => `<span class="chip">${c}</span>`).join('');
  const navLinks = page.sections.map(s => `<a href="#">${s}</a>`).join('');
  const cards = page.products
    .map(
      p => `<article class="product-card">
      <span class="product-badge">${p.badge}</span>
      <div class="product-img" aria-hidden="true"></div>
      <h3>${p.title}</h3>
      <p class="product-detail">${p.detail}</p>
      <p class="product-price">${p.price}</p>
      <button type="button" class="btn-cart">${page.cta}</button>
    </article>`
    )
    .join('\n    ');
  const perks = page.perks
    .map(p => `<div><strong>${p.value}</strong><span>${p.label}</span></div>`)
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
      background: color-mix(in srgb, var(--bg) 94%, transparent);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    .brand {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    nav .links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.88rem;
    }
    nav .links a { color: var(--muted); }
    nav .cart-icon {
      font-size: 1.1rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
      border-radius: 6px;
    }
    .btn-shop {
      background: var(--accent);
      ${btnText}
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .hero {
      text-align: center;
      padding: 3rem 1.5rem 2rem;
      max-width: 640px;
      margin: 0 auto;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      margin-bottom: 1rem;
    }
    .hero h1 {
      font-family: "${headlineFont}", Georgia, serif;
      font-size: clamp(2rem, 4.5vw, 2.75rem);
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 0.75rem;
    }
    .hero .sub { color: var(--muted); margin-bottom: 1.25rem; }
    .hero-actions {
      display: flex;
      gap: 0.65rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--accent);
      ${btnText}
      padding: 0.7rem 1.35rem;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-secondary {
      padding: 0.7rem 1.35rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
      font-weight: 500;
    }
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
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      color: var(--muted);
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      padding-bottom: 2.5rem;
    }
    .product-card {
      border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
      border-radius: 12px;
      overflow: hidden;
      background: color-mix(in srgb, var(--bg) 98%, var(--accent) 2%);
    }
    .product-badge {
      position: absolute;
      margin: 0.75rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.5rem;
      background: var(--accent);
      ${btnText}
      border-radius: 4px;
    }
    .product-card { position: relative; }
    .product-img {
      height: 140px;
      margin: 2.25rem 1rem 0.75rem;
      border-radius: 8px;
      background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 25%, var(--bg)), color-mix(in srgb, var(--muted) 30%, var(--bg)));
    }
    .product-card h3 {
      font-size: 1rem;
      font-weight: 600;
      padding: 0 1rem;
      margin-bottom: 0.25rem;
    }
    .product-detail {
      padding: 0 1rem;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .product-price {
      padding: 0.5rem 1rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
    }
    .btn-cart {
      display: block;
      width: calc(100% - 2rem);
      margin: 0 1rem 1rem;
      padding: 0.55rem;
      border: none;
      border-radius: 8px;
      background: var(--accent);
      ${btnText}
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .perks {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
    }
    .perks strong {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .perks span { font-size: 0.85rem; color: var(--muted); }
    footer {
      text-align: center;
      padding: 2rem 0 3rem;
    }
    .payments {
      display: flex;
      gap: 1rem;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--muted);
      margin: 1rem 0;
    }
    footer input {
      margin-top: 0.75rem;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
      background: transparent;
      color: var(--text);
      width: min(280px, 100%);
    }
    @media (max-width: 768px) {
      nav .links a:not(.btn-shop):not(.cart-icon) { display: none; }
      .product-grid, .perks { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <span class="brand">${page.brand}</span>
    <div class="links">
      ${navLinks}
      <span class="cart-icon" aria-label="Cart">🛒</span>
      <a href="#" class="btn-shop">${page.cta}</a>
    </div>
  </nav>
  <section class="hero">
    <span class="pill">${page.tagline}</span>
    <h1>${heroHtml}</h1>
    <p class="sub">Curated picks with fast checkout and trusted delivery.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">${page.cta}</a>
      <a href="#" class="btn-secondary">Browse catalog</a>
    </div>
  </section>
  <div class="chips">${chips}</div>
  <section class="product-grid container">
    ${cards}
  </section>
  <section class="perks container">
    ${perks}
  </section>
  <footer class="container">
    <p>Get 10% off your first order</p>
    <input type="email" placeholder="Email address" aria-label="Email" />
    <div class="payments">
      <span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span>
    </div>
    <p style="margin-top:1rem;font-size:0.8rem;color:var(--muted)">© ${new Date().getFullYear()} ${page.brand}. E-commerce landing demo.</p>
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

  for (const page of ecommercePages) {
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
