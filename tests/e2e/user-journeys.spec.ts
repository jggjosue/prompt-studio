import { expect, test } from 'playwright/test';

const desktopOnly = (projectName: string) => projectName.includes('mobile');

test.describe('real user journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('prompt_studio_cookie_consent', 'rejected'));
  });

  test('registration and sign-in entry points render and cross-link', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Covered once; Clerk uses the same responsive component.');

    const signIn = await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    expect(signIn?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);

    const signUp = await page.goto('/sign-up?redirect_url=%2Fprices', { waitUntil: 'domcontentloaded' });
    expect(signUp?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test('a web generation completes with the deterministic provider adapter', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'The generation contract is viewport-independent.');
    await page.addInitScript(() => sessionStorage.setItem('ps_openai_key', 'e2e-openai-key'));
    await page.goto('/generate-webs', { waitUntil: 'domcontentloaded' });

    const prompt = page.getByRole('textbox', { name: 'Web Page Requirements' }).or(page.locator('textarea[name="prompt"]'));
    await prompt.fill('Create a launch page for an accessibility product');
    await page.getByRole('button', { name: 'Generate Landing Code' }).click();

    const preview = page.getByTitle('Tailwind Live Preview');
    await expect(preview).toBeVisible({ timeout: 20_000 });
    await expect(preview.contentFrame().getByRole('heading', { name: 'E2E generated landing page' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => Number(localStorage.getItem('ps_credits')))).toBe(10);
  });

  test('provider failure is shown and the same generation can be retried', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'The retry state is shared by every viewport.');
    await page.addInitScript(() => sessionStorage.setItem('ps_openai_key', 'e2e-openai-key'));
    await page.goto('/generate-webs', { waitUntil: 'domcontentloaded' });
    await page.locator('textarea[name="prompt"]').fill('[fail-once] Create a resilient landing page');

    const generate = page.getByRole('button', { name: 'Generate Landing Code' });
    await generate.click();
    const providerError = page.locator('[role="alert"]').filter({ hasText: 'Temporary provider failure' });
    await expect(providerError).toBeVisible();
    await generate.click();
    await expect(page.getByTitle('Tailwind Live Preview')).toBeVisible({ timeout: 20_000 });
    await expect(providerError).toHaveCount(0);
  });

  test('purchase UI explains checkout and download before leaving the site', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Purchase dialog is covered on desktop; mobile navigation is separate.');
    const response = await page.goto('/landing-pages/apple-iphone-video-scrub-hero/preview', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    const buy = page.getByRole('button', { name: /Buy|Comprar/ }).first();
    await expect(buy).toBeVisible();
    await buy.click();
    await expect(page.getByRole('dialog')).toContainText(/Buy and download|Comprar y descargar/);
    await expect(page.getByRole('dialog')).toContainText(/Stripe/);
  });

  test('free copy limit redirects to pricing before copying again', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'The storage-backed limit is viewport-independent.');
    await page.goto('/button-components', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const date = new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      localStorage.setItem('prompt_studio_daily_component_copies', JSON.stringify({ date: key, count: 5 }));
    });
    await page.getByRole('button', { name: /Copy prompt|Copiar prompt/ }).first().click();
    await expect(page).toHaveURL(/\/prices/);
  });

  test('language selection persists after a full reload', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Locale persistence is covered once.');
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: '127.0.0.1', path: '/' }]);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: 'Español' }).click();
    await expect(page.getByRole('button', { name: 'Cambiar idioma' })).toContainText('Español');
    expect((await page.context().cookies()).find(cookie => cookie.name === 'locale')?.value).toBe('es');
  });

  test('favorites and projects survive navigation and reload', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Local library persistence is viewport-independent.');
    await page.addInitScript(() => localStorage.setItem('prompt-studio-component-library-v1', JSON.stringify({
      favorites: ['button-001'],
      recent: [],
      collections: [],
      projects: [],
    })));
    await page.goto('/my-components', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Favoritos, colecciones y proyectos')).toBeVisible();
    await expect(page.getByText('1').first()).toBeVisible();

    await page.getByPlaceholder('Nombre del nuevo espacio').fill('Campaña E2E');
    await page.getByRole('button', { name: 'Crear' }).click();
    await expect(page.getByText('Campaña E2E')).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Campaña E2E')).toBeVisible();
  });

  test('mobile menu exposes every primary group and reaches the AI creator', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'This scenario targets the mobile disclosure navigation.');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Toggle Menu|Abrir menú/ }).click();

    await expect(page.getByRole('link', { name: 'Crear con IA' })).toBeVisible();
    await page.getByRole('button', { name: 'Webs' }).click();
    for (const group of ['Explorar', 'Crear', 'Herramientas', 'Mi biblioteca']) {
      await expect(page.getByRole('region', { name: group })).toBeVisible();
    }
    await page.getByRole('link', { name: 'Crear con IA' }).click();
    await expect(page).toHaveURL(/\/generate-webs/);
  });
});
