# AI Generation Queue

The queue uses MongoDB as durable storage. The browser creates a job and polls its status; the protected cron claims jobs via a lease, so a user request does not remain open.

## Create a Job

`POST /api/ai/jobs` requires a session and the `Idempotency-Key` header (minimum 8 characters).

```json
{
  "kind": "image",
  "provider": "google",
  "input": { "prompt": "Editorial product photography…" },
  "notifyOnComplete": true
}
```

Current types and costs: `image` (1 credit), `video` (3), and `project` (2). The server defines the cost; the client cannot modify it.

## Processing

- Vercel invokes `GET /api/ai/jobs/process?limit=3` every minute using `CRON_SECRET`.
- Google Image can run locally. Video, projects, and other providers are delegated to `AI_GENERATION_WORKER_URL`.
- The worker receives `jobId`, `kind`, `provider`, and `input`, along with `Idempotency-Key` and a bearer token.
- It can report progress (10–95) with `PATCH /api/ai/jobs/:id/progress` using `AI_GENERATION_WORKER_TOKEN`.
- It must save large artifacts in private storage and return URLs; the JSON response is limited to 2 MB.

Failures are retried three times with backoff. Credits are reserved upon creation, captured upon completion, and refunded after final failure. Every transaction is recorded in `ai_credit_ledger`.