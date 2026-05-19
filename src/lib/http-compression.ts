import { brotliCompressSync, constants, gzipSync } from 'zlib';

export type CompressionEncoding = 'br' | 'gzip' | 'identity';

/** Mínimo de bytes para comprimir (respuestas pequeñas no compensan). */
const MIN_COMPRESS_BYTES = 1024;

/**
 * Elige Brotli o Gzip según Accept-Encoding (Brotli tiene prioridad).
 * Ambos usan LZ77 + Huffman; Brotli suele ser mejor en HTML/CSS/JS/JSON.
 */
export function pickCompressionEncoding(
  acceptEncoding: string | null | undefined
): CompressionEncoding {
  if (!acceptEncoding) return 'identity';
  const normalized = acceptEncoding.toLowerCase();
  if (normalized.includes('br')) return 'br';
  if (normalized.includes('gzip')) return 'gzip';
  return 'identity';
}

export function compressBuffer(
  input: Buffer,
  encoding: CompressionEncoding
): { body: Buffer; encoding: CompressionEncoding } {
  if (encoding === 'identity' || input.length < MIN_COMPRESS_BYTES) {
    return { body: input, encoding: 'identity' };
  }

  if (encoding === 'br') {
    return {
      body: brotliCompressSync(input, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 6,
        },
      }),
      encoding: 'br',
    };
  }

  return {
    body: gzipSync(input, { level: 6 }),
    encoding: 'gzip',
  };
}

/**
 * Respuesta HTTP con compresión negociada (Brotli > Gzip > sin comprimir).
 */
export function buildCompressedResponse(
  request: Request,
  body: Buffer,
  init?: ResponseInit
): Response {
  const preferred = pickCompressionEncoding(request.headers.get('accept-encoding'));
  const { body: compressed, encoding } = compressBuffer(body, preferred);

  const headers = new Headers(init?.headers);

  if (encoding !== 'identity') {
    headers.set('Content-Encoding', encoding);
    headers.set('Vary', 'Accept-Encoding');
  }

  return new Response(compressed, {
    status: init?.status ?? 200,
    statusText: init?.statusText,
    headers,
  });
}

export function compressedJsonResponse(
  request: Request,
  data: unknown,
  init?: ResponseInit
): Response {
  const payload = Buffer.from(JSON.stringify(data), 'utf8');
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (init?.status) {
    // buildCompressedResponse uses init.status
  }
  return buildCompressedResponse(request, payload, { ...init, headers });
}

export function compressedTextResponse(
  request: Request,
  text: string,
  contentType: string,
  init?: ResponseInit
): Response {
  const payload = Buffer.from(text, 'utf8');
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', contentType);
  return buildCompressedResponse(request, payload, { ...init, headers });
}
