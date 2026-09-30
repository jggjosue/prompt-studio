import { z } from 'zod';
import { getPageComponentDefinition } from '@/components/page-builder/registry';
import {
  PAGE_SCHEMA_VERSION,
  type PageComponentNode,
  type PageSchema,
} from '@/lib/page-builder/schema';
import { isSafeStyleValue, isStyleProperty, resolveThemeToken } from '@/lib/page-builder/styles';

export type PageSchemaIssue = { code: string; path: string; message: string };
export type PageSchemaValidation =
  | { success: true; data: PageSchema; issues: [] }
  | { success: false; issues: PageSchemaIssue[] };

const idSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/);
const seoSchema = z.object({
  title: z.string().min(1).max(160), description: z.string().min(1).max(500),
  canonical: z.string().max(2048).optional(), image: z.string().max(2048).optional(), noindex: z.boolean().optional(),
}).strict();
const styleSchema = z.record(z.union([z.string(), z.number()]));
const responsiveSchema = z.object({ laptop: styleSchema.optional(), tablet: styleSchema.optional(), mobile: styleSchema.optional() }).strict();
const themeSchema = z.object({
  colors: z.object({ background: z.string(), surface: z.string(), text: z.string(), muted: z.string(), primary: z.string(), secondary: z.string(), border: z.string() }).strict(),
  typography: z.object({ bodyFontFamily: z.string(), headingFontFamily: z.string() }).strict(),
  spacing: z.object({ xs: z.string(), sm: z.string(), md: z.string(), lg: z.string(), xl: z.string() }).strict(),
  radii: z.object({ sm: z.string(), md: z.string(), lg: z.string(), full: z.string() }).strict(),
  shadows: z.object({ sm: z.string(), md: z.string(), lg: z.string() }).strict(),
}).strict();
const componentSchema = z.object({
  id: idSchema, type: z.string().min(1).max(80), props: z.record(z.unknown()),
  styles: styleSchema, responsive: responsiveSchema, children: z.array(idSchema).max(500),
}).strict();
const sectionSchema = z.object({
  id: idSchema, name: z.string().min(1).max(160), componentIds: z.array(idSchema).max(500),
  styles: styleSchema, responsive: responsiveSchema,
}).strict();
const pageSchema = z.object({
  id: idSchema, name: z.string().min(1).max(160), slug: z.string().min(1).max(240),
  sectionIds: z.array(idSchema).max(200), seo: seoSchema,
}).strict();
const rawPageSchema = z.object({
  schemaVersion: z.literal(PAGE_SCHEMA_VERSION),
  site: z.object({
    id: idSchema, name: z.string().min(1).max(160), locale: z.string().min(2).max(20),
    defaultPageId: idSchema, pageIds: z.array(idSchema).min(1).max(200), seo: seoSchema, theme: themeSchema,
  }).strict(),
  pages: z.record(pageSchema), sections: z.record(sectionSchema), components: z.record(componentSchema),
}).strict();

function issue(code: string, path: string, message: string): PageSchemaIssue {
  return { code, path, message };
}

function repeated(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter(value => seen.has(value) || !seen.add(value));
}

function validateStyles(value: Record<string, string | number>, path: string, issues: PageSchemaIssue[], theme: PageSchema['site']['theme']) {
  for (const [property, styleValue] of Object.entries(value)) {
    if (!isStyleProperty(property)) issues.push(issue('style-property-unknown', `${path}.${property}`, `La propiedad de estilo ${property} no está permitida.`));
    else if (!isSafeStyleValue(styleValue)) issues.push(issue('style-value-unsafe', `${path}.${property}`, `El valor de ${property} no es seguro.`));
    else if (typeof styleValue === 'string' && styleValue.startsWith('token:') && !resolveThemeToken(theme, styleValue)) issues.push(issue('theme-token-unknown', `${path}.${property}`, `El token ${styleValue} no existe en el tema.`));
  }
}

/** Valida forma, props, ids, referencias, ciclos, nesting y estilos antes de renderizar. */
export function validatePageSchema(input: unknown): PageSchemaValidation {
  const parsed = rawPageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map(zodIssue => issue('schema-malformed', zodIssue.path.join('.'), zodIssue.message)),
    };
  }

  const schema = parsed.data as unknown as PageSchema;
  const issues: PageSchemaIssue[] = [];
  const pageIds = new Set(Object.keys(schema.pages));
  const sectionIds = new Set(Object.keys(schema.sections));
  const componentIds = new Set(Object.keys(schema.components));

  if (!pageIds.has(schema.site.defaultPageId)) issues.push(issue('default-page-missing', 'site.defaultPageId', 'La página predeterminada no existe.'));
  for (const duplicate of repeated(schema.site.pageIds)) issues.push(issue('duplicate-page', 'site.pageIds', `La página ${duplicate} está repetida.`));
  for (const pageId of schema.site.pageIds) if (!pageIds.has(pageId)) issues.push(issue('page-missing', 'site.pageIds', `La página ${pageId} no existe.`));
  for (const pageId of pageIds) if (!schema.site.pageIds.includes(pageId)) issues.push(issue('page-orphan', `pages.${pageId}`, `La página ${pageId} no está ordenada en site.pageIds.`));

  const slugs = new Map<string, string>();
  for (const [key, page] of Object.entries(schema.pages)) {
    if (key !== page.id) issues.push(issue('id-mismatch', `pages.${key}.id`, 'La clave y el id de la página no coinciden.'));
    const previous = slugs.get(page.slug);
    if (previous) issues.push(issue('duplicate-slug', `pages.${key}.slug`, `El slug ya pertenece a ${previous}.`));
    slugs.set(page.slug, key);
    for (const duplicate of repeated(page.sectionIds)) issues.push(issue('duplicate-section', `pages.${key}.sectionIds`, `La sección ${duplicate} está repetida.`));
    for (const sectionId of page.sectionIds) if (!sectionIds.has(sectionId)) issues.push(issue('section-missing', `pages.${key}.sectionIds`, `La sección ${sectionId} no existe.`));
  }

  const usedSections = new Set(Object.values(schema.pages).flatMap(page => page.sectionIds));
  for (const [key, section] of Object.entries(schema.sections)) {
    if (key !== section.id) issues.push(issue('id-mismatch', `sections.${key}.id`, 'La clave y el id de la sección no coinciden.'));
    if (!usedSections.has(key)) issues.push(issue('section-orphan', `sections.${key}`, `La sección ${key} no pertenece a ninguna página.`));
    for (const duplicate of repeated(section.componentIds)) issues.push(issue('duplicate-component', `sections.${key}.componentIds`, `El componente ${duplicate} está repetido.`));
    for (const componentId of section.componentIds) if (!componentIds.has(componentId)) issues.push(issue('component-missing', `sections.${key}.componentIds`, `El componente ${componentId} no existe.`));
    validateStyles(section.styles, `sections.${key}.styles`, issues, schema.site.theme);
    for (const [breakpoint, styles] of Object.entries(section.responsive)) validateStyles(styles ?? {}, `sections.${key}.responsive.${breakpoint}`, issues, schema.site.theme);
  }

  for (const [key, node] of Object.entries(schema.components)) {
    if (key !== node.id) issues.push(issue('id-mismatch', `components.${key}.id`, 'La clave y el id del componente no coinciden.'));
    const definition = getPageComponentDefinition(node.type);
    if (!definition) {
      issues.push(issue('component-unknown', `components.${key}.type`, `El componente ${node.type} no está registrado.`));
    } else {
      const props = definition.propsSchema.safeParse(node.props);
      if (!props.success) {
        for (const propsIssue of props.error.issues) issues.push(issue('props-invalid', `components.${key}.props.${propsIssue.path.join('.')}`, propsIssue.message));
      }
      if (definition.allowedChildren !== '*') {
        for (const childId of node.children) {
          const child = schema.components[childId];
          if (child && !definition.allowedChildren.includes(child.type)) issues.push(issue('child-not-allowed', `components.${key}.children`, `${node.type} no admite hijos ${child.type}.`));
        }
      }
    }
    for (const duplicate of repeated(node.children)) issues.push(issue('duplicate-child', `components.${key}.children`, `El hijo ${duplicate} está repetido.`));
    for (const childId of node.children) if (!componentIds.has(childId)) issues.push(issue('component-missing', `components.${key}.children`, `El hijo ${childId} no existe.`));
    validateStyles(node.styles, `components.${key}.styles`, issues, schema.site.theme);
    for (const [breakpoint, styles] of Object.entries(node.responsive)) validateStyles(styles ?? {}, `components.${key}.responsive.${breakpoint}`, issues, schema.site.theme);
  }

  for (const [group, values] of Object.entries(schema.site.theme)) {
    for (const [key, value] of Object.entries(values)) if (!isSafeStyleValue(value)) issues.push(issue('theme-value-unsafe', `site.theme.${group}.${key}`, 'El token de tema no es seguro.'));
  }

  const owners = new Map<string, string>();
  const visiting = new Set<string>();
  const reached = new Set<string>();
  const walk = (id: string, owner: string, depth: number) => {
    if (depth > 32) { issues.push(issue('nesting-too-deep', `components.${id}`, 'El anidamiento supera 32 niveles.')); return; }
    if (visiting.has(id)) { issues.push(issue('component-cycle', `components.${id}`, 'El árbol contiene un ciclo.')); return; }
    const previousOwner = owners.get(id);
    if (previousOwner && previousOwner !== owner) { issues.push(issue('component-two-parents', `components.${id}`, `El componente también pertenece a ${previousOwner}.`)); return; }
    owners.set(id, owner);
    const node = schema.components[id];
    if (!node) return;
    visiting.add(id); reached.add(id);
    for (const childId of node.children) walk(childId, id, depth + 1);
    visiting.delete(id);
  };
  for (const section of Object.values(schema.sections)) for (const rootId of section.componentIds) walk(rootId, section.id, 0);
  for (const id of componentIds) if (!reached.has(id)) issues.push(issue('component-orphan', `components.${id}`, `El componente ${id} no pertenece a una sección.`));

  return issues.length > 0 ? { success: false, issues } : { success: true, data: schema, issues: [] };
}

export function isPageSchema(input: unknown): input is PageSchema {
  return validatePageSchema(input).success;
}

export function assertPageSchema(input: unknown): PageSchema {
  const result = validatePageSchema(input);
  if (!result.success) throw new Error(result.issues.map(entry => `${entry.code}@${entry.path}`).join(', '));
  return result.data;
}

export function validateComponentNode(node: PageComponentNode): PageSchemaIssue[] {
  const definition = getPageComponentDefinition(node.type);
  if (!definition) return [issue('component-unknown', `components.${node.id}.type`, `El componente ${node.type} no está registrado.`)];
  const result = definition.propsSchema.safeParse(node.props);
  return result.success ? [] : result.error.issues.map(entry => issue('props-invalid', `components.${node.id}.props.${entry.path.join('.')}`, entry.message));
}
