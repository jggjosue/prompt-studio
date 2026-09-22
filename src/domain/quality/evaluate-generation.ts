import {compareCopyQuality} from '@/domain/quality/copy-quality-engine';import {compareVersions,type VersionSignals} from '@/lib/prompt-evaluation';
export function evaluateGenerationQuality(input:{originalText:string;candidateText:string;originalHtml?:string;candidateHtml?:string;locale?:'en'|'es';candidate:VersionSignals;baseline:VersionSignals}){
 const copy=compareCopyQuality({text:input.originalText,html:input.originalHtml,locale:input.locale},{text:input.candidateText,html:input.candidateHtml,locale:input.locale}),comparison=compareVersions(input.baseline,input.candidate);
 return {workflow:'evaluate-generation' as const,result:{copy,comparison,releaseSignal:copy.after.band==='publish-ready'&&copy.delta>=0&&comparison.axes.filter(a=>a.winner==='b').length>=comparison.axes.filter(a=>a.winner==='a').length},signals:['bilingual-copy-quality','fernandez-huerta/flesch','sentence-and-syllable-subscores','quality-fidelity-cost-latency-feedback']};
}
