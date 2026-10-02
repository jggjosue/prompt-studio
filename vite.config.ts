import { cloudflare } from '@cloudflare/vite-plugin';
import { imagesOptimizer } from '@vinext/cloudflare/images/images-optimizer';
import vinext from 'vinext';
import { defineConfig } from 'vite';

/**
 * Cloudflare Workers target for the vinext migration.
 *
 * App Router RSC executes in workerd; SSR is a child environment. Keep the
 * existing Next/Vercel scripts available until production cutover.
 */
export default defineConfig({
  plugins: [
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr'],
      },
    }),
  ],
});
