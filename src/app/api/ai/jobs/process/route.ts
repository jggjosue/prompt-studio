import { processGenerationJob } from '@/lib/generation-worker-runtime';
import { hasValidCronSecret } from '@/lib/api-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import { verifyGenerationQueueRequest } from '@/lib/generation-queue-dispatch';
import connectToDatabase from '@/lib/mongoose';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

async function handle(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  const isCron = hasValidCronSecret(request);
  const queueRequest = request.method === 'POST'
    ? await verifyGenerationQueueRequest(request)
    : { verified: false, jobId: undefined };
  if (!isCron && !queueRequest.verified && !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  await connectToDatabase();
  const searchParams = new URL(request.url).searchParams;
  const requestedJobId = searchParams.get('jobId')?.trim() || undefined;
  const jobId = requestedJobId || (queueRequest.verified ? queueRequest.jobId : undefined);
  if (jobId && !mongoose.isValidObjectId(jobId)) {
    return NextResponse.json({ error: 'Identificador de trabajo inválido.' }, { status: 400, headers });
  }
  if (queueRequest.verified && (!jobId || (requestedJobId && queueRequest.jobId !== requestedJobId))) {
    return NextResponse.json({ error: 'El trabajo firmado no coincide con el destino.' }, { status: 400, headers });
  }
  const requested = Number(searchParams.get('limit') ?? (jobId ? 1 : 3));
  const limit = Math.min(5, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 3));

  if (isCron || queueRequest.verified) {
    const processed = [];
    const workerLimit = queueRequest.verified ? 1 : limit;
    for (let index = 0; index < workerLimit; index += 1) {
      const result = await processGenerationJob(undefined, 5, queueRequest.verified ? jobId : undefined);
      if (!result) break;
      processed.push(result);
    }
    return NextResponse.json({ processed, count: processed.length }, { headers });
  }

  // En serverless no es seguro responder y continuar trabajando en una promesa suelta:
  // la instancia puede congelarse justo después de enviar la respuesta. Conservamos esta
  // petición abierta hasta que el proveedor termine y el cliente consulta el progreso en paralelo.
  const processed = [];
  for (let index = 0; index < limit; index += 1) {
    const result = await processGenerationJob(userId || undefined, 5, jobId);
    if (!result) break;
    processed.push(result);
    if (jobId) break;
  }
  return NextResponse.json({ processed, count: processed.length }, { headers });
}

export const GET = handle;
export const POST = handle;
