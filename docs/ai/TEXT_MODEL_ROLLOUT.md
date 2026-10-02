# PromptStudio AI load test, canary, and rollout

Issue: #1065  
Parent: #1054

## Principle

PromptStudio AI does not become the production default because the code exists.
It becomes default only after measured evidence passes the rollout gates.

## Stages

`PROMPTSTUDIO_TEXT_ROLLOUT_STAGE`:

1. `off` — all traffic stays on the existing provider.
2. `internal` — only explicit internal user IDs use PromptStudio AI.
3. `canary` — internal users plus a deterministic percentage of production traffic.
4. `primary` — PromptStudio AI is intended primary; existing provider remains fallback during observation.

Instant rollback:

```env
PROMPTSTUDIO_TEXT_ROLLOUT_STAGE=off
PROMPTSTUDIO_TEXT_CANARY_PERCENT=0
```

No code deploy is required when these server-side variables are changed in an environment
that supports runtime environment updates/restarts; on Vercel, apply the environment
change and redeploy/restart as required by the platform.

## Canary assignment

The canary bucket is deterministic from:
- authenticated user ID;
- generation ID.

No random runtime state is needed.

Internal IDs always participate during canary.

## Promotion gates

Minimum measured evidence before increasing traffic:

| Gate | Requirement |
| --- | ---: |
| Samples | >= 100 |
| Success rate | >= 97% |
| p95 TTFT | <= 2.5 s |
| p95 total latency | <= 15 s |
| Human quality | >= 4/5 when scored |
| Cost/generation | <= current-provider baseline |

These align with #1056 benchmark gates.

A stage does not advance if any required gate fails.

## Suggested traffic progression

After staging/internal verification:

```text
internal
  -> 1% canary
  -> 5%
  -> 10%
  -> 25%
  -> 50%
  -> primary
```

Hold each production stage long enough to collect at least 100 representative
generations and inspect #1064 alerts.

For low traffic, use a longer observation window rather than weakening the sample gate.

## Load test

Script:

`scripts/ts/load-test-generate-text.ts`

Required:
- `LOAD_TEST_BASE_URL`;
- `LOAD_TEST_COOKIE` for a dedicated authenticated staging test account.

Optional:
- `LOAD_TEST_CONCURRENCY` (default 5);
- `LOAD_TEST_REQUESTS` (default 50);
- `LOAD_TEST_PROMPT`.

Example:

```bash
LOAD_TEST_BASE_URL="https://staging.example" \
LOAD_TEST_COOKIE="<dedicated-test-session>" \
LOAD_TEST_CONCURRENCY=10 \
LOAD_TEST_REQUESTS=100 \
npm run load-test:text-model
```

Never commit the cookie.

Run concurrency levels 1, 5, and 10+ against staging and compare with #1056.

The script exits non-zero below 97% request success.

## Functional test matrix

Before production canary verify:
- authenticated streaming success;
- anonymous 401;
- invalid input 400/413;
- rate limit 429;
- client cancellation;
- upstream timeout;
- self-hosted recoverable failure -> external fallback;
- non-retryable auth/config error -> no silent fallback;
- usage reservation;
- credit reservation/capture;
- refund on failure/cancel;
- one generation ID -> one accounting lifecycle.

## No duplicate charging

Fallback must remain inside a single generation/accounting lifecycle.

Do not create a second usage reservation or wallet reservation when the router switches
from self-hosted to the existing provider.

The generation ID is the idempotency key across:
- quota;
- wallet;
- provider attempts;
- usage;
- observability.

## Comparison

For each observation stage compare PromptStudio AI vs existing provider on the same
representative case set:
- quality;
- success rate;
- TTFT;
- total latency;
- cost/generation.

Use #1056 benchmark cases and #1064 production telemetry.

Do not compare only list prices.

## Rollback drill

Before increasing beyond 10%:
1. set rollout stage to `off`;
2. verify new generations use the existing provider;
3. verify active generation accounting settles exactly once;
4. verify no self-hosted secret reaches the browser;
5. restore the previous canary stage only if the drill is clean.

Record timestamp, generation IDs, observed provider and accounting result.

## Dependencies

The full canary depends on #1055–#1064 being merged/deployed and on a real Modal
staging endpoint.

This PR provides the rollout policy, gates and load-test harness. It does not fabricate
canary evidence.

#1065 must remain open until measured canary evidence and the rollback drill exist.

## Final production decision

Set `PROMPTSTUDIO_TEXT_ROLLOUT_STAGE=primary` only after:
- #1056 benchmark gates pass;
- staging load tests pass;
- canary gates pass;
- #1064 has no critical alerts;
- rollback drill passes;
- existing provider remains available for the observation window.
