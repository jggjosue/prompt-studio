/**
 * Planificador de sitios por IA.
 *
 * Convierte una petición en lenguaje natural en un `PageSchema` **estructurado y
 * validado**. El modelo nunca devuelve HTML ejecutable: se le pide JSON puro y
 * cada resultado pasa por `migratePageSchema` y, si hace falta, por una capa de
 * reparación que descarta componentes desconocidos, corrige anidamiento, limpia
 * props inválidas y URLs inseguras.
 *
 * El núcleo es agnóstico del proveedor: `planSite` recibe un `callModel`
 * inyectado, de modo que se puede probar sin red ni credenciales.
 */

import {
  PAGE_CHILDREN,
  PAGE_COMPONENT_TYPES,
  PAGE_PROP_FIELDS,
  PAGE_SCHEMA_VERSION,
  TOKEN_KEY_PATTERN,
  isPageComponentType,
  migratePageSchema,
  safeUrl,
  styleValueToCss,
  validatePageSchema,
  type NodeStyles,
  type PageComponentType,
  type PageNode,
  type PropField,
  type SitePage,
  type SiteSchema,
} from './page-schema';

/* ----------------------------------------------------------------- errores --- */

export type AIPlanErrorCode =
  | 'EMPTY_PROMPT'
  | 'INPUT_TOO_LARGE'
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'MODEL_NOT_ALLOWED'
  | 'PROVIDER_ERROR'
  | 'INSUFFICIENT_CREDITS';

/** Error tipado del planner; se serializa al cliente con su código. */
export class AIPlanError extends Error {
  readonly code: AIPlanErrorCode;
  constructor(code: AIPlanErrorCode, message: string) {
    super(message);
    this.name = 'AIPlanError';
    this.code = code;
  }
}

export type SitePlanResult = { schema: SiteSchema; warnings: string[] };

/* ------------------------------------------------------------------ prompt --- */

const CONTAINER_RULES = (Object.entries(PAGE_CHILDREN) as Array<[PageComponentType, readonly PageComponentType[] | undefined]>)
  .filter(([, children]) => children && children.length)
  .map(([type, children]) => `- ${type} acepta: ${(children ?? []).join(', ')}`)
  .join('\n');

export function buildSitePlannerPrompt(request: string): { system: string; user: string } {
  const system = [
    'Eres el Planificador de Sitios de Prompt Studio. Conviertes una petición en un documento PageSchema (JSON) que un renderer seguro convierte a React.',
    'NUNCA devuelvas HTML, JavaScript ni código ejecutable. Devuelve SOLO un objeto JSON válido, sin markdown ni comentarios.',
    `Componentes permitidos como secciones de página: ${PAGE_COMPONENT_TYPES.join(', ')}.`,
    'Solo container y columns aceptan hijos; el resto son hojas (los repetibles van en props.items).',
    `Reglas de anidamiento:\n${CONTAINER_RULES}`,
    'Una navbar como máximo y al inicio; un footer como máximo y al final; cada página con al menos una sección.',
    'URLs seguras: http(s)://, /ruta-interna, #ancla, mailto:. Prohibido javascript: y data:.',
    'Theme: site.theme.tokens con claves como color.primary, color.background, color.surface, color.ink, color.muted; y fontFamily para tipografía.',
    'SEO: site.seo y page.seo con title y description.',
    'Formato esperado: {"schemaVersion":1,"site":{"name","defaultLocale","seo","theme"},"pages":[{"id","name","slug","seo","sections":[{"id","type","props","styles","children"}]}]}.',
    'styles es un mapa por breakpoint: desktop (base), tablet y mobile (solo lo que cambia).',
  ].join('\n');
  const user = [
    `Petición: ${request}`,
    'Genera el PageSchema completo: estructura del sitio, páginas, secciones, copy, configuración de componentes, tokens de tema y SEO básico.',
  ].join('\n');
  return { system, user };
}

/* ------------------------------------------------------------------ parsing --- */

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function cleanPropValue(field: PropField, value: unknown): unknown {
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return typeof value === 'string' ? value : undefined;
    case 'url':
    case 'image':
      return safeUrl(value);
    case 'select':
      return (field.options ?? []).includes(value as string) ? value : undefined;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    case 'boolean':
      return typeof value === 'boolean' ? value : undefined;
    case 'list':
      return Array.isArray(value) ? sanitizeStructuredList(value, field.itemFields ?? []) : undefined;
  }
}

/**
 * Las listas de props contienen objetos tipados (links, imágenes, planes…). El
 * schema valida que sean arrays, pero las URLs internas también deben pasar por
 * la misma allow-list que una prop URL de primer nivel.
 */
function sanitizeStructuredList(value: unknown[], fields: readonly PropField[]): unknown[] {
  return value.flatMap(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const clean: Record<string, unknown> = {};
    const source = item as Record<string, unknown>;
    for (const field of fields) {
      const nested = source[field.key];
      if (nested === undefined) continue;
      const cleaned = cleanPropValue(field, nested);
      if (cleaned !== undefined) clean[field.key] = cleaned;
    }
    if (fields.some(field => field.required && clean[field.key] === undefined)) return [];
    return [clean];
  });
}

function repairStyles(raw: unknown, warnings: string[]): NodeStyles {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: NodeStyles = {};
  for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
    const map = (raw as Record<string, unknown>)[breakpoint];
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
    const clean: Record<string, string | number> = {};
    for (const [property, value] of Object.entries(map as Record<string, unknown>)) {
      if (typeof value !== 'string' && typeof value !== 'number') continue;
      if (styleValueToCss(property, value) === null) {
        warnings.push(`Estilo inválido descartado: ${property}`);
        continue;
      }
      clean[property] = value;
    }
    if (Object.keys(clean).length) out[breakpoint] = clean;
  }
  return out;
}

function repairProps(type: PageComponentType, raw: unknown, warnings: string[]): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const source = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const field of PAGE_PROP_FIELDS[type]) {
    const value = source[field.key];
    if (value === undefined) continue;
    const cleaned = cleanPropValue(field, value);
    if (cleaned !== undefined) out[field.key] = cleaned;
    else warnings.push(`Prop inválida descartada: ${type}.${field.key}`);
  }
  return out;
}

function repairNode(raw: unknown, parentType: PageComponentType | null, warnings: string[]): PageNode | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const node = raw as Record<string, unknown>;
  const type = node.type;
  if (!isPageComponentType(type)) {
    warnings.push(`Componente desconocido descartado: ${String(node.type ?? '?')}`);
    return null;
  }
  if (parentType && !(PAGE_CHILDREN[parentType] ?? []).includes(type)) {
    warnings.push(`Anidamiento inválido descartado: ${type} dentro de ${parentType}`);
    return null;
  }
  const children: PageNode[] = [];
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const repaired = repairNode(child, type, warnings);
      if (repaired) children.push(repaired);
    }
  }
  const id =
    typeof node.id === 'string' && /^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(node.id)
      ? node.id
      : `${type}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, type, props: repairProps(type, node.props, warnings), styles: repairStyles(node.styles, warnings), children };
}

function repairTokens(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'string' || typeof key !== 'string') continue;
    if (!TOKEN_KEY_PATTERN.test(key)) continue;
    if (/[;{}<>]/.test(value)) continue;
    out[key] = value;
  }
  return out;
}

/** Repara un documento malformado: descarta lo inválido y conserva lo sano. */
export function repairSiteSchema(raw: unknown): SitePlanResult | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const candidate = raw as Record<string, unknown>;
  if (!candidate.site || typeof candidate.site !== 'object' || !Array.isArray(candidate.pages)) return null;

  const warnings: string[] = [];
  const site = candidate.site as Record<string, unknown>;
  const siteSeo = (site.seo ?? {}) as Record<string, unknown>;

  const pages: SitePage[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const uniqueId = (candidate: unknown, prefix: string) => {
    const base = typeof candidate === 'string' && /^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(candidate)
      ? candidate
      : `${prefix}-${ids.size + 1}`;
    let id = base;
    let suffix = 2;
    while (ids.has(id)) id = `${base}-${suffix++}`;
    if (id !== candidate) warnings.push(`Id reparado: ${String(candidate ?? '?')} → ${id}`);
    ids.add(id);
    return id;
  };
  for (const rawPage of candidate.pages as unknown[]) {
    if (!rawPage || typeof rawPage !== 'object' || Array.isArray(rawPage)) continue;
    const page = rawPage as Record<string, unknown>;
    const sections: PageNode[] = [];
    if (Array.isArray(page.sections)) {
      for (const section of page.sections) {
        const repaired = repairNode(section, null, warnings);
        if (repaired) sections.push(repaired);
      }
    }
    const navbar = sections.find(section => section.type === 'navbar');
    const footer = sections.find(section => section.type === 'footer');
    const orderedSections = [
      ...(navbar ? [navbar] : []),
      ...sections.filter(section => section.type !== 'navbar' && section.type !== 'footer'),
      ...(footer ? [footer] : []),
    ];
    const requestedSlug = typeof page.slug === 'string' && /^\/(?!\/)[A-Za-z0-9/_-]*$/.test(page.slug)
      ? page.slug
      : pages.length === 0 ? '/' : `/page-${pages.length + 1}`;
    let slug = requestedSlug;
    let slugSuffix = 2;
    while (slugs.has(slug)) {
      slug = requestedSlug === '/' ? `/page-${pages.length + 1}` : `${requestedSlug.replace(/\/$/, '')}-${slugSuffix++}`;
    }
    slugs.add(slug);
    const pageSeo = (page.seo ?? {}) as Record<string, unknown>;
    pages.push({
      id: uniqueId(page.id, 'page'),
      name: typeof page.name === 'string' ? page.name : `Página ${pages.length + 1}`,
      slug,
      seo: {
        title: typeof pageSeo.title === 'string' ? pageSeo.title : '',
        description: typeof pageSeo.description === 'string' ? pageSeo.description : '',
      },
      sections: orderedSections.map(section => {
        const visit = (node: PageNode): PageNode => ({
          ...node,
          id: uniqueId(node.id, node.type),
          children: node.children.map(visit),
        });
        return visit(section);
      }),
    });
  }
  if (!pages.length) return null;

  const schema: SiteSchema = {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      name: typeof site.name === 'string' && site.name.trim() ? site.name : 'Sitio generado por IA',
      defaultLocale: 'es',
      seo: {
        title: typeof siteSeo.title === 'string' ? siteSeo.title : 'Sitio generado por IA',
        description: typeof siteSeo.description === 'string' ? siteSeo.description : '',
      },
      theme: {
        tokens: repairTokens((site.theme as Record<string, unknown> | undefined)?.tokens),
        fontFamily: typeof (site.theme as Record<string, unknown> | undefined)?.fontFamily === 'string'
          ? (site.theme as Record<string, unknown>).fontFamily as string
          : undefined,
      },
    },
    pages,
  };

  const result = validatePageSchema(schema);
  if (!result.ok) return null;
  return { schema: result.schema, warnings };
}

/** Extrae y valida el JSON del modelo; repara si es necesario. */
export function parseSitePlanJson(text: string): SitePlanResult {
  const stripped = stripFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió un JSON válido.');
  }

  const migrated = migratePageSchema(parsed);
  if (migrated) return { schema: migrated, warnings: [] };

  const candidate = parsed as Record<string, unknown> | null;
  const version = typeof candidate?.schemaVersion === 'number' ? candidate.schemaVersion : 1;
  if (version > PAGE_SCHEMA_VERSION) {
    throw new AIPlanError('INVALID_SCHEMA', `Versión de schema no soportada (${version}).`);
  }

  const repaired = repairSiteSchema(parsed);
  if (repaired) return repaired;

  throw new AIPlanError('INVALID_SCHEMA', 'El modelo devolvió un PageSchema inválido que no pudo repararse.');
}

/* ------------------------------------------------------------ orquestación --- */

export type PlanSiteDeps = {
  /** Llama al modelo y devuelve el texto crudo. Lanza `AIPlanError` si falla. */
  callModel: (system: string, user: string, model: string) => Promise<string>;
  model?: string;
};

export type PlanSiteOutput = { schema: SiteSchema; warnings: string[]; model: string };

/** Orquesta: prompt → modelo → JSON validado (y reparado si hace falta). */
export async function planSite(request: string, deps: PlanSiteDeps): Promise<PlanSiteOutput> {
  const trimmed = request.trim();
  if (!trimmed) throw new AIPlanError('EMPTY_PROMPT', 'Escribe qué sitio quieres crear.');
  if (trimmed.length > 4000) throw new AIPlanError('INPUT_TOO_LARGE', 'La petición es demasiado larga.');

  const model = deps.model ?? 'gemini-2.5-flash';
  const { system, user } = buildSitePlannerPrompt(trimmed);

  let text: string;
  try {
    text = await deps.callModel(system, user, model);
  } catch (error) {
    if (error instanceof AIPlanError) throw error;
    throw new AIPlanError('PROVIDER_ERROR', error instanceof Error ? error.message : 'Error del proveedor de IA.');
  }

  const { schema, warnings } = parseSitePlanJson(text);
  return { schema, warnings, model };
}
