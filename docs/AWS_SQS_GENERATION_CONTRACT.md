# AWS SQS generation contract

Issue: #830  
Parent: #827

## Purpose

Amazon SQS is the transport between the Vercel Generation API and ECS/Fargate generation workers. MongoDB's canonical `GenerationJob` remains the source of truth. The queue message carries only the identity and routing data needed to load that job.

## Region and topology

Primary region: `us-east-2` (Ohio).

Image dev resources provisioned during #830:

- source queue: `prompt-studio-dev-image-generation`
- DLQ: `prompt-studio-dev-image-generation-dlq`
- queue type: Standard
- server-side encryption: SSE-SQS
- source visibility timeout: 300 seconds
- long polling: 20 seconds
- source retention: 4 days
- DLQ retention: 14 days
- redrive: after 3 receives

Planned topology uses the same pattern for Video and Web:

```text
Vercel Generation API
        |
        v
prompt-studio-<env>-<workload>-generation
        |
        v
ECS/Fargate worker
        |
        +-- success -> DeleteMessage
        |
        +-- transient failure -> message becomes visible again
        |
        +-- max receives -> workload DLQ
```

## Message contract

Version 1:

```json
{
  "version": 1,
  "generationId": "canonical-generation-job-id",
  "workload": "image",
  "enqueuedAt": "2026-10-01T08:00:00.000Z"
}
```

Allowed workloads are `image`, `video`, and `web`.

Do not put prompts, user data, API keys, provider credentials, binary/base64 media, credit amounts, or provider request payloads in SQS. Workers load the canonical job by `generationId` after receipt.

The `generationId` is also the application idempotency key. Standard queues are at-least-once delivery, so duplicate delivery is expected and must never cause duplicate provider calls or duplicate credit charges. Atomic claim/idempotency remains owned by #785.

## Producer security

Development Vercel producer identity:

`prompt-studio-dev-vercel-sqs-producer`

Image producer policy:

`PromptStudioDevVercelImageSQSProducer`

Allowed actions on the image source queue only:

- `sqs:SendMessage`
- `sqs:GetQueueUrl`

The Vercel server environment holds the dedicated AWS access key credentials. They must never use a `NEXT_PUBLIC_` prefix and must never be committed or logged.

Expected server-only Vercel variables:

```text
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_SQS_IMAGE_QUEUE_URL=<source queue URL>
```

## Consumer security

ECS task role:

`prompt-studio-dev-generation-worker`

Image consumer policy:

`PromptStudioDevImageWorkerSQSConsumer`

Allowed actions on the image source queue only:

- `sqs:ReceiveMessage`
- `sqs:DeleteMessage`
- `sqs:ChangeMessageVisibility`
- `sqs:GetQueueAttributes`
- `sqs:GetQueueUrl`

The worker task role does not receive `sqs:SendMessage` for normal consumption. The ECS task execution role is separate and must not be used as the application worker identity.

## Retry ownership

SQS redrive is the transport safety net; application code decides whether a failure is retryable.

Retryable examples:
- network/transport interruption;
- timeout;
- HTTP 429;
- explicitly eligible provider 5xx.

Non-retryable examples:
- HTTP 400 validation/request errors;
- HTTP 401 authentication errors;
- HTTP 403 authorization/configuration errors;
- invalid job/message configuration.

A non-retryable failure should persist the terminal job failure and reconcile/refund credits as required, then delete the SQS message so it does not consume three deliveries. #786 owns the typed retry implementation.

Workers must extend visibility with `ChangeMessageVisibility` when execution can exceed the initial 300-second lease. Long-running Video jobs must not depend on one permanently running task; #833 owns the provider-job lifecycle.

## DLQ recovery

DLQ messages are evidence of transport/application failure and must not be blindly replayed. Recovery flow:

1. inspect the canonical GenerationJob and sanitized failure metadata;
2. determine whether the underlying cause is fixed and retryable;
3. verify that the generation has not already completed or charged;
4. redrive/re-enqueue only through an idempotent recovery path;
5. retain correlation/generation IDs for audit.

#788 owns stuck-job recovery; #836 owns production retry/DLQ/credit safety.

## Acceptance verification

Infrastructure created manually in AWS must be verified without exposing credentials:

1. producer can send a synthetic message to the source queue;
2. authorized test consumer can receive the synthetic message;
3. unauthorized identity/action is denied;
4. test consumer deletes the message after validation;
5. a controlled failed message reaches the DLQ after the configured receive count;
6. no real AI provider call or credit charge occurs during this transport test.

Do not close #830 until these checks are recorded as sanitized evidence in the issue.

## Next implementation

- #831 builds the shared ECS/Fargate consumer runtime.
- #835 wires normal Vercel Generation API dispatch to SQS.
- #836 completes idempotency, typed retries, DLQ and credit safety.
