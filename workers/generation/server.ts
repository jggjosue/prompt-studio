import http from 'node:http';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { processGenerationJob } from '@/lib/generation-worker-runtime';

const port = Number(process.env.PORT || 8080);
const leaseMinutes = Math.min(30, Math.max(1, Number(process.env.GCP_AI_WORKER_LEASE_MINUTES || 5)));

type TaskPayload = { version?: unknown; jobId?: unknown; correlationId?: unknown; workload?: unknown };
const workloads = new Set(['image','video','web']);

function json(res:http.ServerResponse,status:number,body:unknown){res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body));}
async function body(req:http.IncomingMessage){const chunks:Buffer[]=[];for await(const chunk of req) chunks.push(Buffer.from(chunk));return Buffer.concat(chunks).toString('utf8');}

const server=http.createServer(async(req,res)=>{
 if(req.method==='GET' && (req.url==='/healthz'||req.url==='/readyz')) return json(res,200,{ok:true,service:'prompt-studio-ai-worker'});
 if(req.method!=='POST'||req.url!=='/tasks/generation') return json(res,404,{error:'not_found'});
 try{
  const raw=JSON.parse(await body(req)) as TaskPayload;
  const jobId=typeof raw.jobId==='string'?raw.jobId.trim():'';
  const workload=typeof raw.workload==='string'?raw.workload.trim():'';
  if(raw.version!==1||!mongoose.isValidObjectId(jobId)||!workloads.has(workload)) return json(res,400,{error:'invalid_task_payload'});
  await connectToDatabase();
  const result=await processGenerationJob(undefined,leaseMinutes,jobId,{routeName:'/tasks/generation'});
  // A missing/terminal/already-owned job is safely acknowledged. Durable Mongo state
  // and the shared claim boundary decide whether provider work may execute.
  return json(res,200,{processed:result});
 }catch(error){
  console.error('generation_worker_request_failed', error instanceof Error?error.message:'unknown');
  return json(res,500,{error:'worker_request_failed'});
 }
});

server.listen(port,()=>console.log(`prompt-studio-ai-worker listening on ${port}`));

async function shutdown(signal:string){
 console.log(`received ${signal}; draining worker`);
 server.close(()=>process.exit(0));
 setTimeout(()=>process.exit(1),25_000).unref();
}
process.on('SIGTERM',()=>void shutdown('SIGTERM'));
process.on('SIGINT',()=>void shutdown('SIGINT'));
