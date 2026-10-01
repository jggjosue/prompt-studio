# Resend segments and topics

Prompt Studio separates **behavior segments** from **user-controlled topics**.
Segment membership never grants marketing consent; #669/#670 eligibility and
suppression rules still gate every non-transactional send.

## Behavior segment rules

| Segment | Source-of-truth rule |
| --- | --- |
| `new_registered` | Account has a recorded registration timestamp. Campaigns may add their own age window. |
| `activated` | A first activation event exists. |
| `inactive_7d` | Last product activity is at least 7 days old. |
| `inactive_30d` | Last product activity is at least 30 days old. |
| `image_creator` | At least one successful image creation exists. |
| `video_creator` | At least one successful video creation exists. |
| `web_creator` | At least one successful web creation exists. |
| `premium_interest` | Explicit premium/pricing intent event exists. |
| `checkout_abandoned` | Checkout started and no matching purchase completed within the campaign-defined window. |
| `customer` | A successful paid purchase/subscription exists. |
| `founding_member` | Product billing/entitlement source explicitly records founding-member status. |

These are derived labels, not authoritative profile fields. A rebuild job should
query product activity, generation/project events, and billing/checkout
sources, derive the facts, then replace provider segment membership. Re-running
with the same facts must produce the same membership.

## Topics

`product_updates`, `tutorials`, and `offers` are preferences controlled by
the user through the email-preference model. Unknown topic values are discarded.
Selecting a topic does not override global opt-out, complaint, bounce, or
do-not-contact suppression.

## Privacy boundary

No segment uses health, religion, ethnicity, politics, sexual orientation,
precise location, inferred income, or other sensitive inferred attributes.
Behavior labels are based only on first-party product actions and explicit
billing/entitlement state. Provider synchronization should send only the
minimal derived labels needed for the campaign.
