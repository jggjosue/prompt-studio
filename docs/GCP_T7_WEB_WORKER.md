# GCP-T7 / #834 — Web generation on external workers

Only the heavy generation moves; **the Next.js app stays on Vercel**. The Cloud Run image runs `workers/generation/server.ts`, never `next build/start`.

## What runs where

| Path | Today | On a cloud backend (flags ON) |
|---|---|---|
| `/api/ai/jobs` with `kind: project` (WEBSITE_SIMPLE/ADVANCED/COMPLEX, code, structured data) | legacy runtime | same runtime on Cloud Run; output contracts validated by `validateOutput` |
| Page composer site plan (`workflow: site_plan`) | synchronous `/api/page-composer/ai/plan` | job executor `runSitePlanJob` (new) |

## Site plan job (`src/lib/site-plan-job-core.ts`)

`planSite` (unchanged) → `migratePageSchema`/repair → **`validatePageSchema`** (defence in depth) → R2 `generated/sites/<user>/<job>.json` → job result `{assetKey, outputUrl, pageCount, warnings, schema (inline only ≤ 256 KB)}`.

| Failure | Category | Retry | Credits |
|---|---|---|---|
| invalid JSON / schema, empty or oversized prompt | `validation_error` | no | released |
| model not allowed | `configuration_error` | no | released |
| R2 not configured | `storage_error` | no | released |
| provider timeout | `timeout` | yes | kept reserved |

Credits use the standard job boundary (reserve at creation, capture on success, release on terminal failure). The synchronous route keeps its current "check balance → charge after a valid schema" behaviour until cut-over; no second credit implementation was added.

## Cut-over (not done; requires explicit authorization)

1. Client: `page-composer` handles `202 {job}` and polls `/api/ai/jobs/:id` (adaptive polling from T11), then loads `result.schema` or fetches `result.outputUrl`.
2. Route: when `selectExecutionBackend({kind:'project'})` is not legacy, create an `AIGenerationJob {kind:'project', input:{workflow:'site_plan', prompt}}` + reserve + dispatch instead of calling `generateSitePlan` inline.
3. Flip `GCP_AI_WEB_ENABLED=true` only after Image and Video canaries (see activation runbook).
