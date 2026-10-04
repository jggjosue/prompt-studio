# Prompt Studio

Prompt Studio is a Next.js App Router application for discovering, previewing, generating, purchasing, and downloading AI prompts, landing pages, image concepts, video concepts, and interactive web demos.

[Documentación en español](./README_ES.md)

## Requirements

- Node.js 20 or newer
- npm
- MongoDB database
- Clerk, Stripe, Resend, Cloudflare R2, and Google AI credentials for the corresponding features

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development server runs at `http://localhost:3043`.

## Environment configuration

Never commit real credentials. Use `.env.local` locally and configure the same secrets in the deployment platform.

### Application URLs

```env
DOMAIN=https://www.prompstudio.com/
DOMAIN_DEV=http://localhost:3043
```

`src/lib/site-url.ts` selects `DOMAIN` in production and `DOMAIN_DEV` in development, validates the value, and returns a normalized origin.

### Main variable groups

| Group | Variables |
| --- | --- |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` |
| Stripe | `STRIPE_SECRET_KEY`, Payment Link variables, Buy Button IDs |
| MongoDB | `MONGODB_URI` |
| Resend | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_EMAIL` |
| Cloudflare R2 | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| Google AI | Google GenAI/Genkit credentials |
| Firebase | Public Firebase application and analytics configuration |
| Protected jobs | `CRON_SECRET`, `CACHE_ADMIN_TOKEN`, `GUEST_DOWNLOAD_SECRET` |

See `.env.example` for the complete variable list.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run seo:validate-all
```

Additional SEO validation scripts are available in `package.json`.

## Architecture

| Layer | Technology |
| --- | --- |
| Web application | Next.js 15 App Router, React 19, TypeScript |
| UI | Tailwind CSS, Radix UI, Framer Motion |
| Authentication | Clerk |
| Database | MongoDB Atlas with Mongoose |
| Payments | Stripe Payment Links, Checkout, billing portal, and webhooks |
| Email and audiences | Resend |
| Static demo storage | Cloudflare R2 through the S3-compatible API |
| AI | Google Gemini through Genkit |
| Analytics | Firebase Analytics, Google Analytics 4, Vercel Analytics, Speed Insights |

## Providers and external APIs

| Provider | Purpose | Main integration |
| --- | --- | --- |
| [Clerk](https://clerk.com/docs) | Authentication, sessions, profiles, metadata, and webhooks | `@clerk/nextjs` |
| [Stripe](https://docs.stripe.com/) | One-time purchases, subscriptions, invoices, portal, and payment webhooks | `stripe` |
| [MongoDB Atlas](https://www.mongodb.com/docs/atlas/) | Users, profiles, activity, affiliates, readability data, and purchases | `mongoose` |
| [Resend](https://resend.com/docs) | Transactional email, contacts, and audiences | `resend` |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | HTML demos and static assets | `cloudflare`, `@aws-sdk/client-s3` |
| [Google Gemini / Genkit](https://firebase.google.com/docs/genkit) | Prompt and content generation | `genkit`, `@genkit-ai/google-genai` |
| [Firebase Analytics](https://firebase.google.com/docs/analytics) | Client-side interaction events | `firebase` |
| [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4) | Navigation and conversion-intent analytics | `gtag.js` |
| [Vercel Analytics](https://vercel.com/docs/analytics) | Traffic and performance measurements | `@vercel/analytics`, `@vercel/speed-insights` |

## MongoDB database

The application uses the **`prompt-studio`** database in MongoDB Atlas. The main project collections are:

| Collection | Main purpose |
| --- | --- |
| `user_profiles` | Registered users synchronized from Clerk. |
| `user_profiles` | New-user emails used for Resend synchronization. |
| `user_profiles` | Internal user profile, Stripe data, and account metadata. |
| `user_interests` | Interests, tags, and preferences captured from the app. |
| `useractivities` | Recent user activity stored through Mongoose. |
| `affiliate_applications` | Affiliate program applications. |
| `affiliate_clicks` | Affiliate clicks by product, visitor, and source. |
| `affiliate_sales` | Sales attributed to the affiliate program. |
| `affiliate_daily_stats` | Daily statistics per affiliate. |
| `affiliate_referral_stats` | Accumulated metrics by referral code and product. |
| `affiliate_user_stats` | Affiliate performance summary per user. |
| `affiliate_payout_accounts` | Affiliate payout account details. |

## Internal API catalog

| Area | Endpoints |
| --- | --- |
| User synchronization | `/api/sync-clerk`, `/api/sync-registered-users-to-resend`, `/api/new-users` |
| Webhooks | `/api/webhooks/clerk`, `/api/webhooks/stripe` |
| Subscriptions and checkout | `/api/subscription/status`, `/api/subscription/invoice`, `/api/subscription/portal`, `/api/web-page-checkout`, `/api/stripe/demo-buy-button` |
| Landing pages | `/api/landing-pages/catalog`, `/api/landing-pages/[pageId]/content`, `/api/landing-pages/[pageId]/download`, `/api/landing-pages/[pageId]/readability`, `/api/landing-pages/readability-index` |
| Demos and R2 | `/api/refactory-online/[slug]`, `/api/webpages/assets/[...path]`, `/api/web-pages/validate-demo-url`, `/api/r2/buckets` |
| User data | `/api/activity/ping`, `/api/interests/track`, `/api/like`, `/api/profile/paypal` |
| Affiliates | `/api/affiliate/applications`, `/api/affiliate/click`, `/api/admin/affiliate-applications/[applicationId]`, `/api/admin/affiliate-sales` |
| Administration | `/api/cache/invalidate`, `/api/cache/stats`, `/api/seed` |

## Additive user synchronization

### Clerk `user.created` webhook

Every verified Clerk `user.created` event automatically adds the email to the
MongoDB `prompt-studio.user_profiles` collection and to Resend. Both writes are
idempotent; existing records are preserved. A temporary failure returns HTTP
`503` so Clerk/Svix can retry the event safely.

### `GET /api/sync-clerk`

Fetches up to 500 Clerk users. A user whose email already exists in MongoDB is skipped completely. Missing users are added to:

- `user_profiles`
- `user_profiles`
- `user_profiles`
- Resend

The endpoint does not update or delete existing database users.

Example response:

```json
{
  "success": true,
  "message": "Additive sync complete",
  "usersAdded": 3,
  "usersAlreadyRegistered": 127,
  "totalFoundInClerk": 130
}
```

### `GET /api/sync-registered-users-to-resend`

Reads email addresses from `prompt-studio.user_profiles`, loads the complete Resend audience with pagination, and creates only missing contacts. It never updates contacts, resubscribes unsubscribed contacts, or deletes contacts.

Required variables:

```env
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=tu_resend_key
# Optional: omit to use Resend global contacts
RESEND_AUDIENCE_ID=...
CRON_SECRET=...
```

Recommended request:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$DOMAIN/api/sync-registered-users-to-resend"
```

When `RESEND_AUDIENCE_ID` is empty or does not exist in the current Resend
account, the endpoint automatically synchronizes against Resend's global
contact list. The endpoint can also be opened directly in a browser by the signed-in Clerk
administrator whose email is configured in `PROMPT_STUDIO_PREMIUM_JO`.

Example response:

```json
{
  "message": "Additive sync complete (prompt-studio.user_profiles to Resend)",
  "database": "prompt-studio",
  "collection": "user_profiles",
  "audienceId": "audience_id",
  "totalFoundInDatabase": 130,
  "addedCount": 3,
  "alreadyRegisteredCount": 127,
  "errorCount": 0,
  "errors": []
}
```

## Catalog and public routes

Main public routes:

- `/`
- `/prompts`
- `/image-prompts`
- `/video-prompts`
- `/landing-pages`
- `/image-tags`
- `/video-tags`
- `/web-tags`
- `/prices`
- `/affiliate-program`
- `/prompt/edit`

Dynamic catalog routes include:

- `/landing-pages/[slug]`
- `/webpages/[slug]/`
- `/tags/[tag]`
- `/gallery/[id]`
- `/gallery-videos/[id]`

Static demos live under `public/webpages/<demoUrl>/`. The catalog source is `public/webpages/web-pages.json`. Cloudflare R2-backed demos are resolved through the same public webpage routes.

## Sitemap and SEO

- Source: `src/app/sitemap.ts`
- Public URL: `${DOMAIN}/sitemap.xml`
- Robots configuration: `src/app/robots.ts`

Run all SEO checks before deployment:

```bash
npm run seo:validate-all
```

The suite validates webpage catalog coverage, canonicals, sitemap composition, robots rules, metadata, structured data, internal links, duplicates, performance, Search Console preparation, and production HTTP responses.

## Analytics events

The application sends consistent interaction context to GA4 and Firebase Analytics.

| Event | Meaning |
| --- | --- |
| `web_open_demo_URL` | A user opens a demo |
| `web_buy_button_premium` | A user starts a purchase flow |
| `web_view_prompt` | A signed-in user opens a prompt |
| `web_download_free` | A user downloads a free component |
| `web_download_premium` | A Premium or Startup user downloads a component |

Common dimensions include `page_id`, `page_title`, `item_id`, `item_name`, `item_category`, `membership`, `value`, `currency`, `action_source`, `document_title`, `page_path`, and `page_location`.

Confirmed purchases and revenue must come from Stripe confirmation or a GA4 `purchase` event. `web_buy_button_premium` measures intent only.

## Deployment checklist

1. Configure production environment variables.
2. Confirm Clerk and Stripe webhook URLs and secrets.
3. Run `npm run build`.
4. Run `npm run seo:validate-all`.
5. Verify `/robots.txt` and `/sitemap.xml`.
6. Test Stripe checkout and webhook completion.
7. Confirm R2 demo and asset delivery.
8. Verify analytics events without exposing private data.

## Official profiles

- [Instagram](https://www.instagram.com/prompstudio/)
- [TikTok](https://www.tiktok.com/@promptstudio)
- [Pinterest](https://www.pinterest.com/prompstudio/)
- [Facebook](https://www.facebook.com/prompt.stuudio/)

## Further reading

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Clerk](https://clerk.com/docs)
- [Stripe](https://docs.stripe.com/)
- [Resend](https://resend.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Genkit](https://firebase.google.com/docs/genkit)
