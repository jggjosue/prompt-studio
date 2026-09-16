# Snapshot gradability remediation

This document tracks the repository-side requirements for making quality snapshots fully gradable.

## Current blockers

The evaluator reports six metrics as not gradable for three reasons:

1. Too little source can be read for **Churn × complexity**, **Code complexity**, and **Documentation**.
2. **Commit density** and **Pull request density** have not been measured for the snapshot.
3. **Test coverage** has no coverage report inside the evaluated archive.

## Repository requirements

### Source readability

The snapshot/archive must contain the real text source required for static analysis. Generated, compressed, minified, binary and dependency surfaces should not replace application source. At minimum, preserve the relevant `src/`, tests, documentation, package metadata and GitHub workflow/configuration files in readable form.

A preflight check should fail snapshot creation when expected source directories are absent, source counts collapse unexpectedly, or application source is represented only by opaque/compressed artifacts.

### Coverage

`npm run test:coverage` generates `coverage/lcov.info`. The snapshot packaging step must run coverage before packaging and include `coverage/lcov.info` in the final archive. CI should verify that the file exists, is non-empty and contains `SF:`, `LF:` and `LH:` records before publishing the snapshot.

### Repository-history metrics

Commit-density and pull-request-density measurements depend on repository history/metadata rather than application runtime behavior. Snapshot generation should preserve or export the supported metadata required by the evaluator instead of constructing a source-only archive that loses history context.

### Validation

Before publishing a snapshot, CI should verify:

- application source is present and readable;
- documentation files are present and readable;
- `coverage/lcov.info` exists and is non-empty;
- required repository-history metadata is available to the snapshot/evaluator;
- the archive can be extracted and its expected paths enumerated;
- no required analysis input is replaced by an unsupported opaque file.

After these checks pass, create a fresh snapshot and confirm all six metrics are gradable.