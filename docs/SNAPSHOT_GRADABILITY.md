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

#### Supported measurement path

The evaluator measures commit/PR density through the **GitHub repository connection**: real commit history and real pull requests read from the repository itself, not from a custom archive format. The repository therefore guarantees, at snapshot time:

- **Identidad y revisión correctas.** El snapshot queda asociado al repositorio real (`remote origin`) y a la revisión exacta (`HEAD`). `EXPECTED_REPOSITORY` y `EXPECTED_REVISION` pinzan esa asociación cuando se quiere verificar contra un valor conocido.
- **Historia real no seccionada.** El empaquetado no debe clonar con `--depth` ni despojar `.git`: sin historia alcanzable, commit density no es medible. `actions/checkout` dentro del pipeline usa `fetch-depth: 0`.
- **Nunca se sintetiza historia.** No se generan commits ni PRs ficticios para inflar las métricas.

Comandos disponibles:

```bash
npm run snapshot:history          # exporta reports/snapshot/history.json (solo registros reales)
npm run snapshot:verify-history   # falla si identidad/historia estan seccionadas o son incorrectas
```

`npm run snapshot:history` escribe `reports/snapshot/history.json` con la revisión (`HEAD`, rama, remoto), estadísticas reales de commits (`git rev-list`/`git log`: total, autores, días activos, distribución por día) y, si hay `GH_TOKEN`/`GITHUB_TOKEN`, totales reales de pull requests vía GitHub API. Sin token, la sección de PRs queda marcada como `available: false` con el motivo; nunca se rellena con datos inventados.

`npm run snapshot:verify-history` es el guardarraíl: falla (exit 1) si no hay remote `origin`, si el historial es shallow (salvo `SNAPSHOT_ALLOW_SHALLOW=1`), si no hay commits reales, o si `EXPECTED_REPOSITORY`/`EXPECTED_REVISION` no coinciden con el repositorio/revisión actuales.

### Validation

Before publishing a snapshot, CI should verify:

- application source is present and readable;
- documentation files are present and readable;
- `coverage/lcov.info` exists and is non-empty;
- required repository-history metadata is available to the snapshot/evaluator;
- the archive can be extracted and its expected paths enumerated;
- no required analysis input is replaced by an unsupported opaque file.

The `Snapshot History` workflow ([`.github/workflows/snapshot-history.yml`](../.github/workflows/snapshot-history.yml)) checks out with full history and runs `snapshot:verify-history` plus `snapshot:history` on every push and pull request; the manifest is published as an artifact for the packaging step.

After these checks pass, create a fresh snapshot and confirm all six metrics are gradable.