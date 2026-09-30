/** @jsxRuntime automatic */
/** @jsxImportSource react */
/**
 * Renderer de PageSchema → React.
 *
 * Recorre el árbol declarativo y produce HTML semántico. No se evalúa código
 * dinámico ni se inyecta HTML con cadenas: un documento viene de una IA o de la
 * base de datos, y todo lo que entra se trata como datos, nunca como código. Las
 * URLs pasan por `safeUrl` y los estilos viven en una hoja generada que descarta
 * cualquier valor capaz de cerrar una regla.
 *
 * Los estilos de cada nodo se publican como una regla CSS propia —base para
 * `desktop`, media queries de mayor a menor para el resto—. Esa es la razón de
 * que el responsive funcione sin JavaScript: la cascada resuelve la herencia
 * igual que lo hace el editor (mobile → tablet → laptop → desktop).
 *
 * Es un componente de servidor: el HTML llega completo al navegador y lo leen
 * los buscadores. Los componentes del catálogo sí son de cliente, pero se
 * renderizan en el servidor como cualquier otro hijo.
 */

import { createElement, type ReactNode } from 'react';
import {
  BREAKPOINTS,
  findPage,
  resolveThemeTokens,
  styleValueToCss,
  tokenCssVariable,
  type Breakpoint,
  type PageNode,
  type SitePage,
  type SiteSchema,
  type StyleMap,
} from '@/lib/editor/page-schema';
import {
  componentTokens,
  getPageComponent,
  withDefaultProps,
} from '@/components/editor/page-components';

/** Scope por defecto de la hoja de estilos; permite varios renders por página. */
const DEFAULT_SCOPE = 'ps-site';

/**
 * Corte superior de cada breakpoint, en píxeles. `desktop` es la base sin
 * media query. Los valores son medio abiertos (`767.98px`) para que un teléfono
 * de 390 px caiga en `mobile` y no en `tablet`, y para que los anchos de lienzo
 * del editor (1440/1024/768/375) caigan cada uno en su banda.
 */
const MEDIA_MAX_WIDTH: Record<Exclude<Breakpoint, 'desktop'>, number> = {
  laptop: 1279.98,
  tablet: 1023.98,
  mobile: 767.98,
};

/** Propiedades de `styles` convertidas a declaraciones CSS, omitiendo las inválidas. */
function declarations(styles: StyleMap): string[] {
  const out: string[] = [];
  for (const [property, value] of Object.entries(styles)) {
    const css = styleValueToCss(property, value);
    if (css === null) continue;
    out.push(`${property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${css}`);
  }
  return out;
}

function nodeSelector(scope: string, id: string): string {
  return `[data-ps-scope="${scope}"] [data-ps-id="${id}"]`;
}

/** Reglas CSS de un nodo y sus descendientes. Un nodo por selector. */
function rulesFor(node: PageNode, scope: string): string {
  const rules: string[] = [];
  const base = declarations(node.styles.desktop ?? {});
  if (base.length) rules.push(`${nodeSelector(scope, node.id)}{${base.join(';')}}`);

  for (const breakpoint of ['laptop', 'tablet', 'mobile'] as const) {
    const media = declarations(node.styles[breakpoint] ?? {});
    if (media.length) {
      rules.push(
        `@media (max-width: ${MEDIA_MAX_WIDTH[breakpoint]}px){${nodeSelector(scope, node.id)}{${media.join(';')}}}`
      );
    }
  }

  for (const child of node.children) rules.push(rulesFor(child, scope));
  return rules.join('');
}

/** Variables `--ps-*` del tema, para que un token reestilice el sitio entero. */
function themeVariables(page: SitePage, schema: SiteSchema): Record<string, string> {
  const tokens = resolveThemeTokens({ ...schema.site.theme.tokens, ...page.theme?.tokens });
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) variables[tokenCssVariable(key)] = value;
  const fontFamily = page.theme?.fontFamily ?? schema.site.theme.fontFamily;
  if (fontFamily) variables['--ps-font-family'] = fontFamily;
  return variables;
}

type RenderNodeOptions = {
  tokens: ReturnType<typeof componentTokens>;
  breakpoint: Breakpoint;
  scope: string;
};

function renderNode(node: PageNode, options: RenderNodeOptions): ReactNode {
  const definition = getPageComponent(node.type);
  if (!definition) return null;

  const renderedChildren = node.children.length
    ? node.children.map(child => renderNode(child, options))
    : undefined;

  // El nodo envuelto es el que recibe los estilos por breakpoint. Los
  // componentes aplican su diseño base y esta capa añade las sobrescrituras.
  return createElement(
    'div',
    { key: node.id, 'data-ps-id': node.id, 'data-ps-type': node.type },
    createElement(
      definition.component,
      {
        node: { ...node, props: withDefaultProps(node.type, node.props) },
        tokens: options.tokens,
        breakpoint: options.breakpoint,
      },
      renderedChildren
    )
  );
}

export type PageRendererProps = {
  /** Documento completo del sitio. */
  schema: SiteSchema;
  /** Página a renderizar; por defecto, la primera del sitio. */
  slug?: string;
  /** Breakpoint objetivo para los componentes; la hoja cubre todos. */
  breakpoint?: Breakpoint;
  /** Identificador de scope de la hoja; cámbialo si renderizas dos sitios a la vez. */
  scope?: string;
  className?: string;
};

/**
 * Renderiza una página del sitio como React.
 *
 * Un documento inválido no revienta: si la página no existe o el nodo tiene un
 * tipo desconocido, devuelve `null`. La validación pertenece a
 * `validatePageSchema`; aquí ya se asume que el documento pasó por ella.
 */
export function PageRenderer({
  schema,
  slug,
  breakpoint = 'desktop',
  scope = DEFAULT_SCOPE,
  className,
}: PageRendererProps) {
  const page = findPage(schema, slug);
  if (!page) return null;

  const tokens = componentTokens(page.theme ?? schema.site.theme);
  const variables = themeVariables(page, schema);
  const stylesheet = page.sections.map(section => rulesFor(section, scope)).join('');

  return (
    <div
      className={className}
      data-ps-scope={scope}
      style={{ ...variables, fontFamily: 'var(--ps-font-family, inherit)' } as React.CSSProperties}
      data-ps-page={page.slug}
    >
      {stylesheet ? <style>{stylesheet}</style> : null}
      {page.sections.map(section => renderNode(section, { tokens, breakpoint, scope }))}
    </div>
  );
}

/** Renderiza una sección suelta, para previsualizaciones del inspector. */
export function PageNodeRenderer({
  node,
  tokens,
  breakpoint = 'desktop',
  scope = DEFAULT_SCOPE,
}: {
  node: PageNode;
  tokens?: ReturnType<typeof componentTokens>;
  breakpoint?: Breakpoint;
  scope?: string;
}) {
  return renderNode(node, { tokens: tokens ?? componentTokens(undefined), breakpoint, scope });
}

export { MEDIA_MAX_WIDTH, themeVariables, rulesFor };

/** Breakpoints cubiertos por la hoja generada, para documentación y pruebas. */
export const RENDERER_BREAKPOINTS = BREAKPOINTS;
