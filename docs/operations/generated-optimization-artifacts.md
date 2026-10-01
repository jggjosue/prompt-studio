# Generated optimization artifacts

Issue #700 audits the post-build optimization pipeline.

## Deployment policy

Vercel builds run minification and in-place media optimization only. Brotli/Gzip derivatives are **not** generated during `npm run build` because Vercel's delivery network provides transfer compression and shipping both originals and generated `.br/.gz` files increases deployment input without changing application URLs.

Self-hosted environments can explicitly run `npm run precompress:static`. That command first deletes stale `.br/.gz` derivatives and regenerates them, making repeated runs deterministic with respect to removed or renamed source files.

Generated `.br/.gz` files remain excluded by both `.gitignore` and `.vercelignore`.

## Measurement

Run `npm run audit:optimization-artifacts` before and after optimization. It reports total `public/` bytes, generated compression bytes, and the deployable total with generated compression excluded. In CI it fails when generated `.br/.gz` files are present.

To measure each stage on a clean checkout:

1. `npm run audit:optimization-artifacts`
2. `node scripts/mjs/minify-public-assets.mjs && npm run audit:optimization-artifacts`
3. `node scripts/mjs/optimize-public-media.mjs && npm run audit:optimization-artifacts`
4. For self-hosting only, `npm run precompress:static && npm run audit:optimization-artifacts`

The delta between consecutive reports is the output impact of that stage. The final Vercel artifact excludes precompressed derivatives by construction.
