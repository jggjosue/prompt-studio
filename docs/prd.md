# PRD — Prompt Studio

Product requirements document **as it exists today**, not as it is planned. Everything that appears here is implemented and verifiable in the repository; what is not is explicitly marked in [Out of scope](#out-of-scope).

Operator: Magzin LLC. Domain: `www.prompstudio.com`.

Sibling document: [dm.md](dm.md) describes the entities and their shape. This one describes what the product does and for whom.

---

## 1. What it is

A commercial catalog of resources for working with generative AI —prompts, images, videos, web components, and complete landing pages— with integrated assisted generation tools. The user buys access via subscription or per unit and downloads the resources.

It is not an AI generator with an attached catalog: the curated catalog is the main product and generation is a supporting tool.

## 2. Who it serves

| Profile | What they seek | What they use |
|---|---|---|
| Design/development freelance | Ready-to-deliver resources for clients | Landing pages, components, ZIP downloads |
| Content creator | Prompts that produce repeatable results | Image and video catalog, prompt copying |
| Small business | Web presence without hiring a team | Unit web plans, live demos |
| Affiliate | Income from recommendations | Affiliate program, commissions dashboard |

## 3. Product surfaces

### 3.1 Catalog

Five resource types, each with its index, detail page, and tag navigation:

| Type | Index route | Detail | Volume |
|---|---|---|---|
| Image prompts | `/image-prompts` | `/gallery/[id]` | 299 |
| Video prompts | `/video-prompts` | `/gallery-videos/[id]` | 197 |
| Landing pages | `/landing-pages` | `/landing-pages/[slug]` | 236 |
| Web components | `/{type}-components` | — | 450 in 8 categories |
| Web animations | `/web-animations` | — | — |

The 8 component categories are: login, header, text, form, button, card, navigation, sidebar.

**Cross-navigation**: `/tags/[slug]` and `/category/[slug]` generate pages per tag and category from the catalog (programmatic SEO). Only those exceeding a minimum number of elements are published, to avoid generating empty pages.

**Search**: `/smart-search` with `/api/search/intent`, which scores by intention extracted from the query (including budget) in addition to word matching.

### 3.2 Access and monetization

Two independent axes that coexist:

**Subscription** (`PlanId`: `free` | `premium` | `startup`)

| Plan | Monthly | Annual |
|---|---|---|
| free | $0 | $0 |
| premium | $9 | $54 |
| startup | $1,000 | $10,000 |

**Unit purchase** — fixed-price web plans, each with its checkout page: mini ($5), entrepreneur ($10), professional ($15), business ($20), premium ($35), elite ($50), corporate ($100), advanced ($200), master ($500).

Every catalog resource has a `membership` level (`Free` or `Premium`); today the distribution is 223 free and 312 premium. Access is resolved on the server: the price never travels from the client.

**Downloads**: purchased resources are delivered as a ZIP using a signed token linked to the purchase and the user, with a download counter and cap.

### 3.3 AI Generation

Asynchronous job queue with credit accounting. Three types:

| Type | Credits | Estimated cost | Providers |
|---|---|---|---|
| `image` | 1 | $0.04 | google, openai, fal, replicate |
| `video` | 3 | $0.35 | runway, veo, kling, luma, pika, hailuo, sora |
| `project` | 2 | $0.08 | google, openai, anthropic, deepseek |

Requirements guaranteed by the system:

- **Idempotency**: every submission requires an `Idempotency-Key` of at least 8 characters. A resubmission returns the existing job, not a new one.
- **Credits reserved before execution** and captured or refunded based on the result. A provider failure does not consume balance.
- **Execution outside the request**: creation enqueues; a cron processes. User routes never wait for the provider.
- **Retries with lease**: a job taken by a processor is locked for 5 minutes; if the processor dies, another picks it up.
- **Per-user limit**: 10 creations per minute, counted by `userId` and not by IP, because the cost is charged to the account.

Interfaces: `/generate-images`, `/generate-videos`, `/generate-webs`.

### 3.4 Component tools

`/component-builder`, `/page-composer`, `/component-compare`, `/component-kits`, `/code-auditor`, `/my-components`. They allow composing, comparing, customizing, and exporting components; the export produces a downloadable package or a sandbox.

### 3.5 Affiliate program

`/affiliate-program` with manual application and approval. Every affiliate has a referral code; clicks (deduplicated by `visitorKey`) and sales are registered with their commission. Dashboard in `/dashboard/affiliate-applications` with daily and per-product aggregates. Payout via PayPal, with manual request above a threshold.

### 3.6 Account and dashboard

`/dashboard/profile`, `/billing`, `/library`, `/generations`, `/campaigns`, `/landing-editor`, `/observability`. Authentication with Clerk. All these routes are dynamic by definition: they are never prerendered.

## 4. Cross-cutting requirements

### 4.1 Internationalization

Spanish and English. **The language does not appear in the URL**: the middleware resolves it and rewrites internally to `/{locale}{route}`, so the visitor always sees `/prices`, never `/es/prices` or `/en/prices`.

Detection precedence, from highest to lowest:

1. `locale` cookie — an explicit user choice is never contradicted.
2. `accept-language` header.
3. Country detected at the edge (Latin America and Spain → Spanish).
4. `en` by default.

URLs with a prefix are internal: if one arrives from outside, it is consolidated with a 308 redirect to the canonical one without a prefix, to avoid serving the same content on two URLs.

### 4.2 Performance

- 202 prerendered pages (99 in English, 99 in Spanish, plus metadata).
- Public HTML is served from the prerender cache, without per-request rendering.
- Per-user routes are explicitly marked dynamic.
- Images in AVIF with WebP fallback; static assets immutable for a year.
- Catalogs are served paginated and with a hash in the name, not as a monolithic JSON imported from the client.

### 4.3 Security

- Base headers in block mode: HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP.
- CSP with origin allowlist, in `Report-Only` until `CSP_ENFORCE=true`. Separate policy for static demos in `/webpages/*`, which load from public CDNs.
- Rate limiting on public write routes and AI job creation.
- Maintenance routes (`/api/sync-*`, crons) require `CRON_SECRET` or an administrator session, with constant-time comparison.
- Stripe and Clerk webhooks verified by signature.

### 4.4 Compliance

Policies published in both languages: privacy, cookies, licenses, no refunds, terms. They expressly adhere to GDPR and CCPA/CPRA. Cookie consent registered per user with the accepted policy version.

**Current restriction**: the privacy policy declares that user data is not used to train proprietary models without specific consent. Any initiative to license data must start there.

### 4.5 SEO

It is a product requirement, not an optimization: the catalog is discovered through search. Canonicals, sitemap, structured data, internal linking, and programmatic pages by tag. The repository includes 12 executable validators (`npm run seo:validate-all`).

Design consequence: **URLs are not changed without a reason that outweighs the cost in rankings.** This is what ruled out putting the language in the route.

### 4.6 Observability

Technical and commercial events in `observability_events` with 90-day retention. Prompts, code, keys, or full URLs are not saved.

## 5. Acceptance criteria

A change is acceptable if, in addition to fulfilling its purpose:

1. `npm run test:ci` passes — includes the secrets guardrail, typecheck, unit and data tests, and the cache audit.
2. `next build` completes without errors.
3. It does not increase the number of dynamic routes without justification.
4. It does not introduce real values in `.env.example` (`npm run verify:env-example`).
5. Existing public URLs continue to respond, or carry a 308 redirect.

## 6. Out of scope

Not implemented today, despite appearing in conversations or configuration:

- **Licensing the catalog as a dataset to AI platforms.** The provenance layer (`src/lib/catalog-provenance.ts`) and its audit exist, but there is no exporter, no data card, and the `aiAssisted` and `consent` fields are not declared.
- **`hreflang`**: the site is bilingual but does not declare language alternates.
- **Subresource Integrity** on demos: they load from public CDNs without `integrity`.
- **Nonce in the CSP**: `script-src` keeps `'unsafe-inline'` because the nonce would force dynamic rendering and void the prerender.
