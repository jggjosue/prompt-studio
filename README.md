# Prompt Studio

AI creation catalog and studio: ready-to-use prompts, image, video and web page generation, a visual component editor, and the commerce that supports it —subscriptions, one-off purchases, and an affiliate program—.

> **Status**: in production at `https://www.prompstudio.com`. Working branch
> `develop`; `main` is deployed.

---

## The problem it solves

Anyone using generative models wastes most of their time in two places:
writing the prompt and adapting the result. Prompt Studio tackles both:

- **Catalog** of tested prompts for image, video, web and interface components,
  with their preview and tags.
- **Generators** that execute those prompts against multiple providers without leaving
  the site, with credits, retries, and cost control.
- **Visual component editor**, allowing you to compose an interface by
  dragging blocks and get the exact prompt that reproduces it.

---

## Main features

| Area | What it does |
|---|---|
| **Catalog** | 450 UI components, 180 animations, 244 demo web pages, image and video prompts. Search, tags, and pages per model |
| **AI Generation** | Five families of providers (OpenAI, Anthropic, Google Gemini/Veo, Runway, DeepSeek) behind a common interface, with job queue, progress, retries, and credit accounting |
| **Visual editor** | Component tree with drag and drop, layers panel, inspector per breakpoint, undo/redo via commands, and autosave |
| **Commerce** | Subscriptions and purchases with Stripe, component kits, creator marketplace, and affiliate program with commissions and payouts |
| **Internationalization** | Spanish and English, detected in the middleware and served without language prefix in the URL |
| **Programmatic SEO** | Sitemap, canonicals, structured data, and 12 automatic validators |

---

## Technology

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) · React 19 |
| Language | TypeScript 6 in `strict` mode |
| Styles | Tailwind CSS · Radix UI · Framer Motion |
| Data | MongoDB with Mongoose (45 models) |
| Identity | Clerk (with signed webhooks via `svix`) |
| Payments | Stripe |
| AI | Genkit and custom adapters per provider |
| Storage | Cloudflare R2 · AWS S3 |
| Email | Resend |
| Deployment | Vercel |

---

## Architecture at a glance

```
Browser
   │
   ├── middleware (src/proxy.ts) ── language, redirects, security headers
   │
   ├── src/app/[locale]/**      91 pages (server and client components)
   ├── src/app/api/**          105 API routes
   │      ├── identity: Clerk · signed webhooks · CRON_SECRET · admin
   │      ├── commerce: stripe, credits, affiliates, marketplace
   │      └── AI:       job queue, evaluation, provider quality
   │
   ├── src/lib/**              business logic, without React dependencies
   ├── src/models/**           Mongoose schemas
   └── src/data/**             versioned catalog (outside of `public/`)
```

The details are in [docs/CODEBASE_AUDIT.md](docs/CODEBASE_AUDIT.md), which measures the
real state of the repository, and in [docs/editor/](docs/editor/) for the visual
editor.

---

## Installation

**Requirements**: Node.js **≥ 22.11** (see `.nvmrc`) and a MongoDB instance.

```bash
nvm use            # uses the version from .nvmrc
npm ci             # `preinstall` checks Node version
cp .env.example .env.local
npm run dev        # http://localhost:3048
```

`npm ci` intentionally fails with older Node versions: the project uses APIs
that do not exist before version 22.

---

## Configuration

All variables are declared —with example values, never real ones— in
[.env.example](.env.example). The essential ones to start:

| Variable | For what |
|---|---|
| `MONGODB_URI` | Database |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Identity |
| `STRIPE_SECRET_KEY` | Payments |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`… | AI Generation (each provider is optional separately) |
| `DOMAIN` | Canonical URL of the site |
| `CRON_SECRET` | Authorizes scheduled tasks and `sync-*` |

`npm run verify:env-example` checks that `.env.example` does not contain real
values; it is part of `npm run validate`.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3048 |
| `npm run build` | Production build + minification, media optimization, and precompression |
| `npm start` | Serves the build |
| **`npm run validate`** | **Complete repository health**: lint, types, coverage, `.env.example`, and cache policies |
| `npm run lint` · `lint:fix` | ESLint (configuration in `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit and data tests |
| `npm run test:coverage` | Generates `coverage/lcov.info` over all of `src/` |
| `npm run test:e2e` | Playwright |
| `npm run seo:validate-all` | The 12 SEO validators |
| `npm run catalog:build` | Regenerates paginated catalogs from `src/data` |

---

## Testing

```bash
npm test                       # unit + data
npm run test:coverage          # + lcov report in coverage/lcov.info
COVERAGE_MIN=10 npm run test:coverage   # fails below threshold
npm run test:e2e               # Playwright (needs PLAYWRIGHT_BASE_URL)
```

Coverage is measured **over all `src/` modules**, not just those that
tests import: unloaded ones come in with 0%. The resulting figure is low
and honest; details and plan are in [docs/TESTING.md](docs/TESTING.md).

---

## Codebase structure

Start at the request boundary, then follow the layer that owns the behavior you
need to change. The [documentation-to-code map](docs/audits/DOCUMENTATION_TO_CODE_MAP.md)
connects these entry points to the relevant design and operational documents.

| Area | Responsibility | Main entry points |
|---|---|---|
| Request boundary and i18n | Selects locale, protects routes, applies redirects and edge headers before Next resolves the page | [`src/proxy.ts`](src/proxy.ts), [`src/middleware.ts`](src/middleware.ts), [`src/i18n`](src/i18n), [`src/app/[locale]/layout.tsx`](<src/app/[locale]/layout.tsx>) |
| Pages and server actions | App Router pages; server components by default and server actions where a form or legacy client needs them | [`src/app/[locale]`](<src/app/[locale]>), [`src/app/[locale]/page.tsx`](<src/app/[locale]/page.tsx>), [`src/app/actions.ts`](src/app/actions.ts) |
| API | HTTP handlers that authorize, validate and orchestrate product operations | [`src/app/api`](src/app/api), [`src/app/api/ai/jobs/route.ts`](src/app/api/ai/jobs/route.ts), [`src/app/api/webhooks/stripe/route.ts`](src/app/api/webhooks/stripe/route.ts) |
| UI | Reusable interface, feature clients and the visual editor shell | [`src/components`](src/components), [`src/components/editor`](src/components/editor), [`src/hooks`](src/hooks) |
| Business logic | Provider adapters, authorization helpers, caches, billing and feature services; avoid React dependencies here | [`src/lib`](src/lib), [`src/lib/generation`](src/lib/generation), [`src/lib/editor`](src/lib/editor) |
| Data | Mongoose schemas, database connection and versioned product catalog | [`src/models`](src/models), [`src/lib/mongoose.ts`](src/lib/mongoose.ts), [`src/data`](src/data) |
| AI flows | Genkit initialization and flows used by server actions and job processing | [`src/ai`](src/ai), [`src/ai/genkit.ts`](src/ai/genkit.ts) |
| Tooling and verification | Build helpers, audits, unit/data/E2E tests and CI definitions | [`scripts/mjs`](scripts/mjs), [`tests`](tests), [`.github/workflows`](.github/workflows), [`package.json`](package.json) |
| Runtime configuration | Next, TypeScript, deployment and local environment contracts | [`next.config.ts`](next.config.ts), [`tsconfig.json`](tsconfig.json), [`vercel.json`](vercel.json), [`.env.example`](.env.example) |
| Generated/public content | Public assets and generated catalog demos; treat it as product content, not application source | [`public`](public), [`public/webpages`](public/webpages) |

### First reading path

1. For an interface change, locate its page under [`src/app/[locale]`](<src/app/[locale]>)
   and its client component under [`src/components`](src/components) or the same
   feature directory.
2. For a request or integration change, start at the handler in
   [`src/app/api`](src/app/api), then follow imports into [`src/lib`](src/lib)
   and [`src/models`](src/models).
3. For cross-cutting behavior, read [`src/proxy.ts`](src/proxy.ts) first; it
   controls locale rewrites, protected routes and edge behavior.
4. Before changing a shared contract, consult
   [ARCHITECTURE.md](docs/ARCHITECTURE.md),
   [API_ACCESS.md](docs/API_ACCESS.md) or the appropriate playbook in
   [`docs/playbooks`](docs/playbooks).

---

## Deployment

Vercel builds from `main` with `npm run vercel-build`, which executes the build and
then minifies, optimizes media, and precompresses `public/`. Environment variables
are configured in the Vercel dashboard; Clerk keys must be
`pk_live_*` / `sk_live_*` in production —the build warns if it detects test keys—.

---

## Frequent issues

| Symptom | Cause and solution |
|---|---|
| `npm ci` fails in `preinstall` | Node < 22.11. `nvm use` |
| `Failed to load SWC binary for darwin/arm64` | `node` x64 under Rosetta. Check `node -p "process.arch"` → should say `arm64` |
| `npm run dev` goes well and `npm run build` fails | Dev uses Turbopack and build uses webpack: **they resolve modules differently**. A change is not verified until `next build` passes |
| `curl` receives the previous build | An old server is still on the port: `lsof -ti:3048 \| xargs kill -9` |
| Clerk responds 404 instead of redirecting | `auth.protect()` with `Accept: */*` returns 404. Try with `Accept: text/html` |

More cases, with their cause and resolution, in
[docs/operaciones/base-de-conocimiento.md](docs/operaciones/base-de-conocimiento.md).

---

## Documentation

| Document | Content |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, request lifecycle, data domains, and decisions with their reasoning |
| [docs/API_ACCESS.md](docs/API_ACCESS.md) | Access matrix of the 105 routes — **generated from code** and verified by a test |
| [docs/SECURITY.md](docs/SECURITY.md) | Access model, secrets, paid product protection, and dependency status |
| [docs/TESTING.md](docs/TESTING.md) | Testing architecture, coverage, and what is covered |
| [docs/DATABASE.md](docs/DATABASE.md) | Models, collections, indexes, and the `user_profiles` incident |
| [docs/AI_ARCHITECTURE.md](docs/AI_ARCHITECTURE.md) | Lifecycle of the AI job, credits, and output contracts |
| [docs/ai/TEXT_UNIT_ECONOMICS.md](docs/ai/TEXT_UNIT_ECONOMICS.md) | PromptStudio AI latency, reliability, spend metrics, tracing, and alert thresholds |
| [docs/ai/TEXT_USAGE_ACCOUNTING.md](docs/ai/TEXT_USAGE_ACCOUNTING.md) | Self-hosted text monthly quotas, credit reconciliation, usage records, and cost telemetry |
| [docs/ai/GENERATE_STREAMING_UX.md](docs/ai/GENERATE_STREAMING_UX.md) | `/generate` PromptStudio AI streaming UX, cancellation, errors, and rollback flag |
| [docs/ai/GENERATE_TEXT_API.md](docs/ai/GENERATE_TEXT_API.md) | Authenticated streaming `/api/ai/generate-text` contract, validation, cancellation, rate limiting, and public errors |
| [docs/ai/TEXT_MODEL_ROUTER.md](docs/ai/TEXT_MODEL_ROUTER.md) | Server-side logical text-model routing, feature flags, normalized errors, and fallback behavior |
| [docs/ai/TEXT_INFERENCE_SECURITY.md](docs/ai/TEXT_INFERENCE_SECURITY.md) | Security boundary, request limits, timeouts, rate/concurrency protection, safe logging, and key rotation for self-hosted text inference |
| [docs/ai/SELF_HOSTED_TEXT_DEPLOYMENT.md](docs/ai/SELF_HOSTED_TEXT_DEPLOYMENT.md) | Reproducible Modal/vLLM deployment for the pinned Qwen3-8B text model |
| [docs/ai/SELF_HOSTED_TEXT_HOSTING.md](docs/ai/SELF_HOSTED_TEXT_HOSTING.md) | Modal-first hosting decision, RunPod comparison, budget policy, and serverless/dedicated migration thresholds |
| [docs/ai/TEXT_MODEL_BENCHMARK.md](docs/ai/TEXT_MODEL_BENCHMARK.md) | Reproducible text-model benchmark, cost comparison, quality rubric, and production GO/NO-GO gate |
| [docs/ai/SELF_HOSTED_TEXT_MODEL.md](docs/ai/SELF_HOSTED_TEXT_MODEL.md) | Approved self-hosted text model, immutable revision pin, license obligations, and upgrade review process |
| [docs/audits/DOCUMENTATION_TO_CODE_MAP.md](docs/audits/DOCUMENTATION_TO_CODE_MAP.md) | Navigable map from documented subsystems to their implementation entry points |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Build, why the AI queue has no scheduler, headers, and variables that break production |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, rules enforced by the pipeline, and style |
| [docs/IMPROVEMENT_REPORT.md](docs/IMPROVEMENT_REPORT.md) | Measured before / after of the audit program, and what remains open |
| [docs/CODEBASE_AUDIT.md](docs/CODEBASE_AUDIT.md) | Real state of the repository, measured, with priorities |
| [docs/operaciones/](docs/operaciones/) | Procedures: AI generation, commercial, catalog, deployment, and QA |
| [docs/operaciones/base-de-conocimiento.md](docs/operaciones/base-de-conocimiento.md) | Already solved problems, with their cause |
| [docs/editor/](docs/editor/) | Visual editor diagnosis and plan |
| [docs/historial/](docs/historial/) | How the project was built, with decision traces |
| [docs/prd.md](docs/prd.md) · [docs/dm.md](docs/dm.md) | Product and data model |
| [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md) | Complete index and map of source files (generated) |
| [docs/rotacion-de-credenciales.md](docs/rotacion-de-credenciales.md) | Security procedure |

---

## License

Proprietary software. All rights reserved. The catalog includes
third-party and AI-generated content whose provenance is audited with
`npm run catalog:provenance`.
