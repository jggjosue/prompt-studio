import {buildRefactoryManifest,validateRefactoryBundle,type RefactoryProvenance,type RefactoryManifest} from '@/domain/refactory-runtime/bundle-contract';
import {readLocalDemoBundle,readR2DemoBundle} from '@/lib/refactory-bundle';
export type VerifiedRefactoryBundle={manifest:RefactoryManifest;files:Record<string,string>;source:'local'|'r2'};
const filesFrom=(b:{html:string;css:string|null;js:string|null})=>Object.fromEntries([['index.html',b.html],...(b.css?[['styles.css',b.css] as const]:[]),...(b.js?[['script.js',b.js] as const]:[])]);
export async function resolveVerifiedRefactoryBundle(slug:string,stack:string[]=[],provenance:RefactoryProvenance={}):Promise<{status:'ready';bundle:VerifiedRefactoryBundle}|{status:'not-found'|'invalid';errors:string[]}>{
 const local=readLocalDemoBundle(slug,'html');const source=local?'local': 'r2';const raw=local??await readR2DemoBundle(slug,stack);if(!raw)return {status:'not-found',errors:['BUNDLE_NOT_FOUND']};
 const files=filesFrom(raw),manifest=buildRefactoryManifest({slug,files,provenance}),validation=validateRefactoryBundle(manifest,files);if(!validation.valid)return {status:'invalid',errors:validation.errors};return {status:'ready',bundle:{manifest,files,source}};
}
