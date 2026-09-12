import fs from 'fs';
import path from 'path';
// `zip-archive` no tiene dependencias, así que se importa directamente.
import { createZipArchive } from './zip-archive.ts';

/**
 * R2 se carga de forma diferida: arrastra `@aws-sdk/client-s3`, que solo hace
 * falta cuando la landing no está en disco. Como import estático entraba en el
 * bundle siempre e impedía además probar este módulo con `node --test`.
 */
async function r2() {
  return import('./r2-storage.ts');
}
export type SiteFile={name:string;data:Buffer};
const MAX_FILES=500,MAX_BYTES=50*1024*1024;
export function publicationSlug(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}
export function normalizeDomain(value:string){const domain=value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');return /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)?domain:null}
function validate(files:SiteFile[]){if(!files.length)throw new Error('La landing no contiene archivos.');if(files.length>MAX_FILES)throw new Error('La landing supera 500 archivos.');if(files.reduce((n,f)=>n+f.data.length,0)>MAX_BYTES)throw new Error('La landing supera 50 MB.');}
export async function readLandingFiles(folder:string,stack:string[]){const root=path.join(process.cwd(),'public','webpages',folder);const files:SiteFile[]=[];if(fs.existsSync(root)){const walk=(dir:string)=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){const absolute=path.join(dir,item.name);if(item.isDirectory())walk(absolute);else if(item.isFile()&&!/\.(br|gz)$/.test(item.name))files.push({name:path.relative(root,absolute).replaceAll(path.sep,'/'),data:fs.readFileSync(absolute)})}};walk(root);}else{const{getR2ObjectBytes,listR2ProjectObjects,validateR2ProjectFolder}=await r2();const checked=await validateR2ProjectFolder(folder,stack);if(!checked.valid||!checked.prefix)throw new Error('No se encontraron los archivos de la landing.');for(const key of(await listR2ProjectObjects(checked.prefix)).filter(k=>!k.endsWith('/'))){const data=await getR2ObjectBytes(key);if(data)files.push({name:key.slice(checked.prefix.length),data});}}validate(files);return files}
export function exportLanding(files:SiteFile[],format:'html'|'nextjs',name:string){if(format==='html')return createZipArchive(files);const html=files.find(f=>f.name==='index.html')?.data.toString('utf8')??'<main>Landing</main>';const escaped=JSON.stringify(html);const nextFiles:SiteFile[]=[{name:'package.json',data:Buffer.from(JSON.stringify({name,private:true,scripts:{dev:'next dev',build:'next build',start:'next start'},dependencies:{next:'^15.0.0',react:'^19.0.0','react-dom':'^19.0.0'}},null,2))},{name:'app/layout.tsx',data:Buffer.from("export default function Layout({children}:{children:React.ReactNode}){return <html><body style={{margin:0}}>{children}</body></html>")},{name:'app/page.tsx',data:Buffer.from(`const html=${escaped};export default function Page(){return <div dangerouslySetInnerHTML={{__html:html}}/>}`)},{name:'README.md',data:Buffer.from('# '+name+'\n\nRun `npm install && npm run dev`.\n')},...files.filter(f=>f.name!=='index.html').map(f=>({name:`public/${f.name}`,data:f.data}))];return createZipArchive(nextFiles)}
export function publicUrl(slug:string){const base=process.env.NEXT_PUBLIC_PUBLISH_DOMAIN?.trim();return base?`https://${slug}.${base}`:`/sites/${slug}`}
