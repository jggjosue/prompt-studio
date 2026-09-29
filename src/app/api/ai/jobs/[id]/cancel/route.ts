import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { getCreditBalance, notifyJobFinished, refundCredits } from '@/lib/ai-job-service';
import { canonicalGenerationState, isTerminalGenerationJobState } from '@/lib/generation-job-state';
import { transitionGenerationJob } from '@/lib/generation-job-state-server';
import AIGenerationJob from '@/models/AIGenerationJob';

/**
 * Cancela un trabajo propio y devuelve sus créditos reservados.
 *
 * Cancelar es la única forma de que el usuario recupere el coste sin esperar a
 * que el trabajo agote sus intentos. `refundCredits` es idempotente y solo actúa
 * sobre una reserva vigente, así que repetir la llamada no devuelve el importe
 * dos veces ni toca un trabajo ya liquidado.
 */
export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  await connectToDatabase();
  const job = await AIGenerationJob.findOne({ _id: id, userId });
  if (!job) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });

  const state = canonicalGenerationState(job.status);
  // Cancelar dos veces devuelve el mismo trabajo, nunca un segundo reembolso.
  if (state === 'cancelled') {
    return NextResponse.json({ job: serializeAIJob(job), credits: await getCreditBalance(userId), duplicate: true }, { headers });
  }
  if (isTerminalGenerationJobState(state)) {
    return NextResponse.json({ error: 'Este trabajo ya terminó y no se puede cancelar.' }, { status: 409, headers });
  }
  // Una generación con lease vigente ya está en curso: su llamada al proveedor no
  // se puede deshacer ni recuperar el coste. Se reintenta cuando venza el lease.
  if (job.leaseExpiresAt && job.leaseExpiresAt.getTime() > Date.now()) {
    return NextResponse.json({ error: 'La generación ya está en curso. Inténtalo de nuevo en unos segundos.' }, { status: 409, headers });
  }

  await refundCredits(job);
  const cancelled = await transitionGenerationJob({
    jobId: String(job._id),
    from: state,
    to: 'cancelled',
    patch: {
      progressMessage: 'Generación cancelada; los créditos fueron devueltos',
      errorCategory: 'cancelled',
      creditsState: job.creditsState,
      creditsCharged: job.creditsCharged ?? null,
    },
  });
  await notifyJobFinished(cancelled);
  await cancelled.save();
  return NextResponse.json({ job: serializeAIJob(cancelled), credits: await getCreditBalance(userId) }, { headers });
}
