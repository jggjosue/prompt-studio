import { expect, test } from 'playwright/test';

const budget = { lcpMs: 2500, inpMs: 200, cls: 0.1, initialJsCompressedBytes: 200 * 1024, cardImageBytes: 100 * 1024, catalogMs: 300 };

test('Core Web Vitals and initial JavaScript stay within budget', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { lcp: 0, cls: 0, inp: 0 };
    Object.defineProperty(window, '__performanceBudget', { value: state });
    try { new PerformanceObserver(list => { const entry = list.getEntries().at(-1); if (entry) state.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
    try { new PerformanceObserver(list => { for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) if (!entry.hadRecentInput) state.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
    try { new PerformanceObserver(list => { for (const entry of list.getEntries() as Array<PerformanceEntry & { interactionId?: number }>) if (entry.interactionId) state.inp = Math.max(state.inp, entry.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit); } catch {}
  });
  const scripts: Array<{ bytes: number; encoded: boolean }> = [];
  page.on('response', response => { if (response.request().resourceType() !== 'script') return; const length = Number(response.headers()['content-length'] || 0); if (length) scripts.push({ bytes: length, encoded: Boolean(response.headers()['content-encoding']) }); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.mouse.click(10, 10);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  const vitals = await page.evaluate(() => (window as unknown as Window & { __performanceBudget: { lcp: number; cls: number; inp: number } }).__performanceBudget);
  expect(vitals.lcp).toBeGreaterThan(0);
  expect(vitals.lcp).toBeLessThan(budget.lcpMs);
  expect(vitals.cls).toBeLessThan(budget.cls);
  if (vitals.inp > 0) expect(vitals.inp).toBeLessThan(budget.inpMs);
  const compressedScripts = scripts.filter(script => script.encoded);
  test.skip(compressedScripts.length === 0, 'El servidor local no comprime; ejecuta contra PLAYWRIGHT_BASE_URL de producción para validar 200 KB.');
  expect(compressedScripts.reduce((sum, script) => sum + script.bytes, 0)).toBeLessThan(budget.initialJsCompressedBytes);
});

test('catalog response and optimized card images stay within budget', async ({ page, request }) => {
  const started = performance.now();
  const catalog = await request.get('/api/catalog/images?locale=es&offset=0&limit=24');
  const elapsed = performance.now() - started;
  expect(catalog.ok()).toBeTruthy();
  expect(elapsed).toBeLessThan(budget.catalogMs);
  const imageSizes: number[] = [];
  page.on('response', response => { if (response.request().resourceType() !== 'image') return; const length = Number(response.headers()['content-length'] || 0); if (length) imageSizes.push(length); });
  await page.goto('/image-prompts', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(1500);
  expect(imageSizes.length).toBeGreaterThan(0);
  for (const size of imageSizes.slice(0, 12)) expect(size).toBeLessThan(budget.cardImageBytes);
});
