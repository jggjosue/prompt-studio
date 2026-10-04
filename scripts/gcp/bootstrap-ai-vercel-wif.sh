#!/usr/bin/env bash
# Lets Vercel (production only) enqueue Cloud Tasks WITHOUT service-account keys:
# Vercel OIDC token -> Workload Identity Federation -> impersonate ps-ai-dispatcher.
# Dry-run by default.
set -euo pipefail
source "$(dirname "$0")/_dry-run.sh"

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_PROJECT_NUMBER:?Set GCP_PROJECT_NUMBER}"
: "${VERCEL_TEAM_SLUG:?Set VERCEL_TEAM_SLUG}"
: "${VERCEL_PROJECT_NAME:?Set VERCEL_PROJECT_NAME}"
POOL="${GCP_WIF_POOL:-vercel}"
PROVIDER="${GCP_WIF_PROVIDER:-vercel-oidc}"
DISPATCHER_SA="${GCP_DISPATCHER_SA_NAME:-ps-ai-dispatcher}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

run gcloud iam workload-identity-pools create "$POOL" --project "$GCP_PROJECT_ID" --location global --display-name "Vercel"
run gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
  --project "$GCP_PROJECT_ID" --location global --workload-identity-pool "$POOL" \
  --issuer-uri "https://oidc.vercel.com/${VERCEL_TEAM_SLUG}" \
  --allowed-audiences "https://vercel.com/${VERCEL_TEAM_SLUG}" \
  --attribute-mapping "google.subject=assertion.sub,attribute.project=assertion.project,attribute.environment=assertion.environment" \
  --attribute-condition "assertion.project == '${VERCEL_PROJECT_NAME}' && assertion.environment == 'production'"
run gcloud iam service-accounts add-iam-policy-binding "$DISPATCHER_SA" --project "$GCP_PROJECT_ID" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.project/${VERCEL_PROJECT_NAME}"

echo "Vercel env: GCP_AI_WIF_PROVIDER=projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"
echo "Vercel env: GCP_AI_DISPATCHER_SERVICE_ACCOUNT=${DISPATCHER_SA}"
