export async function register() {
  // Reserved for SDK exporters. Application metrics are persisted by the shared recorder.
}

export async function onRequestError(error: Error & { digest?: string }, request: { path: string; method: string }, context: { routerKind?: string; routeType?: string; routePath?: string }) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.error('Edge request error', request.path, error);
    return;
  }
  const { reportNodeRequestError } = await import('@/lib/instrumentation-node');
  await reportNodeRequestError(error, request, context);
}
