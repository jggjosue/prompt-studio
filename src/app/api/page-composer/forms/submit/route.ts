import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { recordObservabilityEvent } from '@/lib/observability-server';
import {
  loadFormConfig,
  notifySiteOwner,
  resolveSiteFromHost,
  storeSubmission,
} from '@/lib/page-forms';
import { validateSubmission } from '@/lib/form-fields';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** Límite por sitio+formulario+IP: 5 envíos cada 5 minutos. */
const SUBMIT_LIMIT = { limit: 5, windowMs: 5 * 60_000 };

/**
 * POST /api/page-composer/forms/submit
 *
 * Recibe envíos de los formularios del sitio publicado. El sitio se resuelve del
 * hostname (subdominio o dominio personalizado activo) — nunca de datos del
 * cliente —, se valida contra la configuración publicada, se aplica honeypot y
 * rate limit, y se guarda en Mongo bajo ese sitio. Los datos privados nunca se
 * exponen: la respuesta solo dice si el envío se aceptó.
 */
export async function POST(request: Request) {
  const host = request.headers.get('host') ?? '';
  const site = await resolveSiteFromHost(host);
  if (!site) {
    return NextResponse.json({ ok: false, error: 'Sitio no encontrado.' }, { status: 404, headers: headers() });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ ok: false, error: 'Formulario inválido.' }, { status: 400, headers: headers() });

  const formId = typeof formData.get('formId') === 'string' ? (formData.get('formId') as string).slice(0, 64) : '';
  if (!formId) return NextResponse.json({ ok: false, error: 'Falta el formulario.' }, { status: 400, headers: headers() });

  // Honeypot: un bot suele rellenarlo. Si está relleno, se acepta en silencio
  // sin guardar nada (la respuesta es idéntica a un éxito normal).
  const honeypot = formData.get('_hp');
  if (honeypot && typeof honeypot === 'string' && honeypot.trim()) {
    return NextResponse.json({ ok: true }, { headers: headers() });
  }

  const config = await loadFormConfig(site.siteId, formId);
  if (!config) {
    return NextResponse.json({ ok: false, error: 'Formulario no disponible.' }, { status: 404, headers: headers() });
  }

  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || null;
  const quota = await rateLimit({ key: `form:${site.siteId}:${formId}:${ip ?? 'unknown'}`, ...SUBMIT_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const values: Record<string, string> = {};
  for (const field of config.fields) {
    const raw = formData.get(field.name);
    values[field.name] = typeof raw === 'string' ? raw : '';
  }
  const consent = formData.get('consent') === 'true' || formData.get('consent') === 'on';

  const errors = validateSubmission(config.fields, values, config.consentRequired, consent);
  if (errors.length) {
    return NextResponse.json({ ok: false, error: errors[0], errors }, { status: 422, headers: headers() });
  }

  await storeSubmission({
    siteId: site.siteId,
    hostname: site.hostname,
    config,
    fields: values,
    consent,
    ip,
    userAgent: request.headers.get('user-agent'),
  });

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_form_submit',
    route: '/api/page-composer/forms/submit',
    status: 'success',
    metadata: { siteId: site.siteId, formId, variant: config.variant },
  });

  // Notificación best-effort al dueño del sitio.
  void notifySiteOwner(site.siteId, site.hostname, config);

  return NextResponse.json({ ok: true }, { headers: headers() });
}