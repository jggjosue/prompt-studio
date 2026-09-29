/**
 * Autenticación para rutas de mantenimiento (`/api/sync-*`, crons, tareas admin).
 *
 * Dos credenciales válidas:
 *  1. `CRON_SECRET` — por cabecera `Authorization: Bearer <secreto>` o `?secret=`.
 *     Lo usan Vercel Cron y las invocaciones automatizadas.
 *  2. Sesión de administrador de Clerk (`isPremiumJoAdmin`), para lanzarlas a mano.
 */
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

/**
 * Comparación en tiempo constante. Evita que un atacante deduzca el secreto
 * midiendo cuánto tarda la respuesta. Implementada sin `node:crypto` para que
 * el helper siga siendo utilizable desde el runtime edge.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * `true` si la petición trae el `CRON_SECRET` correcto en Authorization.
 *
 * Usar esta variante en diagnósticos que puedan ejecutarse en producción: un
 * secreto en la query puede terminar en logs, historial o herramientas APM.
 */
export function hasValidCronSecretHeader(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const authorization = request.headers.get('authorization');
  return Boolean(authorization && safeEqual(authorization, `Bearer ${expected}`));
}

/** `true` si la petición trae el `CRON_SECRET` correcto. */
export function hasValidCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  if (hasValidCronSecretHeader(request)) return true;

  const secretParam = new URL(request.url).searchParams.get('secret');
  return Boolean(secretParam && safeEqual(secretParam, expected));
}

/**
 * Exige `CRON_SECRET` o sesión de admin.
 *
 * Devuelve `null` si la petición está autorizada, o la `NextResponse` 401 que
 * debe retornarse tal cual si no lo está:
 *
 * ```ts
 * const denied = await requireCronOrAdmin(request);
 * if (denied) return denied;
 * ```
 */
export async function requireCronOrAdmin(
  request: Request
): Promise<NextResponse | null> {
  if (hasValidCronSecret(request)) return null;
  if (await isPremiumJoAdmin()) return null;

  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers: { 'Cache-Control': 'private, no-store' } }
  );
}
