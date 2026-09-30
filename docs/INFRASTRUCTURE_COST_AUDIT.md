# Prompt Studio — Infrastructure Cost Audit

## Goal
Track the real monthly operating cost of Prompt Studio without confusing configured integrations with paid production services.

## Confirmed architecture categories
Fixed/shared infrastructure includes Vercel, MongoDB, authentication, email and source/CI. Variable infrastructure includes R2 operations/storage, Google Cloud workers/queue and provider usage. AI generation is COGS and should be measured separately.

## Cost model
Monthly technology cost =
fixed infrastructure
+ AI provider usage
+ worker/queue compute
+ storage/operations
+ payment fees
+ domain registration COGS
+ other usage-based services.

## Required telemetry
For every generation record:
- userId and generationId
- workload type
- provider and model
- input/output token or media usage
- image resolution / video duration when applicable
- providerCostUsd
- worker duration/attempts
- R2 storage/operations where measurable
- credits estimated/reserved/charged/refunded
- correlationId and timestamps

## Unit economics
Cost per generation = provider API + worker compute + storage/operations + attributable overhead.

Monthly cost per user = sum(generation costs) + attributable shared infrastructure.

Paid-user contribution = subscription revenue - payment fee - AI COGS - attributable infrastructure/storage/email.

Do not present planning estimates as actual invoices. Actual monthly spend requires provider billing data.
