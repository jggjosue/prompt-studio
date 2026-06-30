const fs = require('fs');
const path = require('path');

const webPagesData = JSON.parse(fs.readFileSync('./public/webpages/web-pages.json', 'utf8'));
const freePages = webPagesData.webPages.filter(p => p.membership && p.membership.toLowerCase() === 'free');

console.log(`Found ${freePages.length} free pages`);

for (const page of freePages) {
  const indexHtmlPath = path.join('./public/webpages', page.demoUrl, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.log(`File not found: ${indexHtmlPath}`);
    continue;
  }
  
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Look for the old download button, which usually starts with <a and has data-free-download-trigger
  const btnRegex = /<a[^>]*data-free-download-trigger[^>]*>[\s\S]*?<\/a>/i;
  const match = html.match(btnRegex);
  
  if (match) {
    const oldBtn = match[0];
    const hrefMatch = oldBtn.match(/href="([^"]+)"/);
    const href = hrefMatch ? hrefMatch[1] : `/api/landing-pages/${page.id}/download`;
    
    // Generate the "Ver prompt" URL
    const title = typeof page.title === 'string' ? page.title : page.title.en;
    const description = typeof page.description === 'string' ? page.description : page.description.en;
    
    const promptData = {
      type: 'web',
      title,
      description,
      imageUrl: page.imageUrl,
      stack: page.stack || [],
      tags: page.tags || []
    };
    const promptUrl = `/prompt/edit?prompt=${encodeURIComponent(JSON.stringify(promptData))}`;

    const newButtonsHTML = `
<div style="position:fixed;right:20px;bottom:20px;z-index:99999;display:flex;align-items:center;gap:12px;background:#0d0d0d;padding:8px;border-radius:24px;border:1px solid #262626;box-shadow:0 16px 40px rgba(0,0,0,0.5)">
  <a
    href="${promptUrl}"
    target="_parent"
    aria-label="Ver prompt"
    style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid #3b82f6;border-radius:16px;background:rgba(59,130,246,0.1);color:#60a5fa;font:500 14px/1 system-ui,sans-serif;text-decoration:none;transition:all 0.2s"
    onmouseover="this.style.background='rgba(59,130,246,0.2)'"
    onmouseout="this.style.background='rgba(59,130,246,0.1)'"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    Ver prompt
  </a>
  <a
    href="${href}"
    data-free-download-trigger
    aria-label="Descargar ${title}"
    style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid transparent;border-radius:16px;background:#1a1a1a;color:#d4d4d8;font:500 14px/1 system-ui,sans-serif;text-decoration:none;transition:all 0.2s"
    onmouseover="this.style.background='#27272a';this.style.color='#fff'"
    onmouseout="this.style.background='#1a1a1a';this.style.color='#d4d4d8'"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    Descargar
  </a>
</div>
`.trim();

    html = html.replace(match[0], newButtonsHTML);
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log(`Updated ${indexHtmlPath}`);
  } else {
    console.log(`Could not find button in ${indexHtmlPath}`);
  }
}
