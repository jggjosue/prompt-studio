import http from 'node:http';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { processGenerationJob } from '@/lib/generation-worker-runtime';
import { executionWorkloadForKind, workerMayExecute } from '@/lib/ai-execution-backend-policy';
import AIGenerationJob from '@/models/AIGenerationJob';

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
  const correlationId=typeof raw.correlationId==='string'?raw.correlationId.trim():'';
  if(raw.version!==1||!mongoose.isValidObjectId(jobId)||!workloads.has(workload)) return json(res,400,{error:'invalid_task_payload'});
  await connectToDatabase();
  // MongoDB is the source of truth: the payload only names the job. Anything
  // that cannot run here is acknowledged (2xx) so Cloud Tasks stops retrying
  // a delivery that will never succeed; the job itself is left untouched.
  const stored=await AIGenerationJob.findById(jobId).select('kind executionBackend correlationId').lean<{kind:string;executionBackend?:string|null;correlationId?:string}>();
  if(!stored) return json(res,200,{ignored:'job_not_found'});
  const storedWorkload=executionWorkloadForKind(stored.kind);
  if(storedWorkload!==workload) return json(res,200,{ignored:'workload_mismatch'});
  if(correlationId&&stored.correlationId&&correlationId!==stored.correlationId) return json(res,200,{ignored:'correlation_mismatch'});
  const gate=workerMayExecute({workerBackend:'gcp',jobBackend:stored.executionBackend,workload:storedWorkload});
  if(!gate.allowed) return json(res,200,{ignored:gate.reason});
  const result=await processGenerationJob(undefined,leaseMinutes,jobId,{routeName:'/tasks/generation',executionBackend:'gcp'});
  // A missing/terminal/already-owned job is safely acknowledged. Durable Mongo state
  // and the shared claim boundary decide whether provider work may execute.
  return json(res,200,{processed:result});
 }catch(error){
  // Infrastructure failure before the job could be safely handled (e.g. Mongo
  // unreachable): non-2xx so Cloud Tasks retries the transport.
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
