# Prompt Studio — AI Unit Economics and Credits

## Principle
Prompt Studio credits are an internal AI currency, not tokens and not “one credit = one generation.”

Initial configurable planning target:
`TARGET_COST_PER_CREDIT = 0.005 USD`.

## Cost calculation
`estimatedApiCost = inputTokenCost + outputTokenCost + imageCost + videoCost + providerSpecificCost`

`creditsRequired = max(modelMinimumCredits, ceil(estimatedApiCost / TARGET_COST_PER_CREDIT))`

The registry must remain server-side and configurable because provider/model prices change.

## Transaction flow
estimate → reserve → execute → reconcile.

Provider failures eligible for refund release the reservation. Duplicate worker execution must never charge twice. Subscription credits and purchased credits should be separate ledgers; consume expiring subscription credits first.

## Product rules
Normal visual-editor actions such as drag/drop, style changes and local editing should not consume AI credits. AI website generation, AI edits, image generation, video generation and premium models consume credits according to actual economics.

## Observability
Store provider/model, request ID, usage, actual provider cost, estimated/actual credits and error category. Track AI contribution margin separately from fixed infrastructure.
