# Prompt Credits v1 — T27 final E2E gate

## Canonical paid-generation invariant

The canonical `POST /api/ai/jobs` path now resolves:

1. authenticated user + rate limit
2. allowed provider/model
3. server-side operation tier/code
4. persisted runtime operation override
5. verified provider-cost / minimum-margin guard
6. immutable pricing snapshot on the job
7. credit reservation
8. queue/provider execution
9. exactly-once capture or release/refund
10. ledger/job telemetry consumed by dashboard, analytics and reconciliation

A paid provider call is guarded by `assertPaidGenerationReserved()`.

## Final gate coverage

`tests/e2e/prompt-credits-gate.test.ts` asserts the architecture links between:
- all T7–T14 operation families
- T22/T23 runtime pricing
- T6 reservation boundary
- provider runner
- capture/refund
- unique job ledger entries
- pricing/provider/cost telemetry

## Known residual risks

These do not invalidate the server-side Prompt Credits boundary, but should remain tracked:

- The repository-wide `npm ci` lock mismatch predates this epic, so this branch cannot honestly claim the test suite/typecheck ran successfully until that dependency issue is repaired.
- UI callers across every generator surface still need product-level smoke coverage proving they send the required tier fields. The canonical API rejects missing tiers instead of silently guessing.
- Direct low-level AI helpers can exist for internal/test flows; user-paid generation must continue to enter through the canonical job boundary.
- T5 still uses aggregate wallet buckets rather than allocation-level FIFO/expiry. Expiration semantics should not be advertised until allocation consumption is implemented.
- Refund/chargeback reconciliation is intentionally read-only; financial exposure requires explicit operator policy/remediation.
- Historical T19 Stripe pack IDs should be reviewed before relying on settlement of pre-v1 checkout sessions.

## Release criterion

Do not mark Prompt Credits v1 financially production-ready until:
1. the package-lock mismatch is fixed in a separate dependency PR;
2. this E2E gate plus existing unit/type/lint checks actually execute green;
3. representative UI smoke tests confirm each paid generator sends its required operation tier;
4. T26 reconciliation returns no unexplained critical issues in the target environment.
