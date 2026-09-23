import {estimateAICredits,type CreditEstimateInput} from '@/lib/ai-credit-config';
import {generationQuote} from '@/lib/generation-pricing';
import type {AIJobKind} from '@/models/AIGenerationJob';
export function quoteGeneration(input:CreditEstimateInput&{kind:AIJobKind}){
 const estimate=estimateAICredits(input),experience=generationQuote(input.kind,input.provider);
 return {workflow:'quote-generation' as const,result:{estimate,experience},signals:['model-allowlist','token/media-cost-model','credit-margin','provider-duration-expectation','refund-policy']};
}
