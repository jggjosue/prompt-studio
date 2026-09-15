#!/usr/bin/env node
/** Build 50 bilingual Next.js product sites, static demos, screenshots and catalog records. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = path.join(root, 'public/webpages');
const catalogPath = path.join(webRoot, 'web-pages.json');
const imagesPath = path.join(root, 'src/data/prompts/placeholder-images.json');
const COLLECTION_TAG = 'Product Scroll 3D';

const categories = [
  { en: 'Cosmetics', es: 'Cosméticos', key: 'cosmetics', count: 7, tone: ['#f6eee9','#542d3c','#d997a5'], nouns: ['Aura Skin','Nébula Beauty','Ritual Lab','Savia Derm','Luma Care','Onda Serum','Velvet Glow'] },
  { en: 'Jewelry', es: 'Joyería', key: 'jewelry', count: 7, tone: ['#11100f','#f5e7c7','#bd8f45'], nouns: ['Aurelia','Maison Oro','Nocturne Gems','Lustre','Alma Joya','Élan Fine','Círculo'] },
  { en: 'Fashion', es: 'Moda', key: 'fashion', count: 6, tone: ['#ece9e2','#171717','#c94c37'], nouns: ['Forma Studio','Norte Atelier','Silhouette','Atempo','Materia','Vanta Wear'] },
  { en: 'Restaurants', es: 'Restaurantes', key: 'restaurants', count: 6, tone: ['#251610','#fff0d2','#d75c35'], nouns: ['Fuego Mesa','Casa Umami','Origen','Brasa Norte','Lima & Sal','Savia Cocina'] },
  { en: 'Real Estate', es: 'Bienes raíces', key: 'real-estate', count: 6, tone: ['#e8e3d8','#17332c','#ad8c60'], nouns: ['Habitat One','Lumen Estates','Terra Living','Altura','Nómada Homes','Casa Atlas'] },
  { en: 'Automotive', es: 'Automóviles', key: 'automotive', count: 6, tone: ['#090b10','#e9edf5','#3977ff'], nouns: ['Apex Motors','Torque One','Volta Drive','Nox Auto','Velocity','Aero GT'] },
  { en: 'Advertising Mockups', es: 'Mockups publicitarios', key: 'advertising-mockups', count: 6, tone: ['#f1eadf','#18142a','#ff5c45'], nouns: ['Pitch Objects','Brandstage','Mockup Orbit','Canvas Lab','Adframe','Studio Scene'] },
  { en: 'Amazon & Marketplaces', es: 'Amazon y marketplaces', key: 'amazon-marketplaces', count: 6, tone: ['#f4f6f8','#152334','#ff9f1c'], nouns: ['Market Hero','Prime Shelf','Cartflow','Listing Pro','Buybox','Seller Vista'] },
];

const imageData = JSON.parse(fs.readFileSync(imagesPath, 'utf8')).placeholderImages;
const productImages = imageData.filter(item => Number(item.id) >= 282 && Number(item.id) <= 381);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function assetsFor(category, offset) {
  const matches = productImages.filter(item => item.tags?.includes(category.en));
  return [0, 1, 2].map(step => matches[(offset * 3 + step) % matches.length]);
}

function html(page) {
  const [hero, second, third] = page.assets;
  const [bg, ink, accent] = page.category.tone;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.brand)} — ${esc(page.category.es)}</title><meta name="description" content="Experiencia Next.js de fotografía de producto con scroll 3D"><style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:${bg};color:${ink};font:500 16px/1.5 Inter,Arial,sans-serif;overflow-x:hidden}nav{position:fixed;inset:0 0 auto;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:22px 5vw;color:#fff;mix-blend-mode:difference}.brand{font-weight:900;letter-spacing:-.04em}.navcta{border:1px solid currentColor;border-radius:99px;padding:8px 16px}.hero{height:190vh;position:relative}.stage{position:sticky;top:0;height:100vh;display:grid;place-items:center;perspective:1200px;overflow:hidden;background:radial-gradient(circle at 50% 45%,${accent}44,transparent 42%)}.orb{position:absolute;width:54vw;height:54vw;border-radius:50%;background:${accent};filter:blur(1px);opacity:.92;transform:translateZ(-220px) scale(.75)}.heroimg{width:min(46vw,620px);height:min(70vh,720px);object-fit:cover;border-radius:28px;box-shadow:0 45px 110px #0007;transform-style:preserve-3d;will-change:transform}.copy{position:absolute;z-index:3;width:90vw;text-align:center;color:#fff;text-shadow:0 3px 30px #0008}.eyebrow{text-transform:uppercase;letter-spacing:.22em;font-size:12px}.copy h1{font-size:clamp(58px,11vw,170px);line-height:.78;margin:22px 0;letter-spacing:-.08em}.copy p{max-width:580px;margin:auto;font-size:clamp(16px,2vw,22px)}.story{padding:14vh 5vw;background:${ink};color:${bg}}.storyhead{display:flex;justify-content:space-between;gap:30px;align-items:end;max-width:1200px;margin:auto auto 12vh}.story h2{font-size:clamp(44px,7vw,100px);line-height:.9;letter-spacing:-.06em;margin:0}.storyhead p{max-width:390px}.cards{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:11vh 5vw;perspective:1000px}.card{min-height:78vh;position:relative;transform-style:preserve-3d;will-change:transform}.card:nth-child(even){margin-top:24vh}.card img{width:100%;height:66vh;object-fit:cover;border-radius:24px}.card h3{font-size:32px;margin:20px 0 5px}.card p{opacity:.68}.final{min-height:100vh;display:grid;place-items:center;text-align:center;padding:10vw;background:${accent};color:#fff}.final h2{font-size:clamp(55px,10vw,145px);letter-spacing:-.08em;line-height:.82;margin:0}.button{display:inline-block;margin-top:36px;background:#fff;color:#111;padding:16px 28px;border-radius:999px;font-weight:800}@media(max-width:720px){.heroimg{width:78vw;height:62vh}.orb{width:100vw;height:100vw}.cards{grid-template-columns:1fr}.card:nth-child(even){margin-top:0}.storyhead{display:block}.storyhead p{margin-top:30px}.copy h1{font-size:20vw}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.hero{height:100vh}}
</style></head><body><nav><span class="brand">${esc(page.brand)}</span><span class="navcta">Explorar colección</span></nav><main><section class="hero"><div class="stage"><div class="orb"></div><img class="heroimg" src="${hero.imageUrl}" alt="${esc(hero.title.es)}"><div class="copy"><span class="eyebrow">${esc(page.category.es)} · PRODUCTO EN FOCO</span><h1>${esc(page.brand)}</h1><p>Fotografía que convierte objetos cotidianos en una experiencia de marca extraordinaria.</p></div></div></section><section class="story"><div class="storyhead"><h2>Diseñado para<br>ser deseado.</h2><p>Dirección de arte, detalle y movimiento en una narrativa de scroll tridimensional optimizada para cada pantalla.</p></div><div class="cards"><article class="card"><img src="${second.imageUrl}" alt="${esc(second.title.es)}"><h3>${esc(second.title.es)}</h3><p>Composición editorial · Luz controlada · Acabado premium</p></article><article class="card"><img src="${third.imageUrl}" alt="${esc(third.title.es)}"><h3>${esc(third.title.es)}</h3><p>Detalle comercial · Materiales realistas · Listo para campaña</p></article></div></section><section class="final"><div><span class="eyebrow">NEXT.JS · RESPONSIVE · SCROLL 3D</span><h2>Haz que tu<br>producto hable.</h2><a class="button" href="#">Ver catálogo</a></div></section></main><script>
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;const hero=document.querySelector('.heroimg'),orb=document.querySelector('.orb'),copy=document.querySelector('.copy'),cards=[...document.querySelectorAll('.card')];function render(){if(reduce)return;const y=scrollY,v=innerHeight,p=Math.min(1,y/v);hero.style.transform='rotateX('+(p*-14)+'deg) rotateY('+(p*12-6)+'deg) translateZ('+(p*180)+'px) scale('+(1-p*.12)+')';orb.style.transform='translateZ(-220px) scale('+(0.75+p*.8)+')';copy.style.transform='translate3d(0,'+(p*-180)+'px,'+(p*140)+'px)';copy.style.opacity=String(1-p*.85);cards.forEach((c,i)=>{const r=c.getBoundingClientRect(),q=Math.max(-1,Math.min(1,(r.top-innerHeight*.5)/innerHeight));c.style.transform='rotateY('+(q*(i%2?9:-9))+'deg) rotateX('+(q*-5)+'deg) translateZ('+(Math.abs(q)*-80)+'px)'})}addEventListener('scroll',render,{passive:true});addEventListener('resize',render);render();
</script></body></html>`;
}

function nextPage(page) {
  const images = page.assets.map(x => x.imageUrl);
  return `import Image from 'next/image';\nimport './product-scroll.css';\n\nexport default function Page() {\n  const images = ${JSON.stringify(images)};\n  return (\n    <main data-template="product-scroll-3d">\n      <section className="hero"><p>${page.category.es} · ${page.category.en}</p><h1>${page.brand}</h1><Image src={images[0]} alt="${page.assets[0].title.es}" fill priority /></section>\n      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={\`Producto \${index + 1}\`} width={900} height={1100} />)}</section>\n    </main>\n  );\n}\n`;
}

function description(page, lang) {
  const es = lang === 'es';
  return es
    ? `Crea una landing Premium en Next.js para “${page.brand}”, una marca de ${page.category.es.toLowerCase()}. La experiencia debe usar scroll 3D cinematográfico, imágenes de producto reales, hero sticky, profundidad con perspectiva CSS, tarjetas editoriales, transiciones suaves y CTA final. Incluye App Router, next/image, TypeScript, diseño responsive, prefers-reduced-motion, SEO, accesibilidad y componentes organizados. Optimiza las imágenes y evita animaciones pesadas. Entrega el proyecto completo listo para personalizar y desplegar.`
    : `Create a Premium Next.js landing page for “${page.brand}”, a ${page.category.en.toLowerCase()} brand. Use cinematic 3D scroll, real product imagery, a sticky hero, CSS perspective depth, editorial cards, smooth transitions, and a final CTA. Include App Router, next/image, TypeScript, responsive design, prefers-reduced-motion, SEO, accessibility, and organized components. Optimize all imagery and avoid heavy animation. Deliver a complete project ready to customize and deploy.`;
}

async function screenshots(pages) {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { console.warn('Playwright unavailable; screenshots skipped'); return; }
  let browser;
  try { browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }); }
  catch { try { browser = await chromium.launch({ headless: true }); } catch { console.warn('Browser unavailable; screenshots skipped'); return; } }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  for (const page of pages) {
    const tab = await context.newPage();
    await tab.goto(`file://${path.join(webRoot,page.slug,'index.html')}`, { waitUntil: 'load' });
    await tab.screenshot({ path: path.join(webRoot, page.preview), type: 'png' });
    await tab.close();
  }
  await browser.close();
}

async function main() {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const retained = data.webPages.filter(page => !page.tags?.includes(COLLECTION_TAG));
  const pages = [];
  let n = 0;
  for (const category of categories) for (let i=0; i<category.count; i++) {
    n++;
    const brand = category.nouns[i];
    const slug = `product-scroll-3d-${category.key}-${String(i+1).padStart(2,'0')}-${slugify(brand)}`;
    pages.push({ id: String(400+n), brand, slug, preview: `product-scroll-3d-${String(n).padStart(2,'0')}.png`, category, assets: assetsFor(category,i) });
  }
  for (const page of pages) {
    const dir = path.join(webRoot, page.slug);
    fs.mkdirSync(path.join(dir,'app'), { recursive: true });
    fs.writeFileSync(path.join(dir,'index.html'), html(page));
    fs.writeFileSync(path.join(dir,'app','page.tsx'), nextPage(page));
    fs.writeFileSync(path.join(dir,'app','layout.tsx'), `export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="es"><body>{children}</body></html>; }\n`);
    fs.writeFileSync(path.join(dir,'app','product-scroll.css'), '/* Production styles are represented in the included interactive preview. */\n');
    fs.writeFileSync(path.join(dir,'package.json'), JSON.stringify({ private:true, scripts:{dev:'next dev',build:'next build'}, dependencies:{next:'^15.0.0',react:'^19.0.0','react-dom':'^19.0.0'}, devDependencies:{typescript:'^5.0.0','@types/react':'^19.0.0'} },null,2)+'\n');
  }
  await screenshots(pages);
  data.webPages = [...retained, ...pages.map(page => ({
    id: page.id,
    title: { en: `${page.brand} — 3D Scroll ${page.category.en} Store`, es: `${page.brand} — Tienda 3D de ${page.category.es}` },
    description: { en: description(page,'en'), es: description(page,'es') },
    imageUrl: `/webpages/${page.preview}`,
    imageHint: { en: `${page.category.en} Next.js product photography cinematic 3D scroll ecommerce landing`, es: `${page.category.es} Next.js fotografía de producto landing ecommerce scroll 3D cinematográfico` },
    demoUrl: page.slug,
    stack: ['Next.js','React','TypeScript','next/image','CSS 3D','JavaScript'],
    tags: [COLLECTION_TAG,'Scroll 3D','Next.js','Product Photography','Fotografía de producto',page.category.en,page.category.es,'E-commerce','Responsive'],
    membership: 'Premium', price: '15.00'
  }))];
  fs.writeFileSync(catalogPath, JSON.stringify(data,null,2)+'\n');
  console.log(JSON.stringify({ created: pages.length, catalog: data.webPages.length, first: pages[0].slug, last: pages.at(-1).slug },null,2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
