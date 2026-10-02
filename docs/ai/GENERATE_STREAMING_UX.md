# /generate PromptStudio AI streaming UX

Issue: #1062  
Parent: #1054

## Goal

Text mode in `/generate` can use the Prompt Studio-owned streaming API while
preserving the existing job/polling flow as an immediate rollback.

Product-facing label:

**PromptStudio AI**

The UI does not expose Qwen, Modal, vLLM or the upstream fallback provider.

## Feature flag

Client-safe rollout flag:

```env
NEXT_PUBLIC_PROMPTSTUDIO_TEXT_STREAMING=false
```

- `false`: existing `/api/ai/jobs` text flow remains active.
- `true`: text mode calls `/api/ai/generate-text` and consumes SSE progressively.

This flag contains no credential or infrastructure secret.

Changing a `NEXT_PUBLIC_*` value requires a frontend build/deployment because
Next.js inlines public environment values.

## Streaming behavior

The browser sends:
- optional system instruction;
- user prompt;
- bounded output-token request based on the existing thinking-level control;
- streaming enabled.

The client parses OpenAI-compatible SSE chunks:

```text
data: {"choices":[{"delta":{"content":"..."}}]}
```

and updates the assistant message as text arrives.

The stream terminates on `[DONE]`.

Malformed metadata chunks are ignored rather than rendered.

## Cancellation

The text hook owns an `AbortController`.

A second submission is prevented while generation is active by the existing
`localGenerating` state.

The UI can cancel the active text request. Aborting the browser fetch propagates to
#1061, which propagates the request signal to the internal provider.

## Existing actions

The assistant message continues to use the existing chat message component, so Copy
and retry/regenerate behavior remains attached to the same result structure.

Retry uses the original prompt/params.

## Mobile

Streaming updates the existing responsive chat message area and does not introduce a
fixed-width streaming panel. The current mobile/docked composer remains unchanged.

## Errors

User-facing messages cover:
- authentication required;
- rate limit;
- timeout;
- cancellation;
- temporary service unavailability.

Infrastructure/provider names are not included in errors.

## Dependency / merge order

This branch is based directly on `develop`.

#1061 is still an open prerequisite at implementation time. The frontend can compile
independently because it only references the HTTP path, but end-to-end streaming
requires #1061 to be merged and deployed.

Recommended order:

1. #1059
2. #1060
3. #1061
4. #1062

Keep `NEXT_PUBLIC_PROMPTSTUDIO_TEXT_STREAMING=false` until the backend chain and
Modal staging endpoint pass smoke/benchmark checks.

## Rollout

1. Merge/deploy prerequisites.
2. Verify Modal staging.
3. Verify `POST /api/ai/generate-text`.
4. Enable the public streaming flag in Preview/Staging.
5. Test desktop and mobile:
   - Generate;
   - progressive output;
   - cancel;
   - regenerate;
   - copy;
   - 401/429/timeout errors.
6. Run #1056 quality/latency gates.
7. Only then consider production enablement.

## Acceptance mapping

- end-to-end self-hosted path: feature-flagged client calls #1061;
- progressive streaming: SSE delta parser updates text during generation;
- product label: PromptStudio AI;
- Generate/Regenerate/Copy: existing chat result/action surface preserved;
- loading/error/cancel: existing generation state plus streaming abort/error handling;
- duplicate prevention: existing generation state disables/rejects active submission;
- rollback: flag false retains existing jobs/polling path.
