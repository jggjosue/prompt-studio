import 'server-only';

export type AIOperationCategory =
  | 'text'
  | 'prompt_optimizer'
  | 'image'
  | 'video'
  | 'website'
  | 'website_edit'
  | 'code_audit'
  | 'component';

export type AIOperationCode =
  | 'TEXT_SHORT'
  | 'TEXT_LONG'
  | 'TEXT_COMPLEX'
  | 'PROMPT_OPTIMIZER_BASIC'
  | 'PROMPT_OPTIMIZER_ADVANCED'
  | 'PROMPT_OPTIMIZER_COMPLEX'
  | 'IMAGE_LITE_1K'
  | 'IMAGE_QUALITY_1K'
  | 'IMAGE_QUALITY_2K'
  | 'IMAGE_QUALITY_4K'
  | 'VIDEO_LITE_720_8S'
  | 'VIDEO_LITE_1080_8S'
  | 'VIDEO_FAST_720_8S'
  | 'VIDEO_FAST_1080_8S'
  | 'VIDEO_PREMIUM_8S'
  | 'WEBSITE_SIMPLE'
  | 'WEBSITE_ADVANCED'
  | 'WEBSITE_COMPLEX'
  | 'WEBSITE_AI_EDIT_SMALL'
  | 'WEBSITE_AI_EDIT_SECTION'
  | 'WEBSITE_AI_EDIT_COMPLEX'
  | 'WEBSITE_AI_REDESIGN'
  | 'CODE_AUDIT_SMALL'
  | 'CODE_AUDIT_STANDARD'
  | 'CODE_AUDIT_ADVANCED'
  | 'CODE_AUDIT_PROJECT'
  | 'COMPONENT_PREVIEW'
  | 'COMPONENT_AI_ANALYSIS'
  | 'COMPONENT_AI_MODIFICATION'
  | 'COMPONENT_AI_GENERATION';

export type AIOperationDefinition = Readonly<{
  code: AIOperationCode;
  displayName: string;
  category: AIOperationCategory;
  creditCost: number;
  isFree: boolean;
  enabled: boolean;
  quality?: string;
  resolution?: string;
  durationSeconds?: number;
  minimumMarginPercent: number;
  variablePricing?: boolean;
}>;

const operation = (
  definition: Omit<AIOperationDefinition, 'isFree' | 'enabled' | 'minimumMarginPercent'> &
    Partial<Pick<AIOperationDefinition, 'isFree' | 'enabled' | 'minimumMarginPercent'>>,
): AIOperationDefinition => Object.freeze({
  isFree: definition.creditCost === 0,
  enabled: true,
  minimumMarginPercent: 75,
  ...definition,
});

export const AI_OPERATION_CATALOG: Readonly<Record<AIOperationCode, AIOperationDefinition>> = Object.freeze({
  TEXT_SHORT: operation({ code: 'TEXT_SHORT', displayName: 'Short text', category: 'text', creditCost: 2 }),
  TEXT_LONG: operation({ code: 'TEXT_LONG', displayName: 'Long text', category: 'text', creditCost: 5 }),
  TEXT_COMPLEX: operation({ code: 'TEXT_COMPLEX', displayName: 'Complex text', category: 'text', creditCost: 10 }),

  PROMPT_OPTIMIZER_BASIC: operation({ code: 'PROMPT_OPTIMIZER_BASIC', displayName: 'Basic prompt optimization', category: 'prompt_optimizer', creditCost: 2 }),
  PROMPT_OPTIMIZER_ADVANCED: operation({ code: 'PROMPT_OPTIMIZER_ADVANCED', displayName: 'Advanced prompt optimization', category: 'prompt_optimizer', creditCost: 5 }),
  PROMPT_OPTIMIZER_COMPLEX: operation({ code: 'PROMPT_OPTIMIZER_COMPLEX', displayName: 'Complete prompt optimization', category: 'prompt_optimizer', creditCost: 8 }),

  IMAGE_LITE_1K: operation({ code: 'IMAGE_LITE_1K', displayName: 'Lite image 1K', category: 'image', creditCost: 16, quality: 'lite', resolution: '1K' }),
  IMAGE_QUALITY_1K: operation({ code: 'IMAGE_QUALITY_1K', displayName: 'Quality image 1K', category: 'image', creditCost: 31, quality: 'quality', resolution: '1K' }),
  IMAGE_QUALITY_2K: operation({ code: 'IMAGE_QUALITY_2K', displayName: 'Quality image 2K', category: 'image', creditCost: 46, quality: 'quality', resolution: '2K' }),
  IMAGE_QUALITY_4K: operation({ code: 'IMAGE_QUALITY_4K', displayName: 'Quality image 4K', category: 'image', creditCost: 70, quality: 'quality', resolution: '4K' }),

  VIDEO_LITE_720_8S: operation({ code: 'VIDEO_LITE_720_8S', displayName: 'Lite video 720p / 8s', category: 'video', creditCost: 180, quality: 'lite', resolution: '720p', durationSeconds: 8 }),
  VIDEO_LITE_1080_8S: operation({ code: 'VIDEO_LITE_1080_8S', displayName: 'Lite video 1080p / 8s', category: 'video', creditCost: 288, quality: 'lite', resolution: '1080p', durationSeconds: 8 }),
  VIDEO_FAST_720_8S: operation({ code: 'VIDEO_FAST_720_8S', displayName: 'Fast video 720p / 8s', category: 'video', creditCost: 360, quality: 'fast', resolution: '720p', durationSeconds: 8 }),
  VIDEO_FAST_1080_8S: operation({ code: 'VIDEO_FAST_1080_8S', displayName: 'Fast video 1080p / 8s', category: 'video', creditCost: 432, quality: 'fast', resolution: '1080p', durationSeconds: 8 }),
  VIDEO_PREMIUM_8S: operation({ code: 'VIDEO_PREMIUM_8S', displayName: 'Premium video / 8s', category: 'video', creditCost: 1440, quality: 'premium', durationSeconds: 8 }),

  WEBSITE_SIMPLE: operation({ code: 'WEBSITE_SIMPLE', displayName: 'Simple website', category: 'website', creditCost: 20 }),
  WEBSITE_ADVANCED: operation({ code: 'WEBSITE_ADVANCED', displayName: 'Advanced website', category: 'website', creditCost: 50 }),
  WEBSITE_COMPLEX: operation({ code: 'WEBSITE_COMPLEX', displayName: 'Complex website', category: 'website', creditCost: 100 }),

  WEBSITE_AI_EDIT_SMALL: operation({ code: 'WEBSITE_AI_EDIT_SMALL', displayName: 'Small AI website edit', category: 'website_edit', creditCost: 5 }),
  WEBSITE_AI_EDIT_SECTION: operation({ code: 'WEBSITE_AI_EDIT_SECTION', displayName: 'AI website section edit', category: 'website_edit', creditCost: 10 }),
  WEBSITE_AI_EDIT_COMPLEX: operation({ code: 'WEBSITE_AI_EDIT_COMPLEX', displayName: 'Complex AI website edit', category: 'website_edit', creditCost: 25 }),
  WEBSITE_AI_REDESIGN: operation({ code: 'WEBSITE_AI_REDESIGN', displayName: 'AI website redesign', category: 'website_edit', creditCost: 50 }),

  CODE_AUDIT_SMALL: operation({ code: 'CODE_AUDIT_SMALL', displayName: 'Small code audit', category: 'code_audit', creditCost: 5 }),
  CODE_AUDIT_STANDARD: operation({ code: 'CODE_AUDIT_STANDARD', displayName: 'Standard code audit', category: 'code_audit', creditCost: 15 }),
  CODE_AUDIT_ADVANCED: operation({ code: 'CODE_AUDIT_ADVANCED', displayName: 'Advanced code audit', category: 'code_audit', creditCost: 30 }),
  CODE_AUDIT_PROJECT: operation({ code: 'CODE_AUDIT_PROJECT', displayName: 'Project code audit', category: 'code_audit', creditCost: 50, variablePricing: true }),

  COMPONENT_PREVIEW: operation({ code: 'COMPONENT_PREVIEW', displayName: 'Component preview', category: 'component', creditCost: 0, isFree: true }),
  COMPONENT_AI_ANALYSIS: operation({ code: 'COMPONENT_AI_ANALYSIS', displayName: 'AI component analysis', category: 'component', creditCost: 3 }),
  COMPONENT_AI_MODIFICATION: operation({ code: 'COMPONENT_AI_MODIFICATION', displayName: 'AI component modification', category: 'component', creditCost: 5 }),
  COMPONENT_AI_GENERATION: operation({ code: 'COMPONENT_AI_GENERATION', displayName: 'AI component generation', category: 'component', creditCost: 10 }),
});

export const AI_OPERATION_CODES = Object.freeze(Object.keys(AI_OPERATION_CATALOG) as AIOperationCode[]);

export function isAIOperationCode(value: string): value is AIOperationCode {
  return Object.prototype.hasOwnProperty.call(AI_OPERATION_CATALOG, value);
}

export function getAIOperation(code: AIOperationCode): AIOperationDefinition {
  return AI_OPERATION_CATALOG[code];
}

export function getEnabledAIOperation(code: string): AIOperationDefinition | null {
  if (!isAIOperationCode(code)) return null;
  const definition = AI_OPERATION_CATALOG[code];
  return definition.enabled ? definition : null;
}

export function getAIOperationsByCategory(category: AIOperationCategory): AIOperationDefinition[] {
  return AI_OPERATION_CODES
    .map((code) => AI_OPERATION_CATALOG[code])
    .filter((definition) => definition.category === category && definition.enabled);
}

export function getAIOperationCreditCost(code: AIOperationCode): number {
  return AI_OPERATION_CATALOG[code].creditCost;
}
