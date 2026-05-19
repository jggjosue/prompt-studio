const GITHUB_WEBPAGES_BASE =
  'https://raw.githubusercontent.com/jggjosue/Prompts-images/refs/heads/main/webpages';

/**
 * Convierte imageUrl del JSON (/webpages/placeholder-….png) en URL servible por la app.
 * Los archivos viven en R2 (bucket prompt-studio) y se entregan vía API.
 */
export function resolveWebPageImageUrl(imageUrl: string): string {
  const trimmed = imageUrl?.trim() ?? '';
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith('/webpages/')) {
    const assetPath = trimmed.replace(/^\/webpages\//, '');
    return `/api/webpages/assets/${assetPath}`;
  }

  return trimmed;
}

export function githubWebPageAssetUrl(filename: string): string {
  const clean = filename.replace(/^\/+/, '').replace(/^webpages\//, '');
  return `${GITHUB_WEBPAGES_BASE}/${clean}`;
}

export function contentTypeForAsset(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}
