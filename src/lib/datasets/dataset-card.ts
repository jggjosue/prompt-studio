import type { DatasetName } from '@/lib/dataset-object-contract';

const DESCRIPTIONS: Record<DatasetName, { summary: string; fields: string }> = {
  'prompt-enhancement': {
    summary: 'Pairs of a user intent and the improved prompt that replaced it: the output of the Prompt Studio prompt optimizer, or a prompt the user rewrote and then kept.',
    fields: '`originalIntent`, `improvedPrompt`, `modality`, `quality`, `provenance`, `splitGroupId`',
  },
  preference: {
    summary: 'Chosen/rejected output pairs from the same generation family, only where user behaviour supports the preference (explicit feedback, or regenerating away from one output and then saving, downloading or approving another).',
    fields: '`context`, `chosen`, `rejected`, `signal`, `provenance`, `splitGroupId`',
  },
  'image-generation': { summary: 'Prompt, model, parameters and references to generated images in the private training bucket.', fields: '`prompt`, `model`, `parameters`, `outputs[]` (R2 references), `quality`, `provenance`, `splitGroupId`' },
  'video-generation': { summary: 'Prompt, model, parameters and references to generated videos in the private training bucket.', fields: '`prompt`, `model`, `parameters`, `outputs[]` (R2 references), `quality`, `provenance`, `splitGroupId`' },
  'web-generation': { summary: 'Prompt, model, parameters and references to the sanitized generated HTML in the private training bucket.', fields: '`prompt`, `model`, `parameters`, `outputs[]` (R2 references), `quality`, `provenance`, `splitGroupId`' },
};

/** DATASET_CARD.md for a release. Contains aggregate facts only, never examples or identifiers. */
export function renderDatasetCard(input: {
  dataset: DatasetName;
  version: string;
  builtAt: string;
  counts: { candidates: number; eligible: number; deduplicated: number; total: number; train: number; validation: number; test: number };
  filters: Array<{ name: string; dropped: number }>;
  threshold: number;
  parentVersions: string[];
  splitRatios: { train: number; validation: number; test: number };
}) {
  const description = DESCRIPTIONS[input.dataset];
  const filters = input.filters.map((filter) => `| ${filter.name} | ${filter.dropped} |`).join('\n');
  return `# ${input.dataset} ${input.version}

${description.summary}

- Built: ${input.builtAt}
- Examples: ${input.counts.total} (train ${input.counts.train}, validation ${input.counts.validation}, test ${input.counts.test})
- Quality threshold: ${input.threshold}
- Supersedes / previous: ${input.parentVersions.length ? input.parentVersions.join(', ') : 'none'}

## Fields

${description.fields}. Binary outputs are referenced by bucket, key and sha256 in the private training bucket; they are never inlined.

## Provenance and consent

Every example comes from Prompt Studio /generate activity of users who gave explicit training consent before generating. Consent and eligibility were re-validated when this release was built; withdrawn or revoked records are excluded. Prompts and outputs were sanitized (PII redacted; content containing credentials or secrets rejected).

| Filter | Dropped |
|---|---|
${filters}

## Splits

Deterministic, hash-based ${Math.round(input.splitRatios.train * 100)}/${Math.round(input.splitRatios.validation * 100)}/${Math.round(input.splitRatios.test * 100)} split grouped by a pseudonymous user group (\`splitGroupId\`), so one user's examples never appear in more than one split. User ids are not published.

## Use

Train only against this exact version after verifying \`checksums.json\`:

\`\`\`bash
npm run dataset:verify -- ${input.dataset} ${input.version}
\`\`\`

This release is immutable. Corrections (for example after a consent withdrawal) are published as a new version; see \`manifest.json\` lineage.
`;
}
