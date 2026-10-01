#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GCP_WORKER_SERVICE:?Set GCP_WORKER_SERVICE}"
: "${GCP_WORKER_SECRETS:?Set GCP_WORKER_SECRETS as comma-separated Secret Manager names}"

WORKER_SA_NAME="${GCP_WORKER_SA_NAME:-ps-ai-worker}"
INVOKER_SA_NAME="${GCP_QUEUE_INVOKER_SA_NAME:-ps-ai-queue-invoker}"
WORKER_SA="${WORKER_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
INVOKER_SA="${INVOKER_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null

gcloud services enable run.googleapis.com secretmanager.googleapis.com iam.googleapis.com logging.googleapis.com monitoring.googleapis.com --project "$GCP_PROJECT_ID"

ensure_sa() {
  local name="$1" display="$2"
  if ! gcloud iam service-accounts describe "$name@$GCP_PROJECT_ID.iam.gserviceaccount.com" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$name" --display-name "$display" --project "$GCP_PROJECT_ID"
  fi
}

ensure_sa "$WORKER_SA_NAME" "Prompt Studio AI worker"
ensure_sa "$INVOKER_SA_NAME" "Prompt Studio AI queue invoker"

IFS=',' read -ra SECRET_NAMES <<< "$GCP_WORKER_SECRETS"
for secret in "${SECRET_NAMES[@]}"; do
  secret="$(echo "$secret" | xargs)"
  [[ -z "$secret" ]] && continue
  gcloud secrets describe "$secret" --project "$GCP_PROJECT_ID" >/dev/null
  gcloud secrets add-iam-policy-binding "$secret"     --member="serviceAccount:$WORKER_SA"     --role="roles/secretmanager.secretAccessor"     --project "$GCP_PROJECT_ID" >/dev/null
done

# The worker may not exist during the first foundation run. Grant invocation only
# after it exists; GCP-T4 creates/deploys the shared runtime.
if gcloud run services describe "$GCP_WORKER_SERVICE" --region "$GCP_REGION" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
  gcloud run services add-iam-policy-binding "$GCP_WORKER_SERVICE"     --region "$GCP_REGION"     --member="serviceAccount:$INVOKER_SA"     --role="roles/run.invoker"     --project "$GCP_PROJECT_ID" >/dev/null
else
  echo "Cloud Run service $GCP_WORKER_SERVICE does not exist yet; skipping roles/run.invoker until GCP-T4."
fi

echo "GCP AI worker IAM bootstrap complete."
echo "Worker identity: $WORKER_SA"
echo "Queue invoker:   $INVOKER_SA"
