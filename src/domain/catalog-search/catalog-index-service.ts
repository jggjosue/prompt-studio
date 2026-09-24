import {CatalogSearchIndex,CATALOG_INDEX_MIN_ITEMS} from '@/lib/catalog-search-index';
export type CatalogIndexItem={id:string;title:string;description:string;tags:string[];stack:string[]};
export type CatalogIndexDiagnostics={generation:number;itemCount:number;tokenCount:number;indexed:boolean;lookups:number;hits:number;fallbacks:number;lastBuildMs:number};
export class CatalogIndexService<T extends CatalogIndexItem>{
 private index:CatalogSearchIndex|undefined;private items:T[]=[];private generation=0;private lookups=0;private hits=0;private fallbacks=0;private lastBuildMs=0;
 rebuild(items:readonly T[]){const started=performance.now();this.items=[...items];this.index=CatalogSearchIndex.fromItems(this.items,x=>x.id,x=>[x.title,x.description,...x.tags,...x.stack]);this.generation++;this.lastBuildMs=Math.max(0,performance.now()-started);return this.diagnostics();}
 update(items:readonly T[]){return this.rebuild(items)}
 invalidate(){this.index=undefined;this.items=[];this.generation++}
 lookup(query:string){this.lookups++;if(!this.index){this.fallbacks++;return {ids:null,indexed:false,generation:this.generation}}const ids=this.index.candidateIds(query);if(ids)this.hits++;else this.fallbacks++;return {ids,indexed:true,generation:this.generation}}
 filter(query:string){const found=this.lookup(query);if(!found.ids)return {items:[...this.items],...found};return {items:this.items.filter(i=>found.ids!.has(i.id)),...found}}
 diagnostics():CatalogIndexDiagnostics{const stats=this.index?.getStats(this.items.length);return {generation:this.generation,itemCount:this.items.length,tokenCount:stats?.tokenCount??0,indexed:Boolean(this.index),lookups:this.lookups,hits:this.hits,fallbacks:this.fallbacks,lastBuildMs:Math.round(this.lastBuildMs*1000)/1000}}
 static usefulFor(itemCount:number){return itemCount>=CATALOG_INDEX_MIN_ITEMS}
}
type RegistryEntry={service:CatalogIndexService<CatalogIndexItem>;signature:string};
const registry=new Map<string,RegistryEntry>();
function catalogSignature(items:readonly CatalogIndexItem[]){return items.map(i=>[i.id,i.title,i.description,i.tags.join(','),i.stack.join(',')].join('\u001f')).join('\u001e')}
export function catalogIndexFor<T extends CatalogIndexItem>(key:string,items:readonly T[]){
 const signature=catalogSignature(items);let entry=registry.get(key);
 if(!entry){const service=new CatalogIndexService<CatalogIndexItem>();service.rebuild(items);entry={service,signature};registry.set(key,entry)}
 else if(entry.signature!==signature){entry.service.update(items);entry.signature=signature}
 return entry.service as CatalogIndexService<T>
}
