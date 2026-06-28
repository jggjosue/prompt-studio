import fs from 'fs';
import path from 'path';

const webPagesDir = path.join(process.cwd(), 'public', 'webpages');

function processFolder(folderName) {
  const indexPath = path.join(webPagesDir, folderName, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Format folder name to readable title
  let derivedTitle = folderName
    .replace(/-clone/gi, ' Clone')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  
  let title = derivedTitle;
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Generate description and keywords
  const desc = `Explore ${title} - a premium high-fidelity clone and interactive webpage template built with modern web design practices, available on Prompt Studio.`;
  const cleanName = folderName.replace(/-/g, ' ');
  const kw = `${cleanName}, clone, design, three.js, webgl, interactive, template, landing page, prompt studio`;

  // Check if meta description already exists
  const hasDesc = /<meta\s+name=["']description["']/i.test(html);
  const hasKeywords = /<meta\s+name=["']keywords["']/i.test(html);

  let headInsert = '';
  if (!hasDesc) {
    headInsert += `\n  <meta name="description" content="${desc}">`;
  }
  if (!hasKeywords) {
    headInsert += `\n  <meta name="keywords" content="${kw}">`;
  }

  if (headInsert) {
    // Insert after <head> or <meta charset>
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${headInsert}`);
    } else if (html.includes('<head >')) {
      html = html.replace('<head >', `<head>${headInsert}`);
    }
  }

  // Ensure title has a good format
  if (!html.includes('<title>')) {
    html = html.replace('</head>', `  <title>${title} | Prompt Studio</title>\n</head>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`Updated SEO for: ${folderName}`);
}

// Read directory
const folders = fs.readdirSync(webPagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'refactory-online')
  .map(dirent => dirent.name);

folders.forEach(folder => {
  processFolder(folder);
});
