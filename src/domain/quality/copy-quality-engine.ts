import {analyzeReadability,type ReadabilityLocale,type ReadabilityReport} from '@/lib/readability-analysis';
export type QualityBand='publish-ready'|'review'|'rewrite';
export type QualitySubscore={id:'ease'|'sentences'|'syllables'|'structure'|'focus';score:number;explanation:string};
export type CopyQualityReport={locale:ReadabilityLocale;localeSource:'explicit'|'detected';score:number;band:QualityBand;readability:ReadabilityReport;subscores:QualitySubscore[];suggestions:string[]};
const SPANISH=/\b(el|la|los|las|para|con|una|que|por|como|más|este|esta|nuestro|servicio|solución)\b/gi,ENGLISH=/\b(the|and|for|with|this|that|your|our|service|solution|from|into)\b/gi;
export function detectCopyLocale(text:string):ReadabilityLocale{const es=(text.match(SPANISH)||[]).length,en=(text.match(ENGLISH)||[]).length;return es>en?'es':'en'}
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
export function scoreCopyQuality(input:{text:string;html?:string;locale?:ReadabilityLocale;focusKeyword?:string}):CopyQualityReport{
 const locale=input.locale??detectCopyLocale(input.text),r=analyzeReadability({...input,locale});
 const sentence=clamp(100-Math.max(0,r.avgWordsPerSentence-(locale==='es'?22:20))*4),syllables=clamp(100-Math.max(0,r.avgSyllablesPerWord-(locale==='es'?2.1:1.8))*35),focus=r.keywords.some(k=>k.density>4)?50:r.keywords.some(k=>k.density>=.8&&k.density<=2.5)?100:75;
 const subscores:QualitySubscore[]=[{id:'ease',score:clamp(r.readingEase),explanation:locale==='es'?'Fernández-Huerta reading ease':'Flesch Reading Ease'},{id:'sentences',score:sentence,explanation:`${r.avgWordsPerSentence} words/sentence`},{id:'syllables',score:syllables,explanation:`${r.avgSyllablesPerWord} syllables/word`},{id:'structure',score:r.headingScore,explanation:`${r.headings.length} headings`},{id:'focus',score:focus,explanation:'keyword density and focus'}];
 const score=clamp(subscores.reduce((s,x)=>s+x.score,0)/subscores.length),band:QualityBand=score>=75?'publish-ready':score>=55?'review':'rewrite';
 const suggestions=[...r.tips];if(sentence<70)suggestions.push(locale==='es'?'shortenSpanishSentences':'shortenEnglishSentences');if(syllables<70)suggestions.push(locale==='es'?'preferCommonSpanishWords':'preferCommonEnglishWords');
 return {locale,localeSource:input.locale?'explicit':'detected',score,band,readability:r,subscores,suggestions:[...new Set(suggestions)]};
}
export function compareCopyQuality(original:{text:string;html?:string;locale?:ReadabilityLocale},revised:{text:string;html?:string;locale?:ReadabilityLocale}){const before=scoreCopyQuality(original),after=scoreCopyQuality({...revised,locale:revised.locale??before.locale});return {before,after,delta:after.score-before.score,improved:after.score>before.score}}
