/**
 * Cloudflare Workers build shim for Node-native `sharp`.
 *
 * vinext init aliases `sharp` to this module for the workerd bundle. Routes
 * that need image transcoding must use Cloudflare Images instead of invoking
 * this shim at runtime. The Node/Next build continues to use the real `sharp`
 * dependency because this alias exists only in vite.config.ts.
 */
export default function unsupportedSharpInWorker() {
  throw new Error(
    'sharp is not available in the Cloudflare Workers runtime; use Cloudflare Images for runtime transforms.'
  );
}
