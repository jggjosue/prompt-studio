# Clerk → Resend contact synchronization

The product database is authoritative for marketing eligibility. A Clerk user
may be represented as a Resend Contact, but the existence of a Clerk account or
email address never grants marketing permission.

`upsertResendContact` reconciles by email and is safe to replay. Contacts are
subscribed only when `marketingOptIn === true` and no unsubscribe, suppression
or do-not-contact state exists. Suppression always wins over imports and sync.

Only fields needed to reconcile eligibility are read. Birth date, PayPal email,
and other profile data are not copied into Resend. Locale/topics remain product
segmentation inputs and should only become provider custom properties when a
specific Resend segment/topic implementation requires them (#674).

Privacy/deletion workflow: when an account deletion request is fulfilled,
remove or anonymize the product profile according to retention requirements and
delete the corresponding Resend Contact. A deletion job must not recreate the
contact from stale Clerk/import data. Do-not-contact/suppression records that
must be retained for compliance should be minimized and documented separately.
