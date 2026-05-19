/** Utilidades para enlazar demos vía Refactory Online (carga bajo demanda). */

const LOADER_PATH = '/webpages/refactory-online/loader.html';
const FOLDER_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

/**
 * demoUrl en web-pages.json = nombre de carpeta en el bucket R2 (ej. "magzin-job-dark").
 * También acepta rutas legacy /webpages/{carpeta}/index.html.
 */
export function normalizeDemoFolder(demoUrl: string): string | null {
  const trimmed = demoUrl.trim();
  if (!trimmed) return null;

  const legacyPath = trimmed.match(/\/webpages\/([^/]+)(?:\/|$)/);
  if (legacyPath) return legacyPath[1];

  if (FOLDER_SLUG_RE.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  return null;
}

/** @deprecated Usa normalizeDemoFolder */
export function slugFromDemoUrl(demoUrl: string): string | null {
  return normalizeDemoFolder(demoUrl);
}

export function getRefactoryLoaderUrl(demoUrl: string): string {
  const folder = normalizeDemoFolder(demoUrl);
  if (folder) {
    return `${LOADER_PATH}?demo=${encodeURIComponent(folder)}`;
  }
  if (/^https?:\/\//i.test(demoUrl.trim())) {
    return demoUrl.trim();
  }
  return demoUrl;
}

export const REFACTORY_LOADER_PATH = LOADER_PATH;
export const REFACTORY_API_PATH = '/api/refactory-online';
