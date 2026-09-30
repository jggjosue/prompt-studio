# Prompt Studio — Domain Commerce Architecture

## Goal
Allow users to search, buy, connect, renew and manage domains from the Website Builder while keeping domain economics separate from AI credits.

## User flow
Create website → Publish → search domain → availability/price check → Stripe checkout → payment confirmation → final availability/price check → registrar registration → DNS configuration → attach site → SSL/status → renewals.

## Provider abstraction
Implement a `DomainProvider` abstraction rather than coupling business logic to one registrar. Required capabilities should include search/check availability, live registration/renewal price, register, status, renew and supported transfer/contact operations.

Cloudflare Registrar API can be evaluated because Cloudflare already participates in the stack, but commercial resale/markup terms and API availability must be verified before committing the business model. A reseller-focused registrar can be used if required.

## Financial model
Domains are COGS, not fixed infrastructure.

Retail price = live registrar cost + Prompt Studio margin + payment-cost allowance.

Never hardcode a universal TLD price. Registration and renewal prices may differ and premium domains can be expensive.

## Payment and idempotency
Domain purchase uses Stripe as a separate transaction from subscriptions and AI credit packs. AI credits cannot buy domains.

Registration must be idempotent. If Stripe succeeds and the registrar request times out, first reconcile registrar state before retrying; never blindly issue a second registration.

## Data
Store domainName, siteId, userId, provider, provider domain ID, registration/renewal costs, retail prices, currency, registeredAt, expiresAt, autoRenew, status and registrant/contact references. Sensitive registrant data must be minimized and protected.

## Product strategy
Free sites can use a Prompt Studio subdomain. Paid plans can connect custom domains. Annual paid plans may include a standard-cost domain only under a defined wholesale-cost ceiling; premium domains remain separately priced.
