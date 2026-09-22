import {analyzeReadability,type AnalyzeReadabilityInput} from '@/lib/readability-analysis';
import {compareVersions,type VersionSignals} from '@/lib/prompt-evaluation';
export function evaluateGenerationQuality(input:{copy:AnalyzeReadabilityInput;candidate:VersionSignals;baseline:VersionSignals}){
 const readability=analyzeReadability(input.copy),comparison=compareVersions(input.baseline,input.candidate);
 return {workflow:'evaluate-generation' as const,result:{readability,comparison,releaseSignal:readability.overallScore>=65&&comparison.axes.filter(a=>a.winner==='b').length>=comparison.axes.filter(a=>a.winner==='a').length},signals:['fernandez-huerta/flesch','heading-structure','keyword-density','quality-fidelity-cost-latency-feedback']};
}
