# Founder-led B2B outreach: first 100 prospects

This workflow is intentionally low-volume and personalized. The first cohort is
limited to 100 prospects across four initial segments: creative agencies,
e-commerce brands, SaaS marketing teams and independent creators.

## Initial message gate

Before every initial message, a human must review the company qualification and
write a prospect-specific personalization note. Re-check the CRM's
`doNotContact`/deletion state immediately before send. The message must clearly
identify the founder/Prompt Studio as sender and include a simple reply-based
opt-out. An opt-out must be written back to the CRM as do-not-contact.

Cold prospects are not newsletter subscribers. Never add them to recurring
marketing broadcasts unless appropriate permission has been obtained separately.

## Funnel and learning loop

Track each prospect through sent → delivered → reply → positive reply →
demo/trial → activation → checkout → paid. Delivery is provider evidence, while
reply and downstream product stages are separate outcomes.

Stop for a human evidence review after prospects 25, 50, 75 and 100. Review the
segment and positioning using reply quality and downstream conversion, record
what changed, then continue the next batch. Do not optimize the sequence by
automatically increasing volume.

The outreach attempt stores reviewer, review timestamp, personalization, sender
identity and stage timestamps so the first-100 experiment remains auditable.


## Evidence to record

For every prospect, record objections, the outcome they actually want, and any
learning note alongside the existing funnel timestamps. At checkpoints 25, 50,
75 and 100, persist one cohort review with the funnel totals, recurring
objections/requested outcomes, the segment decision, the message change (or an
explicit decision to keep it), and the next hypothesis.

A checkpoint review is a human decision gate, not an automatic volume ramp. Do
not continue to the next batch until the evidence has been reviewed. The
experiment is complete only after 100 individually qualified, human-reviewed
prospects have actually been contacted and their outcomes recorded; adding this
infrastructure alone does not satisfy that execution requirement.


## First-100 operations API

The protected `/api/admin/founder-outreach` endpoint is the operational write
surface for the first cohort. Creating an attempt requires an already-qualified
CRM prospect, a valid target segment, human reviewer identity, sender identity,
and prospect-specific personalization that passes the existing send gate.

The service assigns ordinals 1–100 and **blocks prospect 26, 51, 76 and any
subsequent cohort block until the previous 25-prospect review exists**. This
turns the review cadence into an enforceable decision gate rather than a note.

After manual outreach, use the same protected endpoint to record funnel stages
and the prospect's objection, requested outcome and learning notes. The endpoint
does not send cold outreach automatically; contact remains founder-led and
individually reviewed.

Issue #656 remains open until 100 real qualified prospects have actually been
contacted and the four checkpoint reviews have been recorded.
