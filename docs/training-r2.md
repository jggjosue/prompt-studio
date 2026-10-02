# Prompt Studio training data on Cloudflare R2

The canonical training-data bucket is private. Production uses a dedicated bucket and dedicated R2 Object Read & Write credentials scoped only to that bucket.

Required production environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_TRAINING_BUCKET` (recommended value: `prompt-studio-ml`)
- `R2_TRAINING_ACCESS_KEY_ID`
- `R2_TRAINING_SECRET_ACCESS_KEY`

Do not reuse browser/public credentials and do not prefix any secret with `NEXT_PUBLIC_`.

Logical key prefixes are `raw/`, `assets/`, `processed/`, `datasets/`, `manifests/`, and `rejected/`. R2 is flat object storage; these are key prefixes rather than physical folders.

## Provisioning

1. Create a private R2 bucket in Cloudflare.
2. Create an R2 Object Read & Write token scoped to that bucket only.
3. Add the four variables above to Vercel Production (and separate credentials/bucket for Preview if enabled).
4. Run `npm run verify:r2:training` in an environment containing the credentials.
5. Keep public access disabled. Dataset workers and training jobs access objects server-side through the S3-compatible endpoint.
6. Do not configure CORS unless a future feature intentionally performs browser-to-R2 access with presigned URLs.

## Retention

Do not set automatic expiration on `datasets/` or `manifests/`: released dataset versions are immutable and needed for reproducibility. Lifecycle rules for temporary/raw material must be introduced only with an explicit retention policy; do not silently delete user-origin data before revocation/audit requirements are defined.

## Credential rotation

Create a second bucket-scoped credential, deploy it, verify access, then revoke the old credential. Never commit credentials to Git.

## Production close checklist (#1076)

Do not close #1076 from an authenticated S3 check alone. Record only non-secret evidence for each item:

- [ ] Dedicated training bucket exists in the intended production Cloudflare account.
- [ ] R2.dev public development URL is disabled for the training bucket.
- [ ] No public custom domain exposes the training bucket.
- [ ] Runtime credential is Object Read & Write and scoped only to the training bucket.
- [ ] Production runtime contains the four server-only training R2 variables; none use NEXT_PUBLIC_.
- [ ] `npm run verify:r2:training` succeeds in the production runtime and reports `authenticatedAccessVerified: true` for all six prefixes.
- [ ] CORS is absent unless an explicitly reviewed browser-to-R2 feature requires it.
- [ ] Released `datasets/` and `manifests/` have no automatic expiration; raw/temporary retention follows an approved policy.
- [ ] A credential-rotation owner/process exists and the old token is revoked after successful rotation.

The verifier intentionally reports `publicAccessVerified: false`. Public-access configuration must be checked through Cloudflare account configuration or a future management API integration; it is not inferred from successful authenticated S3 calls.

## Deployment status

Production deployment configuration is expected to provide the four training R2 variables through Vercel server-only environment variables. Repository files intentionally contain no credential values. The operator has confirmed the variables are configured in the Prompt Studio Vercel project; this statement records configuration intent only and does not expose or independently attest secret values.

Before any training release, run `npm run verify:r2:training` in the production runtime. Public-access controls (`r2.dev` and custom domains) remain Cloudflare account controls and must not be inferred from Vercel environment-variable presence or authenticated S3 access.
