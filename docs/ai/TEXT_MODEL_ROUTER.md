# PromptStudio text provider router

Issue: #1060  
Parent: #1054

## Goal

Application code should request a logical Prompt Studio model instead of knowing
which vendor or upstream model serves it.

Initial logical model:

`promptstudio-fast`

Frontend code must never depend on names such as Qwen, Modal, RunPod, OpenAI, or an
upstream model revision.

## Internal interface

The server-side entrypoint is:

`generatePromptStudioText(input)`

with a logical model ID, messages and generation controls.

The result identifies the internal provider for observability, but this information
does not need to be returned to the browser.

## Providers

### self-hosted

`SelfHostedTextProvider` calls the protected OpenAI-compatible endpoint prepared in
#1058/#1059.

It maps:

`promptstudio-fast -> self-hosted served model promptstudio-fast`

The actual Qwen model/revision remains deployment infrastructure detail.

### external

`ExternalOpenAITextProvider` preserves an external fallback path through the
existing server-side `OPENAI_API_KEY`.

The external upstream model is configured by
`PROMPTSTUDIO_TEXT_EXTERNAL_MODEL`, defaulting to `gpt-4.1-mini`.

This adapter is intentionally behind the same internal interface so additional
Gemini/Anthropic/DeepSeek adapters can be added without changing frontend code.

## Feature flags

Server-only configuration:

```env
PROMPTSTUDIO_TEXT_MODEL_ENABLED=false
PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER=external
PROMPTSTUDIO_TEXT_FALLBACK_PROVIDER=none
PROMPTSTUDIO_TEXT_EXTERNAL_MODEL=gpt-4.1-mini
```

Recommended staging configuration after Modal is verified:

```env
PROMPTSTUDIO_TEXT_MODEL_ENABLED=true
PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER=self-hosted
PROMPTSTUDIO_TEXT_FALLBACK_PROVIDER=external
PROMPTSTUDIO_TEXT_EXTERNAL_MODEL=gpt-4.1-mini
```

Production should remain disabled until #1056 passes.

Because these values are server-side environment configuration, self-hosted routing
can be disabled without changing or redeploying frontend code. Depending on the
hosting platform, applying changed server environment variables may require a
backend redeploy/restart.

## Fallback behavior

Fallback occurs only for errors marked retryable.

Examples that may fallback:
- upstream 429;
- upstream 5xx;
- timeout/network unavailability.

Examples that do not automatically fallback:
- authentication/credential failures;
- invalid requests;
- disabled/misconfigured provider.

This avoids hiding configuration or security failures behind an expensive external
provider.

## Normalized error contract

All adapters use `TextProviderError` with:
- stable code;
- provider ID;
- retryable flag;
- optional HTTP status.

Codes include:
- `provider_disabled`
- `provider_not_configured`
- `provider_timeout`
- `provider_rate_limited`
- `provider_authentication`
- `provider_bad_request`
- `provider_unavailable`
- `provider_error`

#1061 should translate these internal errors into stable public API errors without
exposing provider names or credentials.

## Security

All router/config/provider files live under the server generation layer. No
`NEXT_PUBLIC_*` variables are introduced.

Only the self-hosted adapter reads:
- `PROMPTSTUDIO_TEXT_MODEL_URL`
- `PROMPTSTUDIO_TEXT_MODEL_API_KEY`

Only the external adapter reads:
- `OPENAI_API_KEY`

Frontend components should only know `promptstudio-fast`.

## Follow-up

#1061 should expose the authenticated streaming backend API and call
`generatePromptStudioText`.

#1062 should switch `/generate` to that backend API and display streaming output
without adding provider-specific frontend logic.
