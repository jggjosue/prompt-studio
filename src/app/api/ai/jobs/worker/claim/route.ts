import { hasValidCronSecret } from '@/lib/api-auth';
import { claimExhaustedGenerationJob, claimGenerationJob, transitionGenerationJob } from '@/lib/generation-job-state-server';
import { cacheHeaders } from '@/lib/cache-policy';
import { notifyJobFinished } from '@/lib/ai-job-service';
import { releaseGenerationCredits } from '@/lib/generation-credit-boundary';
import connectToDatabase from '@/lib/mongoose';
import { NextResponse } from 'next/server';

export const maxDuration = 10; // Claiming is fast

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  await connectToDatabase();

  const body = await request.json().catch(() => ({}));
  const jobId = body.jobId;
  const owner = body.owner || 'cloudflare-ai-worker';
  const leaseMs = Number(body.leaseMs) || 5 * 60_000;

  const claimInput = { owner, leaseMs, jobId };
  
  let claimed = await claimGenerationJob(claimInput);

  if (!claimed && jobId) {
    // Si no lo pudo claimear normal, intenta como exhausto
    claimed = await claimExhaustedGenerationJob(claimInput);
    if (claimed) {
      const exhausted = claimed.job;
      await releaseGenerationCredits(exhausted);
      const failed = await transitionGenerationJob({
        jobId: String(exhausted._id),
        from: 'processing',
        to: 'failed',
        lockToken: claimed.lockToken,
        patch: {
          progressMessage: 'La generación agotó sus intentos y los créditos fueron devueltos',
          lastError: exhausted.lastError || 'El worker perdió su lease en el último intento.',
          errorCategory: exhausted.errorCategory || 'unknown',
          creditsState: exhausted.creditsState,
        },
      });
      await notifyJobFinished(failed);
      await failed.save();
      return NextResponse.json({ exhausted: true, jobId: String(failed._id) }, { headers });
    }
  }

  if (!claimed) {
    return NextResponse.json({ claimed: false }, { headers });
  }

  const job = claimed.job;

  // Actualiza progreso a 35% como en el runtime antiguo
  await transitionGenerationJob({
    jobId: String(job._id),
    from: 'queued', // claimGenerationJob lo pasa a processing? Wait. 
    // Actually claimGenerationJob changes it to processing. So the from state is processing.
    to: 'processing',
    lockToken: claimed.lockToken,
    patch: {
      progress: 35,
      progressMessage: 'Generando contenido (External Worker)',
    }
  });

  return NextResponse.json({
    claimed: true,
    jobId: String(job._id),
    kind: job.kind,
    provider: job.provider,
    modelId: job.modelId,
    input: job.input,
    lockToken: claimed.lockToken,
    creditCost: job.creditCost,
    attempts: job.attempts,
  }, { headers });
}
