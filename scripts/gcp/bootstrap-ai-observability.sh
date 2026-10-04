#!/usr/bin/env bash
# Log-based metrics for the per-execution record (GCP-T10). Dry-run by default.
set -euo pipefail
source "$(dirname "$0")/_dry-run.sh"
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
FILTER='resource.type="cloud_run_revision" AND jsonPayload.message="ai_generation_execution"'

run gcloud logging metrics create ai_generation_outcomes --project "$GCP_PROJECT_ID" \
  --description "AI generation outcomes by workload/provider/backend" --log-filter "$FILTER"
run gcloud logging metrics create ai_generation_dead_letters --project "$GCP_PROJECT_ID" \
  --description "AI generations dead-lettered" --log-filter "$FILTER AND jsonPayload.outcome=\"dead_letter\""
run gcloud logging metrics create ai_generation_ownership_lost --project "$GCP_PROJECT_ID" \
  --description "Lease/ownership lost during execution" --log-filter "$FILTER AND jsonPayload.outcome=\"ownership_lost\""
echo "Alert thresholds and dashboards: docs/GCP_T10_OBSERVABILITY.md"
