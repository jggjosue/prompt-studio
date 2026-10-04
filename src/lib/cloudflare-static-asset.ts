type AssetsBinding = { fetch(input: Request | string): Promise<Response> };

/**
 * Reads a file from public/ through the Workers static assets binding.
 * A Worker on a custom domain cannot fetch its own hostname (Cloudflare 522),
 * so env.ASSETS is the only way to read deployed static files at runtime.
 * Returns null outside Cloudflare Workers (Node has the files on disk).
 */
export async function fetchCloudflareStaticAsset(pathname: string): Promise<Response | null> {
  let assets: AssetsBinding | undefined;
  try {
    const workers = (await import(/* webpackIgnore: true */ /* @vite-ignore */ 'cloudflare:workers')) as { env?: { ASSETS?: AssetsBinding } };
    assets = workers.env?.ASSETS;
  } catch {
    return null;
  }
  if (!assets) return null;
  return assets.fetch(new URL(pathname, 'https://assets.local').toString());
}
