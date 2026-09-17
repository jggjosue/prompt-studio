const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const data = require('../src/data/web-pages.json');

const targetDemo = process.argv[2];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 2 });

  const projectsToScreenshot = targetDemo 
    ? data.webPages.filter(p => p.demoUrl === targetDemo)
    : data.webPages;

  for (const project of projectsToScreenshot) {
    if (!project.demoUrl) continue;
    
    const demoDir = path.join(__dirname, '..', 'public', 'webpages', project.demoUrl);
    let htmlPath = path.join(demoDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(demoDir, `webpages_${project.demoUrl}_index.html`);
    }

    if (fs.existsSync(htmlPath)) {
      const fileUrl = 'file://' + htmlPath;
      console.log(`Taking screenshot of ${project.demoUrl}...`);
      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        
        const outPath = path.join(__dirname, '..', 'public', project.imageUrl);
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        await page.screenshot({ path: outPath, type: 'webp', quality: 90 });
        console.log(`Saved screenshot to ${outPath}`);
      } catch (err) {
        console.error(`Failed to screenshot ${project.demoUrl}:`, err.message);
      }
    } else {
      console.log(`Could not find HTML for ${project.demoUrl}`);
    }
  }

  await browser.close();
})();
