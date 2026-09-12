# Deployment

Platform: **Vercel**. Production branch: `main`. Each open branch generates a
*preview*. This document covers only what is not obvious from the Vercel
dashboard: what the build does on its own, why the AI queue has no scheduler,
and what breaks if an environment variable is missing.

---

## 1. The build does more than `next build`

```
prebuild → webpages:normalize · catalog:build · reviews:aggregates
build    → next build · minify-public-assets · optimize-public-media · precompress-static
```

`vercel-build` is simply `npm run build`, so **Vercel also executes `prebuild`**.
That matters for a specific reason: paginated catalogs and review aggregates
are **artifacts generated at build time**, not data read on the fly. If
`catalog:build` fails, the build fails; if skipped, catalog pages would render
empty without a visible error.

The three steps following `next build` (minification, media optimization,
precompression) act on `public/`. They are idempotent: re-running them on an
already processed output does not degrade it.

**Practical consequence:** the build is noticeably slower than a standard Next
build. It is the price of serving the catalog as static.

---

## 2. The AI queue has no scheduler

`vercel.json` **declares no cron job**. It used to declare one:

```json
{ "path": "/api/ai/jobs/process?limit=3", "schedule": "* * * * *" }
```

It was removed because Vercel's Hobby plan only allows cron jobs that run **once
per day**; a per-minute expression is rejected and the deployment fails.

**What this means, plainly: nothing advances the AI queue by itself.** A job
submitted to `/api/ai/jobs` stays in `queued` with its credits `reserved` until
something calls `/api/ai/jobs/process`. That endpoint still exists and still
works; it simply has no scheduler behind it.

To process the queue, call it with the cron secret:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://<dominio>/api/ai/jobs/process?limit=3"
```

Ways to put a scheduler back, when the queue is needed:

| Option | Cost |
|---|---|
| Vercel Pro | Restores `schedule: "* * * * *"`; per-minute precision |
| Hobby with `"schedule": "0 * * * *"` | Not allowed either — Hobby caps at once per day |
| An external scheduler (GitHub Actions `schedule`, cron-job.org, Upstash QStash) | Free; calls the URL above with the secret |

Other details that still apply when a scheduler is in place:

- The route authenticates with `hasValidCronSecret`, **not** with a session.
  Without `CRON_SECRET` it returns 401 with no noise at all, and the queue stops
  advancing with credits still reserved. The symptom is `reserved` growing in
  `ai_credit_accounts`.
- `maxDuration = 300` on the route. The external worker timeout is 270 s
  precisely to fail before the platform does.
- A one-minute cadence with a 5-minute lease means a hung job is not retried
  until those 5 minutes have passed, not on the following minute.

See [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) §3.

---

## 3. Headers

`vercel.json` defines 9 header rules. The two that are not cosmetic:

| Route | Policy | Reason |
|---|---|---|
| `/_next/static/(.*)` | `public, max-age=31536000, immutable` | The filename is hashed; it never changes under the same URL |
| `/__clerk/(.*)` | `no-store, must-revalidate` (also on CDN) | Caching Clerk's handshake leaves cross-user sessions |

The second one is not an optimization: it is a correctness rule. `CDN-Cache-Control`
is set separately because Vercel's CDN does not obey plain `Cache-Control` for
its own layers.

The rest of the application's cache policies reside in the code
(`src/lib/cache-policy.ts`) and are verified by `npm run cache:audit`, which is part
of `validate` and CI.

---

## 4. Environment variables

`.env.example` documents **91 variables**. Not all of them are required; what
breaks when each group is missing:

| Group | If missing |
|---|---|
| `MONGODB_URI` | Everything that persists. Immediate and loud failure (`bufferCommands: false`) |
| Clerk | No session; all authenticated routes return 401 |
| `CRON_SECRET` | Nothing can drain the AI queue: `/api/ai/jobs/process` returns 401 with no noise (§2) |
| Stripe | Payments fail at checkout; webhooks return 400 |
| `AI_GENERATION_WORKER_URL` / `_TOKEN` | Only in-process image+`google` works; the rest of the jobs fail and refund credits |
| R2 | Uploads fail; already uploaded assets continue to be served |
| Resend | No completed job notifications; generation works as usual |

Two checks before deploying:

```bash
npm run verify:env-example   # el ejemplo cubre lo que el código lee
npm run verify:clerk:prod    # las claves de Clerk son de producción, no de test
```

`verify:clerk:prod` exists because deploying with `pk_test_` keys to production
is a silent failure: the application starts up and authenticates against the wrong
environment.

---

## 5. Before pushing to `main`

```bash
npm run validate   # lint · typecheck · cobertura · env-example · caché
```

CI runs the same plus the build and browser tests
(`.github/workflows/quality.yml`, on `pull_request` and on `push` to `main` and
`develop`).

SEO validations (`npm run seo:validate-all`) are **not** in CI because several
of them require the site to already be deployed. They are run against the *preview*
or against production, with `SEO_REPORT=1` to get the detailed report.

---

## 6. Known state

`npm audit --omit=dev` reports **63 production vulnerabilities, 0 critical and
7 high** (starting from 88, with 4 critical and 23 high). The remaining 63 all hang
off the `genkit` tree, which pins `@opentelemetry/* ~1.25` when the fix only
exists in OpenTelemetry 2.x — including its latest version. They do not block
deployment; details and the reason for not forcing it are in
[SECURITY.md](SECURITY.md) §6.