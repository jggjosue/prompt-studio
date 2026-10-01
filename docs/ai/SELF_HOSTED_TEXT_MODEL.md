# Self-hosted text model compliance record

Issue: #1055  
Parent epic: #1054  
Status: **Approved for Prompt Studio commercial SaaS evaluation and deployment, subject to the obligations below**  
Review date: 2026-10-01

## Approved artifact

| Field | Pinned value |
| --- | --- |
| Product role | PromptStudio self-hosted text model |
| Upstream model | `Qwen/Qwen3-8B` |
| Upstream host | Hugging Face |
| Revision | `b968826d9c46dd6066d109eabc6255188de91218` |
| License identifier | `Apache-2.0` |
| Model source | https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218 |
| Model card | https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/README.md |
| License text | https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/LICENSE |
| Runtime pin | `Qwen/Qwen3-8B@b968826d9c46dd6066d109eabc6255188de91218` |

The selected revision is intentionally immutable. Do not replace it with `main`,
`master`, `latest`, a tag that can move, or an unpinned model ID.

## Evidence reviewed

At the pinned revision, the upstream repository:

1. identifies the model as `Qwen/Qwen3-8B`;
2. declares `apache-2.0` in the model metadata;
3. contains the complete Apache License 2.0 text in `LICENSE`;
4. contains the model card in `README.md`;
5. contains the model configuration, tokenizer and safetensor weight shards; and
6. documents serving the model with vLLM through an OpenAI-compatible chat
   completions endpoint.

The upstream repository reports approximately 16.4 GB of files at this revision.
That figure is an artifact-size reference, not a production VRAM sizing guarantee;
runtime memory and performance are measured separately in #1056.

## Commercial-use determination

For Prompt Studio's planned use, this revision is accepted for commercial use under
Apache License 2.0.

Apache-2.0 grants broad permissions to use, reproduce, modify, prepare derivative
works, publicly display, sublicense and distribute the licensed work subject to its
conditions. On that basis, the following planned activities are permitted by the
upstream license:

- running the unmodified model for internal company use;
- serving model inference as part of a paid Prompt Studio SaaS product;
- fine-tuning or otherwise creating modified/derivative versions;
- incorporating the model into proprietary infrastructure; and
- redistributing copies or modified versions if the Apache-2.0 redistribution
  conditions are satisfied.

This record is an engineering compliance decision for this exact upstream artifact,
not general legal advice and not approval for unrelated datasets, adapters,
quantizations or future Qwen releases.

## SaaS use versus redistribution

Prompt Studio's first deployment will host the model on infrastructure controlled by
Prompt Studio and expose only an application/API result to users. The model weights
are not intended to be delivered to customers.

That hosted-inference design is treated as use of the model rather than distribution
of a copy of the model. If Prompt Studio later ships weights, a downloadable
fine-tune, a container containing the weights, an on-prem package, or another copy
to a third party, the redistribution checklist below becomes mandatory.

## Obligations and restrictions to preserve

When the Apache-2.0 distribution conditions apply, Prompt Studio must:

1. provide recipients a copy of the Apache License 2.0;
2. mark files that Prompt Studio modifies with prominent notices that changes were
   made;
3. retain applicable copyright, patent, trademark and attribution notices from the
   upstream work, excluding notices that do not pertain to the redistributed work;
4. include applicable attribution notices from an upstream `NOTICE` file if one is
   supplied for the artifact being redistributed; and
5. avoid implying that Apache-2.0 grants rights to upstream trademarks.

Additional license characteristics relevant to risk review:

- the work is provided without warranties or conditions under the license;
- liability is disclaimed to the extent stated by Apache-2.0;
- Apache-2.0 includes an express patent license and a patent-litigation termination
  provision; and
- adding proprietary code around the model does not require Prompt Studio to
  relicense that separate proprietary code under Apache-2.0.

Before any redistribution, re-check the exact pinned artifact for notices and bundle
the exact upstream license text with the distributed copy.

## Fine-tuning policy

Fine-tuning the approved revision is allowed by the selected upstream license, but a
fine-tuned model is **not automatically approved** for production.

Every fine-tune must separately record:

- the base model ID and base revision;
- the training/validation dataset names and versions;
- dataset licenses, consent/provenance and commercial-use rights;
- adapter or training-code licenses;
- whether Prompt Studio distributes the resulting weights; and
- any new attribution or notice requirements.

A dataset or adapter with a non-commercial/research-only restriction can make the
result unsuitable for the intended commercial product even when the base model is
Apache-2.0.

## Quantization and derivative artifacts

Do not silently replace this artifact with a third-party AWQ, GPTQ, GGUF or other
quantization that merely contains "Qwen3-8B" in its name. A third-party conversion
can carry its own provenance and licensing risk.

For production, either:

1. quantize the pinned upstream revision in a controlled Prompt Studio pipeline and
   record the resulting artifact digest; or
2. perform a separate license/provenance review of a third-party quantization before
   use.

## Runtime configuration contract

The application source of truth is
`src/lib/generation/self-hosted-text-model-config.ts`.

The code pins both:

- `modelId = "Qwen/Qwen3-8B"`
- `revision = "b968826d9c46dd6066d109eabc6255188de91218"`

Deployment code in #1058 must pass the pinned revision to the model downloader /
vLLM runtime. It must not rely on the repository default branch.

Example Hugging Face download semantics:

```bash
hf download Qwen/Qwen3-8B \
  --revision b968826d9c46dd6066d109eabc6255188de91218
```

Equivalent Python loaders must supply the same `revision` value.

## Upgrade and re-review process

A model upgrade is a compliance change, not a routine floating dependency update.

For every proposed new revision or replacement model:

1. open a dedicated issue/PR;
2. capture the exact immutable revision/hash before testing;
3. review the model card and exact license at that revision;
4. diff license, model card, config/tokenizer and other relevant provenance files
   against the currently approved revision;
5. verify commercial use, modification/fine-tuning and distribution rights again;
6. review any new acceptable-use, gating, attribution or field-of-use terms;
7. benchmark quality, latency, memory and cost;
8. update the runtime constant and this record in the same PR;
9. run the model-pin unit test and repository validation; and
10. deploy behind a feature flag/canary before changing the production default.

Never update the revision solely because upstream `main` changed.

## What this approval does not cover

This approval does not automatically cover:

- other Qwen family models or future Qwen3 revisions;
- third-party fine-tunes, LoRA adapters or quantized weights;
- training datasets used in a future Prompt Studio fine-tune;
- vLLM or container/runtime software licenses;
- generated-output IP ownership for a particular customer use case; or
- prohibited/regulated uses that may be restricted by applicable law.

Those items receive their own review when introduced.

## Production evidence to retain

For each production model release, retain:

- model ID;
- immutable upstream revision;
- upstream model-card URL at that revision;
- upstream license URL at that revision;
- deployment/container revision;
- internally produced quantization digest, if applicable;
- date approved; and
- link to the approving Prompt Studio PR.

This creates a reproducible audit trail even if upstream `main` changes later.
