# Email suppression enforcement

All non-transactional senders must call `canSendNonTransactional` immediately
before queue/send. Suppression is server-side and wins over segmentation,
marketing opt-in, imports, and campaign membership.

Suppression reasons are unsubscribe, hard bounce, complaint, and manual. Manual
suppression also sets `emailDoNotContact`, which is the B2B do-not-contact
control. Transactional messages are classified separately and are not made
promotional by bypassing this guard.

Provider webhook handling should apply `suppressionPatch` for Resend
unsubscribe, hard-bounce, and complaint events. The secure webhook ingestion
endpoint/signature verification is scoped to #671; this issue defines the
state transition it must invoke.

The Resend synchronization route derives `unsubscribed` from local state and
does not hard-code false. Re-import therefore cannot silently re-subscribe a
suppressed contact.

Marketing unsubscribe UI/links should update the same local state first, then
reconcile Resend. Links must be easy to use and must not require sign-in.
