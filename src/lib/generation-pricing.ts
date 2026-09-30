import { getAIModelConfig, TARGET_COST_PER_CREDIT_USD } from '@/lib/ai-credit-config';
import { AI_JOB_COSTS } from '@/lib/ai-job-config';
import type { AIJobKind } from '@/models/AIGenerationJob';
const expectations:Record<AIJobKind,{seconds:[number,number];resolution:string;quality:string}>={image:{seconds:[8,45],resolution:'1024 × 1024 px',quality:'Estándar'},video:{seconds:[35,300],resolution:'1280 × 720 px',quality:'Estándar'},project:{seconds:[10,90],resolution:'Responsive',quality:'Código de producción'},text:{seconds:[2,15],resolution:'Texto sin resolución fija',quality:'Estándar'},vision:{seconds:[2,20],resolution:'Analiza la imagen de entrada',quality:'Estándar'},videoUnderstanding:{seconds:[10,90],resolution:'Analiza el video de entrada',quality:'Estándar'}};
export function generationQuote(kind:AIJobKind,provider:string){const cost=AI_JOB_COSTS[kind],expected=expectations[kind];return{kind,provider,credits:cost.credits,estimatedCostUsd:cost.estimatedUsd,estimatedSeconds:{min:expected.seconds[0],max:expected.seconds[1]},resolution:expected.resolution,quality:expected.quality,refundPolicy:'Si el proveedor falla después de todos los reintentos, la reserva se devuelve automáticamente. Los trabajos completados consumen los créditos indicados.'}}
export function actualProviderCost(result:unknown){if(!result||typeof result!=='object')return null;const value=result as Record<string,unknown>,usage=value.usage;if(usage&&typeof usage==='object'){const cost=(usage as Record<string,unknown>).costUsd;if(typeof cost==='number'&&Number.isFinite(cost)&&cost>=0)return cost}return null}

export type ProviderUsage = { inputTokens: number | null; outputTokens: number | null; costUsd: number | null };
export function providerUsage(result: unknown): ProviderUsage {
  if (!result || typeof result !== 'object') return { inputTokens: null, outputTokens: null, costUsd: null };
  const value = result as Record<string, unknown>;
  const usage = (value.usage || value.usageMetadata) as Record<string, unknown> | undefined;
  if (!usage || typeof usage !== 'object') return { inputTokens: null, outputTokens: null, costUsd: null };
  const number = (...keys: string[]) => {
    for (const key of keys) {
      const candidate = usage[key];
      if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) return candidate;
    }
    return null;
  };
  return {
    inputTokens: number('input_tokens', 'total_input_tokens', 'prompt_tokens', 'promptTokenCount'),
    outputTokens: number('output_tokens', 'total_output_tokens', 'completion_tokens', 'candidatesTokenCount'),
    costUsd: number('costUsd'),
  };
}

export function creditsForActualCost(provider: string, model: string | null | undefined, actualCostUsd: number | null, reservedCredits: number): number {
  if (actualCostUsd === null || !Number.isFinite(actualCostUsd)) return reservedCredits;
  const minimum = model ? getAIModelConfig(provider, model)?.minimumCredits ?? 1 : 1;
  return Math.max(minimum, Math.ceil(actualCostUsd / TARGET_COST_PER_CREDIT_USD));
}
