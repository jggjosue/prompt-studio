import Cloudflare from 'cloudflare';
import fs from 'fs';
import path from 'path';
import {
  getDemoProjectKind,
  getDemoProjectManifest,
  isRefactoryPreviewable,
  type DemoProjectKind,
} from '@/lib/demo-project-type';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import {
  getR2BucketName,
  isR2S3Configured,
  validateR2ProjectFolder,
  type R2ProjectValidation,
} from '@/lib/r2-storage';

export type R2BucketSummary = {
  name: string;
  creationDate?: string;
  jurisdiction?: string;
  location?: string;
};

export type DemoUrlValidationResult = {
  demoUrl: string;
  valid: boolean;
  status: 'prompt-only' | 'ok' | 'invalid' | 'misconfigured';
  slug: string | null;
  projectKind: DemoProjectKind | null;
  refactoryPreviewable: boolean;
  checks: {
    format: boolean;
    localFile: boolean | null;
    r2BucketExists: boolean | null;
    r2ProjectValid: boolean | null;
    httpReachable: boolean | null;
  };
  r2?: R2ProjectValidation;
  foundFiles?: string[];
  expectedRequired?: string[];
  reason?: string;
};

function getAccountId(): string | undefined {
  return process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
}

function getApiToken(): string | undefined {
  return process.env.CLOUDFLARE_API_TOKEN?.trim();
}

export function isCloudflareR2Configured(): boolean {
  return Boolean(getAccountId() && getApiToken());
}

export function isR2Configured(): boolean {
  return isR2S3Configured() || isCloudflareR2Configured();
}

export function createCloudflareClient(): Cloudflare {
  const apiToken = getApiToken();
  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN no está configurado');
  }
  return new Cloudflare({ apiToken });
}

export async function listR2Buckets(): Promise<R2BucketSummary[]> {
  const accountId = getAccountId();
  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID no está configurado');
  }

  const client = createCloudflareClient();
  const buckets: R2BucketSummary[] = [];
  let cursor: string | undefined;

  do {
    const page = await client.r2.buckets.list({
      account_id: accountId,
      per_page: 100,
      ...(cursor ? { cursor } : {}),
    });

    for (const bucket of page.buckets ?? []) {
      if (!bucket.name) continue;
      buckets.push({
        name: bucket.name,
        creationDate: bucket.creation_date,
        jurisdiction: bucket.jurisdiction,
        location: bucket.location,
      });
    }

    cursor = page.result_info?.cursor ?? undefined;
  } while (cursor);

  return buckets;
}

function localProjectExists(
  folder: string,
  projectKind: DemoProjectKind
): boolean | null {
  const dir = path.join(process.cwd(), 'public/webpages', folder);
  if (!fs.existsSync(dir)) return false;

  const manifest = getDemoProjectManifest(projectKind);
  const hasRequired = manifest.required.every((file) =>
    fs.existsSync(path.join(dir, file))
  );
  if (!hasRequired) return false;

  if (manifest.entryAnyOf.length === 0) return true;

  return manifest.entryAnyOf.some((file) =>
    fs.existsSync(path.join(dir, file))
  );
}

async function httpDemoReachable(demoUrl: string): Promise<boolean | null> {
  if (!/^https?:\/\//i.test(demoUrl)) return null;
  try {
    const response = await fetch(demoUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });
    if (response.ok) return true;
    const getResponse = await fetch(demoUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });
    return getResponse.ok;
  } catch {
    return false;
  }
}

async function r2BucketExists(): Promise<boolean | null> {
  if (!isCloudflareR2Configured()) return null;
  try {
    const buckets = await listR2Buckets();
    return buckets.some((b) => b.name === getR2BucketName());
  } catch {
    return null;
  }
}

function buildInvalidReason(
  folder: string,
  projectKind: DemoProjectKind,
  r2: R2ProjectValidation | undefined,
  localOk: boolean
): string {
  if (localOk) return '';

  const manifest = getDemoProjectManifest(projectKind);

  if (projectKind === 'html') {
    return `La carpeta "${folder}" en R2 debe incluir index.html (y opcionalmente styles.css, script.js).`;
  }

  const parts = [
    `La carpeta "${folder}" (${projectKind}) requiere package.json`,
  ];
  if (r2?.missingEntry) {
    parts.push(
      `y al menos uno de: ${manifest.entryAnyOf.slice(0, 4).join(', ')}…`
    );
  }
  if (r2?.missingRequired.length) {
    parts.push(`(falta: ${r2.missingRequired.join(', ')})`);
  }
  return parts.join(' ');
}

/**
 * Valida demoUrl (nombre de carpeta en R2) según stack del proyecto.
 */
export async function validateDemoUrl(
  demoUrl: string,
  stack: string[] = []
): Promise<DemoUrlValidationResult> {
  const trimmed = demoUrl.trim();
  const folder = normalizeDemoFolder(trimmed);
  const projectKind = folder ? getDemoProjectKind(stack) : null;
  const manifest = projectKind ? getDemoProjectManifest(projectKind) : null;

  if (!trimmed) {
    return {
      demoUrl: trimmed,
      valid: true,
      status: 'prompt-only',
      slug: null,
      projectKind: getDemoProjectKind(stack),
      refactoryPreviewable: false,
      checks: {
        format: true,
        localFile: null,
        r2BucketExists: null,
        r2ProjectValid: null,
        httpReachable: null,
      },
    };
  }

  const isHttp = /^https?:\/\//i.test(trimmed);

  if (!folder && !isHttp) {
    return {
      demoUrl: trimmed,
      valid: false,
      status: 'invalid',
      slug: null,
      projectKind: null,
      refactoryPreviewable: false,
      checks: {
        format: false,
        localFile: null,
        r2BucketExists: null,
        r2ProjectValid: null,
        httpReachable: null,
      },
      reason:
        'demoUrl debe ser el nombre de carpeta en R2 (ej. magzin-job-dark) o una URL http(s)',
    };
  }

  if (isHttp) {
    const httpReachable = await httpDemoReachable(trimmed);
    return {
      demoUrl: trimmed,
      valid: httpReachable === true,
      status: httpReachable ? 'ok' : 'invalid',
      slug: null,
      projectKind: null,
      refactoryPreviewable: false,
      checks: {
        format: true,
        localFile: null,
        r2BucketExists: null,
        r2ProjectValid: null,
        httpReachable,
      },
      reason: httpReachable ? undefined : 'La URL del demo no responde correctamente',
    };
  }

  const kind = projectKind ?? 'html';
  const localOk = localProjectExists(folder!, kind) === true;
  const skipR2 = localOk;
  const r2BucketListed =
    !skipR2 && isCloudflareR2Configured() ? await r2BucketExists() : null;

  const r2 =
    !skipR2 && isR2S3Configured()
      ? await validateR2ProjectFolder(folder!, stack)
      : undefined;

  const r2Valid = r2?.valid ?? null;
  const valid = localOk || r2Valid === true;

  return {
    demoUrl: trimmed,
    valid,
    status: valid ? 'ok' : 'invalid',
    slug: folder,
    projectKind: kind,
    refactoryPreviewable: isRefactoryPreviewable(kind),
    checks: {
      format: true,
      localFile: localProjectExists(folder!, kind),
      r2BucketExists: r2BucketListed,
      r2ProjectValid: r2Valid,
      httpReachable: null,
    },
    r2,
    foundFiles: r2?.foundFiles,
    expectedRequired: manifest?.required,
    reason: valid
      ? undefined
      : buildInvalidReason(folder!, kind, r2, localOk),
  };
}
