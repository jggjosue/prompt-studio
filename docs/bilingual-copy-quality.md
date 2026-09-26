# Bilingual copy quality engine

Prompt Studio turns the existing readability formulas into a product quality service in `src/domain/quality/copy-quality-engine.ts`.

## Language

Callers may provide `en` or `es`. When omitted, deterministic stopword/function-word evidence selects Spanish or English. Detection is deliberately narrow: mixed-language, very short and specialized copy can be misclassified, so product flows that already know the locale should pass it explicitly.

## Formulas

The underlying analyzer uses Flesch Reading Ease for English and Fernández-Huerta for Spanish. Both depend on sentence length and estimated syllable density. Syllables are heuristic rather than dictionary/phonetic counts, so proper names, abbreviations and multilingual phrases can distort the result.

The quality engine normalizes five explainable 0–100 sub-scores:

- reading ease;
- sentence length;
- syllable density/lexical complexity;
- heading structure;
- keyword focus/density.

Their mean becomes the product quality score. Bands are `publish-ready >= 75`, `review >= 55`, otherwise `rewrite`. Each result retains the complete readability report plus explanations and actionable suggestion codes.

## Product integration

`publication-copy-gate.ts` converts the quality band into `allow`, `review`, or `block`. The authenticated landing readability POST endpoint now runs this gate and returns both the persisted readability snapshot and the quality/publishing decision. This makes readability affect a real pre-publication workflow rather than only displaying a metric.

Generation/optimization flows can call `compareCopyQuality` with original and revised copy. It returns both reports, an exact score delta and whether the revision improved the normalized quality score.

## Golden corpus

`tests/fixtures/readability-golden.v1.json` contains English and Spanish simple/complex fixtures. Tests verify deterministic locale handling, score bands, explainable sub-scores, before/after deltas and publication decisions.

## Limitations

Readability is not factuality, persuasion quality, accessibility compliance or brand correctness. A high score must not bypass publication security/license checks. The engine is an explainable copy-quality signal to combine with Prompt Studio's broader publication-quality system.
