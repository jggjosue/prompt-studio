# vinext compatibility notes: fonts, images, and i18n

Tracking: #1129 · Epic: #1123

## Local fonts

Prompt Studio keeps `next/font/local` because vinext supports local fonts, but the
migration does not rely on `font.variable`. The root layout applies the generated
`firaSans.className` directly.

Accepted difference: vinext injects local `@font-face` CSS at runtime rather than
extracting it during the build. The font files remain self-hosted under `src/fonts/`.

## Images

Application imports from `next/image` remain unchanged. vinext provides the
component contract and responsive `srcSet` behavior, but its image pipeline is not
identical to Next.js/Vercel optimization.

Accepted migration boundary: do not rewrite image components in #1129. Cloudflare
image optimization/platform integration is evaluated with the Worker configuration
in #1130. `next.config.ts` remotePatterns remain the source allow-list.

## next-intl

The existing setup remains:
- `src/i18n/request.ts` via `getRequestConfig`;
- path-segment locale routing through `src/app/[locale]`;
- `setRequestLocale(locale)` before `getMessages()`;
- `NextIntlClientProvider` receives explicit locale and messages.

No domain-based locale routing is required by Prompt Studio.

## Validation

#1128 already proved that the App Router production bundle builds with vinext.
For #1129, rerun:

```bash
npm run build:vinext
```

Then smoke-test at least one English and one Spanish route in `npm run dev:vinext`,
plus a page containing local and remote `next/image` content.
