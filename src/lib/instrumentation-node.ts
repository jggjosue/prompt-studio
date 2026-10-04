import type { ObservabilityCategory } from '@/models/ObservabilityEvent';

type RequestError = Error & { digest?: string };
type RequestInfo = { path: string; method: string };
type RequestContext = { routerKind?: string; routeType?: string; routePath?: string };

/**
 * Node-runtime request error reporting.
 *
 * Kept in a separate module so instrumentation.ts can avoid statically pulling
 * mongoose and MongoDB dependencies into Edge/Workers bundles.
 */
export async function reportNodeRequestError(
  error: RequestError,
  request: RequestInfo,
  context: RequestContext
) {
  const { errorFingerprint, recordObservabilityEvent } = await import(
    '@/lib/observability-server'
  );

  await recordObservabilityEvent({
    category: 'server_error' satisfies ObservabilityCategory,
    name: error.name || 'request_error',
    route: context.routePath || request.path || 'server',
    status: 'error',
    fingerprint:
      error.digest ||
      errorFingerprint(error, context.routePath || request.path),
    metadata: {
      message: error.message,
      method: request.method,
      routerKind: context.routerKind ?? null,
      routeType: context.routeType ?? null,
    },
  });
}
