import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { requireCronOrAdmin } from '@/lib/api-auth';
import { refundCredits } from '@/lib/ai-job-service';
import { transitionGenerationJob } from '@/lib/generation-job-state-server';
import { sweepStuckGenerationJobs, type SweepEvent } from '@/lib/generation-sweeper';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { cacheHeaders } from '@/lib/cache-policy';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';
import 'server-only';

export const maxDuration = 300;

type SweepableJob = IAIGenerationJob & { recovery?: { attempts?: number | null } | null };

async function handle(request: Request) {
  const headers = cacheHeaders('private-no-store');
  // El planificador es la vía normal. La sesión de admin permite pasarlo a mano,
  // pero cualquier usuario autenticado podría tocar los créditos de los demás.
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  await connectToDatabase();

  const summary = await sweepStuckGenerationJobs<SweepableJob>({
    store: AIGenerationJob,
    owner: `sweeper:${process.env.VERCEL_REGION ?? 'local'}`,
    refund: job => refundCredits(job),
    transition: input => transitionGenerationJob(input),
    recordEvent: (event: SweepEvent<SweepableJob>) =>
      recordObservabilityEvent({
        category: 'ai_generation',
        name: event.name,
        route: '/api/ai/jobs/sweep',
        userId: event.job.userId,
        metadata: {
          jobId: String(event.job._id),
          correlationId: event.job.correlationId,
          sweepId: event.sweepId,
          recoveryReason: event.reason,
          attempts: event.job.attempts,
          provider: event.job.provider,
          kind: event.job.kind,
          modelId: event.job.modelId ?? null,
          // El id de petición del proveedor es lo que permite a un operador
          // encontrar un resultado que el proveedor quizá sí terminó.
          requestId: event.job.providerRequestId ?? null,
          errorCategory: event.job.errorCategory ?? null,
        },
      }),
  });

  await recordObservabilityEvent({
    category: 'ai_generation',
    name: 'generation_sweep_completed',
    route: '/api/ai/jobs/sweep',
    value: summary.examined,
    metadata: { sweepId: summary.sweepId, attempts: summary.recovered },
  });

  return NextResponse.json(summary, { headers });
}

export const GET = handle;
export const POST = handle;
