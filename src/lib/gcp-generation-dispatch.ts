import 'server-only';
import { createHash } from 'node:crypto';
import { gcpDispatchReady, type GcpGenerationWorkload } from '@/lib/gcp-generation-policy';

type GcpDispatchInput = { jobId:string; correlationId:string; workload:GcpGenerationWorkload };
export type GcpDispatchResult = { dispatched:boolean; backend:'gcp-cloud-tasks'; queue:string; taskName?:string; reason?:'disabled'|'configuration_missing'|'publish_failed' };

function taskId(jobId:string){ return `job-${createHash('sha256').update(jobId).digest('hex').slice(0,32)}`; }

/**
 * Cloud Tasks REST dispatch. Authentication uses Application Default Credentials
 * in Vercel/CI only once T8 wires a Google workload identity/token provider.
 * T5 intentionally exposes the payload/task contract without enabling production cutover.
 */
export async function dispatchGcpGenerationTask(input:GcpDispatchInput, accessToken?:string):Promise<GcpDispatchResult>{
 const cfg=gcpDispatchReady(input.workload);
 if(!cfg.enabled) return {dispatched:false,backend:'gcp-cloud-tasks',queue:cfg.queue,reason:'disabled'};
 if(!cfg.ready || !accessToken) return {dispatched:false,backend:'gcp-cloud-tasks',queue:cfg.queue,reason:'configuration_missing'};
 const project=process.env.GCP_AI_PROJECT_ID!.trim(), region=process.env.GCP_AI_REGION!.trim();
 const workerUrl=process.env.GCP_AI_WORKER_URL!.trim().replace(/\/$/,'');
 const invoker=process.env.GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT!.trim();
 const audience=(process.env.GCP_AI_WORKER_AUDIENCE?.trim()||workerUrl);
 const parent=`projects/${project}/locations/${region}/queues/${cfg.queue}`;
 const name=`${parent}/tasks/${taskId(input.jobId)}`;
 const body=Buffer.from(JSON.stringify({version:1,jobId:input.jobId,correlationId:input.correlationId,workload:input.workload})).toString('base64');
 try{
  const response=await fetch(`https://cloudtasks.googleapis.com/v2/${parent}/tasks`,{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({task:{name,httpRequest:{httpMethod:'POST',url:`${workerUrl}/tasks/generation`,headers:{'Content-Type':'application/json'},body,oidcToken:{serviceAccountEmail:invoker,audience}}}})});
  if(!response.ok) throw new Error(`Cloud Tasks create failed (${response.status})`);
  const result=await response.json() as {name?:unknown};
  return {dispatched:true,backend:'gcp-cloud-tasks',queue:cfg.queue,taskName:typeof result.name==='string'?result.name:name};
 }catch{return {dispatched:false,backend:'gcp-cloud-tasks',queue:cfg.queue,reason:'publish_failed'};}
}
