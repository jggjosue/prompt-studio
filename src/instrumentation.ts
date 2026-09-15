export async function register() {
  // Reserved for SDK exporters. Application metrics are persisted by the shared recorder.
}

export async function onRequestError(error: Error & { digest?: string }, request: { path: string; method: string }, context: { routerKind?: string; routeType?: string; routePath?: string }) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.error('Edge request error', request.path, error);
    return;
  }
  const { errorFingerprint, recordObservabilityEvent } = await import('@/lib/observability-server');
  await recordObservabilityEvent({
    category: 'server_error',
    name: error.name || 'request_error',
    route: context.routePath || request.path || 'server',
    status: 'error',
    fingerprint: error.digest || errorFingerprint(error, context.routePath || request.path),
    metadata: { message: error.message, method: request.method, routerKind: context.routerKind ?? null, routeType: context.routeType ?? null },
  });
}
