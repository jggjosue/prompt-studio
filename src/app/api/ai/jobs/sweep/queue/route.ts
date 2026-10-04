/**
 * GET /api/ai/jobs/sweep/queue
 *
 * Endpoint de barrido liviano para el cron de Cloudflare.
 * Devuelve los IDs de jobs pendientes o reintentables que deben encolarse
 * en la Cloudflare Queue para ser procesados por el ai-worker.
 *
 * A diferencia de /api/ai/jobs/sweep (que ejecuta el sweep completo con
 * refunds y transiciones), este endpoint es puramente de consulta:
 *   - No procesa jobs.
 *   - No modifica estado.
 *   - Devuelve hasta `limit` IDs ordenados por nextAttemptAt.
 *
 * El cron del resend-sync-worker llama este endpoint y publica los IDs
 * en la Queue. El ai-worker los consume con su timeout propio (hasta 290 s).
 *
 * Response: { queued: string[], count: number }
 */
import 'server-only';

import { hasValidCronSecret } from '@/lib/api-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Máximo de jobs a encolar por barrido. Cada uno consumirá un mensaje de la
// Queue; con maxBatchSize=1 en el Worker se procesan en paralelo según la
// capacidad del Worker. Mantenerlo bajo (≤10) para no saturar la Queue
// con IDs duplicados si el cron se ejecuta antes de que el Worker termine.
const MAX_SWEEP_LIMIT = 10;

export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');

  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  await connectToDatabase();

  const now = new Date();

  // Buscar jobs en estados activos que ya son elegibles para ser procesados:
  //   - status: queued | retrying | processing | uploading | finalizing
  //   - creditsState: reserved (créditos ya apartados)
  //   - nextAttemptAt <= now (el backoff expiró)
  //   - attempts < maxAttempts (aún tienen intentos disponibles)
  //   - leaseExpiresAt <= now o null (sin lease activo; el worker no los tiene)
  //
  // Solo devolvemos IDs — el ai-worker hace el findOneAndUpdate atómico real.
  const jobs = await AIGenerationJob
    .find(
      {
        status: { $in: ['queued', 'retrying', 'processing', 'uploading', 'finalizing'] },
        creditsState: 'reserved',
        nextAttemptAt: { $lte: now },
        $expr: { $lt: ['$attempts', '$maxAttempts'] },
        $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }],
      },
      { _id: 1 },
    )
    .sort({ nextAttemptAt: 1, createdAt: 1 })
    .limit(MAX_SWEEP_LIMIT)
    .lean();

  const queued = jobs.map((job) => String(job._id));

  return NextResponse.json({ queued, count: queued.length }, { headers });
}
