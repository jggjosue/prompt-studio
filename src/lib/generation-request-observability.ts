import 'server-only';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { safeErrorCode, sanitizeObservabilityMetadata } from '@/lib/observability-safety';
import { isRetryableProviderStatus, providerHttpStatus, safeProviderResponseError, sanitizeProviderErrorMessage } from '@/lib/provider-error-safety';

export interface GenerationRequestContext {
  service: string;
  provider: string;
  host: string;
  endpointLabel: string;
  method: string;
  jobId: string;
  correlationId: string;
  modelId?: string | null;
  userId?: string | null;
}

interface GenerationRequestOutcome {
  httpStatus?: number | null;
  durationMs: number;
  error?: unknown;
  providerErrorCode?: string;
  providerErrorMessage?: string;
}

export async function recordGenerationRequest(context: GenerationRequestContext, outcome: GenerationRequestOutcome) {
  const httpStatus = outcome.httpStatus ?? providerHttpStatus(outcome.error);
  const errorCode = outcome.error ? safeErrorCode(outcome.error) : outcome.providerErrorCode || null;
  const metadata = sanitizeObservabilityMetadata({
    operation: 'provider_request', service: context.service, provider: context.provider,
    host: context.host, endpointLabel: context.endpointLabel, method: context.method,
    jobId: context.jobId, correlationId: context.correlationId, modelId: context.modelId,
    httpStatus, retryable: isRetryableProviderStatus(httpStatus), errorCode,
    providerErrorCode: outcome.providerErrorCode || errorCode,
    providerErrorMessage: sanitizeProviderErrorMessage(outcome.providerErrorMessage || (outcome.error instanceof Error ? outcome.error.message : '')),
  });
  const failed = Boolean(outcome.error) || (typeof httpStatus === 'number' && httpStatus >= 400);
  const log = {
    level: failed ? 'error' : 'info', event: 'generation_provider_request',
    service: metadata.service, provider: metadata.provider, host: metadata.host,
    endpointLabel: metadata.endpointLabel, method: metadata.method,
    httpStatus: metadata.httpStatus, durationMs: outcome.durationMs,
    correlationId: metadata.correlationId, jobId: metadata.jobId, modelId: metadata.modelId,
    retryable: metadata.retryable, providerErrorCode: metadata.providerErrorCode,
    providerErrorMessage: metadata.providerErrorMessage,
  };
  // Successful provider requests are useful in production traces for latency and correlation.
  // eslint-disable-next-line no-console
  (failed ? console.error : console.info)(JSON.stringify(log));
  await recordObservabilityEvent({
    category: 'ai_generation', name: 'generation_provider_request', route: '/api/ai/jobs/process',
    userId: context.userId, productId: context.jobId, status: failed ? 'error' : 'success',
    durationMs: outcome.durationMs, metadata,
  });
}

export async function observedGenerationFetch(context: GenerationRequestContext, request: () => Promise<Response>): Promise<Response> {
  const startedAt = performance.now();
  try {
    const response = await request();
    const providerError = response.ok ? null : await safeProviderResponseError(response);
    await recordGenerationRequest(context, {
      httpStatus: response.status, durationMs: Math.round(performance.now() - startedAt),
      providerErrorCode: providerError?.code, providerErrorMessage: providerError?.message,
    });
    return response;
  } catch (error) {
    await recordGenerationRequest(context, { error, durationMs: Math.round(performance.now() - startedAt) });
    throw error;
  }
}
