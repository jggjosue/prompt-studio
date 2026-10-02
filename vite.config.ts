import vinext from 'vinext';
import { defineConfig } from 'vite';

/**
 * vinext runs alongside the existing Next.js commands during migration.
 * Cloudflare-specific Vite/platform configuration is added in #1130 after
 * local vinext compatibility is validated.
 */
export default defineConfig({
  plugins: [vinext()],
});
