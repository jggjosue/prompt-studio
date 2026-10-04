#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GCP_WORKER_SERVICE:?Set GCP_WORKER_SERVICE}"
: "${GCP_WORKER_SECRETS:?Set GCP_WORKER_SECRETS as comma-separated Secret Manager names}"

WORKER_SA_NAME="${GCP_WORKER_SA_NAME:-ps-ai-worker}"
INVOKER_SA_NAME="${GCP_QUEUE_INVOKER_SA_NAME:-ps-ai-queue-invoker}"
DISPATCHER_SA_NAME="${GCP_DISPATCHER_SA_NAME:-ps-ai-dispatcher}"
WORKER_SA="${WORKER_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
INVOKER_SA="${INVOKER_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
DISPATCHER_SA="${DISPATCHER_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null

gcloud services enable run.googleapis.com secretmanager.googleapis.com iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com cloudtasks.googleapis.com logging.googleapis.com monitoring.googleapis.com --project "$GCP_PROJECT_ID"

ensure_sa() {
  local name="$1" display="$2"
  if ! gcloud iam service-accounts describe "$name@$GCP_PROJECT_ID.iam.gserviceaccount.com" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$name" --display-name "$display" --project "$GCP_PROJECT_ID"
  fi
}

ensure_sa "$WORKER_SA_NAME" "Prompt Studio AI worker"
ensure_sa "$INVOKER_SA_NAME" "Prompt Studio AI queue invoker"
# Enqueue-only identity impersonated by Vercel through Workload Identity
# Federation (see bootstrap-ai-vercel-wif.sh). No secrets, no run.invoker.
ensure_sa "$DISPATCHER_SA_NAME" "Prompt Studio AI task dispatcher"

# Enqueuers: Vercel (dispatcher) for initial dispatch, worker for follow-up
# deliveries (business retry / video poll). Both must actAs the invoker SA
# because tasks carry an OIDC token minted for it. No JSON keys are created.
for enqueuer in "$DISPATCHER_SA" "$WORKER_SA"; do
  gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$enqueuer" --role="roles/cloudtasks.enqueuer" --condition=None >/dev/null
  gcloud iam service-accounts add-iam-policy-binding "$INVOKER_SA" --member="serviceAccount:$enqueuer" --role="roles/iam.serviceAccountUser" --project "$GCP_PROJECT_ID" >/dev/null
done
# Worker telemetry.
for role in roles/logging.logWriter roles/monitoring.metricWriter; do
  gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$WORKER_SA" --role="$role" --condition=None >/dev/null
done

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
echo "Dispatcher:      $DISPATCHER_SA"
