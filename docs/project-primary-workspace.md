# Project-first workspace

Prompt Studio treats `/dashboard/projects` as the authenticated workspace entry point. Sign-in and account links land there, and Projects is the first navigation item on desktop and mobile for every authenticated user.

## Behavior

- The project list is loaded from the authenticated `/api/projects` endpoint.
- A `?project=<id>` deep link opens that accessible project; otherwise the first active project is selected.
- Empty accounts keep the existing create-project state instead of creating data implicitly.
- Route-level loading and recoverable error states cover slow or failed server rendering.
- Project mutations continue through `/api/projects/[id]`, where owner/editor/reviewer permissions are enforced server-side.
- Expensive generations no longer accept a client-provided approval flag. They
  require the project to be in `approved` or `published`, with no open change
  requests; those transitions are authorized in
  `/api/projects/[id]/collaboration`.
- Publishing a project-linked result is treated as sensitive and applies the
  same human-verification gate. A blocked check returns HTTP 409 and emits the
  sanitized `human_verification_blocked` observability event.

## Rollback

Revert the navigation and sign-in destinations to `/dashboard`. Project records and APIs are unchanged, so rollback does not require a data migration.

## Observability

Project creation and brief-completion events remain recorded by the project funnel. Navigation does not emit a second event, avoiding duplicate funnel counts.
