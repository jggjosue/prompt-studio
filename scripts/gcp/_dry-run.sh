#!/usr/bin/env bash
# Shared helper: every infra script prints its gcloud commands unless DRY_RUN=0.
# Nothing in Prompt Studio is created, deployed or billed by accident.
DRY_RUN="${DRY_RUN:-1}"
run() {
  if [[ "$DRY_RUN" == "0" ]]; then
    "$@"
  else
    printf '[dry-run]'; printf ' %q' "$@"; printf '\n'
  fi
}
