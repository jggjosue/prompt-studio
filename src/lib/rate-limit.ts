/**
 * Rate limiting para rutas API — capa Next.
 *
 * La lógica de conteo vive en `rate-limit-core.ts` (sin dependencias de Next,
 * para que sea testeable). Aquí solo se envuelve en `NextResponse`.
 */
import { NextResponse } from 'next/server';
import {
  clientIp,
  rateLimit,
  rateLimitHeaders,
  retryAfterSeconds,
  type RateLimitResult,
} from '@/lib/rate-limit-core';

export {
  clientIp,
  rateLimit,
  rateLimitHeaders,
  RATE_LIMITS,
  type RateLimitOptions,
  type RateLimitResult,
} from '@/lib/rate-limit-core';

/** Respuesta 429 lista para devolver cuando se agota la cuota. */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Demasiadas peticiones. Inténtalo de nuevo en unos segundos.' },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(result),
        'Retry-After': String(retryAfterSeconds(result)),
        'Cache-Control': 'private, no-store',
      },
    }
  );
}

/**
 * Atajo para el caso habitual: limitar por IP en una ruta concreta.
 * Devuelve la respuesta 429 si hay que cortar, o `null` si se puede continuar.
 */
export async function enforceIpRateLimit(
  request: Request,
  route: string,
  preset: { limit: number; windowMs: number }
): Promise<NextResponse | null> {
  const result = await rateLimit({ key: `${route}:${clientIp(request)}`, ...preset });
  return result.ok ? null : tooManyRequests(result);
}
