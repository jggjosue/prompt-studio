# Modal + vLLM deployment for PromptStudio text model

Issue: #1058  
Parent: #1054  
Target model: `Qwen/Qwen3-8B`  
Pinned revision: `b968826d9c46dd6066d109eabc6255188de91218`

## Architecture

```text
Prompt Studio server
      |
      | Bearer token, server-to-server only
      v
Modal Server (L4)
      |
      v
vLLM OpenAI-compatible HTTP server
      |
      +-- GET  /health
      +-- GET  /v1/models
      +-- POST /v1/chat/completions
                |
                v
Qwen/Qwen3-8B @ pinned SHA
```

The browser must never receive the Modal endpoint credential. #1059 hardens
network/secrets/rate-limit policy further; this issue establishes the reproducible
inference service and server-to-server authentication.

## Source-controlled deployment

The deployment definition is:

`infra/modal/qwen3_vllm.py`

It uses:

- Modal Server;
- one NVIDIA L4 per replica;
- vLLM OpenAI server image `vllm/vllm-openai:v0.11.0`;
- model and tokenizer revision pinned to the exact #1055 SHA;
- served model alias `promptstudio-fast`;
- 32K max context for the first benchmark deployment;
- persistent Hugging Face and vLLM cache volumes;
- scale-to-zero with `min_containers=0`;
- at most 10 containers for the initial Starter-plan envelope; and
- bearer authentication enforced by vLLM's `--api-key`.

vLLM supports `--revision` and `--tokenizer-revision`, so the deployment does
not depend on upstream `main`. It also exposes an OpenAI-compatible Chat
Completions API and supports streaming.

## Modal resources

The script creates/uses these named volumes:

- `promptstudio-qwen3-hf-cache`
- `promptstudio-qwen3-vllm-cache`

The first cold deployment downloads the model into the persistent Hugging Face cache.
Later replicas can reuse the cache instead of relying solely on ephemeral disk.

## Secret setup

Create a strong random bearer token and store it in Modal. Do not commit it.

Example:

```bash
openssl rand -base64 48
modal secret create promptstudio-text-model \
  PROMPTSTUDIO_TEXT_MODEL_API_KEY='<generated-value>'
```

Prompt Studio itself must store the same value as a server-only secret under:

`PROMPTSTUDIO_TEXT_MODEL_API_KEY`

and the deployed Modal URL under:

`PROMPTSTUDIO_TEXT_MODEL_URL`

Neither variable may use a `NEXT_PUBLIC_` prefix.

## Environments

Use separate Modal environments for staging and production.

### Staging

```bash
modal deploy infra/modal/qwen3_vllm.py -e staging
```

Store the resulting URL in the Prompt Studio staging/preview environment as:

```env
PROMPTSTUDIO_TEXT_MODEL_URL=https://...
PROMPTSTUDIO_TEXT_MODEL_API_KEY=...
```

### Production

Production deployment is permitted only after the #1056 acceptance gate passes.

```bash
modal deploy infra/modal/qwen3_vllm.py -e production
```

Use a distinct production bearer key.

Do not reuse the staging key in production.

## Health and readiness

vLLM provides a health endpoint at:

```text
GET /health
```

The smoke test waits for this endpoint during cold start before checking the model
list and generation behavior.

Run:

```bash
PROMPTSTUDIO_TEXT_MODEL_URL=https://... \
PROMPTSTUDIO_TEXT_MODEL_API_KEY=... \
npm run verify:text-model
```

The smoke test verifies:

1. `/health` becomes ready;
2. `/v1/models` reports `promptstudio-fast`;
3. a non-streaming chat completion succeeds; and
4. a streaming chat completion produces SSE data chunks.

## Manual API check

```bash
curl "$PROMPTSTUDIO_TEXT_MODEL_URL/v1/chat/completions" \
  -H "Authorization: Bearer $PROMPTSTUDIO_TEXT_MODEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "promptstudio-fast",
    "messages": [{"role":"user","content":"Write a concise product prompt."}],
    "stream": true
  }'
```

## Observable model revision

The runtime configuration is duplicated intentionally in a small TypeScript contract:

`src/lib/generation/self-hosted-text-deployment.ts`

It records:

- upstream model ID;
- exact upstream revision;
- vLLM image;
- GPU class;
- served logical model name;
- endpoint paths; and
- server-only environment variable names.

Operational logging in later issues should include this revision on every deployment
and generation trace.

## Why 32K context initially

Qwen3-8B can support larger contexts depending on runtime/configuration, but the
first Prompt Studio deployment deliberately caps vLLM at 32K to reduce KV-cache
pressure on a 24 GB L4 during benchmark work.

#1056 must measure actual VRAM headroom and concurrency. Raising this cap is a
separate measured change.

## Security boundary

This deployment is deliberately not a browser integration.

The intended flow is:

```text
Browser -> Prompt Studio backend -> Modal/vLLM
```

Modal's generated URL may be publicly routable, but vLLM requires the private bearer
token. #1059 must further review proxy authentication, endpoint exposure, rate
limits, request-size limits, timeouts, key rotation and logging.

## Rollback

A deployment rollback is performed by redeploying the prior known-good repository
commit to the same Modal environment.

Because the model revision and vLLM image are both source-controlled, the previous
deployment can be reproduced without relying on floating upstream versions.

## Current execution status

This PR provides a deployable configuration but does **not** claim that a Modal
workspace has already been provisioned or that the model has been successfully
started there.

The repository has no authorized Modal credentials available to this GitHub
connector session, so actual infrastructure creation and GPU execution cannot be
truthfully performed from this PR alone.

Once a Modal workspace/token is connected, deploy to **staging first**, execute
`npm run verify:text-model`, then run the #1056 benchmark harness before any
production-default decision.

## References

- Modal Server documentation: https://modal.com/docs/examples/server
- Modal deployment CLI: https://modal.com/docs/cli/latest/deploy
- vLLM OpenAI-compatible server: https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/
- vLLM `--revision` option: https://docs.vllm.ai/en/latest/cli/serve/
