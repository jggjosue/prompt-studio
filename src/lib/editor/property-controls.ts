/**
 * Metadatos del inspector de propiedades.
 *
 * El inspector no conoce ningún componente: pregunta al catálogo qué controles
 * tiene el nodo seleccionado y los pinta. Añadir un control a un componente es
 * añadir una entrada aquí o en su semilla; el inspector es siempre el mismo.
 *
 * Cada control apunta a un objetivo: una prop del nodo o una propiedad de estilo
 * en un breakpoint. Eso es lo que permite que un solo inspector genérico cubra
 * texto, URL, imágenes, fondos, layout, tipografía, colores, bordes y sombras.
 */

import {
  PAGE_PROP_FIELDS,
  type Breakpoint,
  type PageComponentType,
  type PropField,
} from './page-schema';

/* ------------------------------------------------------------------ tipos --- */

export type ControlKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'select'
  | 'number'
  | 'boolean'
  | 'list'
  | 'color'
  | 'background'
  | 'width'
  | 'height'
  | 'padding'
  | 'margin'
  | 'gap'
  | 'alignment'
  | 'textAlign'
  | 'display'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'borderWidth'
  | 'borderStyle'
  | 'borderColor'
  | 'borderRadius'
  | 'shadow'
  | 'opacity';

/** Dónde vive el valor que edita un control. */
export type ControlTarget =
  | { type: 'prop'; key: string }
  | { type: 'style'; property: string; breakpoint: Breakpoint };

export type ControlDescriptor = {
  kind: ControlKind;
  label: string;
  target: ControlTarget;
  /** Valores admitidos para `select`. */
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
  /** Valor por defecto para "restablecer". */
  default?: string | number | boolean;
  /** Acepta referencias a tokens (`token:color.primary`). */
  acceptsTokens?: boolean;
  unit?: 'px' | 'rem' | '%';
};

/** Forma estructural de `StyleControl` del registro, sin acoplar la lib a React. */
export type StyleControlLike = {
  property: string;
  label: string;
  kind: string;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
};

/* --------------------------------------------------------------- helpers --- */

const style = (property: string, breakpoint: Breakpoint = 'desktop'): ControlTarget => ({
  type: 'style',
  property,
  breakpoint,
});

const TEXTUAL_TYPES: ReadonlySet<PageComponentType> = new Set<PageComponentType>([
  'navbar',
  'hero',
  'heading',
  'text',
  'button',
  'features',
  'gallery',
  'pricing',
  'testimonials',
  'faq',
  'contact-form',
  'cta',
  'footer',
]);

/** Convierte un `PropField` del contrato en un control del inspector. */
export function propControl(field: PropField): ControlDescriptor {
  const target = { type: 'prop', key: field.key } as const;
  switch (field.kind) {
    case 'text':
      return { kind: 'text', label: field.label, target };
    case 'textarea':
      return { kind: 'textarea', label: field.label, target };
    case 'url':
      return { kind: 'url', label: field.label, target };
    case 'image':
      return { kind: 'image', label: field.label, target };
    case 'select':
      return { kind: 'select', label: field.label, target, options: field.options };
    case 'number':
      return { kind: 'number', label: field.label, target };
    case 'boolean':
      return { kind: 'boolean', label: field.label, target };
    case 'list':
      return { kind: 'list', label: field.label, target };
  }
}

/** Convierte un `StyleControl` del registro en un control del inspector. */
export function styleControl(control: StyleControlLike): ControlDescriptor {
  const target = style(control.property);
  switch (control.kind) {
    case 'length':
      return { kind: 'padding', label: control.label, target, min: control.min, max: control.max, step: control.step, unit: 'px' };
    case 'spacing':
      return { kind: 'padding', label: control.label, target, unit: 'px' };
    case 'color':
      return { kind: 'color', label: control.label, target, acceptsTokens: true };
    case 'select':
      return { kind: 'select', label: control.label, target, options: control.options };
    case 'alignment':
      return { kind: 'alignment', label: control.label, target, options: control.options ?? ['left', 'center', 'right'] };
    case 'border':
      return { kind: 'borderWidth', label: control.label, target, unit: 'px' };
    case 'shadow':
      return { kind: 'shadow', label: control.label, target };
    default:
      return { kind: 'text', label: control.label, target };
  }
}

/* ------------------------------------------------------- conjuntos compartidos --- */

/** Layout disponible en cualquier componente. */
export const LAYOUT_CONTROLS: readonly ControlDescriptor[] = [
  { kind: 'width', label: 'Ancho', target: style('width'), unit: '%' },
  { kind: 'height', label: 'Alto', target: style('height'), unit: 'px' },
  { kind: 'padding', label: 'Relleno', target: style('paddingBlock'), unit: 'px' },
  { kind: 'margin', label: 'Margen', target: style('marginBlock'), unit: 'px' },
  { kind: 'gap', label: 'Separación', target: style('gap'), unit: 'px' },
  { kind: 'display', label: 'Display', target: style('display'), options: ['block', 'flex', 'grid', 'none'] },
  { kind: 'opacity', label: 'Opacidad', target: style('opacity'), min: 0, max: 1, step: 0.05 },
];

/** Tipografía para componentes con texto. */
export const TYPOGRAPHY_CONTROLS: readonly ControlDescriptor[] = [
  { kind: 'fontSize', label: 'Tamaño de fuente', target: style('fontSize'), unit: 'px', min: 10, max: 96 },
  { kind: 'fontWeight', label: 'Peso', target: style('fontWeight'), options: ['300', '400', '500', '600', '700', '800'] },
  { kind: 'lineHeight', label: 'Interlineado', target: style('lineHeight'), min: 1, max: 2, step: 0.05 },
  { kind: 'textAlign', label: 'Alineación del texto', target: style('textAlign'), options: ['left', 'center', 'right'] },
];

/** Borde: ancho, estilo y color. */
export const BORDER_CONTROLS: readonly ControlDescriptor[] = [
  { kind: 'borderWidth', label: 'Grosor del borde', target: style('borderWidth'), unit: 'px', min: 0, max: 20 },
  { kind: 'borderStyle', label: 'Estilo de borde', target: style('borderStyle'), options: ['none', 'solid', 'dashed', 'dotted'] },
  { kind: 'borderColor', label: 'Color de borde', target: style('borderColor'), acceptsTokens: true },
  { kind: 'borderRadius', label: 'Radio del borde', target: style('borderRadius'), unit: 'px', min: 0, max: 64 },
];

/** Sombra: presets que son tokens del tema. */
export const SHADOW_OPTIONS: readonly string[] = [
  'none',
  'token:shadow.sm',
  'token:shadow.md',
  'token:shadow.lg',
];

/**
 * Controles completos de un tipo: props del contrato + estilos del registro +
 * layout + borde + tipografía (si el componente tiene texto).
 */
export function buildControls(
  type: PageComponentType,
  fields: readonly PropField[] = PAGE_PROP_FIELDS[type],
  styleControls: readonly StyleControlLike[] = []
): readonly ControlDescriptor[] {
  return [
    ...fields.map(propControl),
    ...styleControls.map(styleControl),
    ...LAYOUT_CONTROLS,
    ...BORDER_CONTROLS,
    ...(TEXTUAL_TYPES.has(type) ? TYPOGRAPHY_CONTROLS : []),
  ];
}

/* ------------------------------------------------------------------ tokens --- */

export type TokenOption = { value: string; label: string };

/** Opciones de token para un grupo, como `token:color.primary`. */
export function tokenOptions(tokens: Record<string, string>, group: string): TokenOption[] {
  return Object.keys(tokens)
    .filter(key => key.startsWith(`${group}.`))
    .sort()
    .map(key => ({ value: `token:${key}`, label: key }));
}
