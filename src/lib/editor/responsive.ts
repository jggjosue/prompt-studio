/**
 * Resolución responsive del Website Builder.
 *
 * Un nodo guarda sus estilos por breakpoint (`styles`), donde `desktop` es la
 * base. Los demás breakpoints solo sobrescriben lo que declaran; lo que no
 * declaran se hereda del más cercano hacia la base:
 *
 *   mobile  → tablet → laptop → desktop (base)
 *   tablet  → laptop → desktop (base)
 *   desktop → sí mismo (base)
 *
 * La UI solo ofrece `desktop`, `tablet` y `mobile`, pero la cascada completa es
 * de cuatro niveles para coincidir con las media queries de la página
 * publicada. `laptop` se hereda, no se edita.
 *
 * Estas funciones son las que usa el editor para pintar el lienzo del
 * dispositivo activo y para marcar en el inspector qué valor es local y cuál
 * heredado. La página publicada resuelve igual por cascada de media queries.
 */

import type { Breakpoint, StyleMap } from './document';
import type { PageNode } from './page-schema';
import { styleValueToCss } from './page-schema';

/** Breakpoints que ofrece el editor. `laptop` no se edita, pero se hereda. */
export const EDITOR_BREAKPOINTS = ['desktop', 'tablet', 'mobile'] as const;
export type EditorBreakpoint = (typeof EDITOR_BREAKPOINTS)[number];

/**
 * Cadena de herencia: el primero que define un valor gana.
 *
 * `laptop` no es un breakpoint editable, pero sí un nivel de la cascada. El
 * schema tiene cuatro bandas y la página publicada las recorre todas, así que
 * omitirlo aquí haría que el lienzo del editor resolviera distinto de lo que se
 * publica: una página con override de `laptop` se vería en el editor con el
 * valor de `desktop` y en producción con el de `laptop`.
 */
export const RESPONSIVE_INHERITANCE: Record<EditorBreakpoint, readonly Breakpoint[]> = {
  desktop: ['desktop'],
  tablet: ['tablet', 'laptop', 'desktop'],
  mobile: ['mobile', 'tablet', 'laptop', 'desktop'],
};

export function isEditorBreakpoint(value: unknown): value is EditorBreakpoint {
  return EDITOR_BREAKPOINTS.includes(value as EditorBreakpoint);
}

/** Estilos efectivos de un nodo en un breakpoint, aplicando la herencia. */
export function resolveNodeStyles(node: PageNode, breakpoint: EditorBreakpoint): StyleMap {
  const resolved: StyleMap = {};
  // Se aplica de la base hacia el breakpoint activo: desktop → tablet → mobile.
  for (const source of [...RESPONSIVE_INHERITANCE[breakpoint]].reverse()) {
    Object.assign(resolved, node.styles[source] ?? {});
  }
  return resolved;
}

/**
 * Breakpoint que aporta el valor de `property` para el breakpoint activo.
 *
 * Devuelve el breakpoint activo si hay un override local, un ancestro si el
 * valor se hereda, o `null` si ninguna fuente lo define.
 */
export function findStyleSource(
  node: PageNode,
  property: string,
  breakpoint: EditorBreakpoint
): Breakpoint | null {
  for (const source of RESPONSIVE_INHERITANCE[breakpoint]) {
    const map = node.styles[source];
    if (map && property in map) return source;
  }
  return null;
}

/** Breakpoints que tienen un override local de `property`. */
export function overrideBreakpoints(node: PageNode, property: string): EditorBreakpoint[] {
  return EDITOR_BREAKPOINTS.filter(breakpoint => {
    const map = node.styles[breakpoint];
    return map !== undefined && property in map;
  });
}

/** Propiedades con override local en un breakpoint. */
export function overriddenProperties(node: PageNode, breakpoint: EditorBreakpoint): string[] {
  const map = node.styles[breakpoint];
  return map ? Object.keys(map) : [];
}

/**
 * Convierte un mapa de estilos en valores aplicables inline.
 *
 * Reutiliza `styleValueToCss`: las referencias a tokens se traducen a
 * `var(--ps-*)`, los números a `px` (salvo propiedades adimensionales) y
 * cualquier valor con `;{}<>` se descarta. El lienzo del editor aplica estos
 * estilos resueltos por breakpoint en lugar de media queries.
 */
export function styleMapToCssProperties(styles: StyleMap): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [property, value] of Object.entries(styles)) {
    const css = styleValueToCss(property, value);
    if (css === null) continue;
    out[property] = css;
  }
  return out;
}