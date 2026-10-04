#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null
gcloud services enable cloudtasks.googleapis.com --project "$GCP_PROJECT_ID"

ensure_queue() {
  local name="$1" concurrency="$2" rate="$3"
  if gcloud tasks queues describe "$name" --location "$GCP_REGION" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
    gcloud tasks queues update "$name" --location "$GCP_REGION" --project "$GCP_PROJECT_ID"       --max-concurrent-dispatches="$concurrency" --max-dispatches-per-second="$rate"       --max-attempts=5 --min-backoff=10s --max-backoff=300s --max-doublings=5 >/dev/null
  else
    gcloud tasks queues create "$name" --location "$GCP_REGION" --project "$GCP_PROJECT_ID"       --max-concurrent-dispatches="$concurrency" --max-dispatches-per-second="$rate"       --max-attempts=5 --min-backoff=10s --max-backoff=300s --max-doublings=5 >/dev/null
  fi
}

# Cloud Tasks rate is requests/second. Conservative equivalents of the initial
# per-minute migration caps: 30/min ~= .5/s; 10/min ~= .1667/s.
ensure_queue "${GCP_IMAGE_QUEUE:-ps-ai-image}" 3 0.5
ensure_queue "${GCP_VIDEO_QUEUE:-ps-ai-video}" 2 0.1667
ensure_queue "${GCP_WEB_QUEUE:-ps-ai-web}" 2 0.1667

echo "Cloud Tasks generation queues are configured in $GCP_PROJECT_ID/$GCP_REGION."
