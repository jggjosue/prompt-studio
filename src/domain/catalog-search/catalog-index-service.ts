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
const registry=new Map<string,CatalogIndexService<any>>();
export function catalogIndexFor<T extends CatalogIndexItem>(key:string,items:readonly T[]){let service=registry.get(key) as CatalogIndexService<T>|undefined;if(!service){service=new CatalogIndexService<T>();service.rebuild(items);registry.set(key,service)}return service}
