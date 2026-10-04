#!/usr/bin/env bash
# Builds and deploys the PRIVATE Cloud Run generation worker (GCP-T4/T12).
# Dry-run by default. Deploying does NOT send traffic: dispatch stays off until
# AI_EXECUTION_BACKEND/GCP_AI_* flags and rollout percentages are changed in Vercel.
set -euo pipefail
source "$(dirname "$0")/_dry-run.sh"

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID (real project id of 'Prompt Studio'; never guessed)}"
: "${GCP_REGION:?Set GCP_REGION}"
SERVICE="${GCP_WORKER_SERVICE:-prompt-studio-ai-worker}"
REPO="${GCP_ARTIFACT_REPO:-prompt-studio}"
TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO}/${SERVICE}:${TAG}"
WORKER_SA="${GCP_WORKER_SA_NAME:-ps-ai-worker}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
# Only what the worker code path needs. Stripe/Clerk/Resend are deliberately absent.
SECRETS="${GCP_WORKER_SECRETS:-MONGODB_URI,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY,GEMINI_API_KEY}"

secret_flags=""
IFS=',' read -ra names <<< "$SECRETS"
for name in "${names[@]}"; do
  name="$(echo "$name" | xargs)"; [[ -z "$name" ]] && continue
  secret_flags+="${secret_flags:+,}${name}=${name}:latest"
done

run gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com --project "$GCP_PROJECT_ID"
if [[ "$DRY_RUN" == "0" ]] && gcloud artifacts repositories describe "$REPO" --location "$GCP_REGION" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
  echo "Artifact Registry repo $REPO exists."
else
  run gcloud artifacts repositories create "$REPO" --repository-format=docker --location "$GCP_REGION" --project "$GCP_PROJECT_ID"
fi
run gcloud builds submit --project "$GCP_PROJECT_ID" --config workers/generation/cloudbuild.yaml --substitutions "_IMAGE=${IMAGE}" .
run gcloud run deploy "$SERVICE" \
  --project "$GCP_PROJECT_ID" --region "$GCP_REGION" --image "$IMAGE" \
  --service-account "$WORKER_SA" \
  --no-allow-unauthenticated \
  --set-secrets "$secret_flags" \
  --set-env-vars "NODE_ENV=production,CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:-},CLOUDFLARE_R2_BUCKET_NAME=${CLOUDFLARE_R2_BUCKET_NAME:-},GCP_AI_PROJECT_ID=${GCP_PROJECT_ID},GCP_AI_REGION=${GCP_REGION},GCP_AI_WORKER_URL=${GCP_AI_WORKER_URL:-},GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT=${GCP_QUEUE_INVOKER_SA_NAME:-ps-ai-queue-invoker}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --concurrency "${WORKER_CONCURRENCY:-4}" --timeout "${WORKER_TIMEOUT:-600}" \
  --cpu "${WORKER_CPU:-1}" --memory "${WORKER_MEMORY:-1Gi}" \
  --min-instances 0 --max-instances "${WORKER_MAX_INSTANCES:-10}"

echo "Next: set GCP_AI_WORKER_URL to the service URL, re-run bootstrap-ai-worker-iam.sh (run.invoker for ps-ai-queue-invoker)."
