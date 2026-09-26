export const PROMPT_STUDIO_SUBSYSTEMS = {
 catalogSearch:{owner:'catalog-search',roots:['src/domain/catalog-search/','src/lib/catalog-','src/lib/search-intent.ts','src/lib/fuzzy-search.ts'],mayDependOn:['quality-intelligence']},
 generation:{owner:'generation-orchestration',roots:['src/domain/generation/','src/lib/generation/','src/lib/batch-generation.ts','src/lib/generation-pricing.ts'],mayDependOn:['credits-commerce','quality-intelligence']},
 visualEditor:{owner:'visual-editor',roots:['src/lib/editor/'],mayDependOn:[]},
 refactoryRuntime:{owner:'refactory-runtime',roots:['src/lib/refactory-','src/app/api/refactory-online/'],mayDependOn:['quality-intelligence']},
 qualityIntelligence:{owner:'quality-intelligence',roots:['src/domain/quality/','src/lib/readability-analysis.ts','src/lib/publication-quality.ts','src/lib/prompt-evaluation.ts'],mayDependOn:[]},
 creatorMarketplace:{owner:'creator-marketplace',roots:['src/lib/creator-marketplace.ts','src/app/api/marketplace/'],mayDependOn:['credits-commerce','quality-intelligence']},
 creditsCommerce:{owner:'credits-commerce',roots:['src/domain/credits/','src/lib/ai-credit-config.ts','src/lib/credit-'],mayDependOn:[]}
} as const;
export type PromptStudioSubsystem=keyof typeof PROMPT_STUDIO_SUBSYSTEMS;
export type DomainWorkflow='discover-and-rank'|'evaluate-generation'|'quote-generation';
export interface DomainWorkflowResult<T>{workflow:DomainWorkflow;result:T;signals:string[]}
