import { getPageComponentDefinition } from '@/components/page-builder/registry';
import { validateStyleDraft } from '@/lib/page-builder/inspector-controls';
import {
  type ComponentNodeOf,
  type ComponentPropsMap,
  type ComponentStyles,
  type PageComponentNode,
  type PageComponentType,
  type PageSchema,
  type ResponsiveBreakpoint,
  type ResponsiveOverrides,
  type StyleProperty,
  type StyleValue,
} from '@/lib/page-builder/schema';
import { safeHref, safeImageSrc } from '@/lib/page-builder/styles';
import { validatePageSchema } from '@/lib/page-builder/validation';

export type ComponentLocation =
  | { kind: 'section'; sectionId: string; index: number }
  | { kind: 'component'; parentId: string; index: number };

export type ComponentTarget =
  | { kind: 'new-section'; pageId: string; index: number }
  | { kind: 'section'; sectionId: string; index: number }
  | { kind: 'component'; parentId: string; index: number };

export type EditorMutationError =
  | 'page-missing'
  | 'section-missing'
  | 'component-missing'
  | 'component-unknown'
  | 'invalid-nesting'
  | 'cycle'
  | 'root-location-missing'
  | 'property-missing'
  | 'props-invalid'
  | 'style-not-allowed'
  | 'style-value-invalid'
  | 'responsive-not-supported'
  | 'theme-token-missing'
  | 'schema-invalid';

export type EditorMutationResult =
  | { schema: PageSchema; componentId?: string; sectionId?: string }
  | { error: EditorMutationError };

function cloneSchema(schema: PageSchema): PageSchema {
  return structuredClone(schema);
}

function clampIndex(length: number, index: number): number {
  return Math.max(0, Math.min(length, index));
}

function nextAvailableId(schema: PageSchema, prefix: string, collection: 'components' | 'sections'): string {
  const rows = schema[collection] as Record<string, unknown>;
  let index = 1;
  while (rows[`${prefix}-${index}`]) index += 1;
  return `${prefix}-${index}`;
}

export function createPageComponent<K extends PageComponentType>(
  type: K,
  id: string,
  props: Partial<ComponentPropsMap[K]> = {},
  styles: ComponentStyles = {},
  responsive: ResponsiveOverrides = {},
  children: string[] = []
): ComponentNodeOf<K> {
  const definition = getPageComponentDefinition(type);
  return {
    id,
    type,
    props: { ...structuredClone(definition.defaultProps), ...structuredClone(props) },
    styles: { ...definition.defaultStyles, ...styles },
    responsive: structuredClone(responsive),
    children: [...children],
  };
}

export function getComponentLocation(schema: PageSchema, componentId: string): ComponentLocation | null {
  for (const section of Object.values(schema.sections)) {
    const index = section.componentIds.indexOf(componentId);
    if (index >= 0) return { kind: 'section', sectionId: section.id, index };
  }
  for (const node of Object.values(schema.components)) {
    const index = node.children.indexOf(componentId);
    if (index >= 0) return { kind: 'component', parentId: node.id, index };
  }
  return null;
}

export function componentDescendants(schema: PageSchema, componentId: string): string[] {
  const output: string[] = [];
  const walk = (id: string) => {
    for (const childId of schema.components[id]?.children ?? []) {
      output.push(childId);
      walk(childId);
    }
  };
  walk(componentId);
  return output;
}

function targetList(schema: PageSchema, target: Exclude<ComponentTarget, { kind: 'new-section' }>): string[] | null {
  if (target.kind === 'section') return schema.sections[target.sectionId]?.componentIds ?? null;
  return schema.components[target.parentId]?.children ?? null;
}

function removeFromLocation(schema: PageSchema, componentId: string, location: ComponentLocation): void {
  if (location.kind === 'section') {
    schema.sections[location.sectionId].componentIds = schema.sections[location.sectionId].componentIds.filter(id => id !== componentId);
  } else {
    schema.components[location.parentId].children = schema.components[location.parentId].children.filter(id => id !== componentId);
  }
}

function finalize(schema: PageSchema, extra: Omit<Extract<EditorMutationResult, { schema: PageSchema }>, 'schema'> = {}): EditorMutationResult {
  const validation = validatePageSchema(schema);
  return validation.success ? { schema, ...extra } : { error: 'schema-invalid' };
}

function editablePropertyValueIsSafe(control: string, value: unknown): boolean {
  if (value === undefined) return true;
  if (control === 'url') return typeof value === 'string' && (!value || safeHref(value, '') === value);
  if (control !== 'image') return true;
  if (typeof value === 'string') return !value || safeImageSrc(value) === value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const src = (value as { src?: unknown }).src;
  return typeof src === 'string' && (!src || safeImageSrc(src) === src);
}

export function updateComponentProperty(
  schema: PageSchema,
  componentId: string,
  property: string,
  value: unknown
): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  const metadata = definition?.editableProperties.find(entry => entry.key === property);
  if (!definition || !metadata) return { error: 'property-missing' };
  if (!editablePropertyValueIsSafe(metadata.control, value)) return { error: 'props-invalid' };
  const props = { ...(node.props as unknown as Record<string, unknown>) };
  if (value === undefined) delete props[property];
  else props[property] = structuredClone(value);
  const parsed = definition.propsSchema.safeParse(props);
  if (!parsed.success) return { error: 'props-invalid' };
  const next = cloneSchema(schema);
  next.components[componentId] = { ...next.components[componentId], props: parsed.data } as PageComponentNode;
  return finalize(next, { componentId });
}

export function resetComponentProperty(schema: PageSchema, componentId: string, property: string): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  if (!definition?.editableProperties.some(entry => entry.key === property)) return { error: 'property-missing' };
  const defaults = definition.defaultProps as unknown as Record<string, unknown>;
  return updateComponentProperty(
    schema,
    componentId,
    property,
    Object.prototype.hasOwnProperty.call(defaults, property) ? structuredClone(defaults[property]) : undefined
  );
}

export function updateComponentStyle(
  schema: PageSchema,
  componentId: string,
  property: StyleProperty,
  value: StyleValue,
  breakpoint?: ResponsiveBreakpoint
): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  if (!definition?.styleControls.includes(property)) return { error: 'style-not-allowed' };
  if (breakpoint && (!definition.responsive.enabled || !definition.responsive.properties.includes(property))) return { error: 'responsive-not-supported' };
  const parsed = validateStyleDraft(property, String(value), schema.site.theme);
  if (!parsed.success) return { error: typeof value === 'string' && value.startsWith('token:') ? 'theme-token-missing' : 'style-value-invalid' };
  if (parsed.value === undefined) return { error: 'style-value-invalid' };
  const next = cloneSchema(schema);
  if (breakpoint) next.components[componentId].responsive[breakpoint] = { ...next.components[componentId].responsive[breakpoint], [property]: parsed.value };
  else next.components[componentId].styles[property] = parsed.value;
  return finalize(next, { componentId });
}

export function resetComponentStyle(
  schema: PageSchema,
  componentId: string,
  property: StyleProperty,
  breakpoint?: ResponsiveBreakpoint
): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  if (!definition?.styleControls.includes(property)) return { error: 'style-not-allowed' };
  const next = cloneSchema(schema);
  if (breakpoint) {
    const overrides = { ...(next.components[componentId].responsive[breakpoint] ?? {}) };
    delete overrides[property];
    if (Object.keys(overrides).length === 0) delete next.components[componentId].responsive[breakpoint];
    else next.components[componentId].responsive[breakpoint] = overrides;
  } else if (definition.defaultStyles[property] === undefined) {
    delete next.components[componentId].styles[property];
  } else {
    next.components[componentId].styles[property] = definition.defaultStyles[property];
  }
  return finalize(next, { componentId });
}

export function resetComponentStyles(schema: PageSchema, componentId: string): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  if (!definition) return { error: 'component-unknown' };
  const next = cloneSchema(schema);
  next.components[componentId].styles = structuredClone(definition.defaultStyles);
  next.components[componentId].responsive = {};
  return finalize(next, { componentId });
}

export function resetComponentToDefaults(schema: PageSchema, componentId: string): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const definition = getPageComponentDefinition(node.type);
  if (!definition) return { error: 'component-unknown' };
  const next = cloneSchema(schema);
  next.components[componentId] = {
    ...next.components[componentId],
    props: structuredClone(definition.defaultProps),
    styles: structuredClone(definition.defaultStyles),
    responsive: {},
  } as PageComponentNode;
  return finalize(next, { componentId });
}

export function canDropComponent(
  schema: PageSchema,
  type: PageComponentType,
  target: ComponentTarget,
  movingId?: string
): EditorMutationError | null {
  if (!getPageComponentDefinition(type)) return 'component-unknown';
  if (target.kind === 'new-section') return schema.pages[target.pageId] ? null : 'page-missing';
  if (target.kind === 'section') return schema.sections[target.sectionId] ? null : 'section-missing';
  const parent = schema.components[target.parentId];
  if (!parent) return 'component-missing';
  if (movingId && (movingId === parent.id || componentDescendants(schema, movingId).includes(parent.id))) return 'cycle';
  const definition = getPageComponentDefinition(parent.type);
  if (!definition || definition.allowedChildren !== '*' && !definition.allowedChildren.includes(type)) return 'invalid-nesting';
  return null;
}

export function insertComponent(
  schema: PageSchema,
  type: PageComponentType,
  target: ComponentTarget
): EditorMutationResult {
  const rejected = canDropComponent(schema, type, target);
  if (rejected) return { error: rejected };
  const next = cloneSchema(schema);
  const componentId = nextAvailableId(next, type, 'components');
  next.components[componentId] = createPageComponent(type, componentId) as PageComponentNode;

  if (target.kind === 'new-section') {
    const page = next.pages[target.pageId];
    if (!page) return { error: 'page-missing' };
    const sectionId = nextAvailableId(next, 'section', 'sections');
    next.sections[sectionId] = { id: sectionId, name: getPageComponentDefinition(type).label, componentIds: [componentId], styles: { paddingBlock: '32px' }, responsive: {} };
    page.sectionIds.splice(clampIndex(page.sectionIds.length, target.index), 0, sectionId);
    return finalize(next, { componentId, sectionId });
  }

  const list = targetList(next, target);
  if (!list) return { error: target.kind === 'section' ? 'section-missing' : 'component-missing' };
  list.splice(clampIndex(list.length, target.index), 0, componentId);
  return finalize(next, { componentId });
}

export function moveComponent(schema: PageSchema, componentId: string, target: ComponentTarget): EditorMutationResult {
  const node = schema.components[componentId];
  if (!node) return { error: 'component-missing' };
  const location = getComponentLocation(schema, componentId);
  if (!location) return { error: 'root-location-missing' };
  const rejected = canDropComponent(schema, node.type, target, componentId);
  if (rejected) return { error: rejected };
  const next = cloneSchema(schema);
  const nextLocation = getComponentLocation(next, componentId);
  if (!nextLocation) return { error: 'root-location-missing' };
  removeFromLocation(next, componentId, nextLocation);

  if (target.kind === 'new-section') {
    const page = next.pages[target.pageId];
    if (!page) return { error: 'page-missing' };
    const sectionId = nextAvailableId(next, 'section', 'sections');
    next.sections[sectionId] = { id: sectionId, name: getPageComponentDefinition(node.type).label, componentIds: [componentId], styles: { paddingBlock: '32px' }, responsive: {} };
    page.sectionIds.splice(clampIndex(page.sectionIds.length, target.index), 0, sectionId);
    return finalize(next, { componentId, sectionId });
  }

  const list = targetList(next, target);
  if (!list) return { error: target.kind === 'section' ? 'section-missing' : 'component-missing' };
  list.splice(clampIndex(list.length, target.index), 0, componentId);
  return finalize(next, { componentId });
}

export function reorderSection(schema: PageSchema, pageId: string, sectionId: string, toIndex: number): EditorMutationResult {
  const page = schema.pages[pageId];
  if (!page) return { error: 'page-missing' };
  const fromIndex = page.sectionIds.indexOf(sectionId);
  if (fromIndex < 0) return { error: 'section-missing' };
  const next = cloneSchema(schema);
  const list = next.pages[pageId].sectionIds;
  list.splice(fromIndex, 1);
  list.splice(clampIndex(list.length, toIndex), 0, sectionId);
  return finalize(next, { sectionId });
}

export function moveComponentByOffset(schema: PageSchema, componentId: string, offset: -1 | 1): EditorMutationResult {
  const location = getComponentLocation(schema, componentId);
  if (!location) return { error: 'root-location-missing' };
  const next = cloneSchema(schema);
  const list = location.kind === 'section'
    ? next.sections[location.sectionId].componentIds
    : next.components[location.parentId].children;
  const nextIndex = Math.max(0, Math.min(list.length - 1, location.index + offset));
  if (nextIndex === location.index) return { schema, componentId };
  list.splice(location.index, 1);
  list.splice(nextIndex, 0, componentId);
  return finalize(next, { componentId });
}

export function moveSectionByOffset(schema: PageSchema, pageId: string, sectionId: string, offset: -1 | 1): EditorMutationResult {
  const page = schema.pages[pageId];
  if (!page) return { error: 'page-missing' };
  const index = page.sectionIds.indexOf(sectionId);
  if (index < 0) return { error: 'section-missing' };
  const nextIndex = Math.max(0, Math.min(page.sectionIds.length - 1, index + offset));
  if (nextIndex === index) return { schema, sectionId };
  const next = cloneSchema(schema);
  next.pages[pageId].sectionIds.splice(index, 1);
  next.pages[pageId].sectionIds.splice(nextIndex, 0, sectionId);
  return finalize(next, { sectionId });
}

export function duplicateComponent(schema: PageSchema, componentId: string): EditorMutationResult {
  const source = schema.components[componentId];
  if (!source) return { error: 'component-missing' };
  const location = getComponentLocation(schema, componentId);
  if (!location) return { error: 'root-location-missing' };
  const next = cloneSchema(schema);
  const reservedIds = new Set(Object.keys(next.components));
  const reserveNextId = (prefix: string) => {
    let index = 1;
    let candidate = `${prefix}-${index}`;
    while (reservedIds.has(candidate)) {
      index += 1;
      candidate = `${prefix}-${index}`;
    }
    reservedIds.add(candidate);
    return candidate;
  };

  const cloneSubtree = (id: string): string => {
    const node = next.components[id];
    const nextId = reserveNextId(node.type);
    const clonedChildren = node.children.map(cloneSubtree);
    next.components[nextId] = {
      ...structuredClone(node),
      id: nextId,
      props: structuredClone(node.props),
      styles: { ...node.styles },
      responsive: structuredClone(node.responsive),
      children: clonedChildren,
    } as PageComponentNode;
    return nextId;
  };

  const duplicateId = cloneSubtree(componentId);
  const list = location.kind === 'section'
    ? next.sections[location.sectionId].componentIds
    : next.components[location.parentId].children;
  list.splice(location.index + 1, 0, duplicateId);
  return finalize(next, { componentId: duplicateId });
}

export function deleteComponent(schema: PageSchema, componentId: string): EditorMutationResult {
  if (!schema.components[componentId]) return { error: 'component-missing' };
  const location = getComponentLocation(schema, componentId);
  if (!location) return { error: 'root-location-missing' };
  const next = cloneSchema(schema);
  const ids = [componentId, ...componentDescendants(next, componentId)];
  removeFromLocation(next, componentId, location);
  for (const id of ids) delete next.components[id];
  return finalize(next);
}
