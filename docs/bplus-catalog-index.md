# B+-tree catalog index architecture

Prompt Studio's in-memory catalog is static/manifest-backed, while mutable transactional records remain in MongoDB. The custom B+-tree is authoritative for **candidate narrowing inside the loaded catalog snapshot**; Mongo remains authoritative for persisted mutable data.

## Lifecycle

`CatalogIndexService` owns build/rebuild, update, lookup, invalidation and diagnostics. A build tokenizes title, description, tags and stack into the existing B+-tree posting index. Rebuild replaces the snapshot deterministically. Invalidation discards both index and snapshot. Catalogs below `CATALOG_INDEX_MIN_ITEMS` deliberately fall back to direct scoring.

The production `discover-and-rank` workflow now asks the B+-tree index for candidates before intent/fuzzy ranking. If the index cannot produce candidates, the workflow falls back to the full catalog so recall is preserved.

Persistence is intentionally **rebuild from the canonical catalog snapshot**, not serialization of internal tree nodes. This prevents stale node topology from becoming a second source of truth.

## Search modes

Exact token and prefix candidate lookup use the B+-tree. Inclusive range behavior is tested at the tree contract. Rich filtering and ranking remain a second phase because intent, fuzzy similarity, engagement and budget signals are not simple lexicographic keys. Pagination remains keyset/manifest based after filtering/ranking.

## Diagnostics

The service exposes only aggregate operational values: generation, item/token counts, indexed state, lookup/hit/fallback counts and last build duration. It exposes no query text, user identity, catalog descriptions or credentials.

## Benchmarks

Run `npm run benchmark:catalog-index`. The benchmark builds realistic synthetic catalogs at 100, 1,000 and 10,000 items, then compares 200 linear scans with 200 B+-tree lookups and reports build cost plus an approximate lookup break-even point. Results are intentionally generated on the executing machine rather than committing invented timing numbers.

The index is useful when a catalog is large enough and receives repeated prefix/token lookups. Tiny catalogs or one-off scans may be faster without construction overhead; the minimum-item threshold and fallback preserve that case.
