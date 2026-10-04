# Cloudflare Workers migration baseline

Tracking issue: #1124  
Epic: #1123

## Migration branch

All migration changes must be committed to:

`migrate/cloudflare-workers`

The production/default branch (`main`) remains unchanged until the Cloudflare deployment has passed validation and the production cutover is explicitly performed.

## Initial vinext compatibility baseline

Command:

```bash
npx vinext check
```

Result:

- Overall compatibility: **85%**
- Imports: **9/11 fully supported**
- Config: **7/9 supported**
- Libraries: **8/10 compatible**
- App Router detected
- 104 pages
- 5 layouts
- 167 route handlers
- 3 loading boundaries
- 1 error boundary

### Blocking issues

1. `next/dist/compiled/path-to-regexp/index.js` is not recognized by vinext.
2. Custom `webpack` configuration requires migration because Vite replaces webpack.
3. `@clerk/nextjs` deep Next.js middleware integration is not compatible.
4. `package.json` is missing `"type": "module"`, required by Vite.

### Partial support

- `next/font/local`: `font.className` works; `font.variable` mode is not fully supported.
- `images`: remote patterns are validated; local optimization is not available.
- `next-intl`: middleware setup works, but some Server Component behavior may differ.

## Migration safety rules

- Keep Vercel production active during the migration.
- Do not commit `.env`, API keys, tokens, passwords, or other secrets.
- Cloudflare preview must pass regression testing before DNS/domain cutover.
- Maintain a rollback path to Vercel until Cloudflare production is validated.

## Next task

Proceed with #1125: resolve the internal `path-to-regexp` import.
