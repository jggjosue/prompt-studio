# Visual Editor and UI Components Playbook

Use this playbook when adding an editor component, changing the document schema, undo/redo, drag-and-drop, design tokens, autosave, or project persistence.

## Architecture

```mermaid
flowchart LR
    R[registry.ts] --> D[document.ts]
    D --> S[store.ts]
    H[history.ts] --> S
    T[tokens.ts] --> S
    G[drag.ts] --> S
    S --> U[src/components/editor]
    S --> A[/api/editor/projects]
    A --> M[EditorProject]
```

- Component definitions and parent/child rules: [`registry.ts`](../../src/lib/editor/registry.ts)
- Normalized tree, schema version, and breakpoints: [`document.ts`](../../src/lib/editor/document.ts)
- Reactive state slices and commands: [`store.ts`](../../src/lib/editor/store.ts)
- Undo/redo behavior: [`history.ts`](../../src/lib/editor/history.ts)
- Tokens and length parsing: [`tokens.ts`](../../src/lib/editor/tokens.ts)
- Drag payloads and drop positions: [`drag.ts`](../../src/lib/editor/drag.ts)
- Editor UI: [`src/components/editor`](../../src/components/editor/)
- Persistence API and access gate: [`/api/editor/projects`](../../src/app/api/editor/projects/route.ts)
- Stored schema and limits: [`EditorProject.ts`](../../src/models/EditorProject.ts)

## Invariants

1. Persist the component tree, not generated HTML.
2. Every document root exists in `nodes`; node count cannot exceed 2,000.
3. A project query/update/delete always includes the authenticated `userId`.
4. Autosave does not create snapshots; explicit snapshots retain at most 20 versions.
5. A new component declares defaults, category, allowed children, and rendering behavior.
6. State mutations that affect the document participate in undo/redo.

## Safe change procedure

1. Register the component and nesting rules.
2. Add or adapt its renderer and inspector controls under [`src/components/editor`](../../src/components/editor/).
3. Make the change serializable in the normalized document.
4. Add a migration path before incrementing `SCHEMA_VERSION`.
5. Verify keyboard access, selection, drag/drop, undo/redo, autosave, and reload.

## Verification

```bash
node --import tsx --test tests/unit/editor-core.test.ts
node --import tsx --test tests/unit/editor-ui-contracts.test.ts
npm run typecheck
```

