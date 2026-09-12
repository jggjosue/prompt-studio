# Repository Improvement Report

Closing report for the audit programme (phases 1–10). It compares the **before**
and **after** states as measured, and states just as plainly what was left
unresolved and why.

Every figure here was measured, not estimated. Each section includes the command
that reproduces it.

---

## 1. Summary

| Dimension | Before | After | How to check |
|---|---|---|---|
| `npm run lint` | **not runnable** (no config) | 0 errors, 222 warnings | `npm run lint` |
| `npm run typecheck` | 0 errors | 0 errors | `npm run typecheck` |
| Published coverage | 93.87 % *over 62 of 680 files* | **5.56 %** over all of `src/` | `npm run test:coverage` |
| lcov report | never generated | `coverage/lcov.info`, uploaded by CI | *tests* job |
| Production vulnerabilities | **88** (4 critical, 23 high) | **63** (0 critical, 7 high) | `npm audit --omit=dev` |
| API routes with verified access | 0 (no inventory) | **105 of 105**, with a test that fails if one is missing | `npx tsx --test tests/unit/route-access-matrix.test.ts` |
| CI on `develop` | no | yes (`pull_request` + `push` to `main` and `develop`) | `.github/workflows/quality.yml` |
| README | did not exist | 217 lines, links verified | `README.md` |
| Documents describing the code | 0 | **9** new or rewritten in `docs/` | README index |
| Post-build steps that actually run | 0 of 3 (broken path) | 3 of 3 fixed, 2 verified running | §2.6 |
| Single validation command | did not exist | `npm run validate` | — |

---

## 2. What improved, and by how much

### 2.1 Linting went from non-existent to mandatory

There was no ESLint configuration at all: `npm run lint` was not runnable.
`eslint.config.mjs` (flat config) was created on top of `next/core-web-vitals`
and `next/typescript`. The first pass reported **280 errors**; today there are
**0 errors and 222 warnings**, and linting blocks CI.

The warnings are deliberate, not hidden debt: `@typescript-eslint/no-explicit-any`
and `no-console` are set to `warn` because clearing them means touching logic,
and that change does not belong in a static-quality task.

**A lesson learned the hard way.** Cleaning up imports with regular expressions
destroyed code **three times** (it removed identifiers from object literals and
left dangling `type` keywords and `import from "x"` statements). The fix was not
a better pattern but a different tool: `eslint-plugin-unused-imports`, which
works on the AST. *Mechanical edits to imports need a syntax tree, not a regular
expression.*

### 2.2 Coverage went from flattering to useful

The previous 93.87 % was real, but it was measured **only over the 62 files the
tests loaded**. The other 618 never appeared in the denominator.

`scripts/mjs/build-coverage-report.mjs` merges the two lcov passes (unit tests
with `tsx`, data tests without) and **adds the `src/` files that no test loads to
the report at 0 %**. Result: **5.56 % (4,290 / 77,202 lines)**, 62 files measured,
614 uncovered.

The number dropped 88 points. That is not a regression: it is the difference
between a metric and a measurement. An honest low number lets you prioritise; a
high partial one stops you from even knowing what is missing.

**A detail that cost a debugging session:** the reporter flags must come
**before** `--test <files>`. After it, Node reads them as test paths and the
report comes out at 0 % with no error.

### 2.3 API access went from convention to contract

`scripts/mjs/build-route-access-matrix.mjs` walks `src/app/api/**` and classifies
each route by the 8 mechanisms detected in its code (webhook, cron, admin, plan,
session, worker token, IP rate limit, disabled). Legitimately public routes are
listed with a **written justification**.

`tests/unit/route-access-matrix.test.ts` turns that into a contract with 7
checks: no route without a mechanism or a justification, `/api/admin/**` checking
role and not merely a session, public writes rate-limited by IP, justifications
of at least 20 characters, and the generated document kept up to date.

**It found two real defects the moment it ran:**

1. `/api/admin/observability` and `/api/admin/product-reviews` checked the email
   address inline instead of using `isPremiumJoAdmin()` — two copies of an
   authorisation rule that can drift apart.
2. `/api/affiliate/applications` was a **public write with no IP rate limit**.

This is what separates a useful test from a decorative one: it was written to
check a property, and it found defects nobody was looking for.

### 2.4 Vulnerabilities: from 88 to 63, and from 4 critical to none

| | Critical | High | Moderate | Low | **Total** |
|---|---|---|---|---|---|
| Before | 4 | 23 | 59 | 2 | **88** |
| After | **0** | **7** | 53 | 3 | **63** |

How, without breaking anything:

| Action | Effect |
|---|---|
| `next` 15.5.9 → **15.5.25** (no major bump) | Closes the critical image-optimizer DoS |
| `sharp` 0.34.5 → **0.35.4** | Closes the CVEs inherited from libvips |
| `postcss` → **8.5.28** + `overrides: {"postcss": "$postcss"}` | Unifies all three copies on the fixed version |
| `recharts` **3.0.0-alpha.9 → 3.10.1** | Removes an *alpha* release from production and drops `lodash`, whose advisory has no published fix |
| Targeted `overrides` | `handlebars` 4.7.9, `protobufjs` 7.6.6, `websocket-driver` 0.7.5, `node-forge` 1.4.0, `js-cookie` 3.0.8, `nanoid` 3.3.19, `fast-uri`, `form-data`, `@grpc/grpc-js`, `qs`, `body-parser`, `path-to-regexp` |
| `firebase-admin` removed | **A direct dependency no module ever imported.** Only the client SDK `firebase` is used, in `src/lib/firebase.ts` |

Two decisions about what was **not** done, and why:

- **`npm audit fix --force` was rejected.** It proposed `genkit@0.5.17`, which is
  a **downgrade** from 1.20.0 and would break the entire AI subsystem. The tool
  presents any version outside the vulnerable range as a "fix", including older
  ones.
- **The `overrides` are targeted, not global.** `picomatch`, `form-data` and
  `@grpc/grpc-js` each exist at two different major versions in the tree; a global
  override would have downgraded the modern consumer. The
  `"package@<range>": "version"` form was used to touch only the vulnerable copy.

### 2.5 Documentation written from the code

Nine documents in `docs/` plus `README.md`, `CONTRIBUTING.md` and `LICENSE`. The
criterion was uniform: **every claim comes with the command that verifies it**,
and no document describes something the code does not do.

What they add that existed nowhere else:

- `ARCHITECTURE.md` documents the **known layer violations** (`lib`→`app`,
  `lib`→`components`, `models`→`lib`) with their explanations, so nobody copies
  them believing they are the pattern.
- `DATABASE.md` explains why **three models share the `user_profiles`
  collection** and the production `E11000` it caused: a lead without `userId` is
  indexed as `null`, and under a plain unique index only the first one gets in.
  The fix is a **partial** unique index.
- `AI_ARCHITECTURE.md` documents that the balance check lives **inside the
  MongoDB filter**, not in an `if`, and why that prevents a negative balance
  under concurrency.
- `DEPLOYMENT.md` names the most expensive silent failure: **without
  `CRON_SECRET` the AI queue stops**, with credits still reserved and no alarm.
- `SECURITY.md` records the real state of dependencies instead of claiming the
  project is clean.

### 2.6 Three build steps that never ran

Validating the build after the dependency upgrades surfaced a failure that had
been hidden for a long time:

```
[optimize-media] Error: ENOENT: no such file or directory, scandir '.../scripts/public'
[minify-public] Skipped (does not exist): public/webpages
```

All three scripts that run after `next build` — `minify-public-assets`,
`optimize-public-media` and `precompress-static` — resolved the project root as
`path.join(__dirname, '..')`. Since they live in `scripts/mjs/`, that points at
`scripts/`, not the root. **They were looking for `scripts/public/`, which does
not exist.**

The consequence: the build claimed to minify, optimise media and precompress, and
did **none of the three**. Two failed silently ("nothing to minify") and the
third printed an error while the build still exited 0.

The fix is `path.join(__dirname, '..', '..')` in all three.

**And the broken path was hiding a second bug.** With the precompressor finally
pointing at `public/`, the script died with `ReferenceError: r is not defined`:

```js
const _r = await compressFile(file);
if (r) results.push(r);          // r no longer exists
```

This one was introduced by this very programme: during the lint cleanup a
variable's declaration was prefixed with `_` **without renaming its uses**. It
never surfaced because the script bailed out earlier, failing to find `public/`.
Fixed and verified: the precompressor now processes **814 files**; before, zero.

This is the second time the pattern appeared in this programme (the first broke
`analyze-route-bundles.mjs`). *Prefixing an "unused" variable with `_` is only
safe once you have checked it really is unused across the whole scope.*

**`optimize-public-media` was deliberately not run here**: it rewrites
already-versioned images and videos with lossy re-encoding. Fixing the path is
what the audit called for; deciding when to re-encode the repository's media
belongs to whoever maintains it.

### 2.7 Coverage can no longer report a false green

Two ways of producing an empty coverage report turned up during validation, both
of which the script presented as **0.00 %**, indistinguishable from a real result:

- **Node < 22.** `--test-coverage-include` has existed since Node 22; on Node 20,
  Node rejects the flag and nothing is collected.
- **Two runs at once.** Both write to `coverage/`, and the second deletes the
  first one's intermediate files.

In both cases the problem is not the percentage but the wording: **zero files
measured is not "0 % coverage", it means the measurement never happened.** Two
guards were added to `build-coverage-report.mjs`:

- A version check at startup: on Node < 22.11 the script stops and tells you to
  run `nvm use`, instead of producing an empty report.
- If **no** file was measured, it exits 1 and says so in those words.

Verified both ways: on Node 20 the script stops with the version message; on the
`.nvmrc` version, with a single run, it reports **5.56 % over 62 measured files**
and exits 0.

### 2.8 SEO validators that failed silently

Several `seo:validate-*` scripts turned out to **exit 0 while checking nothing**:
`audit-webpages-seo` and others read `public/webpages/web-pages.json`, a file that
stopped existing when the catalogue moved to `src/data/`; `validate-canonicals`
and `validate-seo-performance` pointed at pre-`[locale]` paths; and
`validate-live-sitemap-http` had the **literal string** `'process.env.DOMAIN'` as
its default URL.

Ten validators regained their report output (`SEO_REPORT=1`), and three that
exited 1 without explaining anything now list the problems they found.

---

## 3. What got worse

**One number: published coverage, from 93.87 % to 5.56 %.** This is already
explained in §2.2 — the earlier measurement was partial. It is recorded here
anyway, because anyone comparing two reports without reading the method will see
a drop.

No other metric is worse than before.

---

## 4. What did not change

- **No functionality.** The programme did not touch behaviour except in the three
  security fixes in §2.3, which restrict access.
- **`typecheck` was, and remains, at 0 errors.** It was the one healthy thing to
  start from.
- **The test count** (325 unit + 2 data). The 7 access-matrix tests were added; no
  filler tests were written to raise coverage, because a test that executes code
  without asserting anything raises the number and not the confidence.

---

## 5. What is still open

With the reason, not as a wish list.

### 5.1 The 63 remaining vulnerabilities have a single root

**All 63 hang off the `genkit` tree**, and the 7 high-severity ones are the
OpenTelemetry chain. `@genkit-ai/core` pins `@opentelemetry/* ~1.25`, and the
fixes are published only in **OpenTelemetry 2.x**.

It was verified that **`genkit@1.42.0`, the latest release, still pins
`~1.25.0`**: this is not a case of being out of date, the fix does not exist
upstream.

```bash
npm view @genkit-ai/core@latest dependencies --json | grep opentelemetry
```

Forcing OpenTelemetry 2.x under genkit via `overrides` compiles, but there is no
way to verify here that instrumentation still works at runtime. **Changing a
working subsystem for an audit number, with no way to check the result, is worse
than documenting the risk.** The decision is to wait for genkit to migrate and
re-check on each upgrade.

The remaining advisories are denial of service and name confusion in tracing;
tracing only processes our own data, not user input.

### 5.2 614 modules in `src/` with no tests at all

5.56 % is the honest starting point. A sensible priority order, by risk:
`src/lib/ai-job-service.ts` (it moves credits), `src/lib/output-contract.ts`,
`src/lib/cache-policy.ts` and the provider adapters.

### 5.3 The build ignores the errors CI does check

`next.config.ts` still sets `typescript.ignoreBuildErrors: true` and
`eslint.ignoreDuringBuilds: true`. Both checks are clean today and CI enforces
them, so the flags no longer protect against anything; but removing them changes
production build behaviour, and that decision belongs to whoever owns the
deployment. **It is the first candidate for the next iteration.**

### 5.4 Real secrets in the development transcripts

`docs/code/` contains a **real** `sk_live_` `CLERK_SECRET_KEY` alongside publishable
Clerk and Stripe keys. The files have been excluded from version control
(`.gitignore`) so they cannot be published, but **that key must be rotated** and
treated as compromised.

### 5.5 Dead code found

`src/components/ui/chart.tsx` is imported by no module. It is the only consumer of
`recharts`. It was not deleted because removing a component is outside the scope
of a quality task; it is flagged here for a decision. If it goes, `recharts`
leaves the dependencies too.

### 5.6 Compressed artefacts under version control

`public/offline.html.{gz,br}` and `public/sw.js.{gz,br}` are tracked **even though
`.gitignore` excludes `public/**/*.gz` and `*.br`**: they were added before that
rule. Now that the precompressor works they are regenerated on every build and
will produce contentless diffs. They should be removed from the index with
`git rm --cached`.

### 5.7 Two lockfiles

The repository tracks both `package-lock.json` **and** `yarn.lock`. Both were
updated consistently with the dependency changes in §2.4, but two lockfiles can
drift apart silently and yield different installs depending on which package
manager each person or deployment uses. One of them should go.

### 5.8 Git history

369 commits and **0 pull requests** before this programme. The history shows no
peer review. That cannot be fixed retroactively — fabricating PRs would be exactly
the kind of inflation this work avoids — but from now on the PR templates and CI
on `develop` leave a record of the process.

---

## 6. How to reproduce this report

```bash
nvm use                         # use the .nvmrc version; on Node 20 coverage fails
npm ci
npm run validate                # lint · typecheck · coverage · env · cache
npm audit --omit=dev            # 63 / 0 critical
npx tsx --test tests/unit/route-access-matrix.test.ts
npm run build
```

**Use the `.nvmrc` version, not just "a recent Node".** Some Node builds installed
via nvm are x86_64 and run under Rosetta on Apple Silicon; `node_modules` then
holds arm64 esbuild binaries that such a Node cannot load, and every `tsx` test
fails with `You installed esbuild for another platform`. `node -p process.arch`
tells you which one you are on.

State at the time of writing: `npm run validate` exits **0**; lint 0 errors and
222 warnings; 325 unit tests and 2 data tests green; coverage 5.56 %;
`.env.example` clean with 91 keys; cache audit passing.

---

## 7. A note on method

Two rules guided the work and explain why some numbers are not better:

1. **Do not inflate.** No empty commits, no fake PRs, no tests that assert
   nothing, no documentation describing things the code does not do. Where a
   metric came out badly, it was left badly and explained.
2. **Do not break what works for the sake of a figure.** Every dependency fix was
   validated with `validate` and a full build. The one `npm audit` proposal that
   would have lowered the number further — downgrading `genkit` to 0.5.17 — was
   rejected because it would have disabled the AI subsystem.

The result is a repository whose quality claims can be checked with a command.
That is what changed: not that the code is better than it was, but that we now
know — and can demonstrate — how good it is.
