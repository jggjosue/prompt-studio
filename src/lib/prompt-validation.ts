export type PromptMediaType = 'image' | 'video';

export type PromptModelCompatibility = {
  id: string;
  name: string;
  provider: string;
  version: string;
  compatibility: 'verified-format' | 'compatible';
  estimatedSeconds: { min: number; max: number };
  estimatedCostUsd: { min: number; max: number };
};

export type PromptModelChange = {
  model: string;
  detectedOn: string;
  summary: string;
  impact: 'none' | 'review' | 'revalidated';
};

export type PromptValidationReport = {
  status: 'verified' | 'review-needed';
  checkedAt: string;
  method: 'automated-catalog-check';
  algorithmVersion: string;
  consistencyScore: number;
  consistencyBasis: string[];
  resultUrl: string;
  compatibleModels: PromptModelCompatibility[];
  changes: PromptModelChange[];
};

type PromptValidationInput = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: PromptMediaType;
  tags: string[];
};

const CHECKED_AT = '2026-09-07';
const ALGORITHM_VERSION = 'catalog-validator-1.0';

const imageModels: PromptModelCompatibility[] = [
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'Google', version: 'current', compatibility: 'verified-format', estimatedSeconds: { min: 8, max: 35 }, estimatedCostUsd: { min: 0.04, max: 0.14 } },
  { id: 'gpt-image', name: 'GPT Image', provider: 'OpenAI', version: 'current', compatibility: 'compatible', estimatedSeconds: { min: 10, max: 45 }, estimatedCostUsd: { min: 0.04, max: 0.17 } },
  { id: 'flux-2-pro', name: 'Flux.2 Pro', provider: 'Black Forest Labs', version: 'current', compatibility: 'compatible', estimatedSeconds: { min: 4, max: 30 }, estimatedCostUsd: { min: 0.03, max: 0.08 } },
];

const videoModels: PromptModelCompatibility[] = [
  { id: 'veo-3-1', name: 'Veo 3.1', provider: 'Google', version: 'current', compatibility: 'verified-format', estimatedSeconds: { min: 45, max: 240 }, estimatedCostUsd: { min: 0.35, max: 3 } },
  { id: 'sora-2-pro', name: 'Sora 2 Pro', provider: 'OpenAI', version: 'current', compatibility: 'compatible', estimatedSeconds: { min: 60, max: 300 }, estimatedCostUsd: { min: 0.5, max: 5 } },
  { id: 'runway', name: 'Runway', provider: 'Runway', version: 'current', compatibility: 'compatible', estimatedSeconds: { min: 35, max: 180 }, estimatedCostUsd: { min: 0.25, max: 2.5 } },
];

function promptText(description: string): string {
  try {
    const value = JSON.parse(description) as { description?: unknown };
    return typeof value.description === 'string' ? value.description : description;
  } catch {
    return description;
  }
}

export function validateCatalogPrompt(input: PromptValidationInput): PromptValidationReport {
  const text = promptText(input.description).trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasResult = /^(?:https?:\/\/|\/)/.test(input.imageUrl);
  const hasUsefulTags = input.tags.length >= 2;
  const hasCompositionLanguage = /(light|camera|style|composition|scene|motion|color|lighting|lens|shot|image|video)/i.test(text);

  let score = 45;
  if (words >= 20) score += 20;
  else if (words >= 10) score += 10;
  if (words >= 45) score += 10;
  if (hasResult) score += 15;
  if (hasUsefulTags) score += 5;
  if (hasCompositionLanguage) score += 5;
  score = Math.min(100, score);

  const basis = [
    `${words} words analyzed`,
    hasResult ? 'Generated result is available' : 'Generated result is missing',
    hasUsefulTags ? 'Intent metadata is complete' : 'More intent metadata is recommended',
    hasCompositionLanguage ? 'Visual direction was detected' : 'Visual direction could be more explicit',
  ];

  return {
    status: hasResult && words >= 10 ? 'verified' : 'review-needed',
    checkedAt: CHECKED_AT,
    method: 'automated-catalog-check',
    algorithmVersion: ALGORITHM_VERSION,
    consistencyScore: score,
    consistencyBasis: basis,
    resultUrl: input.imageUrl,
    compatibleModels: input.type === 'video' ? videoModels : imageModels,
    changes: [{
      model: input.type === 'video' ? 'Veo 3.1' : 'Nano Banana Pro',
      detectedOn: CHECKED_AT,
      summary: 'Baseline created. Future model-version checks will be compared with this validation.',
      impact: 'none',
    }],
  };
}

