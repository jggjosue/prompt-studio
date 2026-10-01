# Product, AI, revenue and operations dashboards

Issue #242 consolidates the four decision domains in the existing admin observability dashboard instead of creating disconnected mock dashboards.

- **Product:** canonical analytics event counts for the selected 1/7/30-day window.
- **AI:** provider/model jobs, failures, latency, credits and recorded provider cost.
- **Revenue:** confirmed `purchase` events only, grouped by product category and currency. Browser success redirects are not revenue.
- **Operations:** route performance/conversion signals plus grouped operational failures.

The API remains authenticated and restricted through the existing `isPremiumJoAdmin()` authorization boundary. Responses remain private/no-store.

## Empty/loading/error/responsive behavior

The client retains explicit loading and error states. Every table has an empty-state row and horizontal overflow for narrow screens; summary cards use responsive grids.

## Data quality

Dashboards intentionally display recorded telemetry rather than fabricated targets. Revenue is not converted across currencies; each currency is shown separately. AI cost is based on recorded cost fields and therefore can be incomplete when a provider has not supplied actual cost.

## Rollback

The change only adds aggregations and presentation to the existing observability endpoint/dashboard. Removing the new product/revenue/model-health sections restores the previous view without changing event ingestion.
