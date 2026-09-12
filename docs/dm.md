# DM — Data Model

System entities and their actual shape. Written so that whoever codes —person or agent— does not have to invent fields or deduce invariants by reading the code.

Sibling document: [prd.md](prd.md) describes what the product does. This one describes the data it acts upon.

Data lives in three different places with separate responsibilities:

| Store | What it keeps | Source of truth for |
|---|---|---|
| **Clerk** | Identity, sessions, emails | Who the user is |
| **MongoDB** | Application state | Purchases, credits, affiliation, activity |
| **Files in `public/`** | Catalog | What resources exist |

Clerk's `userId` is the join key: it appears in Mongo as `userId`, `clerkUserId`, `purchaserUserId`, `buyerUserId`, or `referrerUserId` depending on the collection. **There are no foreign keys or `populate`**: relationships are resolved by that identifier in the code.

---

## 1. Catalog (files)

The catalog is not in the database. It lives as JSON in `src/data/`, is versioned with the repository, and is consumed by `import` at build and server time.

Important distinction: the **sources** (`src/data/`) carry the full prompt and are not accessible via HTTP. The **derivative** (`public/catalog/`) is served, which is why `build-paged-catalogs.mjs` empties `description` and truncates the prompt of Premium records to 240 characters.

### 1.1 Sources

| File | Root key | Records |
|---|---|---|
| `src/data/prompts/placeholder-images.json` | `placeholderImages` | 299 |
| `src/data/prompts/placeholder-videos.json` | `placeholderVideos` | 197 |
| `src/data/web-pages.json` | `webPages` | 236 |
| `src/data/prompts/web-{type}-components.json` | `components` | 450 in 8 files |

**They live in `src/data/`, not in `public/`**, precisely because they contain the paid prompt: anything under `public/` is downloadable by URL. They are consumed with static `import`, never via HTTP.

### 1.2 Shape of a record

```jsonc
{
  "id": "img-2",                    // stable; used in the detail URL
  "title": "Submerged",
  "description": "",                // frequently empty
  "imageUrl": "https://…",          // absolute, external host
  "imageHint": "underwater half-face",
  "tags": ["Realistic", "Modern"],
  "membership": "Free",             // "Free" | "Premium"
  "type": "image"
}
```

Landing pages add `demoUrl` (folder under `public/webpages/`), `stack` (array of technologies), and `price` (string, not number).

Localizable fields (`title`, `imageHint`) support two forms: direct string, or an object `{ en, es }`. The `pick()` helper in `scripts/build-paged-catalogs.mjs` resolves one or the other.

**Component files do not follow this shape.** They wrap the array in an object with category metadata, and localize by suffix instead of by nested object:

```jsonc
{
  "title_es": "Botones", "title_en": "Buttons",
  "description_es": "…",  "description_en": "…",
  "components": [ /* 50 elements; form-components has 100 */ ]
}
```

Any generic catalog reader must locate the array by search (`Object.values(...).find(Array.isArray)`), not assume a fixed key or that the root is the array.

### 1.3 Known traps of this data

They are documented because they have already broken builds:

- **`tags` contains non-string values.** 52 in `placeholder-images.json`. Always filter before using (`cleanTags()` in `src/lib/seo/programmatic-seo.ts`). A `null` reaching `slugify()` breaks `generateStaticParams` at build time, not in development.
- **`price` is a string**, even when representing a number.
- **`description` is NOT empty in the sources**: it contains an object `{ es: { nombre, prompt }, en: { name, prompt } }` with the paid prompt. It appears empty only in the derivative catalog, because `scripts/build-paged-catalogs.mjs` sets `description: ''` on purpose to avoid publishing the product in the paginated JSON.
- **`id` is not globally unique** across types: there is `img-2` and `wp-2`.

### 1.4 Derivative catalog

`npm run catalog:build` generates `public/catalog/{type}/{locale}/` with pages of 24 elements and a `manifest.json`:

```jsonc
{
  "version": "df077b8792ba761b",
  "total": 200, "pageSize": 24, "pages": 9,
  "files": [{ "page": 1, "file": "page-001.1a7fa02cf1ca5bb9.json", "hash": "…", "count": 24 }]
}
```

The hash in the filename allows caching each page immutably. **It is a generated artifact**: it is not edited by hand, it is regenerated from the sources.

### 1.5 Provenance

`src/lib/catalog-provenance.ts` adds a metadata layer over each record, necessary to license the catalog as a dataset.

```ts
type AssetProvenance = {
  host: string;
  license: 'owned' | 'stock-review' | 'restricted' | 'unknown';
  licensable: boolean;   // true only if it can go in a commercial dataset
  reason: string;
};
```

Classification by host, with the current state (`npm run catalog:provenance`):

| Host | Records | Status |
|---|---|---|
| `raw.githubusercontent.com/jggjosue/…` | 308 | `owned` — own account |
| no external asset | 742 | licensable, own text only |
| `assets.mixkit.co` | 76 | `stock-review` |
| `i.imgur.com` | 44 | `unknown` |
| `images.unsplash.com` | 12 | `restricted` — forbids AI training |

Total 1,182 records, 1,050 licensable (88.8%).

**Rule that cannot be simplified**: for GitHub the domain is not enough, the owner account is compared. `raw.githubusercontent.com/other-person/…` is not owned. Any unrecognized host falls on the safe side: not licensable.

Two fields of the schema are deliberately left `null` because the code cannot deduce them: `aiAssisted` (if the text was AI-generated, relevant because purely generated output has no copyright in the US) and `consent`.

---

## 2. MongoDB Collections

20 models over **18 physical collections**: three schemas share `user_profiles` (see the warning at the end of this section). Database `prompt-studio` in MongoDB Atlas. Connection with bounded pool (`maxPoolSize: 10`) for being serverless.

### 2.1 Identity and profile

**`UserProfile`** — data Clerk does not store.
`userId` (unique), `email`, `birthDate`, `paypalEmail`, `lastUpdatedAt`.

**`RegisteredUser`** / **`NewUser`** — only `email` and `createdAt`. They feed the Resend sync. `NewUser` collects signups from the public form.

> **All three point to the `user_profiles` collection.** They are not separate collections: `UserProfile`, `RegisteredUser`, and `NewUser` pass the same name as the third argument of `mongoose.model()`. Real consequences:
>
> - `UserProfile` declares `userId` **unique**. `RegisteredUser` and `NewUser` documents do not have `userId`, so they are indexed as `null`: **only one can exist**. The second insert crashes with a duplicate key.
> - `RegisteredUser` declares `email` **unique**, and that index also applies to `UserProfile` documents.
> - `NewUser.find({})` in `/api/sync-resend` returns **all** documents from `user_profiles`, including profiles, and sends their emails to Resend.
>
> That it doesn't explode today depends on whether the indexes were successfully built against existing data; a failed build is logged but doesn't throw. It's a latent defect, not a design.

**`UserActivity`** — `userId`, `email`, `lastActiveAt`, `firstSeenAt`, `inactivityNotifiedAt`. Basis for reactivation campaigns.

**`UserInterest`** — `userId`, `email`, `interests[]`, `lastUpdatedAt`.

**`SavedItem`** — resources the user saves from the catalog.
`userId`, `itemKind` (`image` | `video` | `web-page` | `component` | `animation`), `itemId`, `title`, `imageUrl`, `href`, `createdAt`.

`title`, `imageUrl`, and `href` are **denormalized**: the catalog is not in the database and has different shapes by type, so without copying them you would have to traverse five catalogs to paint the profile list. **The prompt is never copied**: it is a paid product and its access is checked when opening the detail page.

Unique index `{ userId, itemKind, itemId }` — a double click cannot duplicate. It includes `itemKind` because `itemId` is not unique across types (`img-2` and `wp-2`).

**`CookieConsent`** — `email`, `clerkUserId`, `privacyPolicyVersion`, `termsOfServiceVersion`, `acceptedAt`. Saves **which version** of each policy was accepted; without this, consent is not provable under GDPR.

### 2.2 Credits and AI generation

**`AICreditAccount`** — one document per user. `userId` (unique), `balance`, `reserved`, `lifetimeSpent`, all with `min: 0`.

The separation between `balance` and `reserved` is the mechanism that prevents charging for failed generations: it is reserved upon queuing and captured or refunded upon completion.

**`AICreditLedger`** — `userId`, `jobId`, `operation`, `amount`, `createdAt`.
Append-only record of every movement; the account is the aggregate, the ledger the history.

**`AIGenerationFeedback`** — human judgment on the result. `jobId`, `userId`, `kind`, `provider`, `useful`, `reason`, `comment`, `createdAt`, `updatedAt`. Unique by `{ jobId, userId }`.

`kind` and `provider` are copied from the job: redundant, but allows aggregating the approval rate per provider without `$lookup`, which is the main query.

**`AIGenerationJob`** — the core of the queue.

| Field | Type | Notes |
|---|---|---|
| `userId` | String | indexed |
| `kind` | enum | `image` \| `video` \| `project` |
| `provider` | String | validated against `AI_JOB_PROVIDERS[kind]` |
| `input` / `result` | Mixed | free payload |
| `status` | enum | `queued` \| `processing` \| `retrying` \| `completed` \| `failed` |
| `progress` | Number | 0–100 |
| `idempotencyKey` | String | required |
| `creditCost`, `estimatedCostUsd` | Number | from server, never from client |
| `creditsState` | enum | `reserved` \| `captured` \| `refunded` |
| `attempts` / `maxAttempts` | Number | default 3, cap 5 |
| `nextAttemptAt` | Date | indexed; controls backoff |
| `leaseExpiresAt` | Date | processor lease |
| `feedbackUseful` | Boolean \| null | copy of human verdict; `null` = unrated |

Two indexes that **are the design, not an optimization**:

```js
{ userId: 1, idempotencyKey: 1 }              // unique — guarantees idempotency
{ status: 1, nextAttemptAt: 1, leaseExpiresAt: 1 }  // atomic claim of the next job
```

The first ensures that a resubmission cannot duplicate the job or the charge. The second allows `findOneAndUpdate` to claim a job and set its lease in a single operation, without a race condition between concurrent processors.

### 2.3 Purchases

**`ComponentPurchase`** — `purchaserUserId`, `purchaserEmail`, `productId`, `productName`, `productKind`, `amountPaidCents`, `currency`, `status` (`paid` | `refunded`), `stripeCheckoutSessionId` (**unique**), `stripePaymentIntentId`, `receiptUrl`, `downloadCount`, `maxDownloads` (default 5), `purchasedAt`.

Unique `stripeCheckoutSessionId` is what prevents a redelivered webhook from duplicating the purchase. `downloadCount` versus `maxDownloads` is compared and atomically incremented in the same operation.

### 2.4 Affiliates

Six collections: one of facts and five of aggregates.

**`AffiliateApplication`** — application with `status`, manual approval.

**`AffiliateClick`** — base fact. Unique index `{ referrerUserId, visitorKey, productId, source }`: this is the deduplication. The same visitor reloading the page does not inflate the counter.

**`AffiliateSale`** — the conversion. `commissionRate` and `commissionCents` frozen at the time of sale, not recalculated later. `status` (`pending` | `paid` | `pending_settlement`) and `payoutStatus` (`available` | `paid_out` | `on_hold`) are independent axes: a sale charged to the client can remain on hold for the affiliate. `stripeCheckoutSessionId` and `stripeInvoiceId` are unique and `sparse` — every sale arrives via one route or the other, never both.

**`AffiliateUserStats`**, **`AffiliateDailyStats`**, **`AffiliateReferralStats`** — aggregates per user, per day, and per product. Derivatives: reconstructible from clicks and sales.

**`AffiliatePayoutAccount`** — `clerkUserId`, `email`, `method`.

### 2.5 Observability

**`ObservabilityEvent`** — `category` (enum of 8: `browser_error`, `server_error`, `web_vital`, `resource_timing`, `stripe`, `ai_generation`, `slow_query`, `commerce`), `name`, `route`, `sessionId`, `userId`, `productId`, `value`, `unit`, `status`, `durationMs`, `costUsd`, `metadata`, `fingerprint`.

`createdAt` has a **90-day TTL** (`expires`), so Mongo purges it alone. Three compound indexes for dashboard queries.

Prompts, code, keys, or full URLs are never saved.

---

## 3. Invariants

Rules the code assumes everywhere. Breaking one is a bug even if it compiles.

1. **The price is set by the server.** No amount arrives from the client.
2. **Credits are reserved before spending** and captured or refunded based on the result. A provider failure does not consume balance.
3. **Stripe identifiers are unique** where they exist. This is the defense against redelivered webhooks.
4. **Clerk's `userId` is the join key.** There is no referential integrity in the database: consistency is maintained by the code.
5. **Aggregates are derivatives.** If they diverge, the truth is in `AffiliateClick` and `AffiliateSale`.
6. **The catalog is read-only at runtime.** It is modified by editing the JSONs and regenerating; never by writing from the application.
7. **Amounts are in whole cents.** Never floats.

## 4. Unmodeled data

Real gaps, not document omissions:

- **Subscriptions**: plan status lives in Clerk Billing and Stripe, not in Mongo. There is no subscription collection; it is queried against the provider and cached in memory (`src/lib/subscription-status-cache.ts`).
- **Library**: `/dashboard/library` still has no collection behind it. Saves do have one now (`SavedItem`), and are listed in the profile.
- **Persisted provenance**: `catalog-provenance.ts` classifies on the fly. Fields are not written to the catalog files, so today you cannot filter by `licensable` without recalculating.
