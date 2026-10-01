# Self-hosted text model hosting decision

Issue: #1057  
Parent epic: #1054  
Decision date: 2026-10-01  
Status: **Modal selected for the initial benchmark/MVP deployment; production host remains conditional on #1056 measured results.**

## Decision

Prompt Studio will use **Modal Starter + NVIDIA L4** for the first non-production
deployment of the approved self-hosted text model.

RunPod remains the planned economic fallback/scale path:

1. **Modal L4** for initial benchmark, integration and low-volume MVP traffic.
2. **RunPod Serverless 24 GB** when measured monthly usage makes it materially
   cheaper than Modal after the included Modal compute credit.
3. **RunPod Secure Cloud A5000 24 GB dedicated Pod** when sustained serverless GPU
   utilization is high enough that a continuously available dedicated GPU is cheaper.

This selection is intentionally split between an **initial host decision** and a
**production-default decision**. #1056 requires measured latency, quality, memory,
cold-start and cost results before production traffic can make Qwen3-8B the default.

## Current pricing snapshot

Prices below were verified on 2026-10-01 from the providers' published pricing.
They are inputs to planning, not permanent contractual prices.

### Modal Starter

Published Modal pricing at review time:

- Starter plan: $0 base plan price plus compute usage.
- Included compute: **$30/month**.
- Starter GPU concurrency: **10**.
- NVIDIA L4: **$0.000222/sec = $0.7992/hour**.
- Volumes: **$0.09/GiB/month**.
- Network egress: **$0.04/GiB**, with **1 TiB/month included** on Starter.

Source: https://modal.com/pricing

### RunPod

Published RunPod pricing at review time:

- Serverless 24 GB class (L4/A5000/3090/MIG): **$0.69/hour**, billed per second.
- Secure Cloud RTX A5000 24 GB Pod: **$0.27/hour**.
- Standard network storage under 1 TB: **$0.07/GB/month**.
- RunPod describes flex serverless workers as able to scale to zero when idle.

Sources:

- https://www.runpod.io/pricing
- https://www.runpod.io/product/serverless
- https://www.runpod.io/product/cloud-gpus

## Why Modal first

Modal is not the lowest raw GPU-hour price in this snapshot. RunPod's 24 GB
serverless class is cheaper per active GPU hour.

Modal is selected first because the **$30 monthly included compute** makes the
expected cash cost of an early benchmark/MVP effectively zero for a meaningful
amount of usage, while still providing:

- scale-to-zero/serverless execution;
- L4 availability suitable for testing an 8B model deployment;
- up to 10 concurrent GPU containers on Starter;
- persistent volumes for the model cache;
- simple Python/container deployment for the #1058 vLLM service; and
- a workspace budget control.

This is a bootstrap decision, not a claim that Modal is always the cheapest host.

## Cost scenarios

Until #1056 produces real runtime measurements, capacity planning uses a transparent
**10 GPU-seconds per generation** assumption. This matches the earlier planning
model but must be replaced by observed GPU time before production selection.

The following estimates cover GPU runtime only. They exclude CPU, RAM, storage,
tax, and other platform-specific charges.

| Generations/month | GPU hours @ 10 s/gen | Modal L4 before $30 credit | Modal after $30 credit | RunPod Serverless 24 GB |
| ---: | ---: | ---: | ---: | ---: |
| 1,000 | 2.78 | $2.22 | **$0.00** | $1.92 |
| 10,000 | 27.78 | $22.20 | **$0.00** | $19.17 |
| 100,000 | 277.78 | $222.00 | **$192.00** | $191.67 |
| 1,000,000 | 2,777.78 | $2,220.00 | **$2,190.00** | $1,916.67 |

The repository includes `npm run analyze:text-model-hosting` so these scenarios can
be recomputed with a different observed seconds-per-generation value.

Example:

```bash
TEXT_MODEL_SECONDS_PER_GENERATION=6.4 npm run analyze:text-model-hosting
```

## Modal → RunPod Serverless threshold

Using the reviewed list rates:

- Modal L4 = $0.7992/GPU-hour;
- RunPod Serverless 24 GB = $0.69/GPU-hour;
- Modal included compute = $30/month.

Modal's included credit offsets its higher hourly rate until approximately
**274.73 active GPU-hours/month**.

Formula:

```text
30 / (0.7992 - 0.69) = 274.73 GPU-hours/month
```

At the temporary 10-second planning assumption, that is roughly **98,900
generations/month**.

This is only a financial crossover. Prompt Studio should migrate from Modal to
RunPod Serverless when:

1. the rolling 30-day measured GPU usage is at or above 275 hours **or** projected
   RunPod cost is at least 15% lower;
2. #1056 quality/performance gates pass on RunPod;
3. operational reliability is not worse; and
4. migration cost/engineering work does not erase the savings.

The 15% savings floor prevents re-platforming for trivial price differences.

## Serverless → dedicated GPU threshold

A Secure Cloud A5000 at $0.27/hour costs approximately:

```text
0.27 × 24 × 30 = $194.40/month
```

A RunPod 24 GB serverless worker at $0.69/hour reaches the same compute cost at:

```text
194.40 / 0.69 = 281.74 active GPU-hours/month
```

That equals approximately **39.1%** utilization of a 720-hour month.

Therefore, start evaluating a dedicated A5000 when rolling 30-day active GPU time
exceeds **~282 hours/month**, subject to these additional gates:

- p95 queue/latency remains acceptable on one GPU;
- measured concurrency fits the dedicated GPU;
- the model has at least 15% tested VRAM headroom;
- uptime/availability requirements are acceptable for the chosen RunPod tier;
- monthly dedicated cost is at least 15% below the measured serverless alternative;
- a restart/failover procedure exists.

Do not migrate solely because the theoretical crossover is reached.

## Storage and model cache

The approved #1055 model artifact is approximately 16.4 GB upstream. Storage should
be provisioned with headroom for tokenizer/config files, runtime caches and future
controlled quantization artifacts.

### Modal

At the published $0.09/GiB/month volume rate, 16.4 GiB of raw model storage is about
$1.48/month before headroom.

### RunPod

At $0.07/GB/month for standard network storage under 1 TB, 16.4 GB is about
$1.15/month before headroom.

For both providers, provision at least **25 GB** initially and measure cache
behavior. Do not count transient container disk as the only copy of the pinned
model.

## Cold starts

The #1056 cold-start protocol remains authoritative.

For Modal:
- allow scale-to-zero for initial benchmark/MVP;
- place the model/cache on persistent storage where the runtime supports it;
- record cold start with cached and uncached weights separately.

For RunPod Serverless:
- test flex workers at scale-to-zero;
- test the provider's pre-warming/FlashBoot behavior rather than assuming marketing
  latency applies to this container/model;
- record active-worker configuration separately if later used.

No cold-start number is approved until measured with the actual Prompt Studio image.

## Network and egress

Text-generation payloads are normally small compared with model weights, so network
cost is not expected to dominate the first deployment.

- Modal currently lists $0.04/GiB egress and 1 TiB/month included on Starter.
- RunPod's GPU Cloud page states no ingress/egress fees for its cloud-GPU product;
  product-specific terms must be rechecked if the architecture changes.

Model downloads during cold starts can dominate startup time even when network cost
is small. Persistent model caching is therefore an operational requirement.

## Operational complexity

### Modal advantages

- minimal infrastructure for Python/container serverless deployment;
- no always-on GPU to administer at the start;
- monthly included compute reduces MVP cash cost;
- straightforward budget controls;
- enough Starter concurrency for the initial benchmark.

### Modal risks

- higher raw L4 hourly rate than RunPod Serverless 24 GB;
- vendor-specific deployment primitives;
- cold-start behavior must be measured with the ~16 GB model;
- Starter limits are not the final production capacity plan.

### RunPod advantages

- lower reviewed 24 GB serverless rate;
- straightforward path from serverless to dedicated GPU;
- vLLM-oriented deployment options;
- inexpensive persistent network storage.

### RunPod risks

- a dedicated Pod creates idle-cost exposure;
- capacity/region choice and persistent-volume placement need operational care;
- raw list-price advantage is not enough if cold starts or reliability miss #1056
  gates.

## Budget policy

For the initial text-model infrastructure:

- **Monthly budget:** $100.
- **Warning alert:** $50.
- **Critical alert:** $80.
- At $100 projected or actual monthly spend, pause traffic expansion and review
  measured unit economics before raising the budget.

These thresholds apply to the self-hosted text-model experiment/MVP, not all Prompt
Studio infrastructure.

Provider-side workspace/billing alerts should mirror these thresholds whenever the
platform supports them.

## Production selection rule

The hosting decision must be revisited with actual #1056 artifacts.

A candidate may become production default only when:

1. #1056 quality and reliability gates pass;
2. observed p95 latency is acceptable at launch concurrency;
3. actual GPU time and memory are known;
4. 30-day projected spend fits the $100 initial budget or an explicitly approved
   revised budget;
5. the candidate is not more than 15% more expensive than an operationally
   equivalent alternative without a documented product reason.

## Repository source of truth

The machine-readable policy is:

`src/lib/generation/self-hosted-hosting-policy.ts`

It stores:
- pricing snapshot date;
- reviewed provider rates;
- initial provider;
- budget alerts; and
- migration thresholds.

All pricing must be re-verified before a production purchase/deployment decision.
A future price change requires a PR updating both the policy and this document.

## Follow-up

#1058 should deploy the pinned Qwen3-8B revision to Modal L4 for non-production
benchmarking, with persistent cache and an OpenAI-compatible vLLM endpoint.

After that deployment exists, rerun #1056 and replace the 10-second planning
assumption with measured runtime data.
