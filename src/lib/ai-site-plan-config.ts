import { resolveAIModelId } from '@/lib/ai-credit-config';
import { AIPlanError } from '@/lib/editor/ai-site-planner';

/** Resuelve exclusivamente modelos project habilitados en el catálogo del servidor. */
export function resolvePlannerModel(provider: string, requestedModel?: string): string {
  const explicit = requestedModel?.trim();
  const resolved = resolveAIModelId('project', provider, explicit);
  if (explicit && !resolved) {
    throw new AIPlanError('MODEL_NOT_ALLOWED', `El modelo ${explicit} no está habilitado para generar sitios.`);
  }
  const fallback = resolved ?? resolveAIModelId('project', provider);
  if (!fallback) throw new AIPlanError('MODEL_NOT_ALLOWED', `El proveedor ${provider} no tiene un modelo habilitado para sitios.`);
  return fallback;
}
