# Repository Audit — September 11, 2026

Actual state of `prompt-studio` measured using the commands in §9. Nothing that
follows is an estimate: if a figure could not be measured, it is stated.

---

## 1. Executive Summary

| Evaluated Area | Status | One-line Reason |
|---|---|---|
| **Material** | Strong | ~97,000 lines of custom code, 368 commits, 105 API routes, 45 models |
| **Difficulty** | Strong | Visual editor, generation queue with credits, affiliate commerce: real logic, not CRUD |
| **Verifiability** | **Weak** | `npm run lint` **does not work**, coverage measures 62 of 680 files, CI does not run on the working branch |
| **Comprehensibility** | **Weak** | **There is no README**; 87 documents without an index or architecture documentation |

The first two areas are already solid; the last two are where all the margin for improvement lies.

---

## 2. Current Architecture

**Stack**: Next.js 15.5.9 (App Router, Turbopack) · React 19 · TypeScript 6 in
`strict` mode · Tailwind · MongoDB with Mongoose · Clerk (identity) · Stripe
(billing) · Genkit + AI providers · next-intl · Vercel.

```
Browser
   │
   ├── src/app/[locale]/**         90 pages (RSC + clients)
   │      └── middleware (src/proxy.ts) — language, redirects, headers
   │
   ├── src/app/api/**             105 API routes
   │      ├── auth: Clerk · signed webhooks · CRON_SECRET · admin · IP rate-limit
   │      ├── commerce: stripe, credits, affiliates, marketplace
   │      └── AI: job queue, evaluation, providers
   │
   ├── src/lib/**                 155 files — pure business logic
   ├── src/models/**               45 Mongoose models
   ├── src/components/**          156 components
   └── src/data/**                catalog (15 JSON files, outside `public/`)
```

**Code breakdown** (versioned files, excluding data and lockfiles):

| Zone | Files | Lines |
|---|---|---|
| `src/app` | 278 | 43,359 |
| `src/components` | 156 | 17,078 |
| `src/lib` | 155 | 13,799 |
| `src/hooks` | 30 | 2,032 |
| `src/models` | 45 | 1,273 |
| `src/ai` | 7 | 230 |
| `scripts` (.mjs) | 80 | 14,862 |
| `tests` | 63 | 3,617 |
| **Total TS/TSX** | **748** | **82,339** |

---

## 3. Verifiability — the weakest area

### 3.1 Linting does not exist (P0)

`npm run lint` executes `next lint`, which in Next 15.5 is removed/deprecated. The
actual execution **opens an interactive wizard** and waits:

```
npx @next/codemod@canary next-lint-to-eslint-cli .
? How would you like to configure ESLint? ❯ Strict (recommended)
```

There is no `eslint.config.*` or `.eslintrc*` in the repository. Consequences:

- No static analysis of any kind.
- In CI, that command would hang or fail — that's why **it is not in the pipeline**.
- Dead imports, unused variables, and incorrectly declared hooks pass without warning. It has already caused a real HMR failure in development production.

### 3.2 Coverage measures a fraction of the code (P0)

`npm run test:coverage` reports **93.87%**, and that figure is misleading:
Node's `--experimental-test-coverage` only counts **files loaded by the tests**.
Measured: **62 files out of 680** in `src/`.

| What is measured | What is not |
|---|---|
| 62 modules from `src/lib` and similar | 156 React components |
| Pure logic imported by tests | 105 API routes |
| | 90 pages |

The lowest covered business modules among those included:

| Module | Line coverage |
|---|---|
| `src/lib/component-purchase-validation.ts` | 23.08 % |
| `src/lib/generation-pricing.ts` | 49.23 % |
| `src/lib/editor/prompt.ts` | 57.78 % |
| `src/lib/affiliate.ts` | 61.06 % |
| `src/lib/campaign-control-center.ts` | 66.13 % |

### 3.3 CI does not cover actual work (P0)

`.github/workflows/quality.yml` has two jobs and triggers on
`pull_request` and `push` to `main`. But:

- Development happens on **`develop`**, so a normal push **does not trigger CI**.
- **0 pull requests** in 368 commits: the `pull_request` path is not used either.
- The pipeline does not run **build**, **lint**, or `seo:validate-all`.

In short: CI is configured, but practically no commit goes through it.

### 3.4 The build ignores its own errors (P1)

`next.config.ts:78-82` keeps `typescript.ignoreBuildErrors: true` and
`eslint.ignoreDuringBuilds: true`. `npm run typecheck` **passes** today (empty
output, exit code 0), so the safety net exists outside the build — but nothing prevents
a type error from reaching production.

### 3.5 What actually works

| Check | Result |
|---|---|
| `npm run typecheck` | **PASSED** (0 errors) |
| `npm test` | **PASSED** — 318 unit + 2 data tests |
| `npm run cache:audit` | **PASSED** |
| `npm run verify:env-example` | **PASSED** (in `test:ci`) |
| E2E tests (Playwright) | 3 suites; binary missing locally, they run in CI |

---

## 4. Comprehensibility

### 4.1 There is no README (P0)

The repository **has no entry point**. `README.md`, `README_EN.md`,
`README_ES.md`, and `AGENTS.md` were deleted in commit `6fb2744e`, the same one that
added the `docs/` folder. Anyone cloning the project today cannot even find how to
install it.

### 4.2 Engineering documentation is missing

`docs/` has **87 documents and 21,065 lines**, well-organized by area
(history, capabilities, policies, operations, data licensing, editor, SEO,
CRM). The problem is not the quantity, but **what** it documents: almost everything is business,
product, and operations. Missing:

`ARCHITECTURE.md` · `SETUP.md` · `DEVELOPMENT.md` · `API.md` · `DATABASE.md` ·
`AI_ARCHITECTURE.md` · `DEPLOYMENT.md` · `TROUBLESHOOTING.md` · `SECURITY.md`

There is also no index for `docs/`, nor `CONTRIBUTING.md`, `LICENSE`, or issue/PR templates.

### 4.3 440,000 lines of markdown that are not documentation (P1)

`.specstory/history/` contains **50 versioned AI session transcripts,
468,167 lines**. Twenty times the volume of `docs/`. They do not describe the system:
they are the log of the conversations that built it.

They have value as a decision history —argued in
`docs/data-licensing/`— but **should not count as documentation**, and an explicit
decision should be made regarding whether they should stay.

---

## 5. Security

### 5.1 Verified and correct

- **No key-shaped secrets in transcripts.** Real-value patterns were searched
  (`sk_live_` + 20 characters, `pk_live_…`, `AIza…`,
  `mongodb+srv://…`): **0 matches**. What appears are variable names quoted in conversation.
- `.gitignore` ignores `.env*` and excepts `.env.example`, which is protected by
  `verify:env-example` inside `test:ci`.
- Public writes (`new-users`, `affiliate/click`) are **IP rate-limited**
  with `enforceIpRateLimit`.

### 5.2 Real issues

| # | Issue | Severity |
|---|---|---|
| 1 | **105 dependency vulnerabilities**: 4 critical, 35 high, 62 moderate. Production only: 88, with **4 critical and 23 high** (`@grpc/grpc-js`, `express`/`body-parser`, `brace-expansion` ReDoS, `@genkit-ai/*` chain, and OpenTelemetry) | **P0** |
| | *Status at closing: production at **63, 0 critical and 7 high**. See [IMPROVEMENT_REPORT.md](IMPROVEMENT_REPORT.md) §2.4.* | |
| 2 | **Six authorization mechanisms** coexisting without a map: Clerk's `auth()`, webhook signatures (Stripe `constructEvent`, Clerk `svix`), `requireCronOrAdmin`, `hasValidCronSecret`, `isCacheAdminAuthorized`, IP rate limit. Checking if a route is protected requires reading it entirely | **P1** |
| 3 | Secrets in old commits of history (documented in `docs/historial/`): deleted from HEAD, **not from history**. Rotation status: unverified | **P1** |
| 4 | 68 out of 105 routes without an obvious sign of input validation (several validate with custom helpers; requires case-by-case review) | **P2** |

---

## 6. Code Quality

**What is good**: Only 1 `console.log` in `src/`, only 1 TODO, 0 commented code
blocks, `strict: true` in TypeScript, models and logic separated from the interface.

**What is not**:

| Issue | Evidence |
|---|---|
| Huge client components | `prompt-editor-client.tsx` 3,202 lines · `generate-videos-client.tsx` 3,027 · `generate-webs-client.tsx` 2,721 · `affiliate-client.tsx` 1,334 |
| Dead routes | `api/like` and `api/seed` return 501 "Firebase integration was removed" |
| Migration leftovers | 5 files still import Firebase after moving to MongoDB |
| No declared formatter | No `.prettierrc`; style depends on each developer's editor |

The longest pages (`privacy` 3,472, `terms` 3,082, `licenses` 2,132) are
**legal text**, not complexity: they are not candidates for refactoring.

---

## 7. Priorities

### P0 — Critical

1. **Configure ESLint** and ensure `npm run lint` works without interactive prompts.
2. **Measure coverage across all of `src/`**, not just what tests import.
3. **CI covering actual work**: trigger on `develop`, add lint and build steps.
4. **`npm run validate`**: a single reproducible command for repo health.
5. **README.md**: the repository has no entry point.
6. **Triage the 4 critical vulnerabilities** in production.

### P1 — High Value

7. `docs/ARCHITECTURE.md` with diagrams, `SETUP.md`, `DEVELOPMENT.md`,
   `TESTING.md`, `SECURITY.md`, `TROUBLESHOOTING.md`, `API.md`, `DATABASE.md`,
   `AI_ARCHITECTURE.md`.
8. **Route access map** documented and **verified by a test**, which is the
   only way to prevent regression.
9. Tests for the lowest covered business modules, starting with
   `component-purchase-validation` (23%) and `generation-pricing` (49%).
10. Remove `ignoreBuildErrors` / `ignoreDuringBuilds`, or place them behind a
    flag that CI sets to strict.

### P2 — Medium Value

11. Decompose the three clients over 2,700 lines by responsibilities.
12. Delete dead routes and leftover Firebase code.
13. `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, issue and PR templates.
14. Decide what to do with `.specstory/history`.

### P3 — Optional

15. Prettier with shared configuration.
16. `seo:validate-all` in CI (currently fails with pending real findings).
17. Start using pull requests: 0 in 368 commits.

---

## 8. What this audit **does not** claim

- **Does not** say real coverage is 93.87%: that figure covers 62 out of 680
  files.
- **Does not** say there are exposed secrets in transcripts: value formats were
  checked and none were found.
- **Does not** say routes "without `auth()`" are unprotected: six different
  mechanisms protect them; the issue is they are undocumented.
- **Has not** run `npm run build` during this pass: build status is
  verified in the final phase.

---

## 9. How to reproduce these figures

```bash
# Material
git log --oneline | wc -l
for ext in ts tsx mjs; do git ls-files "*.$ext" | grep -vE '^public/|^src/data/' | xargs wc -l | tail -1; done
find src/app/api -name route.ts | wc -l && ls src/models | wc -l

# Verifiability
npx tsc --noEmit; echo "typecheck=$?"
npm run lint                      # opens a wizard: that's the problem
npm test
npm run test:coverage | grep "all files"
npm run test:coverage | grep -c "^# src/"    # actually measured files
find src -name '*.ts' -o -name '*.tsx' | wc -l

# Security
npm audit --omit=dev --json | node -e "…"    # see §5
grep -rhoE 'sk_live_[A-Za-z0-9]{20,}' .specstory | sort -u | wc -l   # 0

# Comprehensibility
find docs -name '*.md' | wc -l && cat $(find docs -name '*.md') | wc -l
ls README.md CONTRIBUTING.md SECURITY.md LICENSE 2>/dev/null
```