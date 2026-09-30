# Prompt Studio — Project Architecture Overview

## Purpose
Prompt Studio is a multi-tenant AI creative platform and website builder. The current strategy keeps the web application and lightweight APIs on Vercel while moving heavy asynchronous AI execution to Google Cloud.

## Core stack
- Vercel: Next.js application, /page-composer, lightweight APIs, deployments.
- MongoDB/Mongoose: users/application data, sites, pages, GenerationJob state and related persistence.
- Cloudflare R2: generated images, video and website assets.
- Clerk: authentication.
- Stripe: subscriptions, credit packs and domain purchases.
- Resend: transactional email.
- GitHub: source, issues and pull requests.
- Google Cloud: target execution layer for queue + Cloud Run AI workers.
- AI providers: Gemini is directly configured; other providers are integrated/configured according to product capabilities and should be treated as active only when confirmed by code/runtime.

## Website Builder architecture
The editor lives in `/page-composer`. The primary editable representation should be a versioned PageSchema JSON rendered through a controlled React ComponentRegistry, rather than arbitrary AI-generated HTML.

Draft and published versions are separate. Publishing resolves hostname → site → publishedVersionId → PageSchema → renderer. Customer sites should remain multi-tenant instead of creating one Vercel project per customer.

## AI generation architecture
Target:
Vercel Generation API → reserve credits → MongoDB GenerationJob → Google Cloud managed queue → Cloud Run Image/Video/Web worker → provider → R2/MongoDB → reconcile/refund credits → UI status.

## Cost principle
Keep fixed infrastructure small. Treat AI provider usage and domain registrations as variable COGS. Every generation should eventually record provider/model, usage, providerCostUsd, credits estimated/reserved/charged/refunded, latency and terminal status.
