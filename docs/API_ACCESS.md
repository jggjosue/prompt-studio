# API Access Matrix

> **Generated Document (Documento generado).** Produced automatically by `node scripts/mjs/build-route-access-matrix.mjs`
> by inspecting route source files. Do not edit manually: to update a row,
> update the corresponding route handler.

The system authorizes requests using eight distinct mechanisms. This matrix details
the exact authorization strategy for all 120 API routes, which previously required
manual file-by-file inspection.

The test suite `tests/unit/route-access-matrix.test.ts` verifies that no route lacks
a recognized security mechanism or explicit documented justification. Adding an unprotected
endpoint breaks the build pipeline instead of slipping into production.

## Summary

| Mechanism | Routes |
|---|---|
| Webhook signature | 2 |
| Cron or admin secret | 8 |
| Administrator | 10 |
| Subscription plan | 12 |
| User session | 73 |
| AI worker token | 1 |
| IP rate limit | 38 |
| Disabled (501) | 2 |
| **Total Routes** | **120** |

## Public Routes by Design

These endpoints are publicly accessible by design, each with an explicit rationale.
None of them expose paid prompt data or private account records.

- [`/api/catalog/[kind]`](../src/app/api/catalog/[kind]/route.ts) — Public paginated catalog; does not expose paid prompts
- [`/api/catalog/web-pages/[id]`](../src/app/api/catalog/web-pages/[id]/route.ts) — Public detail view of a catalog demo
- [`/api/landing-pages/catalog`](../src/app/api/landing-pages/catalog/route.ts) — Public list of landing pages
- [`/api/landing-pages/[pageId]/content`](../src/app/api/landing-pages/[pageId]/content/route.ts) — Public content of a published landing page
- [`/api/landing-pages/readability-index`](../src/app/api/landing-pages/readability-index/route.ts) — Readability index, aggregated public data
- [`/api/community-reviews`](../src/app/api/community-reviews/route.ts) — Reviews visible without account; submitting requires session
- [`/api/marketplace`](../src/app/api/marketplace/route.ts) — Public storefront of the marketplace
- [`/api/provider-quality`](../src/app/api/provider-quality/route.ts) — Aggregated provider quality metrics
- [`/api/demo/reproducible/report`](../src/app/api/demo/reproducible/report/route.ts) — Reproducible demo report for external audit
- [`/api/refactory-online/[slug]`](../src/app/api/refactory-online/[slug]/route.ts) — Static demo loader for interactive showcase previews
- [`/api/webpages/assets/[...path]`](../src/app/api/webpages/assets/[...path]/route.ts) — Static assets for demos
- [`/api/web-pages/validate-demo-url`](../src/app/api/web-pages/validate-demo-url/route.ts) — URL format validation, side-effect free
- [`/api/web-page-checkout`](../src/app/api/web-page-checkout/route.ts) — Guest checkout initiation; Stripe validates payment session
- [`/api/stripe/demo-buy-button`](../src/app/api/stripe/demo-buy-button/route.ts) — Public configuration for purchase button
- [`/api/r2/buckets`](../src/app/api/r2/buckets/route.ts) — List of configured buckets, no credentials exposed
- [`/api/affiliate/applications`](../src/app/api/affiliate/applications/route.ts) — Affiliate application submission from public form
- [`/api/new-users/status`](../src/app/api/new-users/status/route.ts) — Boolean free-access status for the email gate; reveals no content or account data

## Complete Access Matrix

| Route | Methods | Protection |
|---|---|---|
| [`/api/activity/ping`](../src/app/api/activity/ping/route.ts) | POST | User session |
| [`/api/admin/affiliate-applications/[applicationId]`](../src/app/api/admin/affiliate-applications/[applicationId]/route.ts) | PATCH | Administrator |
| [`/api/admin/affiliate-sales`](../src/app/api/admin/affiliate-sales/route.ts) | GET | Administrator |
| [`/api/admin/feature-experiments`](../src/app/api/admin/feature-experiments/route.ts) | GET, POST, PATCH | Cron or admin secret |
| [`/api/admin/main-funnel`](../src/app/api/admin/main-funnel/route.ts) | GET | Cron or admin secret |
| [`/api/admin/marketplace`](../src/app/api/admin/marketplace/route.ts) | GET | Administrator |
| [`/api/admin/marketplace/[id]`](../src/app/api/admin/marketplace/[id]/route.ts) | PATCH | Administrator |
| [`/api/admin/observability`](../src/app/api/admin/observability/route.ts) | GET | Administrator + User session |
| [`/api/admin/product-reviews`](../src/app/api/admin/product-reviews/route.ts) | GET, PATCH | Administrator + User session |
| [`/api/affiliate/applications`](../src/app/api/affiliate/applications/route.ts) | POST | IP rate limit |
| [`/api/affiliate/click`](../src/app/api/affiliate/click/route.ts) | POST | IP rate limit |
| [`/api/ai/chats`](../src/app/api/ai/chats/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/ai/chats/[chatId]`](../src/app/api/ai/chats/[chatId]/route.ts) | GET, DELETE | User session + IP rate limit |
| [`/api/ai/chats/[chatId]/messages`](../src/app/api/ai/chats/[chatId]/messages/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/ai/jobs`](../src/app/api/ai/jobs/route.ts) | POST, GET | Subscription plan + User session + IP rate limit |
| [`/api/ai/jobs/[id]`](../src/app/api/ai/jobs/[id]/route.ts) | GET | User session |
| [`/api/ai/jobs/[id]/asset`](../src/app/api/ai/jobs/[id]/asset/route.ts) | GET | User session |
| [`/api/ai/jobs/[id]/feedback`](../src/app/api/ai/jobs/[id]/feedback/route.ts) | POST, DELETE | User session + IP rate limit |
| [`/api/ai/jobs/[id]/progress`](../src/app/api/ai/jobs/[id]/progress/route.ts) | PATCH | AI worker token |
| [`/api/ai/jobs/[id]/retry`](../src/app/api/ai/jobs/[id]/retry/route.ts) | POST | User session |
| [`/api/ai/jobs/process`](../src/app/api/ai/jobs/process/route.ts) | — | Cron or admin secret + User session |
| [`/api/ai/providers/recommend`](../src/app/api/ai/providers/recommend/route.ts) | GET | User session |
| [`/api/assets/provenance`](../src/app/api/assets/provenance/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/batches`](../src/app/api/batches/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/batches/[id]`](../src/app/api/batches/[id]/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/batches/[id]/export`](../src/app/api/batches/[id]/export/route.ts) | GET | User session |
| [`/api/brand-kits`](../src/app/api/brand-kits/route.ts) | GET, POST | Subscription plan + User session + IP rate limit |
| [`/api/brand-kits/[id]`](../src/app/api/brand-kits/[id]/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/cache/invalidate`](../src/app/api/cache/invalidate/route.ts) | POST | Administrator |
| [`/api/cache/stats`](../src/app/api/cache/stats/route.ts) | GET | Administrator |
| [`/api/campaign-workflows`](../src/app/api/campaign-workflows/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/campaign-workflows/[id]`](../src/app/api/campaign-workflows/[id]/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/campaign-workflows/[id]/export`](../src/app/api/campaign-workflows/[id]/export/route.ts) | GET | User session |
| [`/api/catalog-engagement`](../src/app/api/catalog-engagement/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/catalog/[kind]`](../src/app/api/catalog/[kind]/route.ts) | GET | Public — Public paginated catalog; does not expose paid prompts |
| [`/api/catalog/components/[id]`](../src/app/api/catalog/components/[id]/route.ts) | GET | Subscription plan + User session |
| [`/api/catalog/web-pages/[id]`](../src/app/api/catalog/web-pages/[id]/route.ts) | GET | Public — Public detail view of a catalog demo |
| [`/api/community-reviews`](../src/app/api/community-reviews/route.ts) | GET | Public — Reviews visible without account; submitting requires session |
| [`/api/component-bundle-checkout`](../src/app/api/component-bundle-checkout/route.ts) | POST | User session |
| [`/api/component-checkout`](../src/app/api/component-checkout/route.ts) | POST | User session |
| [`/api/component-composer/export`](../src/app/api/component-composer/export/route.ts) | POST | Subscription plan |
| [`/api/component-export/download`](../src/app/api/component-export/download/route.ts) | POST | Subscription plan |
| [`/api/component-export/sandbox`](../src/app/api/component-export/sandbox/route.ts) | POST | Subscription plan |
| [`/api/component-library`](../src/app/api/component-library/route.ts) | GET, PUT | User session + IP rate limit |
| [`/api/component-library/export`](../src/app/api/component-library/export/route.ts) | POST | Subscription plan |
| [`/api/component-personalization`](../src/app/api/component-personalization/route.ts) | POST | Subscription plan + User session + IP rate limit |
| [`/api/creator/listings`](../src/app/api/creator/listings/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/creator/listings/[id]`](../src/app/api/creator/listings/[id]/route.ts) | PATCH | User session |
| [`/api/credits`](../src/app/api/credits/route.ts) | GET | User session |
| [`/api/credits/checkout`](../src/app/api/credits/checkout/route.ts) | POST | User session + IP rate limit |
| [`/api/credits/estimate`](../src/app/api/credits/estimate/route.ts) | POST | User session |
| [`/api/csp-report`](../src/app/api/csp-report/route.ts) | POST | IP rate limit |
| [`/api/debug/gemini-image`](../src/app/api/debug/gemini-image/route.ts) | POST | Cron or admin secret + Administrator |
| [`/api/demo/reproducible/report`](../src/app/api/demo/reproducible/report/route.ts) | GET | Public — Reproducible demo report for external audit |
| [`/api/editor/projects`](../src/app/api/editor/projects/route.ts) | GET, PUT, DELETE | Subscription plan + User session + IP rate limit |
| [`/api/evaluation-suites`](../src/app/api/evaluation-suites/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/evaluation-suites/[id]`](../src/app/api/evaluation-suites/[id]/route.ts) | GET | User session |
| [`/api/evaluation-suites/[id]/export`](../src/app/api/evaluation-suites/[id]/export/route.ts) | GET | User session |
| [`/api/feature-flags`](../src/app/api/feature-flags/route.ts) | GET | User session |
| [`/api/human-evaluations`](../src/app/api/human-evaluations/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/interests/track`](../src/app/api/interests/track/route.ts) | POST | User session + IP rate limit |
| [`/api/landing-pages/[pageId]/content`](../src/app/api/landing-pages/[pageId]/content/route.ts) | GET | Public — Public content of a published landing page |
| [`/api/landing-pages/[pageId]/download`](../src/app/api/landing-pages/[pageId]/download/route.ts) | GET | Subscription plan |
| [`/api/landing-pages/[pageId]/readability`](../src/app/api/landing-pages/[pageId]/readability/route.ts) | GET, POST | User session |
| [`/api/landing-pages/catalog`](../src/app/api/landing-pages/catalog/route.ts) | GET | Public — Public list of landing pages |
| [`/api/landing-pages/readability-index`](../src/app/api/landing-pages/readability-index/route.ts) | GET | Public — Readability index, aggregated public data |
| [`/api/like`](../src/app/api/like/route.ts) | POST | Disabled (501) |
| [`/api/marketplace`](../src/app/api/marketplace/route.ts) | GET | Public — Public storefront of the marketplace |
| [`/api/marketplace/[id]/checkout`](../src/app/api/marketplace/[id]/checkout/route.ts) | POST | User session |
| [`/api/marketplace/[id]/download`](../src/app/api/marketplace/[id]/download/route.ts) | GET | User session |
| [`/api/marketplace/[id]/prompt`](../src/app/api/marketplace/[id]/prompt/route.ts) | GET | User session |
| [`/api/model-regressions`](../src/app/api/model-regressions/route.ts) | GET, POST | User session |
| [`/api/new-users`](../src/app/api/new-users/route.ts) | POST | IP rate limit |
| [`/api/new-users/status`](../src/app/api/new-users/status/route.ts) | GET | Public — Boolean free-access status for the email gate; reveals no content or account data |
| [`/api/newsletter/confirm`](../src/app/api/newsletter/confirm/route.ts) | GET | Public — unjustified |
| [`/api/newsletter/metrics`](../src/app/api/newsletter/metrics/route.ts) | GET | Cron or admin secret |
| [`/api/observability/events`](../src/app/api/observability/events/route.ts) | POST | User session |
| [`/api/output-contracts`](../src/app/api/output-contracts/route.ts) | GET, POST, PATCH | User session + IP rate limit |
| [`/api/product-reviews`](../src/app/api/product-reviews/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/product-reviews/me`](../src/app/api/product-reviews/me/route.ts) | GET | User session |
| [`/api/profile/paypal`](../src/app/api/profile/paypal/route.ts) | POST | User session |
| [`/api/project-client/[token]`](../src/app/api/project-client/[token]/route.ts) | GET, POST | IP rate limit |
| [`/api/projects`](../src/app/api/projects/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/projects/[id]`](../src/app/api/projects/[id]/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/projects/[id]/associations`](../src/app/api/projects/[id]/associations/route.ts) | GET | User session |
| [`/api/projects/[id]/collaboration`](../src/app/api/projects/[id]/collaboration/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/prompt-experiments`](../src/app/api/prompt-experiments/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/prompt-experiments/[id]`](../src/app/api/prompt-experiments/[id]/route.ts) | GET, PATCH | User session + IP rate limit |
| [`/api/prompt-optimizer`](../src/app/api/prompt-optimizer/route.ts) | POST | User session + IP rate limit |
| [`/api/prompt-versions`](../src/app/api/prompt-versions/route.ts) | GET, POST | User session + IP rate limit |
| [`/api/prompt-versions/[id]/evaluation`](../src/app/api/prompt-versions/[id]/evaluation/route.ts) | GET | User session |
| [`/api/prompt-versions/[id]/lineage`](../src/app/api/prompt-versions/[id]/lineage/route.ts) | GET | User session |
| [`/api/prompt-versions/[id]/provenance`](../src/app/api/prompt-versions/[id]/provenance/route.ts) | GET | User session |
| [`/api/prompt-versions/compare`](../src/app/api/prompt-versions/compare/route.ts) | GET | User session |
| [`/api/provider-quality`](../src/app/api/provider-quality/route.ts) | GET | Administrator |
| [`/api/publication-quality`](../src/app/api/publication-quality/route.ts) | GET | User session |
| [`/api/publications`](../src/app/api/publications/route.ts) | GET, POST | Subscription plan + User session + IP rate limit |
| [`/api/publications/[id]`](../src/app/api/publications/[id]/route.ts) | PATCH | User session |
| [`/api/publications/[id]/export`](../src/app/api/publications/[id]/export/route.ts) | GET | User session |
| [`/api/purchases`](../src/app/api/purchases/route.ts) | GET | User session |
| [`/api/purchases/[purchaseId]/download-token`](../src/app/api/purchases/[purchaseId]/download-token/route.ts) | POST | User session |
| [`/api/purchases/download`](../src/app/api/purchases/download/route.ts) | GET | User session |
| [`/api/r2/buckets`](../src/app/api/r2/buckets/route.ts) | GET | Public — List of configured buckets, no credentials exposed |
| [`/api/recommendations`](../src/app/api/recommendations/route.ts) | GET | User session |
| [`/api/refactory-online/[slug]`](../src/app/api/refactory-online/[slug]/route.ts) | GET | Public — Static demo loader for interactive showcase previews |
| [`/api/saved`](../src/app/api/saved/route.ts) | GET, POST, DELETE | User session + IP rate limit |
| [`/api/search/intent`](../src/app/api/search/intent/route.ts) | GET | IP rate limit |
| [`/api/seed`](../src/app/api/seed/route.ts) | GET | Disabled (501) |
| [`/api/stripe/demo-buy-button`](../src/app/api/stripe/demo-buy-button/route.ts) | GET | Public — Public configuration for purchase button |
| [`/api/subscription/invoice`](../src/app/api/subscription/invoice/route.ts) | GET | User session |
| [`/api/subscription/portal`](../src/app/api/subscription/portal/route.ts) | POST | User session |
| [`/api/subscription/status`](../src/app/api/subscription/status/route.ts) | GET | Subscription plan |
| [`/api/sync-clerk`](../src/app/api/sync-clerk/route.ts) | GET | Cron or admin secret |
| [`/api/sync-registered-users-to-resend`](../src/app/api/sync-registered-users-to-resend/route.ts) | GET | Cron or admin secret |
| [`/api/sync-resend`](../src/app/api/sync-resend/route.ts) | GET | Cron or admin secret |
| [`/api/web-page-checkout`](../src/app/api/web-page-checkout/route.ts) | — | Public — Guest checkout initiation; Stripe validates payment session |
| [`/api/web-pages/validate-demo-url`](../src/app/api/web-pages/validate-demo-url/route.ts) | GET | Public — URL format validation, side-effect free |
| [`/api/webhooks/clerk`](../src/app/api/webhooks/clerk/route.ts) | POST | Webhook signature |
| [`/api/webhooks/stripe`](../src/app/api/webhooks/stripe/route.ts) | POST | Webhook signature |
| [`/api/webpages/assets/[...path]`](../src/app/api/webpages/assets/[...path]/route.ts) | GET | Public — Static assets for demos |
