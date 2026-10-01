# GCP-T5 / #832 — Image generation canary

Image is the first GCP workload.

## What T5 adds
- workload-level GCP flags with global kill switch;
- Cloud Tasks image payload/dispatch client contract;
- deterministic task name as an additional duplicate-delivery guard;
- OIDC target identity/audience in task creation;
- durable dispatch provenance fields on `AIGenerationJob`;
- structural tests proving Image is opt-in and independently rollbackable.

## Flags
```
GCP_AI_DISPATCH_ENABLED=false
GCP_AI_KILL_SWITCH=false
GCP_AI_IMAGE_ENABLED=false
GCP_AI_VIDEO_ENABLED=false
GCP_AI_WEB_ENABLED=false
```

Image may only be enabled after the real project, queue, private Cloud Run worker, IAM and secrets exist and a synthetic authenticated task succeeds.

## Important cutover boundary
T5 does **not** change `POST /api/ai/jobs` to call Cloud Tasks. T8 (#835) owns immediate production dispatch and guarantees a job is sent to exactly one backend. Wiring both QStash and Cloud Tasks here would violate that invariant.

T5 instead makes the Image GCP path concrete and testable so T8 can select it atomically.

## Image execution
The Cloud Run worker reloads the canonical Mongo job and invokes the same shared `runAIJob` path as Vercel. Google image generation therefore keeps the existing provider adapter, telemetry, pricing/credits, result validation and terminal reconciliation. Other image providers continue through the existing provider abstraction.

## Acceptance
- [x] Image independently feature-flagged
- [x] global GCP kill switch
- [x] image Cloud Tasks queue selected
- [x] minimal versioned task contract
- [x] deterministic task identity
- [x] OIDC task target contract
- [x] dispatch provenance schema
- [x] no production dual dispatch
- [ ] real Project ID/Cloud Run URL configured
- [ ] image worker container built/deployed
- [ ] authenticated synthetic image task
- [ ] canary production traffic (T12/#839)
