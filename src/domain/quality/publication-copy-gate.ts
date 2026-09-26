import {scoreCopyQuality,compareCopyQuality} from '@/domain/quality/copy-quality-engine';
export function evaluateGeneratedCopyForPublication(input:{generatedText:string;generatedHtml?:string;originalText?:string;locale?:'en'|'es';focusKeyword?:string}){
 const quality=scoreCopyQuality({text:input.generatedText,html:input.generatedHtml,locale:input.locale,focusKeyword:input.focusKeyword});
 const comparison=input.originalText?compareCopyQuality({text:input.originalText,locale:quality.locale},{text:input.generatedText,html:input.generatedHtml,locale:quality.locale}):null;
 return {quality,comparison,publishDecision:quality.band==='publish-ready'?'allow':quality.band==='review'?'review':'block',reasons:quality.subscores.filter(x=>x.score<70).map(x=>x.id)};
}
