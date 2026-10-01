# GCP-T2 / #829 — Environments, IAM and Secret Manager

## Goal
Provision a least-privilege identity and secret contract for Prompt Studio Cloud Run generation workers without changing production dispatch.

## Environment model
Use isolated Google Cloud projects when available:
- development: `PROMPT_STUDIO_GCP_PROJECT_DEV`
- preview/staging: `PROMPT_STUDIO_GCP_PROJECT_PREVIEW`
- production: `PROMPT_STUDIO_GCP_PROJECT_PROD`

A single-project fallback may be used during initial development, but production identities, queues and secrets must still be isolated by service account/resource name.

Recommended regions are configured explicitly through `GCP_AI_REGION`; do not infer region in code.

## Service accounts
Per environment:
- `ps-ai-worker`: runtime identity for Cloud Run. Reads only worker-required secrets and accesses required GCP runtime APIs.
- `ps-ai-queue-invoker`: queue caller identity. It receives only `roles/run.invoker` on the generation worker service.
- deployment identity: CI/operator identity used to deploy; it is not the runtime worker identity.

Do not create/download long-lived JSON service-account keys. Prefer Google-managed identity/OIDC and workload identity for CI where supported.

## Worker secrets
Cloud Run needs server-side values already used by the canonical runner, depending on enabled providers:
- `MONGODB_URI`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET_NAME`
- provider keys actually enabled for that worker (for example `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)

Do **not** copy Clerk/Stripe/Resend secrets to Cloud Run unless a concrete worker code path proves they are required.

Secrets are referenced from Secret Manager at runtime. Never place secret values in queue payloads, Docker images, Terraform/state committed to Git, logs, or source.

## Minimum IAM contract
Worker service account:
- `roles/secretmanager.secretAccessor` only on the specific secret resources mounted/injected into that worker.
- logging/metrics permissions should come from the Cloud Run runtime defaults where possible; do not grant project Editor.
- no `roles/owner`, `roles/editor`, broad Secret Manager admin, IAM admin or service-account-key admin.

Queue invoker:
- `roles/run.invoker` only on the target Cloud Run worker.
- no Secret Manager access.
- no database/provider credentials.

Deployment identity:
- narrowly scoped Cloud Run deployment/service-account-user permissions required by the deployment workflow.
- deployment permissions must not be inherited by runtime identities.

## Authentication boundary
GCP-T3 will define the queue primitive. The security contract is already fixed:
1. worker Cloud Run service is not unauthenticated/public;
2. managed queue obtains an OIDC token as `ps-ai-queue-invoker`;
3. Cloud Run verifies IAM-authenticated invocation;
4. payload identifies the durable job; MongoDB is authoritative;
5. application-level claim/idempotency remains mandatory because authenticated delivery can still occur more than once.

`AI_GENERATION_WORKER_TOKEN` remains a legacy/current compatibility secret while Vercel worker callbacks exist. It is not the target queue-to-Cloud-Run authentication mechanism.

## Required APIs
Provisioning should enable only APIs needed by the migration stage:
- Cloud Run
- Secret Manager
- IAM
- Service Usage
- Logging/Monitoring
- the managed queue API selected by GCP-T3

Do not enable unrelated Firebase/Firestore/Cloud Storage services as part of this migration.

## Rotation/revocation
- provider/R2/Mongo secrets rotate independently through Secret Manager versions;
- workers consume a configured secret version/alias and are redeployed/restarted according to the operational rotation procedure;
- revoke old versions after verification;
- queue invoker has no secret to rotate because it uses Google identity;
- emergency response can disable the queue invoker or remove Run Invoker without rotating provider credentials.

## Reproducibility
`scripts/gcp/bootstrap-ai-worker-iam.sh` creates service accounts and grants only the worker secret-access bindings plus target-service invoker binding. It is intentionally parameterized and contains no project IDs or secret values.

Example:
```bash
GCP_PROJECT_ID=my-dev-project \
GCP_REGION=us-central1 \
GCP_WORKER_SERVICE=prompt-studio-ai-worker \
GCP_WORKER_SECRETS=MONGODB_URI,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY,GEMINI_API_KEY \
bash scripts/gcp/bootstrap-ai-worker-iam.sh
```

The script requires `gcloud` authenticated as an authorized provisioning identity.

## Environment variables (non-secret)
Application/deployment configuration may contain:
- `GCP_AI_PROJECT_ID`
- `GCP_AI_REGION`
- `GCP_AI_WORKER_SERVICE`
- `GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT`
- future queue name from T3

These values identify infrastructure; credentials stay in Secret Manager/Google identity.

## T2 acceptance
- [x] environment isolation contract defined
- [x] runtime and queue identities separated
- [x] least-privilege IAM contract defined
- [x] Secret Manager inventory and exclusions documented
- [x] no service-account key-file requirement
- [x] reproducible bootstrap supplied
- [x] production dispatch unchanged
- [ ] bootstrap executed against real GCP projects
- [ ] real secret resources populated/verified

The final two checks require authorized GCP project access and must not be claimed from repository changes alone.
