# Prompt Studio — GCP AI Workers Migration

Parent tracking Epic: #827.

## Scope
Move only heavy asynchronous Image, Video and Web generation execution to Google Cloud. Keep Vercel, MongoDB, Cloudflare R2, Clerk, Stripe, Resend and GitHub in their existing roles.

## Target architecture
Vercel /page-composer → Generation API → reserve credits → MongoDB GenerationJob → Google Cloud managed queue → Cloud Run Image/Video/Web workers → AI providers → R2 → MongoDB → reconcile credits → status UI.

## Migration order
1. #828 baseline current cost/latency/errors
2. #829 GCP environments/IAM/service accounts/Secret Manager
3. #830 queue topology/security
4. #783 canonical GenerationJob
5. #785 atomic claiming/idempotency
6. #786 retry/DLQ
7. #831 shared Cloud Run worker runtime
8. #832 Image worker
9. #833 Video worker
10. #834 Web worker
11. #835 immediate Vercel → GCP dispatch
12. #836 end-to-end idempotency/retry/DLQ/credit safety
13. #837 observability/providerCostUsd
14. #838 status delivery/stuck-job recovery
15. #839 Image canary
16. #840 Image 100% then Video migration
17. #841 Web migration
18. #842 budgets/unit economics/retire primary cron worker

## Safety
Feature-flag each workload. Migrate Image → Video → Web. Retry transient 429/eligible 5xx/network/timeouts only; do not automatically retry 400/401/403/config/validation failures. Preserve rollback until stability is demonstrated.

## Cron
Vercel Cron should stop being the primary user-triggered generation worker after migration. Retain scheduled work only for reconciliation, stuck-job recovery, cleanup and maintenance.
