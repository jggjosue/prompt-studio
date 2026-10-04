#!/usr/bin/env bash
# Billing budget + alerts for the AI worker project (GCP-T15). Dry-run by default.
set -euo pipefail
source "$(dirname "$0")/_dry-run.sh"
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_BILLING_ACCOUNT:?Set GCP_BILLING_ACCOUNT}"
BUDGET_USD="${GCP_AI_MONTHLY_BUDGET_USD:-100}"

run gcloud services enable billingbudgets.googleapis.com --project "$GCP_PROJECT_ID"
run gcloud billing budgets create --billing-account "$GCP_BILLING_ACCOUNT" \
  --display-name "Prompt Studio AI workers (${GCP_PROJECT_ID})" \
  --budget-amount "${BUDGET_USD}USD" --calendar-period month \
  --filter-projects "projects/${GCP_PROJECT_ID}" \
  --threshold-rule percent=0.5 --threshold-rule percent=0.8 \
  --threshold-rule percent=1.0 --threshold-rule percent=1.0,basis=forecasted-spend
echo "Budget alerts notify billing admins. Provider (Gemini/Veo...) spend is tracked per job via providerCostUsd."
