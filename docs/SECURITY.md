# Security

How Prompt Studio is protected, what is checked automatically, and what remains
pending. The statements in this document are verified with the commands
in §7; those that could not be verified are noted as such.

---

## 1. Access Model

Eight mechanisms, one per caller type. The complete route-by-route list is
in [API_ACCESS.md](API_ACCESS.md), which is **generated from code** and backed
by `tests/unit/route-access-matrix.test.ts`.

| Caller | Mechanism | Implementation |
|---|---|---|
| Authenticated user | Clerk | `auth()` |
| User with plan | Actual subscription status | `src/lib/server-subscription-status.ts` |
| Administrator | Configured email | `src/lib/admin-auth.ts` · `marketplace-admin.ts` · `cache-admin-auth.ts` |
| Stripe / Clerk | Webhook signature | `constructEvent` · `svix` |
| Scheduled tasks | `CRON_SECRET` | `src/lib/api-auth.ts` |
| AI Worker | Bearer token | `AI_GENERATION_WORKER_TOKEN` |
| Anonymous | IP rate limit | `src/lib/rate-limit.ts` |

### Rules enforced by the pipeline

The matrix test fails —and with it, the pipeline— if:

1. a new route does not use any recognized mechanism nor is justified in
   writing;
2. a route under `/api/admin` checks only the session, not the administrator;
3. a write without a session has no IP rate limit.

The three rules stem from real defects found while writing the test:

- **Two admin routes** (`/api/admin/observability` and
  `/api/admin/product-reviews`) had the admin check **inline-copied** instead of
  using the helper. They worked, but duplicate authorization rules are where
  bugs slip in when one copy falls behind. Today both delegate to
  `isPremiumJoAdmin()`.
- **`/api/affiliate/applications`** accepted anonymous writes **without IP rate
  limiting**: a direct vector to flood the applications collection. Today it uses
  `enforceIpRateLimit` with `RATE_LIMITS.publicWrite`.

### Constant-time comparisons

`hasValidCronSecret` compares using `safeEqual`, a byte-by-byte comparison without
early exit. Without it, an attacker could infer the secret by measuring response
timing.

---

## 2. Secrets

### What is guaranteed

- **`.env*` is ignored** by git except for `.env.example`, which is intentionally
  versioned as a template.
- **`.env.example` contains no real values**: this is checked by
  `npm run verify:env-example` on every run of `npm run validate` and CI.
  The guardrail was validated as guardrails should be: copying four real
  secrets to the file and confirming that it flagged them.
- **Transcripts in `.specstory/` contain no keys.** Values matching **key
  patterns** —`sk_live_` followed by 20 characters, `pk_live_`, `AIza…`,
  `mongodb+srv://…`— were searched for, yielding **zero matches**. What appears
  are variable names mentioned in conversation.

### What remains pending

- **Secrets existed in old commits**: a `KINDE_CLIENT_ID` in the commit message of
  `4a2f3055` and, prior to `2bf9a846`, a `.env.example` with 54 values identical
  to `.env`, including a Clerk `sk_live_` key. They were removed from HEAD, **not
  from history**.
- **Removing from HEAD does not remove from history.** The only true fix is
  **rotation**. `npm run verify:rotation` compares current usage against everything
  that was ever in history; the procedure is detailed in
  [rotacion-de-credenciales.md](rotacion-de-credenciales.md).
- **Rotation status: unverified.** Until completed, the repository should not be
  shared with third parties: exposing history exposes those credentials.

### A script that leaked credentials

`scripts/ts/test-mongo-auth.ts` printed `console.log` statements with username,
password, and connection string —commented out, ready to uncomment—. stdout ends
up in CI logs. Today it reports **presence and length**, never the value.

---

## 3. Paid Product Protection

The catalog contains paid prompts. It was previously served from `public/`,
meaning **downloadable**. Three fix attempts failed before reaching the proper rule:

| Attempt | Why it failed |
|---|---|
| Whitelist of 8 filenames | An audit revealed **9 more files** containing paid product that no one had added |
| Block `*.json` | `precompress-static.mjs` generates `.br` and `.gz`: `*.json.br` remained exposed |
| `headers()` with two lookaheads | It behaved **in reverse**: it applied to `/api/*`, which was excluded |

**Active rule**: block by directory, cover all three file formats, and ensure
the test **traverses the actual directory** instead of listing what to protect.
Tests that enumerate grow stale; tests that traverse do not.

---

## 4. Headers and CSP

`src/lib/security-headers.ts` sets base headers and content security policy.
Two mutually exclusive policies:

- the app policy, which allows Clerk, Stripe, analytics, and advertising;
- the demo policy (`/webpages/*`), which requires cdnjs, jsDelivr, and Google Fonts
  because generated pages load `three.js` and `gsap` from CDNs.

If both coincided, the browser would apply the **intersection**, breaking the
demos. The negative lookahead in `source` keeps them separate.

The CSP operates in `Report-Only` mode until `CSP_ENFORCE=true`. Violations are
sent to `/api/csp-report`.

---

## 5. Input Validation

Routes sanitize request bodies before writing: length truncation, value
whitelists, item caps. Two examples illustrating the approach:

- `/api/component-library` truncates names, identifiers, and list sizes according
  to `LIBRARY_LIMITS`: without this, a manipulated `PUT` could store a
  multi-megabyte document in the account.
- `/api/editor/projects` rejects documents with over 2,000 nodes and verifies that
  the root exists within the tree.

Every query reading or writing user data **filters by `userId` directly in the
query**, not after retrieval: no one can modify another account's library or
project.

---

## 6. Dependencies

**Status as of September 12, 2026**: `npm audit --omit=dev` reports **63
vulnerabilities in production — 0 critical and 7 high**. Starting baseline was 88,
with 4 critical and 23 high.

| | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| Before | 4 | 23 | 59 | 2 | 88 |
| Now | **0** | **7** | 53 | 3 | **63** |

What was fixed:

- `next` 15.5.9 → **15.5.25** (no major version bump): closes the critical
  Denial of Service vulnerability in the image optimizer.
- `sharp` → **0.35.4**: CVEs inherited from libvips.
- `recharts` **3.0.0-alpha.9 → 3.10.1**: removes an *alpha* release from production
  and drops `lodash`, whose vulnerability has no published fix.
- `postcss` → **8.5.28**, unified with `overrides: {"postcss": "$postcss"}`.
- Removed `firebase-admin`, a **direct dependency not imported by any module**
  (only the client SDK `firebase` is used in `src/lib/firebase.ts`).
- Targeted `overrides` for `handlebars` 4.7.9, `protobufjs` 7.6.6,
  `websocket-driver` 0.7.5, `node-forge` 1.4.0, `js-cookie` 3.0.8, `nanoid`
  3.3.19, `fast-uri`, `form-data`, `@grpc/grpc-js`, `qs`, `body-parser`, and
  `path-to-regexp`.

The `overrides` use the `"package@<range>": "version"` syntax instead of a
global override, because `picomatch`, `form-data`, and `@grpc/grpc-js` coexist
across two different major versions in the dependency tree, and a global override
would have downgraded modern consumers.

### What remains, and why it is left untouched

**All remaining 63 stem from the `genkit` dependency tree**, and the 7 high
vulnerabilities belong to the OpenTelemetry chain. `@genkit-ai/core` pins
`@opentelemetry/* ~1.25`, while fixes exist only in **OpenTelemetry 2.x**. It
was verified that `genkit@1.42.0`, the latest release, **still pins `~1.25.0`**:
this is not outdated software, but rather a lack of upstream fixes.

```bash
npm view @genkit-ai/core@latest dependencies --json | grep opentelemetry
```

Forcing OpenTelemetry 2.x under genkit compiles, but runtime functionality of
telemetry instrumentation cannot be verified here. This is reviewed with each
genkit update.

**`npm audit fix --force` was not applied**: it suggested `genkit@0.5.17`, a
**downgrade** from 1.20.0 that would break AI generation. `npm audit` presents
any version outside the vulnerable range as a fix, including older releases.

---

## 7. How to Verify All of the Above

```bash
# Access matrix and its rules
node scripts/mjs/build-route-access-matrix.mjs
node --import tsx --test tests/unit/route-access-matrix.test.ts

# Secrets
npm run verify:env-example
npm run verify:rotation
grep -rhoE 'sk_live_[A-Za-z0-9]{20,}' .specstory | sort -u | wc -l   # must be 0

# Exposed paid product
node --import tsx --test tests/unit/catalog-source-exposure.test.ts

# Dependencies
npm audit --omit=dev
```

## 8. Reporting an Issue

This is a private repository for a production product. If you find a security
issue, **do not open a public issue**: write to the site's contact email address
with steps to reproduce it.

## Related source files

- [`src/lib/api-auth.ts`](../src/lib/api-auth.ts) — `hasValidCronSecret`, `safeEqual` (constant-time)
- [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts) — IP rate limiting de escrituras anónimas
- [`src/lib/server-subscription-status.ts`](../src/lib/server-subscription-status.ts) — gating por plan real (no cache)
- [`src/lib/admin-auth.ts`](../src/lib/admin-auth.ts) · [`marketplace-admin.ts`](../src/lib/marketplace-admin.ts) · [`cache-admin-auth.ts`](../src/lib/cache-admin-auth.ts) — gating de administradores (tres helpers)
- [`src/lib/security-headers.ts`](../src/lib/security-headers.ts) — CSP y headers (app vs demo)
- [`scripts/ts/test-mongo-auth.ts`](../scripts/ts/test-mongo-auth.ts) — script que filtró credenciales por `console.log`
- [`tests/unit/route-access-matrix.test.ts`](../tests/unit/route-access-matrix.test.ts) — matriz de acceso; regla del pipeline
- [`tests/unit/catalog-source-exposure.test.ts`](../tests/unit/catalog-source-exposure.test.ts) — bloqueo de producto de pago (recorre el directorio, no lo enumera)
- [`scripts/mjs/build-route-access-matrix.mjs`](../scripts/mjs/build-route-access-matrix.mjs) — genera la matriz desde código