# Vercel deployment retention verification

Issue: #698

## Verification result

The Vercel connection available during this audit exposes the team `Mazgin` (`magzin-projects`) and nine projects. None is named `prompt-studio`.

Because the production Prompt Studio project is not visible through the available Vercel connection, no retention policy or branch alias was changed. Applying retention settings to an unverified project could remove rollback history for an unrelated application.

## Intended policy once the production project is accessible

- Use the shortest supported retention for canceled and errored preview deployments.
- Keep preview retention short enough to control storage while retaining active review deployments.
- Preserve sufficient production history for safe rollback.
- Remove stale branch aliases only after confirming they are not active or externally referenced.
- Re-check deployment storage after Vercel's cleanup cycle and record the before/after result.

Vercel's current CLI supports displaying deployment expiration under project retention policies with `vercel list --policy ...`, which can be used during the follow-up verification.

## Current status

Repository-side verification is complete. The account-level configuration and post-cleanup storage measurement require access to the Vercel team/project that actually serves Prompt Studio. No production relink, migration, retention mutation, alias removal, or deployment deletion was performed during this audit.
