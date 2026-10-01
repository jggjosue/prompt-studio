# GCP-T4 / #831 — Shared Cloud Run generation runtime

T4 extracts the generation state machine from the Vercel route into `src/lib/generation-worker-runtime.ts`.

Both execution surfaces now share the same implementation:
- current Vercel/QStash/Cron: `/api/ai/jobs/process`
- future Cloud Run: `POST /tasks/generation`

The shared runtime owns atomic claim/lease, provider execution, output validation, usage/cost telemetry, finalization, Prompt Credit capture/release, retries and dead-letter transitions.

## Cloud Run entrypoint
`workers/generation/server.ts` accepts only the T3 versioned minimal task payload and reloads the canonical MongoDB job. Health/readiness endpoints are available at `/healthz` and `/readyz`. SIGTERM/SIGINT trigger graceful HTTP draining.

Cloud Run IAM/OIDC from T2/T3 is the network authentication boundary. The worker does not implement a second shared bearer secret.

## Container
`workers/generation/Dockerfile` provides the initial Node 22 container. It intentionally uses the repository dependency graph so the extracted runtime and Vercel route cannot drift into separate provider/credit implementations.

Known deployment blocker: the repository's existing package-lock mismatch must be repaired before `npm ci` can produce a reproducible image. T4 does not hide or bypass that integrity issue.

## Deployment
No Cloud Run service is deployed by this PR because the real GCP Project ID is pending. When available, deploy the service as private using the T2 worker service account and Secret Manager bindings. Then T3 can send an authenticated synthetic Cloud Task.

## T4 acceptance
- [x] shared execution runtime extracted
- [x] existing Vercel process route delegates to it
- [x] Cloud Run HTTP entrypoint added
- [x] minimal task validation
- [x] health/readiness
- [x] graceful shutdown
- [x] same credit/retry/dead-letter implementation on both surfaces
- [x] initial container definition
- [ ] reproducible container build (blocked by existing package-lock mismatch)
- [ ] deploy private Cloud Run service (Project ID pending)
- [ ] authenticated synthetic Cloud Task (requires deployed service)
