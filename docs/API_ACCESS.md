# API Access Matrix

> **Generated document.** Produced by `node scripts/mjs/build-route-access-matrix.mjs`
> from each route's code. Do not edit by hand: to change a row,
> change the route.

The project authorizes using seven different mechanisms. This table shows which one
each of the 105 routes uses, which previously could only be found out by reading
the files one by one.

The `tests/unit/route-access-matrix.test.ts` test fails if a route appears without
a recognized mechanism and without an explicit justification, so a new unprotected
route breaks the pipeline.

## Summary

| Mechanism | Routes |
|---|---|
| Webhook signature | 2 |
| Cron or admin secret | 6 |
| Administrator | 9 |
| Subscription plan | 12 |
| User session | 60 |
| AI worker token | 1 |
| IP limit | 34 |
| Disabled (501) | 2 |
| **Total routes** | **105** |

## Public routes by design

They are public by design, each with its own reason. None expose paid product
content or data from another account.

- `/api/catalog/[kind]` — Paginated public catalog; does not expose paid prompts
- `/api/catalog/web-pages/[id]` — Public listing of a catalog demo
- `/api/landing-pages/catalog` — Public list of landing pages
- `/api/landing-pages/[pageId]/content` — Public content of a published landing page
- `/api/landing-pages/readability-index` — Readability index, public aggregated data
- `/api/community-reviews` — Reviews visible without an account; writing requires a session
- `/api/marketplace` — Public showcase of the marketplace
- `/api/provider-quality` — Aggregated metrics of provider quality
- `/api/demo/reproducible/report` — Reproducible demo report, intended for external audit
- `/api/refactory-online/[slug]` — Static demo loader
- `/api/webpages/assets/[...path]` — Static assets of the demos
- `/api/web-pages/validate-demo-url` — URL format validation, side-effect free
- `/api/web-page-checkout` — Guest checkout initiation; Stripe validates the payment session
- `/api/stripe/demo-buy-button` — Public buy button configuration
- `/api/r2/buckets` — List of configured buckets, without credentials
- `/api/affiliate/applications` — Affiliate application submission from the public form

## Complete matrix

| Route | Verbs | Protection |
|---|---|---|
| `/api/activity/ping` | POST | User session |
| `/api/admin/affiliate-applications/[applicationId]` | PATCH | Administrator |
| `/api/admin/affiliate-sales` | GET | Administrator |
| `/api/admin/feature-experiments` | GET, POST, PATCH | Cron or admin secret |
| `/api/admin/main-funnel` | GET | Cron or admin secret |
| `/api/admin/marketplace` | GET | Administrator |
| `/api/admin/marketplace/[id]` | PATCH | Administrator |
| `/api/admin/observability` | GET | Administrator + User session |
| `/api/admin/product-reviews` | GET, PATCH | Administrator + User session |
| `/api/affiliate/applications` | POST | IP limit |
| `/api/affiliate/click` | POST | IP limit |
| `/api/ai/jobs` | POST, GET | Subscription plan + User session + IP limit |
| `/api/ai/jobs/[id]` | GET | User session |
| `/api/ai/jobs/[id]/feedback` | POST, DELETE | User session + IP limit |
| `/api/ai/jobs/[id]/progress` | PATCH | AI worker token |
| `/api/ai/jobs/[id]/retry` | POST | User session |
| `/api/ai/jobs/process` | — | Cron or admin secret |
| `/api/ai/providers/recommend` | GET | User session |
| `/api/assets/provenance` | GET, PATCH | User session + IP limit |
| `/api/batches` | GET, POST | User session + IP limit |
| `/api/batches/[id]` | GET, PATCH | User session + IP limit |
| `/api/batches/[id]/export` | GET | User session |
| `/api/brand-kits` | GET, POST | Subscription plan + User session + IP limit |
| `/api/brand-kits/[id]` | GET, PATCH | User session + IP limit |
| `/api/cache/invalidate` | POST | Administrator |
| `/api/cache/stats` | GET | Administrator |
| `/api/campaign-workflows` | GET, POST | User session + IP limit |
| `/api/campaign-workflows/[id]` | GET, PATCH | User session + IP limit |
| `/api/campaign-workflows/[id]/export` | GET | User session |
| `/api/catalog-engagement` | GET, POST | User session + IP limit |
| `/api/catalog/[kind]` | GET | Public — Paginated public catalog; does not expose paid prompts |
| `/api/catalog/components/[id]` | GET | Subscription plan + User session |
| `/api/catalog/web-pages/[id]` | GET | Public — Public listing of a catalog demo |
| `/api/community-reviews` | GET | Public — Reviews visible without an account; writing requires a session |
| `/api/component-bundle-checkout` | POST | User session |
| `/api/component-checkout` | POST | User session |
| `/api/component-composer/export` | POST | Subscription plan |
| `/api/component-export/download` | POST | Subscription plan |
| `/api/component-export/sandbox` | POST | Subscription plan |
| `/api/component-library` | GET, PUT | User session + IP limit |
| `/api/component-library/export` | POST | Subscription plan |
| `/api/component-personalization` | POST | Subscription plan |
| `/api/creator/listings` | GET, POST | User session + IP limit |
| `/api/creator/listings/[id]` | PATCH | User session |
| `/api/credits` | GET | User session |
| `/api/credits/checkout` | POST | User session + IP limit |
| `/api/csp-report` | POST | IP limit |
| `/api/demo/reproducible/report` | GET | Public — Reproducible demo report, intended for external audit |
| `/api/editor/projects` | GET, PUT, DELETE | Subscription plan + User session + IP limit |
| `/api/evaluation-suites` | GET, POST | User session + IP limit |
| `/api/evaluation-suites/[id]` | GET | User session |
| `/api/evaluation-suites/[id]/export` | GET | User session |
| `/api/feature-flags` | GET | User session |
| `/api/human-evaluations` | GET, POST | User session + IP limit |
| `/api/interests/track` | POST | User session + IP limit |
| `/api/landing-pages/[pageId]/content` | GET | Public — Public content of a published landing page |
| `/api/landing-pages/[pageId]/download` | GET | Subscription plan |
| `/api/landing-pages/[pageId]/readability` | GET, POST | User session |
| `/api/landing-pages/catalog` | GET | Public — Public list of landing pages |
| `/api/landing-pages/readability-index` | GET | Public — Readability index, public aggregated data |
| `/api/like` | POST | Disabled (501) |
| `/api/marketplace` | GET | Public — Public showcase of the marketplace |
| `/api/marketplace/[id]/checkout` | POST | User session |
| `/api/marketplace/[id]/download` | GET | User session |
| `/api/model-regressions` | GET, POST | User session |
| `/api/new-users` | POST | IP limit |
| `/api/observability/events` | POST | User session |
| `/api/output-contracts` | GET, POST, PATCH | User session + IP limit |
| `/api/product-reviews` | GET, POST | User session + IP limit |
| `/api/product-reviews/me` | GET | User session |
| `/api/profile/paypal` | POST | User session |
| `/api/project-client/[token]` | GET, POST | IP limit |
| `/api/projects` | GET, POST | User session + IP limit |
| `/api/projects/[id]` | GET, PATCH | User session + IP limit |
| `/api/projects/[id]/collaboration` | GET, POST | User session + IP limit |
| `/api/prompt-experiments` | GET, POST | User session + IP limit |
| `/api/prompt-experiments/[id]` | GET, PATCH | User session + IP limit |
| `/api/prompt-optimizer` | POST | User session + IP limit |
| `/api/prompt-versions` | GET, POST | User session + IP limit |
| `/api/provider-quality` | GET | Administrator |
| `/api/publication-quality` | GET | User session |
| `/api/publications` | GET, POST | Subscription plan + User session + IP limit |
| `/api/publications/[id]` | PATCH | User session |
| `/api/publications/[id]/export` | GET | User session |
| `/api/purchases` | GET | User session |
| `/api/purchases/[purchaseId]/download-token` | POST | User session |
| `/api/purchases/download` | GET | User session |
| `/api/r2/buckets` | GET | Public — List of configured buckets, without credentials |
| `/api/recommendations` | GET | User session |
| `/api/refactory-online/[slug]` | GET | Public — Static demo loader |
| `/api/saved` | GET, POST, DELETE | User session + IP limit |
| `/api/search/intent` | GET | IP limit |
| `/api/seed` | GET | Disabled (501) |
| `/api/stripe/demo-buy-button` | GET | Public — Public buy button configuration |
| `/api/subscription/invoice` | GET | User session |
| `/api/subscription/portal` | POST | User session |
| `/api/subscription/status` | GET | Subscription plan |
| `/api/sync-clerk` | GET | Cron or admin secret |
| `/api/sync-registered-users-to-resend` | GET | Cron or admin secret |
| `/api/sync-resend` | GET | Cron or admin secret |
| `/api/web-page-checkout` | — | Public — Guest checkout initiation; Stripe validates the payment session |
| `/api/web-pages/validate-demo-url` | GET | Public — URL format validation, side-effect free |
| `/api/webhooks/clerk` | POST | Webhook signature |
| `/api/webhooks/stripe` | POST | Webhook signature |
| `/api/webpages/assets/[...path]` | GET | Public — Static assets of the demos |