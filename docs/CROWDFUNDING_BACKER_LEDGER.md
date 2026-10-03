# Crowdfunding Backer Ledger

## Goal

Every unique crowdfunding backer receives a permanent sequential number:

- Backer #1
- Backer #2
- Backer #3
- ...

The number represents the order in which Prompt Studio confirmed successful crowdfunding participation.

A backer can make multiple contributions without receiving a second backer number. Their paid amount and Founder Credits accumulate under the same backer record.

## Collections

### `crowdfunding_backers`

One row per unique backer.

Important fields:

- `campaignId`
- `backerNumber`
- `purchaserUserId`
- `purchaserEmail`
- `totalContributedCents`
- `totalBaseCredits`
- `totalBonusCredits`
- `totalCredits`
- `contributionCount`
- `creditStatus`
- `founderClaimId`
- `firstContributionAt`
- `lastContributionAt`
- `claimedAt`

Backers are ordered by `backerNumber ASC` for fulfillment.

### `crowdfunding_contributions`

One row per successful Stripe contribution.

Each row stores:

- `backerId`
- `backerNumber`
- Stripe Checkout Session
- Stripe Payment Intent
- amount paid
- currency
- base credits
- bonus credits
- total credits
- paid/refunded status
- credit status
- timestamps

### `founder_credit_claims`

The claim is linked back to the ordered backer with:

- `backerId`
- `backerNumber`
- aggregate contribution amount
- aggregate base credits
- aggregate bonus credits
- aggregate total credits

## Number allocation

Backer numbers are allocated with a MongoDB sequence counter inside a transaction.

Do not replace this with `countDocuments() + 1`; concurrent Stripe webhooks could assign duplicate numbers.

The Stripe Checkout timestamp is stored as `paidAt`.

## Existing campaign data

Before enabling the new ledger in a database that already contains crowdfunding contributions, run:

```bash
npm run crowdfunding:backfill-backers
```

The migration:

1. orders existing contributions by `paidAt`, `createdAt`, and `_id`,
2. groups repeat contributions by Clerk user ID or email,
3. creates sequential backers,
4. links each contribution to its backer,
5. synchronizes existing Founder claims,
6. initializes the sequence counter.

New payments intentionally fail with `CROWDFUNDING_BACKER_BACKFILL_REQUIRED` if legacy unnumbered contributions exist and the sequence has not been initialized. This prevents a historical backer from accidentally losing the #1 position.

## Admin view

Authorized Prompt Studio admins can query:

`GET /api/admin/crowdfunding/backers`

Optional query parameters:

- `limit` — 1 to 5000
- `status` — `pending`, `eligible`, `claimed`, or `cancelled`

The endpoint returns backers ordered by number with their linked contribution history.

This endpoint contains purchaser identity and payment references and must remain admin-only.

## Fulfillment

Use the ordered backer ledger as the source for fulfillment.

`listFounderBackersForFulfillment()` returns outstanding backers ordered by `backerNumber ASC`.

When credits are granted:

- the Founder claim becomes `claimed`,
- the linked backer becomes `claimed`,
- `claimedAt` is stored,
- credit metadata contains the backer number and crowdfunding backer ID.

The exact accumulated credit total from the ledger is granted. Do not recalculate a backer's aggregate reward from their total dollar amount, because multiple contributions may have earned different tier bonuses.

## Refunds

A fully refunded contribution:

- becomes `refunded`,
- becomes credit `cancelled`,
- is removed from the backer's aggregate paid amount,
- subtracts its base, bonus, and total credits,
- updates the linked Founder claim.

If the backer still has other paid contributions, the remaining credits stay pending/eligible as appropriate.

## Privacy

Do not publish backer email addresses, Clerk IDs, Stripe IDs, or the ordered ledger publicly.

The public crowdfunding page may display aggregate backer count only.
