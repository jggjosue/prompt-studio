# Verifiable Refactory micro-site runtime

Refactory bundles use a versioned, content-addressed contract defined in `src/domain/refactory-runtime/bundle-contract.ts`.

## Contract and reproducibility

Schema version 1 requires an HTML `index.html` entrypoint and records every served text asset with its SHA-256 digest, byte size and media type. The bundle ID is derived from sorted asset paths/digests plus provenance, so identical inputs produce the same ID regardless of object enumeration order. Internal runtime topology is not persisted as authority.

## Resolution

`resolveVerifiedRefactoryBundle` resolves local content first and R2 second. Both sources are normalized to the same file map, manifested and integrity-validated before the API returns them. Resolution exposes explicit `ready`, `not-found`, and `invalid` states. Missing entrypoints, missing assets, hash mismatches, unsupported schemas and unsafe paths fail closed.

## Provenance

The manifest can bind a bundle to generation job ID, provider, model ID, prompt-version ID, prompt hash and generation timestamp. These fields correspond to metadata already represented by Prompt Studio AI generation jobs. Callers that have a generation job should supply that provenance when constructing the verified bundle.

## Sandbox boundary

The API returns a restrictive rendering policy: sandboxed scripts without same-origin privilege, no ambient Permissions Policy capabilities, no referrer, and CSP denying network connections, framing, base changes and form submission. A consuming iframe must apply these returned restrictions; returning the policy does not by itself sandbox arbitrary HTML elsewhere in the product.

## R2

R2 remains optional. When configured, the resolver uses the existing validated R2 project-folder path and reads the same HTML/CSS/JS contract. Local and R2 payloads therefore share integrity and rendering semantics.

## Tests

Unit tests cover content-address reproducibility, tampering, missing entrypoints, traversal rejection, provenance and sandbox policy. The integration contract fixture exercises representative local and R2-shaped payloads through build, serialization/load, validation and entrypoint rendering. Live Cloudflare credentials are intentionally not required by the deterministic test suite.
