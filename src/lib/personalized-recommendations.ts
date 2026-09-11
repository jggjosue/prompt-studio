export type RecommendationKind = 'continue'|'prompt'|'model'|'component'|'template'|'next-step';
export type RecommendationCandidate = { id:string;kind:RecommendationKind;title:string;description:string;href:string;tags:string[];imageUrl?:string|null;provider?:string };
export type RecommendationSignals = { interests:string[];savedTags:string[];generationKinds:string[];providers:string[];purchaseTags:string[] };
export type ScoredRecommendation = RecommendationCandidate & { score:number;reasons:string[] };

const tokens=(values:string[])=>new Set(values.flatMap(value=>value.toLowerCase().split(/[^a-z0-9áéíóúñ]+/)).filter(token=>token.length>2));
export function scoreRecommendation(candidate:RecommendationCandidate,signals:RecommendationSignals):ScoredRecommendation{
  const candidateTokens=tokens([candidate.title,...candidate.tags]);let score=0;const reasons:string[]=[];
  const add=(values:string[],points:number,reason:string)=>{const matches=[...tokens(values)].filter(value=>candidateTokens.has(value));if(matches.length){score+=Math.min(3,matches.length)*points;reasons.push(`${reason}: ${matches.slice(0,3).join(', ')}`)}};
  add(signals.interests,4,'Coincide con tus intereses');add(signals.savedTags,3,'Relacionado con tus favoritos');add(signals.purchaseTags,5,'Complementa tus compras');
  if(candidate.kind==='model'&&candidate.provider&&signals.providers.includes(candidate.provider.toLowerCase())){score+=6;reasons.push('Ya utilizaste este proveedor')}
  if((candidate.kind==='prompt'||candidate.kind==='template')&&signals.generationKinds.some(kind=>candidate.tags.includes(kind))){score+=3;reasons.push('Relacionado con tus generaciones')}
  if(score===0){score=1;reasons.push('Popular en el catálogo')}
  return{...candidate,score,reasons};
}
export function rankRecommendations(candidates:RecommendationCandidate[],signals:RecommendationSignals,limit=8){return candidates.map(item=>scoreRecommendation(item,signals)).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,limit)}

