/**
 * Preload for Node processes that run server code outside Next.js: unit tests,
 * the training worker and the dataset CLIs.
 *
 * `server-only` throws whenever it is resolved without the `react-server`
 * condition, which is how Next.js keeps server modules out of client bundles.
 * Plain Node never sets that condition, so every module that imports it fails
 * to load. Enabling `--conditions=react-server` globally is not an option: it
 * also switches React to its server build and breaks component tests.
 *
 * This hook resolves only the `server-only` specifier to an empty module. The
 * guard still applies inside Next.js builds, which do not load this file.
 *
 *   node --import tsx --import ./scripts/node/server-only-shim.mjs ...
 */
import { registerHooks } from 'node:module';

const EMPTY_MODULE = new URL('./server-only-empty.cjs', import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: EMPTY_MODULE, format: 'commonjs', shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
