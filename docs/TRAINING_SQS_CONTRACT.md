# Training data SQS contract

Parent: #1072. Issue: #1078. Related generation SQS architecture: #827.

Amazon SQS is transport only. MongoDB remains the operational source for records and Cloudflare R2 remains the canonical dataset/asset store.

Version 1 messages are compact identity/routing envelopes:

```json
{
  "version": 1,
  "action": "process-record",
  "idempotencyKey": "training:event:event-123:v1",
  "recordId": "event-123",
  "entityType": "event",
  "generationId": "generation-456",
  "eventId": "event-123",
  "enqueuedAt": "2026-10-02T00:00:00.000Z"
}
```

Dataset build messages use `action=build-dataset` plus `buildId`. Message bodies are capped by application contract at 4 KiB, far below the SQS service limit. Prompts, input/output content, secrets, tokens, provider payloads, base64 and binary assets are forbidden.

## Idempotency and retry

Standard SQS is treated as at-least-once transport. The worker must atomically claim the application `idempotencyKey` before doing preprocessing or writes. Duplicate delivery is a no-op after a successful claim/result exists.

Retryable failures (temporary network/R2/Mongo/SQS availability, throttling) are allowed to return to the source queue. Permanent schema, consent, validation or policy failures are persisted with a reason code and the message is acknowledged rather than retried indefinitely.

Production must configure a DLQ and redrive policy. DLQ entries are investigated before redrive; replay uses the same idempotency key.

## Security

Producer credentials need only `sqs:SendMessage` and `sqs:GetQueueUrl` for the training source queue. Consumer credentials/task role need only Receive/Delete/ChangeMessageVisibility/GetQueueAttributes/GetQueueUrl. Queue encryption should remain enabled. Credentials are server-only and never appear in message bodies.
