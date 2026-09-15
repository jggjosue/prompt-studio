# Contributing

## Before writing code

```bash
nvm use            # Node >= 22.11 (see .nvmrc / package.json engines)
npm ci
cp .env.example .env.local   # fill at least MONGODB_URI and Clerk keys
npm run dev        # http://localhost:3048
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before your first non-trivial change. It explains where everything lives and, importantly, the **known layer violations**, which are deliberately documented so no one replicates them thinking they are the pattern.

## Before opening a PR

```bash
npm run validate
```

Runs lint, typecheck, coverage, `verify:env-example` and `cache:audit`. **Must exit with 0.** CI runs the same plus the build and browser tests; opening a PR that doesn't pass `validate` locally only shifts the failure.

## Rules enforced by the pipeline

These are not conventions: if you break them, CI fails.

1. **Every API route needs an access mechanism or a written justification.** `tests/unit/route-access-matrix.test.ts` traverses `src/app/api/**` and requires that each route declares one of the 8 detected mechanisms or appears in `PUBLICAS_JUSTIFICADAS` with a justification of at least 20 characters.
   If you add a new route, regenerate the matrix:

   ```bash
   node scripts/mjs/build-route-access-matrix.mjs
   ```

   That test has already found two real security bugs. Treat it as a contract, not a formality.

2. **A public write must be IP limited.** `enforceIpRateLimit` with `RATE_LIMITS.publicWrite`.

3. **`/api/admin/**` checks for administrator role**, not just session presence.

4. **`.env.example` covers what the code reads** (`verify:env-example`) and contains **only placeholders**. Never a real value.

5. **Every response declares a cache policy** (`cache:audit`).

## Style

- TypeScript `strict`. Do not add `any` to silence a type error; fix the error.
- `npm run lint:fix` before committing. Today there are 0 errors and 222 warnings; **do not increase the number of errors**.
- Keep names and comments consistent with the existing code. (This project used to have Spanish names and comments, which might be transitioning).
- Comment the *why*, not the *what*. If a comment describes what the line already says, it is redundant.

## Testing

```bash
npm test                     # 325 unit + 2 data tests
npm run test:coverage        # honest lcov report in coverage/
```

Line coverage over `src/` is 5.56%: 62 files measured out of 680. That number is real and explained in [docs/TESTING.md](docs/TESTING.md). If you touch a module without tests, adding them truly raises that number; do not add tests that only execute code without asserting anything.

## Commits

Conventional: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
One commit, one change. Do not mix a massive rename with a behavior change: it makes review impossible.
