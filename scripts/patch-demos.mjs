import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..', 'public', 'webpages');
const webPagesJsonPath = path.join(root, 'web-pages.json');

const webPagesData = JSON.parse(fs.readFileSync(webPagesJsonPath, 'utf8'));
const webPages = webPagesData.webPages || [];

const dirs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let updated = 0;
let skipped = 0;

for (const dir of dirs) {
  const indexPath = path.join(root, dir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    skipped++;
    continue;
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  const originalHtml = html;

  // Attempt to remove old modal HTML blocks
  html = html.replace(/<div[^>]*id="ps-email-modal"[^>]*>[\s\S]*?(?=<script|<\/body)/gi, '');
  html = html.replace(/<div[^>]*id="ps-prompt-modal"[^>]*>[\s\S]*?(?=<script|<\/body)/gi, '');
  html = html.replace(/<div[^>]*data-free-download-modal[^>]*>[\s\S]*?(?=<script|<\/body)/gi, '');
  html = html.replace(/<div[^>]*data-prompt-display-modal[^>]*>[\s\S]*?(?=<script|<\/body)/gi, '');

  // Remove inline scripts that query those modals
  html = html.replace(/<script>\s*(?:const|let|var)\s*(?:authModal|downloadTrigger|promptModal|promptTrigger)[^]*?<\/script>/gi, '');
  html = html.replace(/<script>\s*document\.getElementById\('ps-email-modal'\)[^]*?<\/script>/gi, '');
  html = html.replace(/<script>[\s\S]*?const authModal = document\.querySelector\('\[data-free-download-modal\]'\);[\s\S]*?<\/script>/g, '');

  // Find the prompt text for this specific demo
  const wp = webPages.find(p => 
    p.demoUrl === dir || 
    (p.slug && p.slug === dir) || 
    String(p.id) === dir
  );

  let promptText = '';
  if (wp && wp.description) {
    if (typeof wp.description.es === 'string') {
      promptText = wp.description.es;
    } else if (wp.description.es && wp.description.es.prompt) {
      promptText = wp.description.es.prompt;
    } else if (typeof wp.description.en === 'string') {
      promptText = wp.description.en;
    } else if (wp.description.en && wp.description.en.prompt) {
      promptText = wp.description.en.prompt;
    }
  }

  const escapedPrompt = JSON.stringify(promptText);

  // Remove existing injection if any to avoid duplicates
  html = html.replace(/<script>\s*window\.__PS_PROMPT_TEXT\s*=\s*[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script src="\/webpages\/demo-actions\.js"><\/script>/gi, '');

  // Clean up any stray spaces/newlines before </body> from previous replacements
  html = html.replace(/\s*<\/body>/i, '\n</body>');

  // Re-inject right before </body>
  const injection = `
  <script>
    window.__PS_PROMPT_TEXT = ${escapedPrompt};
  </script>
  <script src="/webpages/demo-actions.js"></script>
</body>`;

  html = html.replace(/<\/body>/i, injection);

  if (html !== originalHtml) {
    fs.writeFileSync(indexPath, html, 'utf8');
    updated++;
  } else {
    skipped++;
  }
}

console.log(`Patch process completed.`);
console.log(`Updated: ${updated} index.html files.`);
console.log(`Skipped: ${skipped} directories without modifications needed (or no index.html).`);
