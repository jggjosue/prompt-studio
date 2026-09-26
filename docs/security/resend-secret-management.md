# Resend secret management

Resend is a server-only integration. `RESEND_API_KEY` must exist only in the deployment provider's encrypted environment store and must never use a `NEXT_PUBLIC_` prefix.

## Environment separation

Create a different, domain-scoped Resend key for each deployment boundary:

- **Development:** local development and test recipients only.
- **Preview:** Vercel Preview deployments, using a non-production key.
- **Production:** Production deployments only, restricted to the verified sending domain.

Use the same variable name (`RESEND_API_KEY`) with a different encrypted value in each Vercel environment. `RESEND_EMAIL` should also identify an approved sender for that environment.

## Rotation procedure

1. Create a replacement domain-scoped key in Resend.
2. Set it in the corresponding Vercel environment without exposing it in a terminal transcript, issue, commit, or pull request.
3. Redeploy that environment and verify one transactional message plus one contact sync.
4. Revoke the previous key only after the replacement is verified.
5. Repeat separately for Development, Preview, and Production.

Creating or revoking credentials is an account-level operation and is intentionally not automated by repository code.

## Logging and responses

Email addresses, provider error bodies, API keys, audience identifiers, and full message payloads must not be logged or returned by synchronization endpoints. Operational responses expose counts and stable error codes only.

Run the repository guard with:

```bash
npm run verify:resend-secrets
```
