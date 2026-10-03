# Prompt Studio — AI Unit Economics and Credits

## Purpose

This document is the canonical product and engineering context for Prompt Credits.

Any change to plan pricing, crowdfunding rewards, top-ups, provider routing, or AI operation costs must preserve the same unit-economics model described here. Do not create a second independent credit system.

## Prompt Credit commercial floor

Prompt Studio currently uses:

- **Commercial floor:** `$0.01 USD` per Prompt Credit.
- **Maximum provider-cost reserve:** 25% of the commercial value.
- **Platform / infrastructure reserve:** 15%.
- **Payment, refund, and risk reserve:** 10%.
- **Target minimum contribution margin:** 50% before taxes, payroll, legal/accounting, and other fixed company expenses.

Source of truth in code:

- `src/lib/credit-economics.ts`
- `src/lib/ai-credit-config.ts`
- `src/lib/ai-provider-pricing-engine.ts`

The runtime margin guard must fail closed when provider pricing is unknown or when an operation would violate the configured margin.

## Current paid plans

| Plan | Monthly price | Monthly Prompt Credits | Annual price | Annual Prompt Credits |
| --- | ---: | ---: | ---: | ---: |
| Free | $0 | 0 during crowdfunding | $0 | 0 |
| Premium | $9 | 900 | $90 | 10,800 |
| Creator | $19 | 1,900 | $190 | 22,800 |
| Pro | $29 | 2,900 | $290 | 34,800 |
| Studio | $39 | 3,900 | $390 | 46,800 |

Source: `src/lib/subscription-plans.ts`.

During the crowdfunding period, paid-plan AI credits are recorded as **pending** and are not spendable until the campaign ends and Prompt Studio activates the AI credit balance.

## Current operation pricing

The server-side operation catalog is authoritative.

| Operation | Prompt Credits |
| --- | ---: |
| Short text | 2 |
| Long text | 5 |
| Complex text | 10 |
| Image Lite 1K | 16 |
| Image Quality 1K | 31 |
| Image Quality 2K | 46 |
| Image Quality 4K | 70 |
| Video Lite 720p / 8s | 180 |
| Video Lite 1080p / 8s | 288 |
| Video Fast 720p / 8s | 360 |
| Video Fast 1080p / 8s | 432 |
| Video Premium / 8s | 1,440 |
| Simple website | 36 |
| Advanced website | 50 |
| Complex website | 100 |

Source: `src/lib/ai-operation-catalog.ts`.

Before changing these amounts, validate the real provider cost, safety buffer, and contribution margin. Do not reduce operation credits based only on competitor marketing.

## Generation flow

The economic lifecycle is:

`estimate → margin validation → reserve → execute → reconcile → capture/refund`

The system must:

1. estimate provider cost,
2. resolve the operation credit cost,
3. block the request if provider pricing is unknown or margin is insufficient,
4. reserve credits before execution,
5. reconcile against actual provider cost,
6. refund eligible failed jobs,
7. avoid double charges through idempotency.

Relevant code:

- `src/lib/runtime-operation-pricing.ts`
- `src/lib/ai-job-service.ts`
- `src/lib/generation-pricing.ts`

## Credit sources must remain separate

Prompt Studio tracks multiple balance sources because they have different lifecycle rules:

- subscription credits,
- purchased/top-up credits,
- Founder Credits,
- promotional credits.

Do not collapse them into one source in persistence even though the user sees one total balance.

This allows expiration, refunds, campaign activation, reconciliation, and analytics to remain correct.

## Top-ups

One-time top-up packs currently preserve the same commercial floor:

| Pack | Price |
| --- | ---: |
| 500 credits | $5 |
| 1,000 credits | $10 |
| 2,500 credits | $25 |
| 5,000 credits | $50 |
| 10,000 credits | $100 |

Top-ups are enabled only after crowdfunding credit activation.

Relevant files:

- `src/lib/credit-packs.ts`
- `src/app/api/credits/checkout/route.ts`

## Crowdfunding rule

Founder Credits use the **same Prompt Credit economy** as plans and top-ups. They are not a separate token.

The campaign currently uses a base of **100 credits per $1 contributed** plus a tier bonus that remains inside the commercial economics guard.

| Contribution | Founder Credits |
| ---: | ---: |
| $10 | 1,050 |
| $25 | 2,675 |
| $50 | 5,500 |
| $100 | 11,200 |
| $250 | 28,750 |
| $500 | 58,500 |
| $1,000 | 120,000 |

Custom contribution amounts use the same formula and the bonus percentage of the highest tier reached.

Founder Credits remain pending during the campaign. They become eligible after the campaign ends, payment has been received, and the backer/payment is verified. Reaching 100% of the funding goal is not required.

Relevant files:

- `src/lib/founder-credit-tiers.ts`
- `src/lib/founder-credit-fulfillment.ts`
- `src/models/CrowdfundingContribution.ts`
- `src/app/api/webhooks/stripe/route.ts`

## Financial interpretation

Do not confuse these concepts:

- **cash collected**,
- **recognized/operating profit**,
- **future credit liability**,
- **provider COGS**,
- **fixed infrastructure**.

A crowdfunding payment may generate cash immediately while the associated Founder Credits remain a future product obligation.

For planning, always model both:

- expected utilization (for example 70%), and
- 100% redemption.

Do not treat unused credits as guaranteed profit.

## Observability requirements

For every paid generation, record or derive:

- user ID,
- generation/job ID,
- operation code,
- provider and model,
- input/output usage,
- image resolution or video duration,
- estimated provider cost,
- actual provider cost when available,
- credits estimated,
- credits reserved,
- credits captured/refunded,
- source bucket,
- correlation/request ID,
- timestamps.

Contribution margin should be observable by provider, model, operation, plan, and credit source.

## Change-control checklist

Before modifying prices or credits:

1. Update the relevant source-of-truth module.
2. Recalculate price per credit.
3. Validate provider cost against the margin guard.
4. Check annual as well as monthly economics.
5. Check crowdfunding rewards and top-ups for consistency.
6. Verify Stripe amount-to-plan mapping.
7. Update public pricing/crowdfunding copy.
8. Update tests.
9. Update this document if the product rule changed.

Never hard-code a second credit table in UI code when the value can come from the central domain logic.


## Full-platform COGS audit — 2026-10-03

Prompt Credits must be evaluated against the full platform cost, not only model/API cost. The repository environment contract identifies these economic domains: AI providers; Vercel; MongoDB Atlas; Cloudflare R2 and Queues; Google Cloud Run and Cloud Tasks; Resend; Upstash Redis/QStash; Clerk; Firebase; Stripe; and optional worker/provider infrastructure.

Secrets and real environment-variable values are never part of this audit. Provider discovery uses variable names, application configuration and dependencies only.

### Two cost layers

1. **Provider COGS**: direct AI cost attributable to a generation (tokens, images, video seconds, provider tools).
2. **Platform COGS**: hosting, database, storage, queues, email, auth, payment fees, serverless compute and other shared/variable infrastructure.

The commercial price of a Prompt Credit is intentionally not equal to either layer:

```text
nominal Prompt Credit retail value = $0.0100

true COGS / credit =
  (AI provider spend
   + attributable platform usage
   + amortized shared platform spend
   + attributable payment fees)
  / Prompt Credits consumed
```

Source of truth for planning/list-price platform inputs:
- `src/lib/platform-cost-registry.ts`

Actual invoices/usage remain authoritative for realized COGS.

### Current infrastructure price references

| Provider/service | Planning input | Cost behavior |
| --- | ---: | --- |
| Vercel Pro | $20/month; $20 included usage credit | shared + metered |
| Vercel function invocation | $0.0000006/invocation | variable |
| MongoDB Atlas Flex | starts near $8/month, up to $30/month | shared/usage |
| MongoDB Atlas Dedicated | published starting equivalent ~$56.94/month | shared; configuration-sensitive |
| Cloudflare R2 Standard storage | $0.015/GB-month | variable |
| Cloudflare R2 Class A | $4.50/million | variable |
| Cloudflare R2 Class B | $0.36/million | variable |
| Cloudflare Queues | first 1M ops/month included on Workers Paid, then $0.40/million | variable |
| Resend Pro | $20/month, 50k emails | shared |
| Resend overage | $0.90/1,000 emails | variable |
| Upstash Redis PAYG | $0.20/100k commands | variable |
| Upstash QStash | planning rate $1/100k messages | variable |
| Clerk Pro | $20/month annual-billing equivalent; 50k MRU included | shared + usage |
| Clerk first MRU overage band | $0.02/retained-user-month above included threshold | usage |
| Cloud Run CPU | $0.000018/vCPU-second after free allowance | variable |
| Cloud Run memory | $0.000002/GiB-second after free allowance | variable |
| Cloud Tasks | first 1M operations free, then $0.40/million | variable |
| Firestore Standard reads (us-central1 reference) | $0.03/100k reads after applicable free quota | variable |
| Firestore Standard writes (us-central1 reference) | $0.09/100k writes after applicable free quota | variable |
| Stripe Mexico domestic cards | 3.6% + MXN 3 per successful transaction | transaction |

Prices are public list-price planning inputs verified on 2026-10-03. Currency, region, negotiated agreements, taxes, product configuration, free tiers and provider changes can alter actual invoices.

### Cost attribution policy

Do **not** charge every service literally to every AI request.

- AI token/image/video cost: attribute directly to the generation.
- R2 requests/storage: attribute when the generated asset causes the usage; amortize persistent storage over measured consumption when direct attribution is impractical.
- Queue/Redis/Cloud Tasks/Cloud Run: attribute measured job usage where telemetry exists.
- Resend: attribute only when a generation/workflow actually sends email; otherwise treat subscription base as shared platform overhead.
- MongoDB, Vercel and Clerk base plans: amortize monthly actual spend across consumed credits or, preferably, across product revenue plus credits using finance reporting. They are not per-prompt API fees.
- Stripe: allocate actual payment fees to the credit source/purchase. The fixed MXN fee makes small purchases proportionally more expensive.
- Firebase: charge only the Firebase services actually used; presence of client configuration does not prove billable Firestore usage.

### Commercial decision: keep $0.01 nominal value

The audit does **not** justify reducing the nominal Prompt Credit price. The current structure remains:

```text
$0.0100 nominal revenue / credit
$0.0025 maximum AI-provider reserve / credit
$0.0015 platform/infrastructure reserve / credit
~10% payment/refund/risk reserve
~50% target contribution margin
```

Many platform operations cost much less than the $0.0015 infrastructure reserve when amortized at meaningful volume. The reserve is intentionally broader than a single request: it must also absorb base subscriptions, database capacity, storage persistence, retries, observability and growth.

Do not increase or decrease `PROMPT_CREDIT_RETAIL_USD` from public list prices alone. Change it only when measured trailing usage shows that realized full-platform economics persist outside the guardrails.

### Price-change triggers

Review commercial pricing monthly once paid credits are active. Use trailing 30-day actual invoices and credit consumption.

- **Healthy:** true COGS <= $0.0040/credit and contribution margin >= 50%: keep $0.01.
- **Watch:** true COGS > $0.0040/credit or contribution margin < 50%: investigate provider mix, retries, infrastructure and payment mix before changing retail price.
- **Critical:** true COGS > $0.0050/credit for two consecutive complete billing periods: reprice expensive operations/provider routing first; evaluate retail credit price only after operation-level optimization.
- **Over-reserved:** true COGS < $0.0025/credit for at least three complete billing periods: do not automatically lower credit retail value. Consider more included credits, promotions, or better plan value while preserving the $0.01 anchor.

These are management guardrails, not accounting standards.

### Monthly true-cost report

Record at minimum:

```text
period
credits_consumed
credit_cash_revenue
AI_provider_spend
Vercel_spend
MongoDB_spend
Cloudflare_spend
Google_Cloud_spend
Resend_spend
Upstash_spend
Clerk_spend
Firebase_spend
Stripe_fees
other_platform_spend
true_cost_per_credit
contribution_per_credit
contribution_margin_percent
```

Calculate:

```text
platform_spend = sum(non-AI infrastructure)
total_COGS = AI_provider_spend + platform_spend + attributable_payment_fees
true_cost_per_credit = total_COGS / credits_consumed
contribution = credit_cash_revenue - total_COGS
contribution_margin = contribution / credit_cash_revenue
```

Track both 100% credit redemption and observed utilization. Unused credits are not guaranteed profit.

### Public pricing sources reviewed

Re-verify before every financial change:
- Vercel pricing: https://vercel.com/pricing
- MongoDB Atlas pricing: https://www.mongodb.com/pricing
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Queues: https://developers.cloudflare.com/queues/platform/pricing/
- Resend: https://resend.com/pricing
- Upstash: https://upstash.com/pricing
- Clerk: https://clerk.com/pricing
- Stripe Mexico: https://stripe.com/mx/pricing
- Cloud Run: https://cloud.google.com/run/pricing
- Cloud Tasks: https://cloud.google.com/tasks/pricing
- Firebase / Firestore: https://firebase.google.com/pricing
- Gemini Developer API: https://ai.google.dev/gemini-api/docs/pricing
- OpenAI API models/pricing: https://developers.openai.com/api/docs/models

### Change-control extension

Any future Prompt Credit audit must review **both** provider AI pricing and platform COGS. A model becoming cheaper is not sufficient reason to make credits cheaper if infrastructure/payment costs rise, and a hosting bill increase is not sufficient reason to raise every AI operation if the increase is fixed and well amortized.

When actual billing integrations become available, replace planning assumptions with invoice/usage telemetry while retaining the registry as a documented benchmark and anomaly detector.


## Cloudflare training datasets and /generate retrieval economics — 2026-10-03

The environment contract already reserves a dedicated private Cloudflare R2 training bucket (`CLOUDFLARE_R2_TRAINING_BUCKET`) with bucket-scoped server-only credentials. No production dataset consumer was found in `main` during this audit, so this section defines the economic architecture before runtime integration.

### Do not treat every dataset row as model training

For `/generate`, split dataset use into three paths:

1. **R2 corpus/archive** — canonical prompts, answers, preference pairs, generated assets, evaluation data and training shards.
2. **Retrieval/RAG** — embed approved knowledge/examples, index vectors, retrieve only relevant context for a question, then send that context to the selected text/web/image/video generation model.
3. **Training/fine-tuning** — periodically export quality-approved examples to Runpod/NVIDIA training jobs. Training cost is amortized across the resulting model's lifetime usage.

This prevents repeatedly retraining a model just to make new information available to `/generate`.

### Cloudflare public planning prices

Verified 2026-10-03:

| Layer | Planning price |
| --- | ---: |
| R2 Standard storage | $0.015/GB-month |
| R2 Class A operations | $4.50/million |
| R2 Class B operations | $0.36/million |
| R2 Internet egress | $0 |
| Vectorize stored vector dimensions | $0.05/100M dimensions/month |
| Vectorize queried vector dimensions | $0.01/50M queried dimensions |
| Workers AI | $0.011 per 1,000 neurons; 10,000 neurons/day included on Workers Free/Paid |

Cloudflare documents Vectorize query usage as returned vectors multiplied by vector dimensions. The actual embedding-model cost is separate and must be included when vectors are created/re-created.

Source of truth for planning calculations: `src/lib/cloudflare-dataset-cost-registry.ts`.

### Storage examples

R2 raw storage is inexpensive:

```text
10 GB  × $0.015 = $0.15/month
100 GB × $0.015 = $1.50/month
1 TB   × $0.015 ≈ $15.36/month (1024 GB)
```

Request operations and embedding/training compute are additional. Therefore dataset size alone is unlikely to justify changing the $0.01 Prompt Credit anchor.

### Vectorize example

For 1,000,000 vectors at 768 dimensions:

```text
stored dimensions = 768,000,000
storage = 768M / 100M × $0.05
        = $0.384/month
```

For 1,000,000 searches returning top-10 vectors at 768 dimensions:

```text
queried dimensions = 1,000,000 × 10 × 768
                   = 7.68B
query cost = 7.68B / 50M × $0.01
           = $1.536
```

This excludes embedding generation and the LLM tokens added by retrieved context. Those two costs are generally more important to Prompt Credit economics than Vectorize itself.

### /generate cost formula

For a retrieval-assisted generation:

```text
generate_true_COGS =
  vector_query_cost
  + amortized_embedding/indexing_cost
  + retrieved_context_input_token_cost
  + model_output_cost
  + attributable R2/request/queue/compute cost
  + training amortization when using a Prompt Studio-owned model
```

Do not charge a separate large dataset fee merely because R2/Vectorize was consulted. Add credits only when the retrieved context/model/provider materially increases protected provider cost.

### Dataset lifecycle cost

For training datasets:

```text
dataset_lifecycle_cost =
  R2 storage
  + R2 operations
  + cleaning/quality-processing compute
  + embedding/indexing
  + Vectorize storage/query
  + export/queue compute
  + Runpod/NVIDIA training GPU cost
  + checkpoint/model storage

amortized_dataset_training_cost_per_credit =
  training-specific lifecycle cost
  / expected lifetime credits served by trained model
```

Keep retrieval-only corpus cost separate from model-training investment so the same storage is not counted twice.

### Recommended /generate architecture

```text
user question
  -> classify generation intent
  -> retrieve relevant approved examples/knowledge from Vectorize
  -> fetch full private records/assets from R2 only when needed
  -> construct bounded context
  -> select Gemini/OpenAI/Vertex/PromptStudio-owned model
  -> provider + platform cost estimate
  -> Prompt Credit margin guard
  -> generation
  -> quality/feedback telemetry
  -> only quality-approved examples enter future training datasets
```

Do not insert raw user prompts/responses into a training corpus without the platform's applicable consent/privacy/data-governance policy. Economic eligibility does not replace data-rights review.

### Prompt Credit conclusion

Cloudflare dataset infrastructure does not currently justify raising the universal $0.01 Prompt Credit value. R2 and Vectorize list-price costs are small relative to the existing $0.0015 infrastructure reserve per credit at meaningful usage volumes. The larger economic effects are embedding generation, additional retrieved-context tokens and GPU training.

Keep the $0.01 nominal anchor. Measure retrieval COGS per `/generate` request and increase a specific operation's credit requirement only when its combined AI + retrieval + infrastructure cost would violate the existing margin/provider-budget guardrails.

### Sources

Re-verify before financial changes:
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Vectorize pricing: https://developers.cloudflare.com/vectorize/platform/pricing/
- Cloudflare Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare AI Search pricing: https://developers.cloudflare.com/ai-search/pricing/

## GPU training and owned-model economics — 2026-10-03

Prompt Studio may add Runpod/NVIDIA-based compute to train, fine-tune, store and serve proprietary text models. This introduces two new economic categories:

- **model development/training investment**: GPU hours, experiments, failed runs, datasets and checkpoints. This is not charged to one prompt; amortize it across the expected useful lifetime of the resulting model.
- **owned-model inference COGS**: GPU/serverless runtime and storage used to serve the trained model. This is recurring provider COGS and must fit the same Prompt Credit margin guard.

Source of truth for planning inputs: `src/lib/gpu-training-cost-registry.ts`.

### Runpod planning rates

Verified against Runpod public pricing on 2026-10-03:

| Compute | Planning rate |
| --- | ---: |
| RTX 4090 Community Pod | $0.34/GPU-hour |
| RTX 4090 Secure Pod | $0.74/GPU-hour |
| RTX 4090 Serverless | $1.10/GPU-hour active worker equivalent |
| A100 80GB Community Pod | $1.19/GPU-hour |
| A100 80GB Secure Pod | $1.59/GPU-hour |
| A100 SXM Cluster | $1.79/GPU-hour |
| H100 PCIe Community Pod | $1.99/GPU-hour |
| H100 SXM Secure Pod | $3.49/GPU-hour |
| H100 Serverless | $4.79/GPU-hour active worker equivalent |
| H200 SXM Cluster | $4.31/GPU-hour |

Runpod storage planning rates: container/running volume $0.10/GB-month; standard network storage $0.07/GB-month under 1TB and $0.05/GB-month above 1TB; high-performance network storage $0.14/GB-month.

Community Cloud is appropriate for restart-tolerant experiments when reliability/security requirements allow it. Secure Cloud is the safer production/training default. Serverless is primarily an inference option, not the default for multi-node pretraining.

### NVIDIA software/licensing

NVIDIA NeMo is available as open-source software. NVIDIA NIM can be used free for development/research/testing under the NVIDIA Developer program subject to NVIDIA terms. Production NIM usage requires NVIDIA AI Enterprise; NVIDIA currently states pricing starts at $4,500 per GPU/year (about $0.514/GPU-hour if spread continuously across a year). This license cost is **in addition to** rented GPU compute.

NVIDIA DGX Cloud / DGX Cloud Lepton can support training and deployment, but NVIDIA's public DGX Cloud pages direct customers to private/provider pricing for relevant enterprise capacity. Do not invent a DGX hourly rate in the Prompt Credit registry; ingest a contracted quote/invoice when Prompt Studio buys it.

### Training scenarios

Compute-only examples using current Runpod Community rates:

| GPU | 100 GPU-hours | 500 GPU-hours | 1,000 GPU-hours | 5,000 GPU-hours |
| --- | ---: | ---: | ---: | ---: |
| RTX 4090 | $34 | $170 | $340 | $1,700 |
| A100 80GB | $119 | $595 | $1,190 | $5,950 |
| H100 PCIe | $199 | $995 | $1,990 | $9,950 |

These are **GPU-hour examples, not estimates that a particular foundation model can be trained in those hours**. Training from scratch can require many GPUs and many more GPU-hours depending on parameter count, token count, optimizer, precision, utilization, failed runs and evaluation. Benchmark the actual training code before committing to a budget.

### Amortizing a proprietary model

Do not add the entire training bill to the first users' prompts.

```text
amortized_training_cost_per_credit =
  total_training_and_model_development_cost
  / expected_lifetime_credits_served_by_model

owned_model_true_COGS_per_credit =
  inference_compute_per_credit
  + storage_per_credit
  + amortized_training_cost_per_credit
  + attributable_platform_cost_per_credit
```

Example: a $1,000 model-development run amortized across 1,000,000 credits adds $0.001/credit. Across 10,000,000 credits it adds $0.0001/credit. The expected lifetime volume therefore matters as much as the headline GPU rate.

### Effect on the $0.01 Prompt Credit

Do not raise the universal Prompt Credit price merely because Prompt Studio begins training models. Keep $0.01 as the nominal retail anchor while each owned model is economically evaluated.

An owned model is eligible for the normal Prompt Credit economy when its recurring inference cost plus chosen training amortization fits inside the applicable provider/platform reserves and contribution-margin target. If it does not fit:

1. optimize/quantize/batch or route it to a cheaper GPU;
2. increase that operation's Prompt Credit charge;
3. use a premium operation/model tier;
4. only reconsider the universal $0.01 credit anchor if measured full-platform COGS persistently violates the documented platform guardrails.

This preserves comparability between Gemini/OpenAI/Vertex calls and Prompt Studio-owned models.

### Recommended GPU progression

- Small experiments, tokenizer/data pipeline tests, small-model training/fine-tuning: RTX 4090 Community where 24GB VRAM is sufficient and restart risk is acceptable.
- Larger model state or production-grade training: A100 80GB is the cost/capacity checkpoint before H100.
- H100/H200: justify with measured throughput/time-to-train, not prestige; a higher hourly rate can still be cheaper if the job finishes proportionally faster.
- Multi-node training: use cluster pricing and benchmark communication efficiency.
- Production inference: compare Runpod Serverless active-worker cost against a continuously running Pod using real utilization. Serverless wins when scale-to-zero/low utilization offsets its higher active hourly rate.

### Required telemetry for owned models

Record model/version, training run ID, GPU type/count, GPU-hours, storage/checkpoint GB-months, failed/restarted GPU-hours, total development cost, deployment GPU, active inference seconds, generated input/output tokens, credits charged, and expected/actual lifetime credits. Recompute amortized training cost monthly as actual adoption becomes known.

### Pricing sources

Re-verify before financial changes:
- Runpod GPU/storage pricing: https://www.runpod.io/pricing
- NVIDIA NIM production licensing: https://docs.api.nvidia.com/nim/docs/product
- NVIDIA NIM run-anywhere licensing: https://docs.api.nvidia.com/nim/docs/run-anywhere
- NVIDIA DGX Cloud Lepton: https://www.nvidia.com/en-us/data-center/dgx-cloud-lepton/
- NVIDIA NeMo: https://www.nvidia.com/en-us/ai-data-science/products/nemo/
