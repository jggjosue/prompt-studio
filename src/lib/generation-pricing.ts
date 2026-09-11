import type{AIJobKind}from'@/models/AIGenerationJob';import{AI_JOB_COSTS}from'@/lib/ai-job-config';
const expectations:Record<AIJobKind,{seconds:[number,number];resolution:string;quality:string}>={image:{seconds:[8,45],resolution:'1024 × 1024 px',quality:'Estándar'},video:{seconds:[35,300],resolution:'1280 × 720 px',quality:'Estándar'},project:{seconds:[10,90],resolution:'Responsive',quality:'Código de producción'}};
export function generationQuote(kind:AIJobKind,provider:string){const cost=AI_JOB_COSTS[kind],expected=expectations[kind];return{kind,provider,credits:cost.credits,estimatedCostUsd:cost.estimatedUsd,estimatedSeconds:{min:expected.seconds[0],max:expected.seconds[1]},resolution:expected.resolution,quality:expected.quality,refundPolicy:'Si el proveedor falla después de todos los reintentos, la reserva se devuelve automáticamente. Los trabajos completados consumen los créditos indicados.'}}
export function actualProviderCost(result:unknown){if(!result||typeof result!=='object')return null;const value=result as Record<string,unknown>,usage=value.usage;if(usage&&typeof usage==='object'){const cost=(usage as Record<string,unknown>).costUsd;if(typeof cost==='number'&&Number.isFinite(cost)&&cost>=0)return cost}return null}

export function validateCreditCost(cost: number): number {
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost <= 0) {
    return 1.0;
  }
  return Math.max(0.5, Number(cost.toFixed(2)));
}

export function calculateModelCreditCost(tab: string, provider: string, model: string): number {
  const p = (provider || '').toLowerCase();
  const m = (model || '').toLowerCase();
  const t = (tab || '').toLowerCase();

  // Gemini model family pricing
  if (p === 'google' || m.includes('gemini')) {
    if (m.includes('pro') || m.includes('2.5-pro') || m.includes('1.5-pro')) {
      if (t === 'ai-web' || t === 'project') return validateCreditCost(4.0);
      if (t === 'ai-image' || t === 'image') return validateCreditCost(2.5);
      return validateCreditCost(2.0);
    }
    if (m.includes('2.5-flash') || m.includes('2.0-flash')) {
      if (t === 'ai-web' || t === 'project') return validateCreditCost(2.0);
      if (t === 'ai-image' || t === 'image') return validateCreditCost(2.0);
      return validateCreditCost(1.0);
    }
    if (m.includes('1.5-flash')) {
      if (t === 'ai-web' || t === 'project') return validateCreditCost(1.5);
      if (t === 'ai-image' || t === 'image') return validateCreditCost(1.0);
      return validateCreditCost(0.5);
    }
    // Default Gemini
    if (t === 'ai-web' || t === 'project') return validateCreditCost(2.0);
    if (t === 'ai-video' || t === 'video') return validateCreditCost(3.5);
    return validateCreditCost(1.5);
  }

  // Other model pricing by tab
  if (t === 'ai-web' || t === 'project') {
    if (m.includes('gpt-5.4')) return validateCreditCost(5.0);
    if (m.includes('claude-3-5-sonnet') || m.includes('gpt-4o')) return validateCreditCost(4.0);
    if (m.includes('gpt-5-mini') || m.includes('gpt-4o-mini')) return validateCreditCost(2.0);
    if (m.includes('deepseek')) return validateCreditCost(1.5);
    return validateCreditCost(2.0);
  }

  if (t === 'ai-image' || t === 'image') {
    if (m.includes('flux-pro') || m.includes('dall-e-3')) return validateCreditCost(2.0);
    if (m.includes('flux/dev')) return validateCreditCost(2.0);
    if (m.includes('flux/schnell') || m.includes('dall-e-2')) return validateCreditCost(1.0);
    return validateCreditCost(1.0);
  }

  if (t === 'ai-video' || t === 'video') {
    if (m.includes('veo')) return validateCreditCost(3.5);
    return validateCreditCost(3.0);
  }

  return validateCreditCost(1.0);
}


