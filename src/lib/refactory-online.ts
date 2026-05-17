/** Utilidades para enlazar demos vía Refactory Online (carga bajo demanda). */

const LOADER_PATH = '/webpages/refactory-online/loader.html';

export function slugFromDemoUrl(demoUrl: string): string | null {
  const match = demoUrl.match(/\/webpages\/([^/]+)\//);
  return match ? match[1] : null;
}

export function getRefactoryLoaderUrl(demoUrl: string): string {
  const slug = slugFromDemoUrl(demoUrl);
  if (!slug) return demoUrl;
  return `${LOADER_PATH}?demo=${encodeURIComponent(slug)}`;
}

export const REFACTORY_LOADER_PATH = LOADER_PATH;
export const REFACTORY_API_PATH = '/api/refactory-online';
