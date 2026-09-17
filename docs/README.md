# Prompt Studio

Web platform to discover, customize, and generate creative AI resources: images, videos, prompts, components, and landing pages.

The application is built with Next.js App Router and uses **Clerk** for authentication. It does not use Kinde.

## Requirements

- Node.js 22.11.0 or a compatible Node 22 version
- npm
- A Clerk application for development
- MongoDB for features that persist users, purchases, activity, and generations

The repository includes `.nvmrc` and `.node-version`. With `nvm`:

```bash
nvm use
```

Installation automatically stops if run with an incompatible Node version.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local configuration from the versioned template:

   ```bash
   cp .env.example .env.local
   ```

3. Configure at least the Clerk development credentials:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_publishable_key
   CLERK_SECRET_KEY=tu_clerk_secret
   ```

4. Add `MONGODB_URI` and the credentials for the services you plan to use. The full list, with comments and safe example values, is in `.env.example`.

5. Start the server:

   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3046](http://localhost:3046).

## Authentication with Clerk

The default routes are:

- Sign in: `/sign-in`
- Sign up: `/sign-up`
- Redirect after sign in: `/dashboard`
- Redirect after sign up: `/prices`

These routes can be modified using the `NEXT_PUBLIC_CLERK_*` variables documented in `.env.example`.

To synchronize users, configure a Clerk webhook directed to:

```text
https://your-domain.com/api/webhooks/clerk
```

Save its signing secret in `CLERK_WEBHOOK_SECRET`. Before deploying, you can verify the keys with:

```bash
npm run verify:clerk
npm run verify:clerk:prod
```

Production validation requires `pk_live_*` and `sk_live_*` keys.

## Environment Variables

Do not copy secrets into the README or `.env.example`. Use `.env.local` during development and the platform's secret manager during deployment.

Variables are grouped in `.env.example` by integration:

- AI providers: OpenAI, Anthropic, Gemini, Veo, Runway, Fal, and others
- Authentication: Clerk
- Payments: Stripe
- Persistence: MongoDB
- Files: Cloudflare R2
- Email: Resend
- Analytics: Firebase and Vercel services
- Infrastructure: cache, rate limiting, CSP, and internal jobs

AI provider keys are private and must not carry the `NEXT_PUBLIC_` prefix.

Verify that the template does not contain real secrets with:

```bash
npm run verify:env-example
npm run verify:rotation
```

## Main Services

| Service | Responsibility |
| --- | --- |
| Clerk | User sessions, profiles, and webhooks |
| MongoDB + Mongoose | Application data, purchases, affiliates, and AI jobs |
| Stripe | Subscriptions, purchases, invoices, and payment webhooks |
| Cloudflare R2 | Demos, downloads, and private catalogs |
| Resend | Transactional email and contact synchronization |
| Genkit and AI providers | Image, video, text, and code generation |

## Persistence

The connection is configured via `MONGODB_URI`. Actual collection names are declared by the schemas in `src/models`; do not maintain a second manual list in this document.

Main data areas:

- user profiles and preferences;
- AI generation jobs, credits, and feedback;
- purchases and saved items;
- activity and observability;
- affiliate applications, sales, and statistics.

Some legacy models share the `user_profiles` collection. Before modifying it, review `NewUser`, `RegisteredUser`, and `UserProfile` in `src/models` and the corresponding synchronization routes.

## Development Commands

| Command | Usage |
| --- | --- |
| `npm run dev` | Next.js server with Turbopack on port 3046 |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests and data validation |
| `npm run test:e2e` | Browser tests with Playwright |
| `npm run test:ci` | Main validations executed in CI |
| `npm run build` | Catalogs, production build, and asset optimization |
| `npm run analyze:routes` | Analysis of JavaScript associated with routes |
| `npm run genkit:dev` | Genkit local environment |

Before opening a pull request, run:

```bash
npm run test:ci
```

When the change affects navigation, interface, or performance, also run:

```bash
npm run test:e2e
```

## Project Structure

```text
src/app/          Routes, pages, server actions, and API handlers
src/components/   Shared UI components
src/hooks/        Reusable client state and behavior
src/lib/          Integrations, catalogs, and domain logic
src/models/       MongoDB/Mongoose schemas
src/ai/           Genkit configuration and flows
public/           Public assets and derived catalogs
scripts/          Audits, synchronization, builds, and checks
tests/            Unit, data, and end-to-end tests
docs/             Specific operational documentation
```

## Technical Capabilities

The documentation for the application —Coding/SWE, applied ML evaluation, Technical PM, Computer Use, MCP, Cybersecurity, enterprise tools, STEM QA, synthetic content, scraping, and Quant Trading— is centralized in [docs/capabilities](capabilities/README.md).

Each spec sheet separates evidence, verification commands, and limits. Areas that are not yet part of the product are explicitly identified to avoid claims that the repository cannot demonstrate.

## Operational Data Licensing

The proposal for preparing and licensing authorized, anonymized copies of tickets, conversations, documents, and code is documented in [docs/data-licensing](data-licensing/README.md).

This is a proposed product line, not an available capability or revenue promise. The documentation covers product flow, consent and rights, sensitive data exclusions, anonymization, quality control, license terms, traceability, and compensation.

## Organizational Scaling

The plan to evolve the product and the company from a founder core up to scenarios of 10, 20, 30, and 50 people is in [docs/escalamiento](escalamiento/README.md). It includes teams, org charts, supervised agents, engineering, infrastructure, security, operations, metrics, costs, and explicit hiring conditions.

## CRM Strategy

The de facto CRM audit, comparison of alternatives, and proposed HubSpot plan are in [docs/crm](crm/README.md). The design keeps Clerk, MongoDB, and Stripe as authoritative systems and uses the CRM for sales, onboarding, support, and expansion.

## Sensitive Integrations

- `/api/webhooks/clerk` validates Clerk events before syncing profiles.
- `/api/webhooks/stripe` validates the Stripe signature and updates purchases or subscriptions.
- Routes matching `/api/sync-*` require `CRON_SECRET` or an authorized administrative session.
- Pricing, credit costs, and permissions are determined on the server.
- Catalogs or paid products must not be published directly under `public/`.

## Continuous Integration

The GitHub Actions workflow uses the version declared in `.nvmrc` and executes two jobs:

1. Installation, environment validation, TypeScript, tests, and cache audit.
2. End-to-end tests with Chromium.

For deployed browser tests, `PLAYWRIGHT_BASE_URL` can be configured as a repository variable.

## Deployment

Before publishing:

1. Use production Clerk keys and register the domain in its dashboard.
2. Configure Clerk and Stripe webhooks with production URLs.
3. Add all required variables in the hosting secret manager.
4. Run `npm run verify:clerk:prod` and `npm run test:ci`.
5. Run `npm run build` with Node 22.

Do not reuse development credentials in production or expose secrets via `NEXT_PUBLIC_*` variables.