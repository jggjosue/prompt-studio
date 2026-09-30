import type { CSSProperties } from 'react';
import {
  STYLE_PROPERTIES,
  type ComponentStyles,
  type PageDefinition,
  type PageSchema,
  type ResponsiveBreakpoint,
  type StyleProperty,
  type StyleValue,
  type ThemeTokens,
} from '@/lib/page-builder/schema';

export type ThemeTokenReference = {
  [Group in keyof ThemeTokens]: `token:${Group & string}.${Extract<keyof ThemeTokens[Group], string>}`;
}[keyof ThemeTokens];

export type ThemeTokenOption = {
  group: keyof ThemeTokens;
  key: string;
  label: string;
  reference: ThemeTokenReference;
  value: string;
};

const STYLE_SET = new Set<string>(STYLE_PROPERTIES);

export function isStyleProperty(value: string): value is StyleProperty {
  return STYLE_SET.has(value);
}

export function isSafeStyleValue(value: unknown): value is StyleValue {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string' || value.length > 500) return false;
  const normalized = value.toLowerCase().replace(/\s+/g, '');
  return !normalized.includes('javascript:') && !normalized.includes('expression(') &&
    !normalized.includes('url(') && !normalized.includes('@import') &&
    !normalized.includes('</style') && !/[<>]/.test(value);
}

export function safeHref(value: string | undefined, fallback = '#'): string {
  const href = value?.trim() ?? '';
  if (!href) return fallback;
  if (href.startsWith('/') || href.startsWith('#') || href.startsWith('./') || href.startsWith('../')) return href;
  try {
    const parsed = new URL(href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? href : fallback;
  } catch {
    return fallback;
  }
}

export function safeImageSrc(value: string | undefined): string | null {
  const src = value?.trim() ?? '';
  if (!src) return null;
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return src;
  try {
    const parsed = new URL(src);
    return ['http:', 'https:'].includes(parsed.protocol) ? src : null;
  } catch {
    return null;
  }
}

export function themeTokenOptions(tokens: ThemeTokens): ThemeTokenOption[] {
  return (Object.entries(tokens) as Array<[keyof ThemeTokens, Record<string, string>]>).flatMap(([group, values]) =>
    Object.entries(values).map(([key, value]) => ({
      group,
      key,
      label: `${group}.${key}`,
      reference: `token:${group}.${key}` as ThemeTokenReference,
      value,
    }))
  );
}

export function resolveThemeToken(tokens: ThemeTokens, reference: string): string | null {
  const match = /^token:([a-zA-Z][\w-]*)\.([a-zA-Z][\w-]*)$/.exec(reference);
  if (!match) return null;
  const [, group, key] = match;
  const values = tokens[group as keyof ThemeTokens] as Record<string, string> | undefined;
  return values?.[key] ?? null;
}

function tokenVariable(value: string): string {
  if (!value.startsWith('token:')) return value;
  return `var(--ps-${value.slice('token:'.length).replaceAll('.', '-')})`;
}

export function styleToReact(styles: ComponentStyles): CSSProperties {
  const safe: Record<string, StyleValue> = {};
  for (const [property, value] of Object.entries(styles)) {
    if (!isStyleProperty(property) || !isSafeStyleValue(value)) continue;
    safe[property] = typeof value === 'string' ? tokenVariable(value) : value;
  }
  return safe as CSSProperties;
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}

function cssDeclarations(styles: ComponentStyles): string {
  return Object.entries(styles)
    .filter(([property, value]) => isStyleProperty(property) && isSafeStyleValue(value))
    .map(([property, value]) => `${kebab(property)}:${typeof value === 'string' ? tokenVariable(value) : value}`)
    .join(';');
}

export function cssClassForId(prefix: 'component' | 'section', id: string): string {
  return `ps-${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

const MEDIA: Record<ResponsiveBreakpoint, string> = {
  laptop: '(max-width:1199px)', tablet: '(max-width:1023px)', mobile: '(max-width:767px)',
};

export function buildResponsiveCss(schema: PageSchema, page: PageDefinition): string {
  const rules: Record<ResponsiveBreakpoint, string[]> = { laptop: [], tablet: [], mobile: [] };
  for (const sectionId of page.sectionIds) {
    const section = schema.sections[sectionId];
    if (!section) continue;
    for (const breakpoint of Object.keys(MEDIA) as ResponsiveBreakpoint[]) {
      const declarations = cssDeclarations(section.responsive[breakpoint] ?? {});
      if (declarations) rules[breakpoint].push(`.${cssClassForId('section', section.id)}{${declarations}}`);
    }
  }
  for (const node of Object.values(schema.components)) {
    for (const breakpoint of Object.keys(MEDIA) as ResponsiveBreakpoint[]) {
      const stackColumns = node.type === 'columns' && node.props.stackAt === breakpoint
        ? { gridTemplateColumns: '1fr' as const }
        : {};
      const declarations = cssDeclarations({ ...stackColumns, ...(node.responsive[breakpoint] ?? {}) });
      if (declarations) rules[breakpoint].push(`.${cssClassForId('component', node.id)}{${declarations}}`);
    }
  }
  return (Object.keys(MEDIA) as ResponsiveBreakpoint[])
    .filter(breakpoint => rules[breakpoint].length > 0)
    .map(breakpoint => `@media ${MEDIA[breakpoint]}{${rules[breakpoint].join('')}}`)
    .join('');
}

export function themeStyle(tokens: ThemeTokens): CSSProperties {
  const values: Record<string, string> = {};
  const add = (group: string, entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) values[`--ps-${group}-${key}`] = value;
  };
  add('colors', tokens.colors);
  add('typography', tokens.typography);
  add('spacing', tokens.spacing);
  add('radii', tokens.radii);
  add('shadows', tokens.shadows);
  return values as CSSProperties;
}
