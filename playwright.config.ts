import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3046', trace: 'retain-on-failure', screenshot: 'only-on-failure', launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : undefined },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
  // `npm run dev` sirve en el 3048; este servidor usa el 3046 para no pelearse
  // con el que tenga abierto quien desarrolla. Antes invocaba `npm run dev` y
  // esperaba en el 3046, así que sin PLAYWRIGHT_BASE_URL nunca arrancaba.
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: 'NEXT_PUBLIC_E2E_TEST_MODE=true next dev --turbopack -p 3046', url: 'http://127.0.0.1:3046', reuseExistingServer: !process.env.CI, timeout: 180_000 },
});
