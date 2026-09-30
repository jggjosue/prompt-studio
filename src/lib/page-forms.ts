import 'server-only';

import { createHash } from 'node:crypto';
import { clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongoose';
import PageComposerSubmission, { type IPageComposerSubmission } from '@/models/PageComposerSubmission';
import PageComposerProject from '@/models/PageComposerProject';
import PageComposerDomain from '@/models/PageComposerDomain';
import { getSitePublishedVersion } from '@/lib/publish-site';
import { normalizeHostname, tenantSubdomain } from '@/lib/tenant-sites';
import { sendTransactionalEmail } from '@/lib/transactional-email';
import {
  FORM_VARIANTS,
  defaultFormFields,
  parseFormFields,
  type FormFieldConfig,
  type FormVariant,
} from '@/lib/form-fields';

export type ResolvedSite = { siteId: string; hostname: string };

/**
 * Resuelve el sitio desde el hostname del envío (subdominio o dominio
 * personalizado activo). Aislamiento: un envío solo puede aterrizar en el sitio
 * que posee el hostname.
 */
export async function resolveSiteFromHost(host: string): Promise<ResolvedSite | null> {
  const hostname = normalizeHostname(host);
  await connectToDatabase();

  const subdomain = tenantSubdomain(hostname);
  if (subdomain) {
    const project = await PageComposerProject.findOne({ subdomain }).select('_id').lean();
    if (!project) return null;
    return { siteId: String(project._id), hostname: `${subdomain}.prompstudio.com` };
  }

  const custom = await PageComposerDomain.findOne({ hostname, status: 'active' }).select('siteId').lean();
  if (!custom) return null;
  return { siteId: String(custom.siteId), hostname };
}

export type FormConfig = {
  formId: string;
  variant: FormVariant;
  fields: FormFieldConfig[];
  consentRequired: boolean;
  emailTo?: string;
};

/** Localiza el formulario dentro de la versión publicada y lee su configuración. */
function findFormInSchema(schema: unknown, formId: string): FormConfig | null {
  const walk = (node: unknown): FormConfig | null => {
    if (!node || typeof node !== 'object') return null;
    const record = node as Record<string, unknown>;
    if (record.type === 'contact-form') {
      const props = (record.props ?? {}) as Record<string, unknown>;
      if (record.id === formId) {
        const variant = (FORM_VARIANTS.includes(props.variant as FormVariant) ? props.variant : 'contact') as FormVariant;
        const configured = parseFormFields(props.fields);
        return {
          formId,
          variant,
          fields: configured.length ? configured : defaultFormFields(variant),
          consentRequired: props.consentRequired === true,
          emailTo: typeof props.emailTo === 'string' ? props.emailTo : undefined,
        };
      }
    }
    const children = Array.isArray(record.children) ? record.children : [];
    for (const child of children) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  return walk(schema);
}

/** Configuración de un formulario del sitio publicado, o null si no existe. */
export async function loadFormConfig(siteId: string, formId: string): Promise<FormConfig | null> {
  const published = await getSitePublishedVersion(siteId);
  if (!published) return null;
  return findFormInSchema(published.schema, formId);
}

function hashIp(ip: string): string {
  return createHash('sha256').update(`ps-form:${ip}`).digest('hex').slice(0, 32);
}

export type StoreSubmissionInput = {
  siteId: string;
  hostname: string;
  config: FormConfig;
  fields: Record<string, string>;
  consent: boolean;
  ip?: string | null;
  userAgent?: string | null;
};

/** Guarda un envío validado. La IP viaja hasheada, no en claro. */
export async function storeSubmission(input: StoreSubmissionInput): Promise<IPageComposerSubmission> {
  await connectToDatabase();
  const submission = await PageComposerSubmission.create({
    siteId: input.siteId,
    formId: input.config.formId,
    formVariant: input.config.variant,
    hostname: input.hostname,
    fields: input.fields,
    consent: input.consent,
    ipHash: input.ip ? hashIp(input.ip) : null,
    userAgent: input.userAgent ? input.userAgent.slice(0, 500) : null,
  });
  return submission;
}

/** Notifica al dueño del sitio (best-effort) usando la infra de email existente. */
export async function notifySiteOwner(siteId: string, hostname: string, config: FormConfig): Promise<boolean> {
  try {
    const project = await PageComposerProject.findById(siteId).select('userId').lean();
    if (!project?.userId) return false;
    const user = await (await clerkClient()).users.getUser(project.userId);
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return false;
    return sendTransactionalEmail({
      to: email,
      subject: `Nuevo envío de ${hostname}`,
      text: `Recibiste un nuevo envío del formulario "${config.formId}" en ${hostname}. Revisa tu panel de envíos en Prompt Studio.`,
      context: { operation: 'form_notification', siteId, formId: config.formId },
    });
  } catch {
    return false;
  }
}

export async function listSubmissions(siteId: string, limit = 100) {
  await connectToDatabase();
  return PageComposerSubmission.find({ siteId }).sort({ createdAt: -1 }).limit(limit).lean();
}

/** Serializa envíos a CSV (cabeceras = unión de campos). */
export function submissionsToCsv(submissions: Array<{ fields: Record<string, string>; createdAt: Date; hostname: string; formVariant: string }>): string {
  const columns = new Set<string>(['createdAt', 'hostname', 'formVariant']);
  for (const submission of submissions) for (const key of Object.keys(submission.fields)) columns.add(key);
  const headers = [...columns];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = submissions.map(submission => {
    const row: string[] = [];
    for (const header of headers) {
      if (header === 'createdAt') row.push(escape(new Date(submission.createdAt).toISOString()));
      else if (header === 'hostname') row.push(escape(submission.hostname));
      else if (header === 'formVariant') row.push(escape(submission.formVariant));
      else row.push(escape(submission.fields[header] ?? ''));
    }
    return row.join(',');
  });
  return [headers.map(escape).join(','), ...rows].join('\n');
}