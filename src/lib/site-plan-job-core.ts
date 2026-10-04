import { AIPlanError, planSite, type PlanSiteDeps } from '@/lib/editor/ai-site-planner';
import { validatePageSchema } from '@/lib/editor/page-schema';

/**
 * Website (page composer) generation as a queue job (#834).
 *
 * Reuses the existing planner unchanged: prompt → model → JSON → migrate/
 * repair → PageSchema. A schema that is still invalid is a validation error
 * and is never charged (the job is dead-lettered and its reservation
 * released). Credits go through the standard job reserve/capture boundary.
 *
 * The full schema is written to R2 and referenced from the job; a copy is
 * kept inline only while it is small, so MongoDB documents stay bounded.
 */

export const SITE_PLAN_WORKFLOW = 'site_plan';
export const SITE_PLAN_INLINE_MAX_BYTES = 256 * 1024;

export type SitePlanJobInput = { userId: string; jobId: string; request: string; provider: string; model: string };

export type SitePlanJobDeps = {
  callModel: PlanSiteDeps['callModel'];
  storeSchema(key: string, json: string): Promise<string | null>;
};

export function sitePlanSchemaKey(userId: string, jobId: string) {
  return `generated/sites/${userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)}/${jobId}.json`;
}

/** Maps planner failures onto the shared retry categories (codes are matched by generationJobErrorCategory). */
export function sitePlanErrorCode(error: AIPlanError): string {
  switch (error.code) {
    case 'EMPTY_PROMPT':
    case 'INPUT_TOO_LARGE':
    case 'INVALID_JSON':
    case 'INVALID_SCHEMA':
      return `VALIDATION_${error.code}`;
    case 'MODEL_NOT_ALLOWED':
      return 'CONFIG_MODEL_NOT_ALLOWED';
    case 'INSUFFICIENT_CREDITS':
      return 'VALIDATION_INSUFFICIENT_CREDITS';
    default:
      return 'PROVIDER_ERROR';
  }
}

export async function runSitePlanJobCore(input: SitePlanJobInput, deps: SitePlanJobDeps): Promise<Record<string, unknown>> {
  let planned;
  try {
    planned = await planSite(input.request, { callModel: deps.callModel, model: input.model });
  } catch (error) {
    if (error instanceof AIPlanError) {
      // Keep the planner's own message; the code drives retry/no-retry.
      throw Object.assign(new Error(error.message), { code: sitePlanErrorCode(error) });
    }
    throw error;
  }
  // Defence in depth: the planner already migrates/repairs, but nothing that
  // fails the canonical validator may be stored or charged.
  const validation = validatePageSchema(planned.schema);
  if (!validation.ok) {
    throw Object.assign(new Error(`El sitio generado no cumple PageSchema: ${validation.issues.slice(0, 3).map(issue => issue.message).join('; ')}`), { code: 'VALIDATION_INVALID_SCHEMA' });
  }
  const json = JSON.stringify(validation.schema);
  const key = sitePlanSchemaKey(input.userId, input.jobId);
  const url = await deps.storeSchema(key, json);
  if (!url) throw Object.assign(new Error('R2 no está configurado para guardar el sitio generado.'), { code: 'R2_NOT_CONFIGURED' });
  const inline = Buffer.byteLength(json, 'utf8') <= SITE_PLAN_INLINE_MAX_BYTES;
  return {
    workflow: SITE_PLAN_WORKFLOW,
    ...(inline ? { schema: validation.schema } : {}),
    schemaInline: inline,
    assetKey: key,
    outputUrl: url,
    pageCount: validation.schema.pages.length,
    warnings: planned.warnings.slice(0, 20),
    provider: input.provider,
    model: planned.model,
  };
}
