# Prompt Studio — Crowdfunding and Competitive Credit Context

## Purpose

This document gives future product and engineering work the commercial context behind Prompt Studio credits.

It covers:

- the crowdfunding reward schedule,
- how Founder Credits relate to normal Prompt Credits,
- what users can create with Prompt Studio plans,
- how Prompt Studio should be compared with visual-AI competitors,
- what comparisons are fair and what comparisons are misleading.

This is product context, not a substitute for runtime pricing code.

For the canonical credit-economics rules, read [AI_UNIT_ECONOMICS_AND_CREDITS.md](AI_UNIT_ECONOMICS_AND_CREDITS.md).

## Crowdfunding campaign

The current campaign is planned to run for **3 months from the official launch date**.

Founder Credits remain pending during the campaign and become eligible only after:

1. the campaign period has ended,
2. Magzin LLC has received the applicable payment,
3. the backer/payment is verified.

The campaign does **not** need to reach 100% of the funding goal for eligible Founder Credits to become available.

Public page:

- `/crowdfunding`
- `src/app/[locale]/crowdfunding/page.tsx`

## Official Founder Credit schedule

| Contribution | Base | Bonus | Total Founder Credits |
| ---: | ---: | ---: | ---: |
| $10 | 1,000 | 5% | 1,050 |
| $25 | 2,500 | 7% | 2,675 |
| $50 | 5,000 | 10% | 5,500 |
| $100 | 10,000 | 12% | 11,200 |
| $250 | 25,000 | 15% | 28,750 |
| $500 | 50,000 | 17% | 58,500 |
| $1,000 | 100,000 | 20% | 120,000 |

Custom amounts use the same formula:

- 100 base Prompt Credits per $1,
- apply the bonus percentage of the highest tier reached,
- reject allocations that fail the shared credit-economics validator.

Source: `src/lib/founder-credit-tiers.ts`.

## Prompt Studio plan capacity

Current monthly plans:

| Plan | Monthly price | Prompt Credits |
| --- | ---: | ---: |
| Premium | $9 | 900 |
| Creator | $19 | 1,900 |
| Pro | $29 | 2,900 |
| Studio | $39 | 3,900 |

Using the current operation catalog, this approximately gives:

| Plan | Quality 1K images | Lite 720p / 8s videos | Advanced websites |
| --- | ---: | ---: | ---: |
| Premium | 29 | 5 | 18 |
| Creator | 61 | 10 | 38 |
| Pro | 93 | 16 | 58 |
| Studio | 125 | 21 | 78 |

These are category maximums, not bundled promises. A user can spend the same balance across categories.

## Why competitor credits are not directly comparable

A competitor credit/token is not equivalent to a Prompt Credit.

Different platforms:

- assign different token costs per model,
- subsidize some models,
- include relaxed/unlimited modes,
- expire or roll over credits differently,
- specialize in one category,
- bundle stock libraries or Adobe applications,
- use different resolutions and durations.

Do not write marketing or UI copy that says Prompt Studio is cheaper or more generous solely because of the raw credit count.

Normalize comparisons around:

- monthly price,
- concrete image output,
- concrete video duration/model,
- output quality/resolution,
- rollover/expiry,
- included non-generation features,
- whether the same balance covers other product categories.

## Competitive benchmark reference

Competitive pricing changes frequently. Treat this section as a dated benchmark, not a permanent pricing contract.

### Leonardo.Ai

Typical comparison dimensions:

- strong image-generation volume,
- token costs vary by model,
- some plans include rollover/token bank behavior,
- selected plans/modes may offer relaxed image generation.

Reference products used in analysis:

- Alchemy V2 image generation,
- Kling video options,
- Veo options.

Product implication: Leonardo can outperform Prompt Studio on raw image count. Prompt Studio should not position itself as an image-only credit competitor.

Official pricing: https://www.leonardo.ai/pricing/

### Runway

Runway is a strong video benchmark.

Comparison dimensions:

- monthly credit allocation,
- credit cost per video model/second,
- Gen image models,
- specialized video editing/generation workflows.

Product implication: do not promise that Prompt Studio is always cheaper per video. Prompt Studio's value is multi-provider routing and one wallet across categories.

Official pricing: https://runway.com/pricing

### Freepik / Magnific

Freepik can combine:

- AI image generation,
- AI video,
- stock content,
- selected unlimited/relaxed model access,
- large annual credit allocations.

Product implication: Freepik is a bundle benchmark, not only a model-cost benchmark.

Official pricing: https://www.freepik.com/pricing

### Adobe Firefly

Adobe plans can include:

- premium generative credits,
- unlimited standard image generations on eligible paid plans,
- Adobe ecosystem integration.

Product implication: a pure image-count comparison can make Prompt Studio look expensive even when the product scope is different.

Official pricing: https://www.adobe.com/products/firefly/plans.html

## Prompt Studio positioning

Prompt Studio should compete on **cross-category utility**, not raw credit count.

The same Prompt Credit balance can fund:

- text generation,
- prompt optimization,
- image generation,
- video generation,
- website generation,
- AI website edits,
- component generation/modification,
- code audits.

This is the core differentiation to preserve in product design and pricing communication.

A useful answer to:

> “Why do I get fewer credits than Leonardo?”

is:

> Credits are not equivalent across platforms. Prompt Studio credits represent a shared balance that can be spent across images, video, text, websites, code and other AI tools, while each operation is priced against provider cost and margin requirements.

Do not claim that Prompt Studio is universally “better” or “cheaper.” Compare concrete workflows.

## Product-development implications

Future development should favor:

1. **Transparent estimates before generation.**
   Show the user the expected Prompt Credit cost before a paid operation.

2. **Provider abstraction.**
   Keep the user balance independent from Gemini, OpenAI, Runway, or another provider.

3. **Cost-aware routing.**
   Route to providers/models only when quality and economics satisfy the operation contract.

4. **One wallet across product categories.**
   Avoid separate image/video/web credit currencies.

5. **No accidental subsidy.**
   New models should remain disabled or fail closed until provider pricing is verified.

6. **Competitive UX, not only competitive pricing.**
   A unified workflow can be more valuable than maximizing raw image count.

7. **Top-ups after campaign activation.**
   Users who exhaust credits should be able to buy more without changing plans.

## Financial reference

Planning models created in October 2026 used:

- $0.01 Prompt Credit commercial floor,
- 25% provider reserve,
- 15% platform/infrastructure reserve,
- 10% payment/refund/risk reserve,
- 50% target minimum contribution margin.

A $25,000 crowdfunding scenario should be evaluated under both expected utilization and 100% redemption. Do not treat unredeemed Founder Credits as guaranteed profit.

Actual profitability must use real invoices and provider billing exports when available.

See also:

- [INFRASTRUCTURE_COST_AUDIT.md](INFRASTRUCTURE_COST_AUDIT.md)
- [AI_UNIT_ECONOMICS_AND_CREDITS.md](AI_UNIT_ECONOMICS_AND_CREDITS.md)

## Documentation maintenance

When any of the following changes, update this document:

- plan prices,
- plan credit allocations,
- Founder reward tiers,
- campaign duration/activation rules,
- operation credit costs,
- top-up prices,
- competitive benchmark assumptions,
- positioning claims.

Competitive prices should always be dated or re-verified before being used in public copy.
