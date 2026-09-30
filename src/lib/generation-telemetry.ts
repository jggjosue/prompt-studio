import 'server-only';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { sanitizeObservabilityMetadata } from '@/lib/observability-safety';
import { parseGeneratedImageSource } from '@/lib/generated-image-source';
import type { GenerationRequestContext } from '@/lib/generation-request-observability';

/**
 * Telemetría del ciclo de vida de una generación.
 *
 * Lo que falta hasta aquí era el par `generation_started` / `generation_failed`:
 * sin él no se puede medir tasa de éxito por proveedor, porque la ruta de imagen
 * de Genkit solo escribía `console.warn` y nada quedaba en `observability_events`.
 *
 * Privacidad: aquí no entra ni el prompt ni el contenido. De la imagen solo se
 * conservan mime, tamaño decodificado y si quedó inline o remota; la allowlist de
 * `sanitizeObservabilityMetadata` es la que aplica, y ningún prompt sobrevive
 * porque ni siquiera se le pasa.
 */
export const GENERATION_TELEMETRY_ROUTE = '/api/ai/jobs/process';

type TelemetryContext = Pick<GenerationRequestContext, 'provider' | 'jobId' | 'correlationId' | 'modelId' | 'userId'>;

type Credits = {
  /** Crédito estimado al aceptar el trabajo, no el cobrado. */
  estimated?: number | null;
  /** Estado de la reserva en el momento del evento. */
  state?: string | null;
};

async function record(input: {
  name: string;
  status: string;
  context: TelemetryContext;
  kind?: string;
  attempts?: number | null;
  durationMs?: number | null;
  credits?: Credits;
  metadata?: Record<string, unknown>;
}) {
  const { context, credits, ...rest } = input;
  const metadata = sanitizeObservabilityMetadata({
    operation: 'image_generation',
    kind: rest.kind,
    provider: context.provider,
    modelId: context.modelId,
    jobId: context.jobId,
    correlationId: context.correlationId,
    attempts: rest.attempts ?? null,
    creditsEstimated: credits?.estimated ?? null,
    creditsState: credits?.state ?? null,
    ...rest.metadata,
  });
  await recordObservabilityEvent({
    category: 'ai_generation',
    name: rest.name,
    route: GENERATION_TELEMETRY_ROUTE,
    userId: context.userId,
    productId: context.jobId,
    status: rest.status,
    durationMs: rest.durationMs ?? undefined,
    value: credits?.estimated ?? undefined,
    unit: credits?.estimated ? 'credits' : undefined,
    metadata,
  });
}

export async function recordGenerationStarted(
  context: TelemetryContext,
  input: { kind: string; attempts?: number | null; credits?: Credits },
) {
  await record({ name: 'generation_started', status: 'started', context, kind: input.kind, attempts: input.attempts, credits: input.credits });
}

export async function recordImageGenerationCompleted(
  context: TelemetryContext,
  input: { kind: string; durationMs: number; attempts?: number | null; credits?: Credits; imageUrl: string },
) {
  // Solo la forma del resultado: mime y tamaño. Si los bytes no se pueden leer,
  // se registra `inline` igualmente —lo que importa para diagnosticar es que
  // hubo una imagen, no poder re-derivarla.
  let mimeType: string | null = null;
  let byteLength: number | null = null;
  let storageKind = 'inline';
  try {
    const source = parseGeneratedImageSource(input.imageUrl);
    storageKind = source.kind;
    mimeType = source.kind === 'inline' ? source.mimeType : null;
    byteLength = source.kind === 'inline' ? source.buffer.length : null;
  } catch {
    storageKind = 'unparsable';
  }
  await record({
    name: 'generation_completed',
    status: 'completed',
    context,
    kind: input.kind,
    attempts: input.attempts,
    durationMs: input.durationMs,
    credits: input.credits,
    metadata: { mimeType, byteLength, base64Length: input.imageUrl.length, storageKind, storageOutcome: 'returned_inline' },
  });
}

export async function recordGenerationFailed(
  context: TelemetryContext,
  input: {
    kind: string;
    durationMs: number;
    errorCategory: string;
    httpStatus?: number | null;
    retryable?: boolean | null;
    errorCode?: string | null;
    finishReason?: string | null;
    attempts?: number | null;
    credits?: Credits;
  },
) {
  await record({
    name: 'generation_failed',
    status: 'failed',
    context,
    kind: input.kind,
    attempts: input.attempts,
    durationMs: input.durationMs,
    credits: input.credits,
    metadata: {
      errorCategory: input.errorCategory,
      httpStatus: input.httpStatus ?? null,
      retryable: input.retryable ?? null,
      errorCode: input.errorCode ?? null,
      finishReason: input.finishReason ?? null,
    },
  });
}

export type CreditReconciliationOperation = 'reserve' | 'capture' | 'refund';

/**
 * Una reserva que no cuadra es el fallo más caro de este pipeline sin que nadie
 * entere: el usuario ni paga ni recibe nada y no queda rastro. Por eso el
 * conflicto se registra en el momento en que se lanza, no cuando alguien se
 * queja.
 */
export async function recordCreditReconciliationFailure(input: {
  operation: CreditReconciliationOperation;
  jobId: string;
  correlationId?: string | null;
  provider?: string | null;
  modelId?: string | null;
  userId?: string | null;
  credits?: number | null;
  errorCode: string;
  category: string;
}) {
  await recordObservabilityEvent({
    category: 'ai_generation',
    name: 'generation_credit_reconciliation_failed',
    route: GENERATION_TELEMETRY_ROUTE,
    userId: input.userId,
    productId: input.jobId,
    status: 'error',
    value: input.credits ?? undefined,
    unit: input.credits ? 'credits' : undefined,
    metadata: sanitizeObservabilityMetadata({
      operation: 'credit_reconciliation',
      creditOperation: input.operation,
      provider: input.provider,
      modelId: input.modelId,
      jobId: input.jobId,
      correlationId: input.correlationId,
      errorCode: input.errorCode,
      errorCategory: input.category,
    }),
  });
}
