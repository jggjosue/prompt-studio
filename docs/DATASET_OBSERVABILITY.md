# Dataset pipeline observability and cost metrics

Issue #1091, parent #1072. Metrics contract: `observability-v1`.

Structured metrics are emitted as JSON logs with low-cardinality dimensions only: dataset, stage, result and sanitized reason code. Never attach prompt text, record/user IDs, R2 object keys, queue URLs, credentials or asset content.

Core metrics: records processed/rejected/duplicate, processing duration, SQS queue depth, DLQ depth, examples by dataset, R2 bytes written, R2 operation count, release duration and release success/failure.

Initial alert policy:
- queue depth >= 1000: TRAINING_QUEUE_STALLED (warning);
- DLQ depth > 0: TRAINING_DLQ_NONEMPTY (critical);
- >=20 attempts and rejection rate >=25%: TRAINING_REJECTION_RATE_HIGH;
- >=20 attempts and failure rate >=10%: TRAINING_FAILURE_RATE_HIGH.

Release instrumentation emits example count, estimated bytes written, five release-object write operations, duration and success/failure. Queue/DLQ gauges are exposed as pure helpers for the worker/runtime collector.

Cost accounting should derive provider cost from measured R2 bytes/operations and SQS request metrics using the active provider price sheet, rather than hard-coding currency prices in application code. This keeps metrics stable when vendor pricing changes.

Dashboards should show throughput, latency percentiles, rejection/failure ratios, queue/DLQ health, examples per dataset, R2 storage/operation volume and release outcomes. Alert delivery is configured in the deployment/logging platform, not with user data in application messages.
