# Prompt Studio — Website Builder Cost Model

## Editor economics
The visual editor itself is inexpensive: drag/drop, styles, text edits, responsive settings and component manipulation primarily execute client-side. Costs arise from persistence, storage, published traffic and AI operations.

## Architecture
/page-composer → PageSchema → MongoDB → multi-tenant renderer.
Assets → Cloudflare R2.
Heavy AI → Google Cloud queue/Cloud Run.
Publishing resolves hostname → siteId → publishedVersionId → PageSchema → React renderer.

Avoid a dedicated Vercel project/server per customer and avoid rebuilding/deploying the entire application on every visual edit.

## Cost categories
Shared fixed: Vercel, MongoDB, auth, email.
Variable: R2, Cloud Run/queue, AI providers, high traffic.
AI generation should remain credit-metered.

## Product separation
Included editor operations: drag/drop, text/styles, responsive edits, pages, normal saves and reasonable publishing.

Credit-metered operations: AI website generation, AI component/section edits, image/video generation and premium models.

## Measurement
Track cost per active website, published website, page view, GB stored and AI generation. Do not use hypothetical per-user estimates as actual cost until billing telemetry is available.
