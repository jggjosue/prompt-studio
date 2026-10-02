# Secure streaming text generation API

Issue: #1061  
Parent: #1054

## Endpoint

`POST /api/ai/generate-text`

This is the browser-facing backend boundary for Prompt Studio text generation.

The browser does not call Modal/vLLM or any external AI provider directly.

```text
Browser
  |
  | Clerk session
  v
POST /api/ai/generate-text
  |
  | logical model: promptstudio-fast
  v
generatePromptStudioText()
  |
  +-- self-hosted provider
  |      |
  |      +-- Modal/vLLM
  |
  +-- optional external fallback
```

## Authentication

The route uses the project's existing Clerk server convention:

```ts
const { userId } = await auth();
```

Anonymous requests return HTTP 401 before any model call.

## Request

Example:

```json
{
  "messages": [
    { "role": "user", "content": "Create a concise product prompt." }
  ],
  "maxTokens": 512,
  "temperature": 0.7,
  "stream": true
}
```

The model is intentionally not supplied by the browser. The backend fixes the
logical model to `promptstudio-fast`.

This prevents frontend code from depending on Qwen, Modal, RunPod or an external
provider name.

## Validation

The route uses the #1059 security policy:

- maximum request body: 64 KiB;
- maximum 32 messages;
- maximum 24,000 characters/message;
- maximum 48,000 total prompt characters;
- maximum 2,048 output tokens;
- temperature 0–2;
- upstream timeout inherited from the provider/security layer.

`Content-Length` is checked before JSON parsing when supplied. Parsed content is
validated again, so omission of the header does not bypass prompt limits.

## Rate limiting

The endpoint reuses Prompt Studio's existing `rate-limit-core`.

Key:

`generate-text:<Clerk userId>`

The configured #1059 limit is 20 requests per 60 seconds.

When Upstash variables are configured, the project's limiter uses shared Redis and
therefore protects horizontally scaled Vercel instances. If Upstash is unavailable,
the existing limiter falls back to its bounded in-memory implementation.

A second local #1059 guard protects per-instance GPU concurrency.

## Streaming

The provider's response body is returned directly as a Web `ReadableStream`.

For vLLM/OpenAI-compatible streaming this preserves SSE chunks and avoids buffering
the entire completion in Prompt Studio.

Response headers include:

- `Content-Type: text/event-stream` when upstream provides streaming;
- `Cache-Control: private, no-store`;
- `X-Generation-Id: <uuid>`;
- rate-limit headers; and
- `X-Accel-Buffering: no`.

## Cancellation

The incoming `request.signal` is passed into the model router/provider.

When the client disconnects, the upstream fetch can be aborted rather than
continuing to consume GPU unnecessarily.

The provider's own timeout remains an additional upper bound.

## Public errors

Provider names and infrastructure details are not exposed.

Examples:

| Public code | HTTP | Meaning |
| --- | ---: | --- |
| `UNAUTHORIZED` | 401 | Sign-in required |
| `INVALID_JSON` | 400 | Malformed JSON |
| `INVALID_REQUEST` | 400/413 | Invalid or oversized input |
| `RATE_LIMITED` | 429 | User request rate exceeded |
| `CAPACITY_LIMITED` | 503 | Local generation capacity full |
| `GENERATION_TIMEOUT` | 504 | Upstream generation timeout |
| `GENERATION_UNAVAILABLE` | 503 | Temporary provider failure |
| `INTERNAL_ERROR` | 500 | Unexpected backend failure |

Each response includes a `generationId` for support/observability.

## Logging

The route uses the #1059 sanitized log contract.

It may log:
- generation ID;
- hashed actor fingerprint;
- logical model;
- message count;
- prompt character count;
- max output tokens;
- status/error code.

It does not log:
- prompt text;
- response text;
- Clerk user ID in clear text;
- model-host URL;
- API keys;
- Authorization/cookie headers.

## Dependency / merge order

This issue is intentionally branched directly from `develop`.

At creation time, #1059 and #1060 are open PRs and their source files are not yet
merged into `develop`. This route imports their contracts and therefore the safe
merge order is:

1. #1059
2. #1060
3. #1061

CI for this PR can fail type resolution until the two prerequisite PRs land in
`develop` or are merged/rebased into this branch.

Do not duplicate the security/router implementations inside #1061 merely to make the
PR standalone; that would create competing sources of truth.

## Credits

This endpoint establishes authentication, rate/capacity controls and streaming.
Product credit accounting remains #1063.

Until #1063 is implemented, production self-hosted routing must remain disabled.

## Acceptance mapping

- successful streaming: upstream ReadableStream/SSE is passed through;
- typed invalid requests: stable public error contract;
- disconnect: request AbortSignal propagates upstream;
- timeout: provider timeout maps to `GENERATION_TIMEOUT`;
- correlation: UUID in body/header;
- secrets: endpoint never reads or returns a model credential directly;
- model selection: internal router only.

## Follow-up

#1062 connects the `/generate` UI to this endpoint and consumes its stream.
#1063 adds credit/quota accounting.
