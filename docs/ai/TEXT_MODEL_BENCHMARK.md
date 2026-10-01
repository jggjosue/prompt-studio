# Qwen3-8B benchmark plan and acceptance gate

Issue: #1056  
Parent: #1054  
Benchmark target from #1055: `Qwen/Qwen3-8B` at revision
`b968826d9c46dd6066d109eabc6255188de91218`.

## Purpose

This benchmark decides whether the approved self-hosted model is suitable for the
Prompt Studio `/generate` experience and provides the data required by #1057 to
select Modal or RunPod.

The harness deliberately benchmarks an OpenAI-compatible endpoint rather than a
specific host. The exact same fixtures can therefore be run against:

1. Qwen3-8B on Modal;
2. Qwen3-8B on RunPod/vLLM; and
3. the current Prompt Studio text provider through an OpenAI-compatible adapter or
   benchmark proxy.

This prevents provider-specific test prompts or measurement methods from biasing the
comparison.

## What is measured

For every fixture and concurrency level the harness records:

- time to first token (TTFT);
- total generation latency;
- output tokens and whether token count is exact or estimated;
- output tokens/second after first token;
- success/failure;
- estimated cost per generation using either GPU-hour pricing, token pricing, or
  both;
- GPU and RAM usage when the endpoint exposes a benchmark metrics endpoint; and
- an automatic output-contract score.

The report summarizes p50/p95 TTFT, p50/p95 total latency, throughput, success rate,
cost and peak memory.

## Representative workload

The versioned fixture set is:

`docs/ai/benchmarks/text-generation-cases.json`

It contains short, medium and long Prompt Studio use cases in Spanish and English:

- product/image prompt creation;
- social copy prompt creation;
- landing-page prompt creation;
- TypeScript/Next.js code-review prompt creation;
- B2B SaaS marketing strategy; and
- evidence-based research/agent specification.

Do not replace these fixtures between provider runs. Add new cases only in a PR and
rerun every comparison target.

## Run the benchmark

The benchmark client requires Node 22 and no additional packages.

### Qwen3-8B / self-hosted endpoint

```bash
BENCHMARK_LABEL=qwen3-8b-runpod \
BENCHMARK_BASE_URL=https://your-private-benchmark-endpoint.example.com \
BENCHMARK_API_KEY=... \
BENCHMARK_MODEL=Qwen/Qwen3-8B \
BENCHMARK_RUNS=5 \
BENCHMARK_CONCURRENCY=1,5,10 \
BENCHMARK_HOURLY_COST_USD=0.69 \
BENCHMARK_METRICS_URL=https://your-private-benchmark-endpoint.example.com/metrics/benchmark \
BENCHMARK_OUTPUT=.benchmark/qwen3-8b-runpod.json \
npm run benchmark:text-model
```

The hourly value above is an example input, **not a pinned price claim**. Record the
actual provider/instance price at benchmark time.

### Current provider baseline

Run the same command against an adapter/proxy for the currently selected Prompt
Studio text model:

```bash
BENCHMARK_LABEL=current-provider \
BENCHMARK_BASE_URL=https://your-current-provider-proxy.example.com \
BENCHMARK_API_KEY=... \
BENCHMARK_MODEL=current-model-id \
BENCHMARK_RUNS=5 \
BENCHMARK_CONCURRENCY=1,5,10 \
BENCHMARK_INPUT_COST_PER_MILLION=<actual-input-price> \
BENCHMARK_OUTPUT_COST_PER_MILLION=<actual-output-price> \
BENCHMARK_OUTPUT=.benchmark/current-provider.json \
npm run benchmark:text-model
```

Do not commit benchmark API keys or production credentials.

## Cold-start protocol

Serverless cold starts must be measured separately from warm request latency.

For each hosting candidate:

1. scale the deployment to zero / ensure no worker is warm;
2. record wall-clock time from the first request until the first token;
3. repeat at least 5 independent cold starts;
4. record model download/cache state for each trial;
5. repeat the normal benchmark after the worker is warm.

Store the cold-start observations in the result table below.

## Memory protocol

The preferred method is a protected metrics endpoint owned by the benchmark
deployment that returns:

```json
{
  "gpuMemoryUsedMb": 0,
  "gpuMemoryTotalMb": 0,
  "ramUsedMb": 0,
  "ramTotalMb": 0
}
```

The benchmark client samples that endpoint after each generation. For vLLM hosts,
the deployment implementation may collect these values from the platform/runtime or
`nvidia-smi`. Never expose this endpoint publicly without authentication.

If memory metrics cannot be collected remotely, mark memory as **not measured**;
do not substitute marketing/spec-sheet VRAM for observed utilization.

## Quality review

The automatic contract score only verifies basic shape constraints. It is not a
semantic quality score.

Before approval, perform a blind human review of at least one output from each case
for every candidate. Reviewers should not know which provider produced each answer.

Score each dimension from 1–5:

| Dimension | Question |
| --- | --- |
| Instruction following | Did it satisfy the requested format and constraints? |
| Reusability | Can a Prompt Studio user paste/reuse the generated prompt with little editing? |
| Specificity | Is the prompt concrete enough to guide another model well? |
| Structure | Is the result organized appropriately for the requested task? |
| Language quality | Is Spanish/English natural, correct and professional? |
| Hallucination discipline | Does it avoid inventing evidence, capabilities or unsupported facts? |

Calculate the mean across dimensions and cases.

## Acceptance gate

The first production candidate is **GO** only if all of these are true:

| Metric | Gate |
| --- | --- |
| Success rate | >= 99% at concurrency 1 and >= 97% at planned launch concurrency |
| p95 TTFT, warm | <= 2.5 s |
| p95 total latency, short | <= 8 s |
| p95 total latency, medium | <= 15 s |
| p95 total latency, long | <= 30 s |
| Human quality mean | >= 4.0 / 5 |
| Automatic contract score mean | >= 90 / 100 |
| Memory | Fits selected instance with >= 15% headroom under tested concurrency |
| Cost | Measured cost/generation is lower than the current provider baseline for the same fixture mix, or documented product value justifies the difference |
| Reliability | No credential leakage, malformed streaming, or unrecovered worker errors during the benchmark |

If any mandatory gate fails, the decision is **NO-GO for production default**.
The model may still proceed to optimization experiments behind a feature flag.

## Result record

Do not fill this table from list prices or marketing benchmarks. Populate it only
from committed/attached benchmark artifacts produced by this harness.

| Candidate | Revision/model | p50 TTFT | p95 TTFT | p50 latency | p95 latency | tok/s p50 | Success | Peak VRAM | Avg cost/gen | Human quality | Decision |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Qwen3-8B / Modal | pinned SHA | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |
| Qwen3-8B / RunPod | pinned SHA | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |
| Current provider | current production model | pending | pending | pending | pending | pending | pending | n/a | pending | pending | baseline |

## Current decision

**NO-GO for making Qwen3-8B the production default until measured benchmark
artifacts satisfy the acceptance gate above.**

This is intentionally conservative: #1055 proves licensing/provenance, while #1056
must prove product quality and operating characteristics. Creating a deployment in
#1057/#1058 for measurement is allowed behind a non-production feature flag, but
production-default traffic must not move until this gate is populated with actual
results.

## Evidence retention

For every provider/candidate run retain:

- JSON benchmark artifact;
- date/time;
- exact model/revision;
- instance/GPU type;
- runtime/vLLM version;
- concurrency and number of runs;
- actual pricing inputs used;
- cold/warm state;
- memory collection method;
- human-review sheet or summary; and
- commit SHA of the fixture/harness used.

This makes cost and performance comparisons reproducible even after provider prices
or model defaults change.
