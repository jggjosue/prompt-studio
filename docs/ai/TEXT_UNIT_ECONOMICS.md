# PromptStudio AI observability and unit economics

Issue: #1064  
Parent: #1054

## Purpose

Make the self-hosted text model measurable as an operating system, not just an API.

The reporting contract covers:
- generation/correlation ID;
- model revision;
- logical model;
- hosting provider/runtime;
- input/output tokens;
- time to first token (TTFT);
- total latency;
- runtime/GPU seconds;
- estimated/actual cost;
- success/failure category;
- cold/warm start when available;
- concurrency and queue signals.

Prompt and generated content are not part of telemetry.

## Unit economics

`summarizeTextUnitEconomics()` reports:
- generations;
- successful/failed;
- active users;
- success rate;
- input/output tokens;
- runtime seconds;
- monthly spend;
- cost per generation;
- cost per active user;
- p50/p95 TTFT;
- p50/p95 total latency.

Percentiles use nearest-rank semantics, matching the #1056 benchmark helper.

## Alert thresholds

Defaults:

| Signal | Warning | Critical |
| --- | ---: | ---: |
| Failure rate | 3% | 8% |
| p95 latency | 15 s | 30 s |
| Monthly spend | $50 | $80 |

The spend thresholds align with the #1057 initial warning/critical infrastructure
budget.

All thresholds are environment-configurable:

```env
PROMPTSTUDIO_TEXT_ALERT_FAILURE_RATE_WARNING=0.03
PROMPTSTUDIO_TEXT_ALERT_FAILURE_RATE_CRITICAL=0.08
PROMPTSTUDIO_TEXT_ALERT_P95_LATENCY_MS_WARNING=15000
PROMPTSTUDIO_TEXT_ALERT_P95_LATENCY_MS_CRITICAL=30000
PROMPTSTUDIO_TEXT_ALERT_SPEND_USD_WARNING=50
PROMPTSTUDIO_TEXT_ALERT_SPEND_USD_CRITICAL=80
```

## End-to-end trace

Use one generation UUID through:

```text
browser X-Generation-Id
  -> /api/ai/generate-text
  -> usage reservation
  -> model router
  -> provider request
  -> usage reconciliation
  -> observability event
```

The same ID should appear in sanitized server logs and the #1063 usage record.

## Dashboard data source

#1063 introduces `promptstudio_text_usage`.

After #1063 merges, add the latency/runtime fields required by this issue and expose an
admin-only server query that maps those rows to `TextGenerationTelemetry`.

The dashboard should display aggregate metrics, not raw prompt content.

Recommended sections:
1. current-month KPI cards;
2. latency/TTFT percentiles;
3. spend and cost per generation/user;
4. status/error breakdown;
5. plan/model/provider breakdown;
6. warning/critical alerts.

## Access

Unit-economics reporting contains internal provider and cost information and should be
restricted to Prompt Studio administrators. Do not expose provider/runtime/cost
telemetry through the public `/generate` response.

## Dependency state

This branch is created from `develop`.

At implementation time #1063 / PR #1119 is open, so this PR intentionally provides the
metrics and alerting layer without copying its model/service.

After #1063 lands, integrate the Mongo aggregation/admin dashboard in this branch or a
follow-up commit before marking #1064 fully accepted.

## Acceptance mapping

- traceability: shared generation-ID contract;
- monthly spend: `spendUsd`;
- cost/gen and cost/active user: first-class summary fields;
- success rate: first-class summary field;
- p50/p95 latency/TTFT: nearest-rank aggregation;
- alerts: configurable failure/latency/spend thresholds;
- privacy: telemetry type contains metrics/IDs only, no prompt/response content.
