# Prompt Studio domain architecture

Prompt Studio is organized around seven product subsystems rather than framework routes. Next.js routes, Clerk authentication, Mongo persistence, and Stripe billing are adapters around these boundaries.

| Subsystem | Ownership | Repository-specific responsibility |
| --- | --- | --- |
| Catalog & search | `catalog-search` | Intent facets, fuzzy matching, catalog ranking, provenance/facets |
| Generation orchestration | `generation-orchestration` | Provider adapters, batch generation, pricing, quality feedback |
| Visual editor | `visual-editor` | Document model, constraints, drag/history, serialization, prompt-aware editing |
| AI webpage / Refactory runtime | `refactory-runtime` | Reproducible webpage bundles and online runtime |
| Quality/readability intelligence | `quality-intelligence` | Spanish/English readability, publication quality, prompt evaluation |
| Creator marketplace | `creator-marketplace` | Creator assets, marketplace policy and delivery |
| Credits & commerce | `credits-commerce` | Model allowlists, cost-to-credit policy, top-ups and charging |

The machine-readable ownership/dependency contract lives in `src/domain/architecture.ts`.

## End-to-end custom workflows

### Discover and rank

`src/domain/catalog-search/discover-and-rank.ts` combines Prompt Studio intent extraction, normalized keyword overlap, fuzzy field matching and budget constraints. `/api/search/intent` is now a transport adapter: it authenticates/rate-limits HTTP input, obtains catalog records and delegates ranking to the domain workflow.

### Evaluate a generation

`src/domain/quality/evaluate-generation.ts` composes the bilingual Flesch/Fernández-Huerta readability engine with Prompt Studio version evaluation signals (quality, fidelity, cost, latency and creator feedback). The resulting release signal is domain behavior reusable outside an HTTP controller.

### Quote a generation

`src/domain/generation/quote-generation.ts` composes the model allowlist/cost estimator with generation experience policy: credits, expected provider duration, output expectations and refund behavior. This keeps product economics out of generic CRUD code.

## Boundary rules

Catalog/search may consume quality intelligence but not commerce internals. Generation may consume credits/commerce and quality intelligence. Refactory may consume quality intelligence. Marketplace may consume credits/commerce and quality intelligence. Editor, quality and credits/commerce are independent roots.

New domain behavior belongs under `src/domain/<subsystem>` or an explicitly registered subsystem root. API routes should parse/authenticate/serialize and call domain services rather than reimplement ranking, evaluation, pricing or editor algorithms.

`tests/unit/domain-architecture.test.ts` verifies ownership and a real catalog workflow contract. `npm run architecture:check` verifies that the subsystem registry retains owners, roots and dependency rules.
