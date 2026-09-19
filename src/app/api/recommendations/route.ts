import { auth } from '@clerk/nextjs/server';import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';import connectToDatabase from '@/lib/mongoose';
import SavedItem from '@/models/SavedItem';import UserInterest from '@/models/UserInterest';import ComponentPurchase from '@/models/ComponentPurchase';import AIGenerationJob from '@/models/AIGenerationJob';
import { getPlaceholderImages } from '@/lib/placeholder-images';import { getPlaceholderVideos } from '@/lib/placeholder-videos';import { getWebPages } from '@/lib/web-pages';import { getComponentProducts } from '@/lib/component-products';
import { rankRecommendations,type RecommendationCandidate,type RecommendationSignals } from '@/lib/personalized-recommendations';

const headers=()=>cacheHeaders('private-no-store');
export async function GET(){const{userId}=await auth();if(!userId)return NextResponse.json({error:'Unauthorized'},{status:401,headers:headers()});await connectToDatabase();
 const[interest,saved,purchases,jobs]=await Promise.all([UserInterest.findOne({userId}).lean(),SavedItem.find({userId}).sort({createdAt:-1}).limit(60).lean(),ComponentPurchase.find({purchaserUserId:userId,status:'paid'}).sort({purchasedAt:-1}).limit(30).lean(),AIGenerationJob.find({userId}).sort({createdAt:-1}).limit(30).select('kind provider status createdAt promptVersionNumber').lean()]);
 const images=getPlaceholderImages('es'),videos=getPlaceholderVideos('es'),pages=getWebPages('es'),components=getComponentProducts();
 const savedTags=saved.flatMap(item=>{if(item.itemKind==='image')return images.find(x=>x.id===item.itemId)?.tags||[];if(item.itemKind==='video')return videos.find(x=>x.id===item.itemId)?.tags||[];if(item.itemKind==='web-page')return pages.find(x=>x.id===item.itemId)?.tags||[];return components.find(x=>x.id===item.itemId)?.tags||[]});
 const signals:RecommendationSignals={interests:interest?.interests||[],savedTags,generationKinds:jobs.map(job=>job.kind),providers:[...new Set(jobs.map(job=>job.provider.toLowerCase()))],purchaseTags:purchases.flatMap(purchase=>{const component=components.find(item=>item.id===purchase.productId);const page=pages.find(item=>item.id===purchase.productId);return component?.tags||page?.tags||[purchase.productKind]})};
 const candidates:RecommendationCandidate[]=[
  ...images.slice(0,120).map(item=>({id:item.id,kind:'prompt' as const,title:item.title,description:'Prompt de imagen relacionado con tu actividad.',href:`/gallery/${item.id}`,tags:[...item.tags,'image'],imageUrl:item.imageUrl})),
  ...videos.slice(0,80).map(item=>({id:item.id,kind:'prompt' as const,title:item.title,description:'Prompt de video relacionado con tus intereses.',href:`/gallery-videos/${item.id}`,tags:[...item.tags,'video'],imageUrl:item.imageUrl})),
  ...pages.slice(0,180).map(item=>({id:item.id,kind:'template' as const,title:item.title,description:item.description.slice(0,150),href:`/landing-pages/${item.demoUrl}`,tags:[...item.tags,...item.stack,'web'],imageUrl:item.imageUrl})),
  ...components.map(item=>({id:item.id,kind:'component' as const,title:item.name.es,description:item.description.es,href:`/${item.kind}-components`,tags:[...item.tags,...item.stack,item.kind]})),
  {id:'model-google',kind:'model',title:'Gemini',description:'Recomendado para generación multimodal y optimización estructurada.',href:'/prompts/nano-banana-pro',tags:['image','project','google'],provider:'google'},
  {id:'model-openai',kind:'model',title:'OpenAI',description:'Recomendado para imágenes y respuestas estructuradas.',href:'/generate',tags:['image','project','openai'],provider:'openai'},
  {id:'model-runway',kind:'model',title:'Runway',description:'Recomendado para flujos de generación de video.',href:'/generate',tags:['video','runway'],provider:'runway'},
 ];
 const recommendations=rankRecommendations(candidates,signals,12);const latest=jobs[0];
 const continueItem=latest?{kind:'continue',title:`Continúa tu generación de ${latest.kind}`,description:latest.status==='completed'?'Revisa el resultado, crea una variante o valora su calidad.':'Consulta el progreso y reintenta si fuera necesario.',href:'/dashboard/generations',reason:`Tu actividad más reciente fue con ${latest.provider}.`}:null;
 const dominant=signals.interests[0]||signals.savedTags[0]||signals.purchaseTags[0]||null;
 const nextStep=latest?.status==='completed'?{kind:'next-step',title:'Compara una variante antes de decidir',description:'Prueba dos prompts con Gemini y OpenAI y registra tu preferencia.',href:'/dashboard/prompt-lab',reason:'Ya tienes una generación terminada.'}:{kind:'next-step',title:'Crea tu primera prueba comparable',description:'Empieza con el laboratorio A/B para obtener evidencia reproducible.',href:'/dashboard/prompt-lab',reason:dominant?`Basado en tu interés por ${dominant}.`:'Te ayudará a personalizar futuras recomendaciones.'};
 return NextResponse.json({continueItem,nextStep,recommendations,explanation:{signals:{interests:signals.interests.length,favorites:saved.length,generations:jobs.length,purchases:purchases.length},method:'Reglas por coincidencia de etiquetas, tipo, proveedor y actividad reciente.'}},{headers:headers()});}
