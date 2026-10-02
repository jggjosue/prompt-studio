# Self-hosted text inference security policy

Issue: #1059  
Parent: #1054

## Security boundary

The privileged model credential belongs only to server-side Prompt Studio code.

```text
Browser
  |
  | Clerk-authenticated Prompt Studio request
  v
Prompt Studio backend
  |
  | PROMPTSTUDIO_TEXT_MODEL_API_KEY
  v
Modal / vLLM
```

Never send `PROMPTSTUDIO_TEXT_MODEL_API_KEY` to React props, browser bundles,
client components, localStorage, analytics, error-report payloads, or a
`NEXT_PUBLIC_*` variable.

The browser must call the Prompt Studio backend endpoint introduced in #1061. That
backend is responsible for user authentication, credits/quotas and this security
policy before it calls Modal.

## Current limits

The machine-readable policy lives in:

`src/lib/generation/text-inference-security.ts`

Initial defensive limits:

| Control | Limit |
| --- | ---: |
| HTTP request body | 64 KiB |
| Messages/request | 32 |
| Characters/message | 24,000 |
| Total prompt characters | 48,000 |
| Output tokens | 2,048 |
| Temperature | 0–2 |
| Upstream request timeout | 45 seconds |
| Concurrent upstream calls / app instance | 8 |
| Per-actor rate | 20 requests / 60 seconds |

These are launch safety limits, not product-plan entitlements. #1063 adds
credits/quotas separately.

## Request-size enforcement

#1061 must check `Content-Length` before parsing where available and call
`assertRequestSize`. Parsed payloads must then pass
`validateTextGenerationRequest`.

Character limits are intentionally enforced even when tokenization is not locally
available. vLLM receives a separately bounded `max_tokens` value.

## Rate limiting

`InMemoryInferenceGuard` provides a local per-instance protection layer.

It is useful for:
- preventing one application instance from flooding the GPU;
- unit/integration testing the policy; and
- providing defense in depth.

It is **not** sufficient as the only distributed production rate limiter because
Vercel/other backend platforms can run multiple instances.

#1061 should use the authenticated Clerk user/account as the actor key and add a
shared/distributed limiter if production traffic spans multiple instances. The
local guard remains as a final GPU-capacity safeguard.

Never rate-limit by raw API key or log the actor identifier directly.

## Concurrency

The Prompt Studio backend permits at most 8 concurrent upstream calls per application
instance. Modal/vLLM has its own capacity configuration.

When capacity is full:
- return a bounded 503/over-capacity response;
- do not silently queue an unbounded number of requests in application memory;
- do not automatically retry a generation that may already be executing upstream.

## Timeouts and disconnects

The server-to-server client uses a 45-second AbortController timeout.

#1061 must also abort the upstream request when the browser/client disconnects where
the runtime exposes that signal.

Timeout handling must:
- stop reading the upstream stream;
- avoid charging successful-generation credits when no successful completion exists;
- log only sanitized metadata;
- return a stable application error code.

Retries should be explicit and bounded. Streaming POST requests are not automatically
replayed because the upstream model may already have consumed GPU time.

## Authentication

The vLLM server from #1058 uses its `--api-key` option.

Every Prompt Studio -> Modal request includes:

```http
Authorization: Bearer <PROMPTSTUDIO_TEXT_MODEL_API_KEY>
```

Requests without the correct key are rejected by vLLM.

The Prompt Studio backend itself must require normal Prompt Studio user
authentication before invoking this privileged client.

## Network exposure

For the first Modal Server deployment, the HTTPS endpoint is routable but protected
by the vLLM bearer key.

Do not:
- link the Modal URL in public UI;
- expose it through `NEXT_PUBLIC_*`;
- permit browser CORS as an authentication mechanism;
- place the bearer token in query parameters.

If Modal/network architecture later supports a private-only service path that still
works from the Prompt Studio backend runtime, prefer it and document the change.
Bearer authentication remains required as defense in depth.

## Secret storage

Required server-only values:

- `PROMPTSTUDIO_TEXT_MODEL_URL`
- `PROMPTSTUDIO_TEXT_MODEL_API_KEY`

The same API-key value exists in:
1. Modal Secret `promptstudio-text-model`; and
2. Prompt Studio server-side deployment secrets.

Do not commit either real value.

Generate keys with a cryptographically secure generator, for example:

```bash
openssl rand -base64 48
```

## Key rotation

Rotate the model-host bearer key:
- immediately after suspected exposure;
- when a person/service with secret access is removed;
- before/after a material environment ownership change; and
- at least every 90 days for production.

### Zero/low-downtime procedure

vLLM's simple `--api-key` configuration accepts one configured key, so rotation
requires a coordinated deployment.

1. Generate a new 48-byte-or-stronger random key.
2. Update the Modal secret in **staging**.
3. Redeploy staging.
4. Update Prompt Studio staging server secret.
5. Run `npm run verify:text-model`.
6. Repeat for production during a controlled deployment window.
7. Update Modal production secret and redeploy.
8. Immediately update Prompt Studio production secret.
9. Run a server-side health/generation check.
10. Revoke/remove the old value from every secret store.
11. Record rotation date and operator, never the secret itself.

If near-zero downtime becomes mandatory, #1060/#1061 should introduce a Prompt
Studio-owned authenticated proxy that can accept overlapping key versions during
rotation.

## Logging policy

Allowed generation log fields include:
- generated request/correlation ID;
- logical model ID;
- message count;
- total prompt character count;
- requested output-token limit;
- duration;
- result/error code; and
- a one-way truncated SHA-256 actor fingerprint.

Do **not** log by default:
- prompt/message content;
- model bearer tokens;
- Authorization headers;
- raw Clerk/user IDs;
- cookies/session tokens;
- complete upstream response bodies.

The helper `sanitizedInferenceLog` intentionally has no prompt/messages field.

## Incident response

If the model credential is exposed:

1. disable/rotate the Modal key immediately;
2. stop self-hosted routing with the feature flag/kill switch once introduced;
3. inspect sanitized access/usage telemetry for anomalous volume;
4. replace the Prompt Studio server-side key;
5. redeploy and run the smoke test;
6. document the incident without copying the leaked key into tickets or logs.

## Acceptance mapping

- Browser cannot obtain model credentials: server-only env contract and backend-only
  client.
- Unauthorized Modal requests: vLLM bearer authentication from #1058.
- Oversized requests: byte/message/character/output-token bounds.
- Abuse/capacity: per-actor local rate guard + per-instance concurrency cap.
- Secret-safe logs: structured metadata-only helper.
- Timeouts: 45-second AbortController.
- Secrets outside source control: env/Modal secret procedure.
- Rotation: documented 90-day and incident-driven procedure.

## Follow-up

#1060 should place this client behind the Prompt Studio provider/model router.
#1061 should add the authenticated user-facing backend route and distributed
rate/credit enforcement.
