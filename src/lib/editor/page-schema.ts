/**
 * PageSchema: el contrato de datos del Visual Website Builder.
 *
 * Un sitio es un árbol declarativo —sitio, páginas, secciones, nodos— que la IA
 * manipula y el renderer convierte en React. Aquí no hay React, ni estilos
 * calculados, ni efectos: solo datos que se pueden validar antes de llegar al
 * navegador. Esa separación es lo que permite que un modelo construya un sitio
 * **sin escribir HTML ni JavaScript**, y que un documento malformado se rechace
 * con un mensaje que la IA puede corregir.
 *
 * La forma del documento reutiliza el vocabulario ya establecido en
 * `document.ts` (ids, `props`, `styles` por breakpoint, tokens como
 * `token:color.primary`) para que un borrador generado aquí sea compatible con el
 * lienzo y con el historial del editor visual.
 */

import { BREAKPOINTS, type Breakpoint, type NodeStyles, type StyleMap } from '@/lib/editor/document';
import { DEFAULT_TOKENS, isTokenRef, type DesignTokens } from '@/lib/editor/tokens';

/** Versión del contrato. Súbela al cambiar la forma de un documento existente. */
export const PAGE_SCHEMA_VERSION = 1;

/**
 * Los 16 tipos del catálogo inicial. Es la lista cerrada que valida el
 * documento: un tipo fuera de aquí no es un error recuperable, es contenido
 * ajeno, y por eso se rechaza en vez de representarse.
 */
export const PAGE_COMPONENT_TYPES = [
  'navbar',
  'hero',
  'heading',
  'text',
  'image',
  'button',
  'container',
  'columns',
  'features',
  'gallery',
  'pricing',
  'testimonials',
  'faq',
  'contact-form',
  'cta',
  'footer',
] as const;

export type PageComponentType = (typeof PAGE_COMPONENT_TYPES)[number];

const COMPONENT_TYPE_SET: ReadonlySet<string> = new Set(PAGE_COMPONENT_TYPES);

/** `true` si el tipo existe en el catálogo. */
export function isPageComponentType(value: unknown): value is PageComponentType {
  return typeof value === 'string' && COMPONENT_TYPE_SET.has(value);
}

/* ------------------------------------------------------------------ props --- */

export type PropKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'select'
  | 'number'
  | 'boolean'
  | 'list';

export type PropField = {
  key: string;
  label: string;
  kind: PropKind;
  /** Valores admitidos cuando `kind` es `select`. */
  options?: readonly string[];
  /** Sub-campos cuando `kind` es `list` (una entrada por objeto de la lista). */
  itemFields?: readonly PropField[];
  /** Si falta, el renderer inyecta el valor por defecto. */
  required?: boolean;
};

const f = (key: string, label: string, kind: PropKind, extra: Partial<PropField> = {}): PropField => ({
  key,
  label,
  kind,
  ...extra,
});
const select = (key: string, label: string, options: readonly string[], extra: Partial<PropField> = {}) =>
  f(key, label, 'select', { options, ...extra });
const list = (key: string, label: string, itemFields: readonly PropField[]) => f(key, label, 'list', { itemFields });
const linkItem = { key: 'href', label: 'Enlace', kind: 'url' as const, required: true };
const imageItem = { key: 'src', label: 'Imagen', kind: 'image' as const, required: true };
const labelItem = { key: 'label', label: 'Texto', kind: 'text' as const, required: true };

/**
 * Contrato de propiedades por tipo. Es la fuente de verdad: el registro React
 * usa estas mismas definiciones para sus controles editables y el validador las
 * usa para rechazar props desconocidos o con el tipo equivocado. Añadir una
 * propiedad es añadirla aquí; no hay que tocar renderer ni inspector.
 */
export const PAGE_PROP_FIELDS: Record<PageComponentType, readonly PropField[]> = {
  navbar: [
    f('brand', 'Marca', 'text', { required: true }),
    f('brandHref', 'Enlace de la marca', 'url'),
    list('links', 'Enlaces', [labelItem, linkItem]),
    f('showCta', 'Mostrar botón', 'boolean'),
    f('ctaLabel', 'Texto del botón', 'text'),
    f('ctaHref', 'Enlace del botón', 'url'),
  ],
  hero: [
    f('eyebrow', 'Antetítulo', 'text'),
    f('title', 'Título', 'text', { required: true }),
    f('subtitle', 'Subtítulo', 'textarea'),
    f('primaryLabel', 'Botón principal', 'text'),
    f('primaryHref', 'Enlace principal', 'url'),
    f('secondaryLabel', 'Botón secundario', 'text'),
    f('secondaryHref', 'Enlace secundario', 'url'),
    select('align', 'Alineación', ['left', 'center']),
  ],
  heading: [f('text', 'Texto', 'text', { required: true }), select('level', 'Nivel', ['h1', 'h2', 'h3', 'h4'])],
  text: [f('text', 'Texto', 'textarea', { required: true }), select('tone', 'Tono', ['default', 'muted', 'strong'])],
  image: [
    f('src', 'Imagen', 'image', { required: true }),
    f('alt', 'Texto alternativo', 'text', { required: true }),
    select('ratio', 'Proporción', ['auto', '1/1', '4/3', '16/9', '21/9']),
    select('fit', 'Ajuste', ['cover', 'contain']),
    f('caption', 'Pie de imagen', 'text'),
  ],
  button: [
    f('label', 'Texto', 'text', { required: true }),
    f('href', 'Enlace', 'url'),
    select('variant', 'Variante', ['primary', 'secondary', 'ghost']),
    select('size', 'Tamaño', ['sm', 'md', 'lg']),
  ],
  container: [
    select('width', 'Ancho', ['narrow', 'default', 'wide', 'full']),
    select('align', 'Alineación vertical', ['start', 'center', 'stretch']),
    f('label', 'Etiqueta interna', 'text'),
  ],
  columns: [
    select('count', 'Columnas', ['1', '2', '3', '4']),
    select('gap', 'Separación', ['tight', 'normal', 'loose']),
  ],
  features: [
    f('heading', 'Título', 'text'),
    f('intro', 'Introducción', 'textarea'),
    list('items', 'Características', [
      f('title', 'Título', 'text', { required: true }),
      f('description', 'Descripción', 'textarea'),
      f('icon', 'Icono', 'text'),
    ]),
    select('layout', 'Disposición', ['cards', 'list']),
  ],
  gallery: [
    f('heading', 'Título', 'text'),
    list('images', 'Imágenes', [imageItem, f('alt', 'Texto alternativo', 'text')]),
    select('columns', 'Columnas', ['2', '3', '4']),
  ],
  pricing: [
    f('heading', 'Título', 'text'),
    list('plans', 'Planes', [
      f('name', 'Plan', 'text', { required: true }),
      f('price', 'Precio', 'text', { required: true }),
      f('period', 'Periodo', 'text'),
      list('features', 'Incluye', [f('label', 'Prestación', 'text', { required: true })]),
      select('cta', 'Acción', ['join', 'contact', 'none']),
    ]),
    select('highlight', 'Plan destacado', ['first', 'middle', 'last', 'none']),
  ],
  testimonials: [
    f('heading', 'Título', 'text'),
    list('items', 'Testimonios', [
      f('quote', 'Cita', 'textarea', { required: true }),
      f('author', 'Autor', 'text', { required: true }),
      f('role', 'Cargo', 'text'),
    ]),
  ],
  faq: [
    f('heading', 'Título', 'text'),
    list('items', 'Preguntas', [
      f('question', 'Pregunta', 'text', { required: true }),
      f('answer', 'Respuesta', 'textarea', { required: true }),
    ]),
  ],
  'contact-form': [
    f('heading', 'Título', 'text'),
    f('intro', 'Introducción', 'textarea'),
    list('fields', 'Campos', [f('name', 'Campo', 'text', { required: true })]),
    f('submitLabel', 'Texto del botón', 'text'),
    f('successMessage', 'Mensaje de éxito', 'text'),
    f('emailTo', 'Destino de las submissions', 'text'),
  ],
  cta: [
    f('title', 'Título', 'text', { required: true }),
    f('subtitle', 'Subtítulo', 'textarea'),
    f('buttonLabel', 'Botón', 'text'),
    f('buttonHref', 'Enlace del botón', 'url'),
    select('align', 'Alineación', ['left', 'center']),
  ],
  footer: [
    f('brand', 'Marca', 'text', { required: true }),
    f('tagline', 'Eslogan', 'text'),
    list('columns', 'Columnas', [f('title', 'Título', 'text', { required: true }), list('links', 'Enlaces', [labelItem, linkItem])]),
    f('copyright', 'Copyright', 'text'),
  ],
};

/* ------------------------------------------------------- reglas de árbol --- */

/** Tipos que aceptan hijos. `undefined` = hoja. */
export const PAGE_CHILDREN: Record<PageComponentType, readonly PageComponentType[] | undefined> = {
  container: [
    'heading',
    'text',
    'image',
    'button',
    'columns',
    'container',
    'features',
    'gallery',
    'pricing',
    'testimonials',
    'faq',
    'contact-form',
    'cta',
  ],
  columns: ['container', 'heading', 'text', 'image', 'button', 'features', 'contact-form', 'gallery', 'testimonials'],
  navbar: undefined,
  hero: undefined,
  heading: undefined,
  text: undefined,
  image: undefined,
  button: undefined,
  features: undefined,
  gallery: undefined,
  pricing: undefined,
  testimonials: undefined,
  faq: undefined,
  'contact-form': undefined,
  cta: undefined,
  footer: undefined,
};

/** `true` si `child` puede anidarse bajo `parent`. */
export function allowsChild(parent: PageComponentType, child: PageComponentType): boolean {
  const allowed = PAGE_CHILDREN[parent];
  return allowed ? allowed.includes(child) : false;
}

/** Profondez máxima del árbol. Protege al validador y al renderer. */
export const MAX_DEPTH = 12;
/** Tope de nodos por página. */
export const MAX_NODES = 2000;
/** Tope de páginas por sitio. */
export const MAX_PAGES = 200;

/* --------------------------------------------------------------- estilos --- */

export type { NodeStyles, StyleMap, Breakpoint };
export { BREAKPOINTS };

/**
 * Anchos de publicación por breakpoint, ordenados de mayor a menor.
 *
 * El lienzo dibuja a 1440/1024/768/375, pero un sitio publicado se ve en
 * ventanas de cualquier tamaño. Estas bandas son las que aplican en el sitio
 * real, y cada lienzo cae dentro de la suya, así que lo que se ve editando es lo
 * que se publica: 1440→desktop, 1024→laptop, 768→tablet, 375→mobile.
 */
export const PAGE_BREAKPOINT_WIDTHS = { desktop: 1280, laptop: 1024, tablet: 768, mobile: 480 } as const;

/** Breakpoints de mayor a menor: el último sobrescribe al anterior. */
export const BREAKPOINT_ORDER: readonly Breakpoint[] = ['desktop', 'laptop', 'tablet', 'mobile'];

/**
 * CSS para una regla que no admite unidad numérica. Sin esta lista, un `2` en
 * `fontWeight` se convertiría en `2px`.
 */
const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  'opacity',
  'zIndex',
  'z-index',
  'fontWeight',
  'font-weight',
  'lineHeight',
  'line-height',
  'flex',
  'flexGrow',
  'flex-grow',
  'flexShrink',
  'flex-shrink',
  'order',
  'zoom',
  'columnCount',
  'column-count',
  'aspectRatio',
  'aspect-ratio',
]);

/** Un valor de estilo no puede romper la regla CSS donde se inyecta. */
const UNSAFE_CSS_VALUE = /[;{}<>]/;

/** `paddingBlock` → `padding-block`. */
export function kebabCase(property: string): string {
  return property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Convierte un valor de estilo en CSS.
 *
 * Las referencias a tokens se traducen a `var(--ps-*)`, de modo que un cambio
 * de tema reestiliza el sitio entero sin tocar el documento. Cualquier valor
 * con un delimitador de CSS se descarta: un documento manipulado por IA no debe
 * poder inyectar reglas en la hoja de estilos.
 */
export function styleValueToCss(property: string, value: string | number): string | null {
  const kebab = kebabCase(property);
  if (!/^-?[a-zA-Z][a-zA-Z0-9-]*$/.test(kebab)) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return UNITLESS_PROPERTIES.has(kebab) || UNITLESS_PROPERTIES.has(property) ? String(value) : `${value}px`;
  }
  if (UNSAFE_CSS_VALUE.test(value)) return null;
  const token = tokenRefToCssVariable(value);
  if (token) return token;
  return value.trim();
}

/** `token:color.primary` → `var(--ps-color-primary)`. */
export function tokenRefToCssVariable(value: string): string | null {
  if (!isTokenRef(value)) return null;
  const key = value.slice('token:'.length);
  return TOKEN_KEY_PATTERN.test(key) ? `var(--ps-${key.replace(/\./g, '-')})` : null;
}

/* ---------------------------------------------------------------- tokens --- */

/** Un nombre de token solo puede ser un identificador CSS. */
export const TOKEN_KEY_PATTERN = /^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/i;

/** `--ps-color-primary` a partir de `color.primary`. */
export function tokenCssVariable(key: string): string {
  return `--ps-${key.replace(/\./g, '-')}`;
}

/** Tokens del tema, resueltos sobre la base para que falte lo que falte. */
export function resolveThemeTokens(tokens: Record<string, string> | undefined): DesignTokens {
  return { ...DEFAULT_TOKENS, ...(tokens ?? {}) };
}

/* ------------------------------------------------------------------ urls --- */

/**
 * Acepta solo rutas internas y `http(s)`. Descarta `javascript:`, `data:` y
 * cualquier esquema ejecutable: un schema puede venir de una IA, así que sus
 * URLs no son de fiar por definición.
 */
export function safeUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (UNSAFE_CSS_VALUE.test(value)) return undefined;
  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('.')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^mailto:/i.test(value)) return value;
  return undefined;
}

/* ----------------------------------------------------------------- nodes --- */

export type PageNode = {
  id: string;
  type: PageComponentType;
  props: Record<string, unknown>;
  /** Estilos por breakpoint; `desktop` es la base y los demás la sobrescriben. */
  styles: NodeStyles;
  children: PageNode[];
};

/** Nodos de primer nivel de una página: las secciones. */
export type PageSection = PageNode;

export type PageSeo = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export type PageTheme = {
  tokens: DesignTokens;
  /** Tipografía de la página; se publica como variable `--ps-font-family`. */
  fontFamily?: string;
};

export type SitePage = {
  id: string;
  name: string;
  /** Ruta pública: siempre empieza por `/` y no contiene `?` ni `#`. */
  slug: string;
  seo: PageSeo;
  theme?: PageTheme;
  sections: PageSection[];
};

export type SiteSchema = {
  schemaVersion: number;
  site: {
    name: string;
    defaultLocale: string;
    seo: PageSeo;
    theme: PageTheme;
  };
  pages: SitePage[];
};

/* ------------------------------------------------------------ validación --- */

export type SchemaIssueCode =
  | 'not-an-object'
  | 'missing-field'
  | 'wrong-type'
  | 'unknown-component'
  | 'unknown-prop'
  | 'invalid-prop'
  | 'invalid-id'
  | 'duplicate-id'
  | 'invalid-nesting'
  | 'invalid-styles'
  | 'invalid-token'
  | 'invalid-url'
  | 'too-many-nodes'
  | 'too-many-pages'
  | 'too-deep'
  | 'invalid-slug'
  | 'invalid-version'
  | 'invalid-seo'
  | 'invalid-structure'
  | 'unexpected-nesting';

export type SchemaIssue = {
  code: SchemaIssueCode;
  /** Ruta legible dentro del documento: `pages[0].sections[1].props.title`. */
  path: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; schema: SiteSchema; warnings: SchemaIssue[] }
  | { ok: false; issues: SchemaIssue[]; warnings: SchemaIssue[] };

const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,63}$/;
const SLUG_PATTERN = /^\/(?!\/)[A-Za-z0-9/_-]*$/;

type Ctx = { issues: SchemaIssue[]; warnings: SchemaIssue[] };

function fail(ctx: Ctx, code: SchemaIssueCode, path: string, message: string): void {
  ctx.issues.push({ code, path, message });
}

function warn(ctx: Ctx, code: SchemaIssueCode, path: string, message: string): void {
  ctx.warnings.push({ code, path, message });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Claves que nunca deben aceptarse de un documento externo. */
const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

function checkKeys(ctx: Ctx, value: Record<string, unknown>, path: string): boolean {
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      fail(ctx, 'invalid-structure', `${path}.${key}`, `Clave no permitida: ${key}.`);
      return false;
    }
  }
  return true;
}

function readString(
  ctx: Ctx,
  value: unknown,
  path: string,
  code: SchemaIssueCode = 'wrong-type'
): string | undefined {
  if (typeof value !== 'string') {
    fail(ctx, code, path, 'Se esperaba un texto.');
    return undefined;
  }
  return value;
}

function readId(ctx: Ctx, value: unknown, path: string, seen: Set<string>): string | undefined {
  const id = readString(ctx, value, path, 'invalid-id');
  if (id === undefined) return undefined;
  if (!ID_PATTERN.test(id)) {
    fail(ctx, 'invalid-id', path, `Id inválido: "${id}". Usa letras, dígitos, guion y guion bajo (2-64 caracteres).`);
    return undefined;
  }
  if (seen.has(id)) {
    fail(ctx, 'duplicate-id', path, `Id duplicado en el documento: "${id}".`);
    return undefined;
  }
  seen.add(id);
  return id;
}

function validateStyles(ctx: Ctx, value: unknown, path: string): void {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    fail(ctx, 'invalid-styles', path, 'Los estilos deben ser un objeto por breakpoint.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  for (const [breakpoint, styles] of Object.entries(value)) {
    if (!BREAKPOINTS.includes(breakpoint as Breakpoint)) {
      fail(ctx, 'invalid-styles', `${path}.${breakpoint}`, `Breakpoint desconocido: "${breakpoint}".`);
      continue;
    }
    if (!isPlainObject(styles)) {
      fail(ctx, 'invalid-styles', `${path}.${breakpoint}`, 'Los estilos de un breakpoint deben ser un objeto.');
      continue;
    }
    if (!checkKeys(ctx, styles, `${path}.${breakpoint}`)) continue;
    for (const [property, styleValue] of Object.entries(styles)) {
      if (typeof styleValue !== 'string' && typeof styleValue !== 'number') {
        fail(ctx, 'invalid-styles', `${path}.${breakpoint}.${property}`, 'Un estilo debe ser texto o número.');
        continue;
      }
      if (styleValueToCss(property, styleValue) === null) {
        warn(ctx, 'invalid-styles', `${path}.${breakpoint}.${property}`, `Estilo no representable y omitido: "${property}".`);
      }
    }
  }
}

function validateField(
  ctx: Ctx,
  field: PropField,
  value: unknown,
  path: string,
  depth: number
): void {
  switch (field.kind) {
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') {
        fail(ctx, 'invalid-prop', path, `"${field.key}" debe ser un texto.`);
        return;
      }
      if (field.required && !value.trim()) {
        fail(ctx, 'invalid-prop', path, `"${field.key}" es obligatorio y no puede estar vacío.`);
      }
      return;
    }
    case 'url': {
      if (typeof value !== 'string' || !value.trim()) return;
      if (safeUrl(value) === undefined) {
        fail(ctx, 'invalid-url', path, `"${field.key}" debe ser una ruta interna o una URL http(s).`);
      }
      return;
    }
    case 'image': {
      if (typeof value !== 'string' || !value.trim()) return;
      if (safeUrl(value) === undefined) {
        fail(ctx, 'invalid-url', path, `"${field.key}" debe ser una ruta interna o una URL http(s).`);
      }
      return;
    }
    case 'select': {
      if (typeof value !== 'string') {
        fail(ctx, 'invalid-prop', path, `"${field.key}" debe ser un texto.`);
        return;
      }
      if (field.options && !field.options.includes(value)) {
        fail(
          ctx,
          'invalid-prop',
          path,
          `"${field.key}" admite: ${field.options.join(', ')}. Recibido: "${value}".`
        );
      }
      return;
    }
    case 'number': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        fail(ctx, 'invalid-prop', path, `"${field.key}" debe ser un número finito.`);
      }
      return;
    }
    case 'boolean': {
      if (typeof value !== 'boolean') {
        fail(ctx, 'invalid-prop', path, `"${field.key}" debe ser verdadero o falso.`);
      }
      return;
    }
    case 'list': {
      if (!Array.isArray(value)) {
        fail(ctx, 'invalid-prop', path, `"${field.key}" debe ser una lista.`);
        return;
      }
      if (depth > MAX_DEPTH) {
        fail(ctx, 'too-deep', path, 'Anidamiento de listas demasiado profundo.');
        return;
      }
      value.forEach((entry, index) => {
        const entryPath = `${path}[${index}]`;
        if (!isPlainObject(entry)) {
          fail(ctx, 'invalid-prop', entryPath, 'Cada entrada de la lista debe ser un objeto.');
          return;
        }
        if (!checkKeys(ctx, entry, entryPath)) return;
        for (const itemField of field.itemFields ?? []) {
          const itemValue = entry[itemField.key];
          if (itemValue === undefined) {
            if (itemField.required) {
              fail(ctx, 'missing-field', `${entryPath}.${itemField.key}`, `Falta "${itemField.key}".`);
            }
            continue;
          }
          validateField(ctx, itemField, itemValue, `${entryPath}.${itemField.key}`, depth + 1);
        }
      });
    }
  }
}

function validateProps(ctx: Ctx, type: PageComponentType, value: unknown, path: string): void {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    fail(ctx, 'invalid-prop', path, 'Las propiedades deben ser un objeto.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  const fields = PAGE_PROP_FIELDS[type];
  for (const [key, propValue] of Object.entries(value)) {
    const field = fields.find(item => item.key === key);
    if (!field) {
      fail(
        ctx,
        'unknown-prop',
        `${path}.${key}`,
        `"${key}" no es una propiedad de "${type}". Admitidas: ${fields.map(item => item.key).join(', ')}.`
      );
      continue;
    }
    validateField(ctx, field, propValue, `${path}.${key}`, 0);
  }
  for (const field of fields) {
    if (field.required && value[field.key] === undefined) {
      warn(
        ctx,
        'missing-field',
        `${path}.${field.key}`,
        `Falta "${field.key}"; el renderer usará el valor por defecto del catálogo.`
      );
    }
  }
}

function validateNode(
  ctx: Ctx,
  value: unknown,
  path: string,
  parent: PageComponentType | null,
  depth: number,
  seen: Set<string>,
  counter: { count: number }
): void {
  if (!isPlainObject(value)) {
    fail(ctx, 'not-an-object', path, 'Cada nodo debe ser un objeto.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  if (depth > MAX_DEPTH) {
    fail(ctx, 'too-deep', path, `Profundidad máxima superada (${MAX_DEPTH}).`);
    return;
  }
  counter.count += 1;
  if (counter.count > MAX_NODES) {
    fail(ctx, 'too-many-nodes', path, `La página supera el máximo de ${MAX_NODES} nodos.`);
    return;
  }

  const type = value.type;
  if (!isPageComponentType(type)) {
    fail(
      ctx,
      'unknown-component',
      `${path}.type`,
      `Componente desconocido: ${JSON.stringify(type)}. Catálogo: ${PAGE_COMPONENT_TYPES.join(', ')}.`
    );
    return;
  }
  if (parent && !allowsChild(parent, type)) {
    fail(
      ctx,
      'invalid-nesting',
      `${path}.type`,
      `"${type}" no puede anidarse dentro de "${parent}".`
    );
  }

  readId(ctx, value.id, `${path}.id`, seen);
  validateProps(ctx, type, value.props, `${path}.props`);
  validateStyles(ctx, value.styles, `${path}.styles`);

  const children = value.children;
  if (children === undefined) return;
  if (!Array.isArray(children)) {
    fail(ctx, 'invalid-structure', `${path}.children`, 'Los hijos deben ser una lista.');
    return;
  }
  if (PAGE_CHILDREN[type] === undefined && children.length > 0) {
    fail(ctx, 'unexpected-nesting', `${path}.children`, `"${type}" es una hoja y no admite hijos.`);
  }
  children.forEach((child, index) => {
    validateNode(ctx, child, `${path}.children[${index}]`, type, depth + 1, seen, counter);
  });
}

function validateSeo(ctx: Ctx, value: unknown, path: string): void {
  if (!isPlainObject(value)) {
    fail(ctx, 'invalid-seo', path, 'El SEO debe ser un objeto con title y description.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  readString(ctx, value.title, `${path}.title`, 'invalid-seo');
  readString(ctx, value.description, `${path}.description`, 'invalid-seo');
  if (value.canonical !== undefined && safeUrl(value.canonical) === undefined) {
    fail(ctx, 'invalid-url', `${path}.canonical`, 'canonical debe ser una ruta interna o una URL http(s).');
  }
  if (value.ogImage !== undefined && safeUrl(value.ogImage) === undefined) {
    fail(ctx, 'invalid-url', `${path}.ogImage`, 'ogImage debe ser una ruta interna o una URL http(s).');
  }
  if (value.noIndex !== undefined && typeof value.noIndex !== 'boolean') {
    fail(ctx, 'invalid-seo', `${path}.noIndex`, 'noIndex debe ser verdadero o falso.');
  }
}

function validateTheme(ctx: Ctx, value: unknown, path: string): void {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    fail(ctx, 'invalid-structure', path, 'El tema debe ser un objeto.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  if (value.tokens !== undefined) {
    if (!isPlainObject(value.tokens)) {
      fail(ctx, 'invalid-structure', `${path}.tokens`, 'Los tokens deben ser un objeto.');
    } else if (checkKeys(ctx, value.tokens, `${path}.tokens`)) {
      for (const [key, tokenValue] of Object.entries(value.tokens)) {
        if (!TOKEN_KEY_PATTERN.test(key)) {
          fail(ctx, 'invalid-token', `${path}.tokens.${key}`, `Nombre de token inválido: "${key}".`);
          continue;
        }
        if (typeof tokenValue !== 'string') {
          fail(ctx, 'invalid-token', `${path}.tokens.${key}`, 'Un token debe ser un texto.');
          continue;
        }
        if (UNSAFE_CSS_VALUE.test(tokenValue)) {
          fail(ctx, 'invalid-token', `${path}.tokens.${key}`, 'El valor de un token no puede contener ; { } < >.');
        }
      }
    }
  }
  if (value.fontFamily !== undefined) {
    const font = readString(ctx, value.fontFamily, `${path}.fontFamily`);
    if (font !== undefined && UNSAFE_CSS_VALUE.test(font)) {
      fail(ctx, 'invalid-token', `${path}.fontFamily`, 'fontFamily no puede contener ; { } < >.');
    }
  }
}

function validatePage(ctx: Ctx, value: unknown, path: string, index: number, seen: Set<string>): void {
  if (!isPlainObject(value)) {
    fail(ctx, 'not-an-object', path, 'Cada página debe ser un objeto.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  readId(ctx, value.id, `${path}.id`, seen);
  const name = readString(ctx, value.name, `${path}.name`);
  if (name !== undefined && !name.trim()) {
    fail(ctx, 'invalid-structure', `${path}.name`, 'El nombre de la página no puede estar vacío.');
  }

  const slug = readString(ctx, value.slug, `${path}.slug`, 'invalid-slug');
  if (slug !== undefined && !SLUG_PATTERN.test(slug)) {
    fail(ctx, 'invalid-slug', `${path}.slug`, `Ruta inválida: "${slug}". Empieza por "/" y sin espacios ni query.`);
  }
  if (index === 0 && slug !== undefined && slug !== '/') {
    warn(ctx, 'invalid-slug', `${path}.slug`, 'La primera página no es la raíz del sitio.');
  }

  validateSeo(ctx, value.seo, `${path}.seo`);
  validateTheme(ctx, value.theme, `${path}.theme`);

  const sections = value.sections;
  if (!Array.isArray(sections)) {
    fail(ctx, 'invalid-structure', `${path}.sections`, 'Las secciones deben ser una lista.');
    return;
  }
  if (sections.length === 0) {
    fail(ctx, 'invalid-structure', `${path}.sections`, 'Una página necesita al menos una sección.');
  }
  const counter = { count: 0 };
  sections.forEach((section, sectionIndex) => {
    validateNode(ctx, section, `${path}.sections[${sectionIndex}]`, null, 1, seen, counter);
  });

  // Una navbar y un footer por página, y la navbar abre la página.
  let navbarIndex = -1;
  let footerCount = 0;
  sections.forEach((section, sectionIndex) => {
    if (!isPlainObject(section)) return;
    if (section.type === 'navbar') {
      navbarIndex = sectionIndex;
      if (sectionIndex > 0) {
        fail(ctx, 'invalid-structure', `${path}.sections[${sectionIndex}]`, 'La navbar debe ser la primera sección.');
      }
    }
    if (section.type === 'footer') footerCount += 1;
  });
  if (footerCount > 1) {
    fail(ctx, 'invalid-structure', `${path}.sections`, 'Solo puede haber un footer por página.');
  }
  if (navbarIndex === -1) {
    warn(ctx, 'invalid-structure', `${path}.sections`, 'La página no declara navbar.');
  }
}

function validateSite(ctx: Ctx, value: unknown, path: string): void {
  if (!isPlainObject(value)) {
    fail(ctx, 'not-an-object', path, 'El sitio debe ser un objeto.');
    return;
  }
  if (!checkKeys(ctx, value, path)) return;
  const name = readString(ctx, value.name, `${path}.name`);
  if (name !== undefined && !name.trim()) {
    fail(ctx, 'invalid-structure', `${path}.name`, 'El nombre del sitio no puede estar vacío.');
  }
  const locale = readString(ctx, value.defaultLocale, `${path}.defaultLocale`);
  if (locale !== undefined && !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    fail(ctx, 'invalid-structure', `${path}.defaultLocale`, `Locale inválido: "${locale}". Usa "es" o "es-MX".`);
  }
  validateSeo(ctx, value.seo, `${path}.seo`);
  validateTheme(ctx, value.theme, `${path}.theme`);
}

/**
 * Valida cualquier valor como `SiteSchema`.
 *
 * Devuelve un resultado discriminado en lugar de lanzar: quien llama decide si
 * un documento corrupto es un error fatal o un aviso que se le devuelve a la IA
 * para que lo corrija. Los problemas no bloqueantes (un token desconocido, una
 * navbar ausente) van a `warnings`; el resto a `issues`.
 */
export function validatePageSchema(value: unknown): ValidationResult {
  const ctx: Ctx = { issues: [], warnings: [] };
  if (!isPlainObject(value)) {
    return { ok: false, issues: [{ code: 'not-an-object', path: '', message: 'El documento debe ser un objeto.' }], warnings: [] };
  }
  if (!checkKeys(ctx, value, '')) {
    return { ok: false, issues: ctx.issues, warnings: ctx.warnings };
  }

  const version = value.schemaVersion;
  if (version !== undefined && version !== PAGE_SCHEMA_VERSION) {
    fail(
      ctx,
      'invalid-version',
      'schemaVersion',
      `schemaVersion ${String(version)} no soportada. Este renderer entiende la ${PAGE_SCHEMA_VERSION}.`
    );
  }

  validateSite(ctx, value.site, 'site');

  const pages = value.pages;
  if (!Array.isArray(pages)) {
    fail(ctx, 'invalid-structure', 'pages', 'El sitio necesita una lista de páginas.');
    return { ok: false, issues: ctx.issues, warnings: ctx.warnings };
  }
  if (pages.length === 0) {
    fail(ctx, 'invalid-structure', 'pages', 'El sitio necesita al menos una página.');
  }
  if (pages.length > MAX_PAGES) {
    fail(ctx, 'too-many-pages', 'pages', `Máximo ${MAX_PAGES} páginas por sitio.`);
  }

  const seen = new Set<string>();
  const slugs = new Set<string>();
  pages.forEach((page, index) => {
    validatePage(ctx, page, `pages[${index}]`, index, seen);
    if (isPlainObject(page) && typeof page.slug === 'string') {
      if (slugs.has(page.slug)) {
        fail(ctx, 'invalid-slug', `pages[${index}].slug`, `Ruta duplicada: "${page.slug}".`);
      }
      slugs.add(page.slug);
    }
  });

  if (ctx.issues.length > 0) return { ok: false, issues: ctx.issues, warnings: ctx.warnings };
  return { ok: true, schema: value as unknown as SiteSchema, warnings: ctx.warnings };
}

/** `true` si el documento supera la validación. Azúcar sobre `validatePageSchema`. */
export function isValidPageSchema(value: unknown): value is SiteSchema {
  return validatePageSchema(value).ok;
}

/* -------------------------------------------------------------- utilidades --- */

/** Número total de nodos de un árbol, útil para medidores y límites. */
export function countNodes(nodes: readonly PageNode[]): number {
  let total = 0;
  for (const node of nodes) total += 1 + countNodes(node.children);
  return total;
}

/** Profundidad máxima del árbol. */
export function treeDepth(nodes: readonly PageNode[]): number {
  let deepest = 0;
  for (const node of nodes) deepest = Math.max(deepest, 1 + treeDepth(node.children));
  return deepest;
}

/** Ids de todos los nodos, en orden de aparición. */
export function collectIds(nodes: readonly PageNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    ids.push(...collectIds(node.children));
  }
  return ids;
}

/** Primera página del sitio, o la de `slug` si se indica. */
export function findPage(schema: SiteSchema, slug?: string): SitePage | undefined {
  if (slug) return schema.pages.find(page => page.slug === slug);
  return schema.pages[0];
}

/**
 * Serialización canónica para comparar dos documentos: claves ordenadas, sin
 * espacios. La usa el generador para detectar si un cambio de la IA modificó algo
 * de verdad, y las pruebas para comparar sin depender del orden de inserción.
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !FORBIDDEN_KEYS.has(key))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalize(entry)}`).join(',')}}`;
}

/** Huella estable del documento; cambia si cambia cualquier valor significativo. */
export function fingerprintSchema(schema: SiteSchema): string {
  const canonical = canonicalize(schema);
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/* ----------------------------------------------------------------- semilla --- */

function seedNode(
  id: string,
  type: PageComponentType,
  props: Record<string, unknown>,
  styles: NodeStyles = {},
  children: PageNode[] = []
): PageNode {
  return { id, type, props, styles, children };
}

/**
 * Documento inicial del builder: una landing que ejercita los 16 componentes del
 * catálogo —incluida anidación real bajo `container` y `columns`— y una segunda
 * página para probar el enrutado.
 *
 * Es la plantilla que se carga al abrir `/page-composer/website` y el material
 * con el que se prueba que un `PageSchema` se valida y se renderiza. La IA
 * recibirá este documento como punto de partida y devolverá otro con la misma
 * forma.
 */
export function createLandingSchema(): SiteSchema {
  const homeSections: PageNode[] = [
    seedNode(
      'nav-home',
      'navbar',
      {
        brand: 'Prompt Studio',
        brandHref: '/',
        links: [
          { label: 'Características', href: '#features' },
          { label: 'Precios', href: '#pricing' },
        ],
        showCta: true,
        ctaLabel: 'Empezar',
        ctaHref: '#contacto',
      },
      { desktop: { background: 'var(--ps-color-surface)' } }
    ),
    seedNode(
      'hero-home',
      'hero',
      {
        eyebrow: 'Visual Website Builder',
        title: 'Describe tu página y mírala construirse',
        subtitle: 'Un contrato de datos tipado convierte cada sección en React semántico, responsive y accesible.',
        primaryLabel: 'Comenzar ahora',
        primaryHref: '#contacto',
        secondaryLabel: 'Ver precios',
        secondaryHref: '/precios',
        align: 'center',
      },
      { desktop: { paddingBlock: 112, background: 'var(--ps-color-background)' }, mobile: { paddingBlock: 64 } }
    ),
    seedNode('container-main', 'container', { width: 'default', align: 'stretch' }, {}, [
      seedNode('heading-home-features', 'heading', { text: 'Todo lo que necesitas para publicar', level: 'h2' }),
      seedNode('columns-home', 'columns', { count: '2', gap: 'normal' }, {}, [
        seedNode('container-a', 'container', { width: 'narrow', align: 'stretch' }, {}, [
          seedNode('text-home-intro', 'text', {
            text: 'Cada componente declara sus props editables, sus hijos permitidos y su comportamiento responsive.',
            tone: 'muted',
          }),
          seedNode('image-home-showcase', 'image', {
            src: '/images/webpages/buffer-clone.webp',
            alt: 'Vista del editor visual de Prompt Studio',
            ratio: '16/9',
            fit: 'cover',
          }),
          seedNode(
            'features-home',
            'features',
            {
              heading: 'Pensado para convertir',
              intro: 'La estructura, los textos y los estilos viven en datos que la IA puede editar sin romper nada.',
              items: [
                { title: 'Diseño que convierte', description: 'Plantillas con jerarquía clara y llamadas a la acción visibles.', icon: '✦' },
                { title: 'Flujo sin fricción', description: 'De la idea a la página publicada en minutos.', icon: '◆' },
                { title: 'Listo para crecer', description: 'Añade secciones sin rehacer las que ya funcionan.', icon: '▲' },
              ],
              layout: 'cards',
            },
            { desktop: { paddingBlock: 32 } }
          ),
        ]),
        seedNode('container-b', 'container', { width: 'narrow', align: 'stretch' }, {}, [
          seedNode(
            'pricing-home',
            'pricing',
            {
              heading: 'Precios simples',
              plans: [
                { name: 'Básico', price: '0 €', period: '/mes', features: [{ label: '1 proyecto' }], cta: 'join' },
                { name: 'Pro', price: '29 €', period: '/mes', features: [{ label: 'Proyectos ilimitados' }, { label: 'Exportación a Next.js' }], cta: 'join' },
              ],
              highlight: 'last',
            },
            { desktop: { paddingBlock: 32 } }
          ),
          seedNode('button-home-more', 'button', { label: 'Explorar el catálogo', href: '#features', variant: 'ghost', size: 'md' }),
        ]),
      ]),
    ]),
    seedNode('gallery-home', 'gallery', {
      heading: 'Hecho con el builder',
      images: [
        { src: '/images/webpages/notion-clone.webp', alt: 'Landing de producto SaaS' },
        { src: '/images/webpages/cozyloft-home-decor.webp', alt: 'Tienda de decoración' },
        { src: '/images/webpages/atelier-creative-studio-portfolio.webp', alt: 'Portafolio de estudio creativo' },
      ],
      columns: '3',
    }),
    seedNode('testimonials-home', 'testimonials', {
      heading: 'Lo que dicen nuestros usuarios',
      items: [
        { quote: 'Publicamos la landing en una tarde y el equipo de marketing la edita sin tocar código.', author: 'Ana Ruiz', role: 'Directora de Marketing' },
        { quote: 'El contrato tipado evita que una IA rompa el diseño al regenerar una sección.', author: 'Marco Díaz', role: 'Ingeniero de Plataforma' },
      ],
    }),
    seedNode('faq-home', 'faq', {
      heading: 'Preguntas frecuentes',
      items: [
        { question: '¿Necesito saber programar?', answer: 'No. Editas datos estructurados y el renderer produce el React.' },
        { question: '¿Puedo usar mi propia marca?', answer: 'Sí. Los tokens del tema se publican como variables CSS.' },
      ],
    }),
    seedNode('contact-home', 'contact-form', {
      heading: 'Hablemos de tu proyecto',
      intro: 'Cuéntanos qué necesitas y te respondemos en menos de 24 horas.',
      fields: [{ name: 'name' }, { name: 'email' }, { name: 'message' }],
      submitLabel: 'Enviar mensaje',
      successMessage: 'Recibimos tu mensaje. Gracias.',
    }),
    seedNode('cta-home', 'cta', {
      title: '¿Listo para construir tu página?',
      subtitle: 'Empieza con una plantilla y hazla tuya.',
      buttonLabel: 'Crear mi proyecto',
      buttonHref: '#contacto',
      align: 'center',
    }),
    seedNode(
      'footer-home',
      'footer',
      {
        brand: 'Prompt Studio',
        tagline: 'Convierte ideas en páginas que venden.',
        columns: [
          { title: 'Producto', links: [{ label: 'Características', href: '#features' }, { label: 'Precios', href: '/precios' }] },
          { title: 'Recursos', links: [{ label: 'Documentación', href: '/docs' }] },
        ],
        copyright: '© Prompt Studio. Todos los derechos reservados.',
      },
      { desktop: { paddingBlock: 56, background: 'var(--ps-color-surface)' } }
    ),
  ];

  const pricingSections: PageNode[] = [
    seedNode('nav-pricing', 'navbar', { brand: 'Prompt Studio', brandHref: '/', links: [{ label: 'Inicio', href: '/' }], showCta: true, ctaLabel: 'Empezar', ctaHref: '/#contacto' }),
    seedNode('hero-pricing', 'hero', { title: 'Planes para cada etapa', subtitle: 'Empieza gratis y crece cuando lo necesites.', align: 'center' }),
    seedNode('pricing-page', 'pricing', {
      heading: 'Elige tu plan',
      plans: [
        { name: 'Básico', price: '0 €', period: '/mes', features: [{ label: '1 proyecto' }], cta: 'join' },
        { name: 'Pro', price: '29 €', period: '/mes', features: [{ label: 'Proyectos ilimitados' }, { label: 'Exportación' }], cta: 'join' },
        { name: 'Equipo', price: '79 €', period: '/mes', features: [{ label: 'Todo lo de Pro' }, { label: 'Soporte prioritario' }], cta: 'contact' },
      ],
      highlight: 'middle',
    }),
    seedNode('cta-pricing', 'cta', { title: '¿Hablamos?', buttonLabel: 'Contactar', buttonHref: '/#contacto', align: 'center' }),
    seedNode('footer-pricing', 'footer', { brand: 'Prompt Studio', copyright: '© Prompt Studio.' }),
  ];

  return {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      name: 'Prompt Studio',
      defaultLocale: 'es',
      seo: {
        title: 'Prompt Studio — Visual Website Builder',
        description: 'Construye páginas web con componentes tipados que la IA puede editar sin romper el diseño.',
      },
      theme: {
        tokens: {
          ...DEFAULT_TOKENS,
          'color.primary': '#7c3aed',
          'color.secondary': '#ec4899',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    pages: [
      {
        id: 'page-home',
        name: 'Inicio',
        slug: '/',
        seo: {
          title: 'Prompt Studio — Crea tu página web',
          description: 'Describe tu página y mírala construirse con componentes tipados y responsive.',
          canonical: '/',
        },
        sections: homeSections,
      },
      {
        id: 'page-pricing',
        name: 'Precios',
        slug: '/precios',
        seo: {
          title: 'Precios — Prompt Studio',
          description: 'Planes para cada etapa: empieza gratis y crece cuando lo necesites.',
          canonical: '/precios',
        },
        sections: pricingSections,
      },
    ],
  };
}
