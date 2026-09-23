import {extractSearchIntent,getSearchKeywords,normalizeSearchText,scoreIntentText} from '@/lib/search-intent';
import {fuzzyScoreFields} from '@/lib/fuzzy-search';
import {catalogIndexFor} from '@/domain/catalog-search/catalog-index-service';
export type SearchableCatalogItem={id:string;title:string;description:string;imageHint?:string;tags:string[];stack:string[];membership:string;price:string;searchDocument?:unknown};
export function discoverAndRankCatalog(query:string,items:readonly SearchableCatalogItem[],limit=36){
 const intent=extractSearchIntent(query),words=getSearchKeywords(query),budget=Number(intent.find(f=>f.dimension==='presupuesto')?.value??Number.POSITIVE_INFINITY);
 const index=catalogIndexFor('web-pages',items);const narrowed=index.filter(query);const candidates=narrowed.ids?narrowed.items:items;
 const ranked=candidates.map(item=>{const text=JSON.stringify(item.searchDocument??item),scored=scoreIntentText(text,intent),wordScore=words.reduce((s,w)=>s+(normalizeSearchText(text).includes(w)?3:0),0),fuzzy=fuzzyScoreFields(query,[item.title,item.description,item.imageHint??'',...item.tags,...item.stack],{minScore:.48}),price=Number.parseFloat(item.price)||0,budgetMatch=price<=budget;return {...item,score:scored.score+wordScore+Math.round(fuzzy*18)+(Number.isFinite(budget)&&budgetMatch?10:0),reasons:[...scored.reasons,...(Number.isFinite(budget)&&budgetMatch?[`≤ $${budget}`]:[])]}}).filter(x=>x.score>0&&(!Number.isFinite(budget)||Number.parseFloat(x.price)<=budget)).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,limit);
 return {workflow:'discover-and-rank' as const,result:ranked,signals:['bplus-candidate-index','intent-facets','keyword-overlap','fuzzy-fields',...(Number.isFinite(budget)?['budget-constraint']:[])],diagnostics:index.diagnostics()};
}
