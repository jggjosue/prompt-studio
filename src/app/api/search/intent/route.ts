import {cacheHeaders} from '@/lib/cache-policy';
import {getWebPages} from '@/lib/web-pages';
import {NextResponse} from 'next/server';
import {enforceIpRateLimit,RATE_LIMITS} from '@/lib/rate-limit';
import {discoverAndRankCatalog} from '@/domain/catalog-search/discover-and-rank';
export async function GET(request:Request){
 const limited=await enforceIpRateLimit(request,'search-intent',RATE_LIMITS.publicRead);if(limited)return limited;
 const url=new URL(request.url),query=url.searchParams.get('q')?.trim().slice(0,240)??'',locale=url.searchParams.get('locale')==='es'?'es':'en';
 if(!query)return NextResponse.json({intent:[],items:[]},{headers:cacheHeaders('public-catalog')});
 const pages=getWebPages(locale);
 const workflow=discoverAndRankCatalog(query,pages.map(page=>({id:page.id,title:page.title,description:page.imageHint,imageHint:page.imageHint,tags:page.tags,stack:page.stack,membership:page.membership,price:page.price,searchDocument:page})));
 return NextResponse.json({intent:workflow.signals,items:workflow.result.map(({searchDocument,...item})=>({...item,demoUrl:searchDocument?.demoUrl})),workflow:workflow.workflow},{headers:cacheHeaders('public-catalog')});
}
