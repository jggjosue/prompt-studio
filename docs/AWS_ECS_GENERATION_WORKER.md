# AWS ECS/Fargate generation worker

Issue: #831  
Parent: #827

This worker is the shared Amazon ECS/Fargate runtime for generation queues. It long-polls SQS, loads the canonical MongoDB GenerationJob through the existing runtime, uses the existing atomic claim/lease/credit/provider boundaries, extends SQS visibility while work is in flight, and deletes only terminal messages.

## Runtime

Entry point:

```bash
npm run worker:aws
```

Container:

```bash
docker build -f Dockerfile.aws-worker -t prompt-studio-generation-worker .
```

The container must run with the ECS task role `prompt-studio-dev-generation-worker`. Do not inject AWS access keys into ECS; the AWS SDK obtains temporary credentials from the task role.

Required dev variables:

```text
AWS_REGION=us-east-2
AWS_SQS_IMAGE_QUEUE_URL=<prompt-studio-dev-image-generation URL>
MONGODB_URI=<existing MongoDB connection>
```

Provider/R2 variables are required only when a real provider job is enabled. The #831 acceptance test must use a synthetic job and must not call a paid AI provider.

Optional:

```text
AWS_SQS_VISIBILITY_TIMEOUT_SECONDS=300
AWS_SQS_VISIBILITY_HEARTBEAT_SECONDS=120
AWS_ECS_WORKER_ID=<stable task label>
```

## Processing rules

1. SQS message contains only version, generationId, workload and enqueuedAt.
2. Worker loads/claims the canonical GenerationJob via `processGenerationJob`.
3. Existing MongoDB lock token is the provider/idempotency ownership boundary.
4. SQS visibility is renewed while processing.
5. Completed, dead-letter or failed terminal jobs are deleted from SQS.
6. Retryable jobs returned to `queued` are not deleted and become visible again.
7. SIGTERM/SIGINT stops new polling and waits for the current message before exit.
8. Logs are JSON and include worker/correlation/generation identifiers; secrets and prompt bodies are not logged.

## ECR + ECS/Fargate deployment

Create one ECR repository for the shared runtime, for example `prompt-studio-generation-worker`. Build an immutable image tag from the Git commit SHA and push it to ECR. The ECS task definition should reference that immutable tag.

For dev Image, run one Fargate service/task against `prompt-studio-dev-image-generation`. Video and Web reuse the same image with their workload-specific queue URL once #833/#834 are implemented.

The task execution role is only for ECS/ECR/log delivery. The application container uses the separate task role `prompt-studio-dev-generation-worker` for SQS access.

## Synthetic acceptance test

Do not use a real paid provider for #831.

1. Push this image to ECR.
2. Register an ECS Fargate task definition in `us-east-2`.
3. Attach the worker task role and configure the Image queue URL.
4. Insert/use a synthetic GenerationJob designed for the no-provider test path once that fixture is available.
5. Enqueue its generationId using the #830 contract.
6. Confirm CloudWatch logs show receive, claim and terminal processing.
7. Confirm the message is deleted on success.
8. Confirm SIGTERM drains the current message.
9. Record sanitized evidence in #831.

The AWS console/ECR/ECS deployment and live synthetic run remain required before #831 is closed.
