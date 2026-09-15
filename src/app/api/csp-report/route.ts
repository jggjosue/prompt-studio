/**
 * Receptor de informes de violación de CSP (`report-uri`).
 *
 * Mientras la política esté en `Report-Only`, aquí llega todo lo que la CSP
 * *habría* bloqueado. Sirve para calibrar la allowlist antes de pasar a modo
 * bloqueo: si un tercero legítimo aparece en estos logs, hay que añadirlo a
 * `src/lib/security-headers.ts`; si no aparece nada durante unos días, la
 * política está lista para `CSP_ENFORCE=true`.
 *
 * El endpoint es necesariamente público —lo llama el navegador, sin sesión— así
 * que va con rate limiting: una página rota puede generar miles de informes por
 * visita, y sin límite serían miles de escrituras en el log.
 */
import { NextResponse } from 'next/server';
import { enforceIpRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** Se ignoran: ruido de extensiones del navegador, no fallos del sitio. */
const IGNORED_SOURCES = [
  'chrome-extension',
  'moz-extension',
  'safari-extension',
  'safari-web-extension',
  'about:blank',
];

type CspReport = {
  'document-uri'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'blocked-uri'?: string;
  'source-file'?: string;
  'line-number'?: number;
};

function isNoise(report: CspReport): boolean {
  const candidates = [report['blocked-uri'], report['source-file'], report['document-uri']];
  return candidates.some(
    value => typeof value === 'string' && IGNORED_SOURCES.some(prefix => value.startsWith(prefix))
  );
}

export async function POST(request: Request) {
  const limited = await enforceIpRateLimit(request, 'csp-report', RATE_LIMITS.publicWrite);
  if (limited) return limited;

  // 204 en todos los caminos: el navegador no hace nada con la respuesta y no
  // conviene dar señal a quien sondee el endpoint.
  const noContent = () => new NextResponse(null, { status: 204 });

  const body = await request.json().catch(() => null);
  const report: CspReport | null =
    body?.['csp-report'] ?? (Array.isArray(body) ? body[0]?.body : null) ?? null;

  if (!report || typeof report !== 'object' || isNoise(report)) return noContent();

  console.warn('[csp]', {
    directive: report['effective-directive'] ?? report['violated-directive'],
    blocked: report['blocked-uri'],
    document: report['document-uri'],
    source: report['source-file'],
    line: report['line-number'],
  });

  return noContent();
}
