import { parseGeneratedImageSource } from '@/lib/generated-image-source';
import { isRetryableProviderStatus, providerHttpStatus } from '@/lib/provider-error-safety';
import { safeErrorCode } from '@/lib/observability-safety';

export const GEMINI_SMOKE_MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type GeminiSmokeFailureCategory =
  | 'BAD_REQUEST'
  | 'AUTH_OR_PERMISSION'
  | 'MODEL_NOT_FOUND'
  | 'RATE_LIMIT_OR_QUOTA'
  | 'TIMEOUT'
  | 'NO_IMAGE'
  | 'INVALID_IMAGE_BYTES'
  | 'PROVIDER_ERROR';

export type ValidatedSmokeImage = {
  dataUrl: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
  byteLength: number;
};

function detectImageMime(buffer: Buffer): ValidatedSmokeImage['mimeType'] | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'image/gif';
  return null;
}

export function validateGeminiSmokeImage(dataUrl: string): ValidatedSmokeImage {
  const source = parseGeneratedImageSource(dataUrl);
  if (source.kind !== 'inline') {
    throw Object.assign(new Error('El diagnóstico requiere bytes de imagen inline.'), { code: 'INVALID_IMAGE_BYTES' });
  }
  if (source.buffer.length < 32 || source.buffer.length > GEMINI_SMOKE_MAX_IMAGE_BYTES) {
    throw Object.assign(new Error('El tamaño de la imagen del proveedor no es válido.'), { code: 'INVALID_IMAGE_BYTES' });
  }
  const detectedMime = detectImageMime(source.buffer);
  const declaredMime = source.mimeType.toLowerCase();
  if (!detectedMime || declaredMime !== detectedMime) {
    throw Object.assign(new Error('Los bytes no coinciden con un formato de imagen permitido.'), { code: 'INVALID_IMAGE_BYTES' });
  }
  return {
    dataUrl: `data:${detectedMime};base64,${source.buffer.toString('base64')}`,
    mimeType: detectedMime,
    byteLength: source.buffer.length,
  };
}

export function classifyGeminiSmokeFailure(error: unknown): {
  category: GeminiSmokeFailureCategory;
  httpStatus: number | null;
  code: string;
  retryable: boolean;
} {
  const httpStatus = providerHttpStatus(error);
  const code = safeErrorCode(error);
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  let category: GeminiSmokeFailureCategory = 'PROVIDER_ERROR';

  if (code === 'NO_IMAGE') category = 'NO_IMAGE';
  else if (code === 'INVALID_IMAGE_BYTES') category = 'INVALID_IMAGE_BYTES';
  else if (message.includes('timeout') || message.includes('abort')) category = 'TIMEOUT';
  else if (httpStatus === 400) category = 'BAD_REQUEST';
  else if (httpStatus === 401 || httpStatus === 403) category = 'AUTH_OR_PERMISSION';
  else if (httpStatus === 404) category = 'MODEL_NOT_FOUND';
  else if (httpStatus === 429) category = 'RATE_LIMIT_OR_QUOTA';

  return { category, httpStatus, code, retryable: isRetryableProviderStatus(httpStatus) };
}
