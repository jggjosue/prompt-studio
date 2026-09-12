# Worker Agents

How many agents can work on Prompt Studio at the same time, which area of the code
each one owns, and how work is distributed so they don't step on each other's toes.

## The Short Answer

**There is no fixed number of agents allowed by the platform.** The real limit
is not a product quota; it is **file collision**: two agents editing the same
module will overwrite each other. The useful question is not "how many fit"
but "how many independent zones this repository has," and here there are **ten**.

The concrete data that does exist:

| Metric | Value |
| --- | ---: |
| Non-overlapping work zones | 10 |
| Recommended parallel agents on the same repo | 3 to 4 |
| Limit per orchestration (`Workflow`, "medium" profile) | fewer than 15 |
| Agents with isolation in their own *worktree* | no practical limit |

The figures in the second and third rows have different origins and should not be
confused. The limit of 15 is a guidance setting for the workspace environment,
adjustable from `/config` → "Dynamic workflow size". The 3 to 4 recommendation is
derived from this repository: above that, the time spent resolving conflicts
exceeds what is gained in parallel, unless each agent works in an isolated *worktree*.

## Scope Size

What needs to be distributed, measured on 2026-09-08:

| Zone | Quantity |
| --- | ---: |
| API routes | 90 |
| Pages | 83 |
| Data models | 32 |
| Logic modules (`src/lib`) | 122 |
| Components | 142 |
| Unit tests | 31 files, 135 cases |
| End-to-end tests | 3 |
| Maintenance scripts | 79 |
| `npm` scripts | 38, of which 11 are SEO validators |

## The Ten Zones

Each zone is a workstation: it has its own files, commands to verify itself,
and a "done" criteria. One agent per zone can work without coordinating with the others.

### 1. Catalog and data

Maintains the catalog inventory: integrity, provenance, and licenses.
Measured on 2026-09-08: 450 components, 275 images, 200 web pages, and 197
videos, plus 245 pages in `src/data/web-pages.json`.

- **Owns**: `src/data/`, `public/catalog/`, `scripts/build-paged-catalogs.mjs`, `scripts/audit-catalog-provenance.mjs`, `scripts/validate-catalog-coverage.mjs`
- **Verifies with**: `npm run test:data`, `npm run catalog:provenance`
- **Done when**: Valid JSON files, unique identifiers, and existing local media
- **Known pending**: Nothing blocking

### 2. Technical SEO

Eleven automated validators and the internal link graph.

- **Owns**: `scripts/validate-*-seo.mjs`, `scripts/audit-webpages-seo.mjs`, `src/lib/internal-link-graph.ts`, `sitemap.xml`, `robots.txt`, page metadata
- **Verifies with**: `npm run seo:validate-all`
- **Done when**: All eleven validators are in green (`seo:validate-all` groups them)
- **Known pending**: Missing `hreflang`; `alternates` in `src/app/[locale]/layout.tsx` only declares `canonical`, without `languages`. Missing `aggregateRating` in product JSON-LD, which requires ISR or a build step that reads the database

### 3. Commerce and payments

Stripe, checkout, purchases, credits, subscriptions, and affiliates.

- **Owns**: `src/lib/stripe*`, `src/lib/credit-*`, `src/app/api/webhooks/stripe/`, `src/app/api/*checkout*`, `src/models/*Purchase*`, `src/models/Affiliate*`
- **Verifies with**: `npm run test:unit`
- **Done when**: Every credit addition is idempotent against Stripe retries and no amount originates from the client
- **Known pending**: Abandoned cart recovery (`checkout.session.expired` events are logged but not used); team seats; API keys for clients

### 4. AI Generation

The job queue, providers, credit accounting, and batches.

- **Owns**: `src/lib/ai-job-*`, `src/lib/campaign-orchestrator.ts`, `src/lib/batch-generation.ts`, `src/lib/prompt-*`, `src/app/api/ai/`
- **Verifies with**: `npm run test:unit`
- **Done when**: No credit reservation is left orphaned; retries do not charge twice
- **Documentation**: `docs/ai-generation-queue.md`

### 5. Interface and accessibility

142 components and 83 pages.

- **Owns**: `src/components/`, `src/app/[locale]/**/*.tsx`
- **Verifies with**: `npm run test:e2e`
- **Done when**: Keyboard-navigable, no content shift, images with alt text
- **Caution**: It is the zone that collides most with others, because almost every feature touches a component

### 6. Performance

Network budgets and Core Web Vitals.

- **Owns**: `scripts/optimize-public-media.mjs`, `scripts/precompress-static.mjs`, `scripts/minify-public-assets.mjs`, `next.config.*`
- **Verifies with**: `npm run test:e2e:performance`
- **Done when**: LCP < 2,500 ms, INP < 200 ms, CLS < 0.1, initial JavaScript < 200 KB
- **Documentation**: `docs/testing.md`

### 7. Security

Headers, rate limits, authorization contracts, and secret rotation.

- **Owns**: `src/middleware.ts`, `src/lib/rate-limit*`, `src/lib/cache-policy.ts`, `tests/unit/api-security-contracts.test.ts`, `tests/unit/security-*`
- **Verifies with**: `npm run test:unit`, `npm run verify:env-example`, `npm run verify:rotation`
- **Done when**: No authenticated route without rate limiting; no custom response with public cache
- **Known pending**: CSP image hosts must be declared before activating it
- **Documentation**: `docs/rotacion-de-credenciales.md`

### 8. Observability

Events, operational errors, and PII sanitization.

- **Owns**: `src/lib/observability-*`, `src/models/ObservabilityEvent.ts`, `src/app/api/observability/`, `src/app/[locale]/dashboard/observability/`
- **Verifies with**: `npm run test:unit`
- **Done when**: No event saves un-sanitized personal data
- **Documentation**: `docs/observability.md`

### 9. Quality and testing

Coverage of what already exists, not new features.

- **Owns**: `tests/`
- **Verifies with**: `npm test`, `npm run typecheck`
- **Done when**: Every bug fix includes a test that prevents regression
- **House convention**: The test explains in a comment **what would break** if the check were removed, not just what it checks

### 10. Editorial content and translation

Product copy, published prompts, and both languages.

- **Owns**: `messages/es.json`, `messages/en.json`, landing copy, publishing guidelines
- **Verifies with**: `npm run test:data`
- **Done when**: No orphaned translation key in either language
- **Known pending**: Post-purchase email notice asking for a review (Resend is already integrated)

## Rules to Avoid Stepping on Each Other

Without these rules, four parallel agents produce less than a single one.

1. **One agent, one zone.** The owner of the zone is the only one editing its files.
2. **Shared boundaries are negotiated upfront.** `src/lib/mongoose.ts`,
   `src/middleware.ts`, `messages/*.json`, `package.json`, and `next.config.*` can
   be touched and broken by anyone. Anyone needing to change them announces it
   before starting, not after.
3. **Data models have a single owner per file.** Adding a field is safe; changing
   a unique index **is not** and requires a migration: MongoDB rejects two indexes
   with the same key and different options.
4. **Nobody considers work done without `npm run typecheck` and `npm test`.** They
   are fast and catch collisions before they reach the repository.
5. **More than four agents, each in their own *worktree*.** Working on isolated
   copies of the repository eliminates collisions at the cost of integrating at
   the end.
6. **The interface is distributed by page, not by component.** It is the area with
   the most overlap: two agents on the same page step on each other even if touching
   different components.

## Suggested Breakdown for Three Agents

If only three agents are going to be launched, this is the distribution with the
least overlap and highest value:

| Agent | Zones | First Task |
| --- | --- | --- |
| A | Commerce (3) + Security (7) | Abandoned cart using already registered Stripe events |
| B | SEO (2) + Content (10) | `hreflang` between both languages |
| C | Interface (5) + Performance (6) | Network budgets on catalog pages |

Quality (9) is not assigned: it is the responsibility of each agent for their own zone.

## Before Launching Any Agent

The project requires **Node 22.11 or higher** and does not support mixing `arm64`
and `x64` installations in the same `node_modules`. On a Mac with Apple Silicon, an
`x86_64` Node compiles `node_modules` with the wrong binary and the build fails
when loading SWC. Verification:

```bash
node -p "process.version + ' ' + process.arch"
```

It must say `arm64` on Apple Silicon. If it says `x64`, reinstall Node before
distributing work, or all agents will inherit a broken build.

## What This Document Does Not Cover

The **product's** AI agents—the generation queue, prompt optimizer, campaign
assistant—are not code workstations: they are features being sold. They are
described in `docs/ai-generation-queue.md` and in `docs/prd.md`.