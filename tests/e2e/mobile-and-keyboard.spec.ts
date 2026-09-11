import { expect, test } from 'playwright/test';

test('public catalog has no horizontal overflow on mobile', async ({ page }) => {
  await page.goto('/image-prompts', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('primary navigation is reachable and operable by keyboard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Mobile navigation uses a separate disclosure flow.');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  const tag = await focused.evaluate(element => element.tagName.toLowerCase());
  expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tag);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});

test('visible local links and images do not return missing responses', async ({ page }) => {
  const failed = new Set<string>();
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === new URL(page.url() || 'http://127.0.0.1:3046').origin && response.status() === 404 && /(?:_next\/image|\.(?:png|jpe?g|webp|avif|svg)|\/landing-pages\/)/i.test(url.pathname)) failed.add(url.pathname);
  });
  await page.goto('/landing-pages', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(750);
  expect([...failed], `Recursos inexistentes: ${[...failed].join(', ')}`).toEqual([]);
});
