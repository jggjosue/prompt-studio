const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.srt': 'text/plain',
  '.txt': 'text/plain',
};

function serve(root) {
  const server = http.createServer((request, response) => {
    const clean = request.url.split('?')[0] === '/' ? 'index.html' : request.url.split('?')[0].slice(1);
    const file = path.join(root, clean);
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      response.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  let browser;
  let server;
  try {
    console.error('starting server');
    server = await serve(process.cwd());
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    console.error(`server ${baseUrl}`);
    console.error('launching browser');
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    const out = {};
    for (const cfg of [
      { name: 'desktop', viewport: { width: 1440, height: 920 } },
      { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
    ]) {
      console.error(`viewport ${cfg.name}`);
      const page = await browser.newPage({ viewport: cfg.viewport, isMobile: Boolean(cfg.isMobile) });
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      console.error(`goto ${cfg.name}`);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.error(`loaded ${cfg.name}`);
      await page.waitForTimeout(2200);
      console.error(`evaluating ${cfg.name}`);
      const first = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const hero = document.querySelector('.hero').getBoundingClientRect();
        return {
          title: document.querySelector('h1')?.textContent,
          canvas: { width: canvas?.width, height: canvas?.height },
          hero: { height: hero.height, bottom: hero.bottom },
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          navOpen: document.querySelector('.nav')?.classList.contains('is-open'),
        };
      });
      console.error(`hotspot ${cfg.name}`);
      await page.click('[data-hotspot="0"]');
      await page.waitForTimeout(300);
      const modalOpen = await page.locator('#detail-modal.is-open').count();
      await page.click('#modal-close');
      console.error(`collections ${cfg.name}`);
      if (cfg.name === 'mobile') {
        await page.click('#nav-toggle');
        await page.waitForTimeout(200);
      }
      await page.click('text=Explore Collections');
      await page.waitForTimeout(900);
      const collectionY = await page.evaluate(() => ({
        hash: location.hash,
        scrollY,
        collectionsTop: document.querySelector('#collections').getBoundingClientRect().top,
      }));
      console.error(`plan ${cfg.name}`);
      await page.click('[data-plan="Guided Digital Tour"]');
      await page.waitForTimeout(900);
      const plan = await page.evaluate(() => ({
        visit: document.querySelector('#visit-type').value,
        status: document.querySelector('#form-status').textContent,
        hash: location.hash,
        contactTop: document.querySelector('#contact').getBoundingClientRect().top,
      }));
      console.error(`form ${cfg.name}`);
      await page.fill('#name', 'QA Visitor');
      await page.fill('#email', 'visitor@example.com');
      await page.fill('#message', 'I would like a guided tour.');
      await page.click('#contact-form button[type="submit"]');
      await page.waitForTimeout(250);
      const form = await page.evaluate(() => document.querySelector('#form-status').textContent);
      console.error(`screenshot ${cfg.name}`);
      await page.screenshot({ path: `/tmp/museum-${cfg.name}.png`, fullPage: false });
      out[cfg.name] = { first, modalOpen, collectionY, plan, form, errors };
      await page.close();
    }
    console.log(JSON.stringify(out, null, 2));
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }
})();
