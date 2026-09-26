# Rarity quality gate rerun

Issue: [#31](https://github.com/jggjosue/prompt-studio/issues/31)
Required external score: **71 or higher**

## Purpose

This rerun validates the repository after the differentiation work landed. It keeps the external Rarity score separate from repository-owned evidence: `npm run rarity:verify` proves that each claimed custom subsystem is implemented, exercised by a product workflow, tested, and documented. The authoritative numeric score must come from the external Rarity QC run attached to the pull request.

## Differentiation evidence

| Subsystem | Implementation | Product workflow | Verification | Documentation |
| --- | --- | --- | --- | --- |
| Domain architecture | `src/domain/architecture.ts` | `src/app/api/search/intent/route.ts` | `tests/unit/domain-architecture.test.ts` | `docs/prompt-studio-domain-architecture.md` |
| B+-tree catalog index | `src/domain/catalog-search/catalog-index-service.ts` | `src/domain/catalog-search/discover-and-rank.ts` | `tests/unit/bplus-catalog-index.test.ts` | `docs/bplus-catalog-index.md` |
| Bilingual copy quality | `src/domain/quality/copy-quality-engine.ts` | `src/app/api/landing-pages/[pageId]/readability/route.ts` | `tests/unit/copy-quality-engine.test.ts` | `docs/bilingual-copy-quality.md` |
| Verifiable Refactory runtime | `src/domain/refactory-runtime/verified-bundle-runtime.ts` | `src/app/api/refactory-online/[slug]/route.ts` | `tests/integration/refactory-runtime.test.ts` | `docs/refactory-verifiable-runtime.md` |

The evidence corresponds to issues #20, #22, #23, and #24. It is functional differentiation rather than cosmetic renaming.

## Repository integrity

- The gate scans current product entry points for obsolete starter-template markers.
- Existing license, attribution, authorship, and Git history remain unchanged.
- The verifier does not delete legitimate metadata or manufacture an internal substitute for the external score.

## Reproduction

```bash
npm run rarity:verify
node --import tsx --test tests/unit/domain-architecture.test.ts tests/unit/bplus-catalog-index.test.ts tests/unit/copy-quality-engine.test.ts tests/unit/refactory-bundle-contract.test.ts tests/integration/refactory-runtime.test.ts
```

## External result

Record the authoritative Rarity QC result in the pull request after rerunning it against this revision. The issue can be closed only when the recorded score is at least 71, `passed` is `true`, and no reject verdict ceiling is applied.
