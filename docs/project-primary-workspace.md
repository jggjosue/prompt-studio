# Project-first workspace

Prompt Studio treats `/dashboard/projects` as the authenticated workspace entry point. Sign-in and account links land there, and Projects is the first navigation item on desktop and mobile for every authenticated user.

## Behavior

- The project list is loaded from the authenticated `/api/projects` endpoint.
- A `?project=<id>` deep link opens that accessible project; otherwise the first active project is selected.
- Empty accounts keep the existing create-project state instead of creating data implicitly.
- Route-level loading and recoverable error states cover slow or failed server rendering.
- Project mutations continue through `/api/projects/[id]`, where owner/editor/reviewer permissions are enforced server-side.

## Rollback

Revert the navigation and sign-in destinations to `/dashboard`. Project records and APIs are unchanged, so rollback does not require a data migration.

## Observability

Project creation and brief-completion events remain recorded by the project funnel. Navigation does not emit a second event, avoiding duplicate funnel counts.
