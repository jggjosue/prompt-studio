import React, { createElement, type ComponentType, type ReactNode } from 'react';
import { getPageComponentDefinition } from '@/components/page-builder/registry';
import type { BuilderComponentProps } from '@/components/page-builder/components';
import type { ComponentNodeOf, PageComponentType, PageDefinition, PageSchema, SeoMetadata } from '@/lib/page-builder/schema';
import { buildResponsiveCss, cssClassForId, styleToReact, themeStyle } from '@/lib/page-builder/styles';
import { validatePageSchema } from '@/lib/page-builder/validation';

function selectPage(schema: PageSchema, pageId?: string, slug?: string): PageDefinition | undefined {
  if (pageId) return schema.pages[pageId];
  if (slug) return Object.values(schema.pages).find(page => page.slug === slug);
  return schema.pages[schema.site.defaultPageId];
}

function renderNode(schema: PageSchema, id: string): ReactNode {
  const node = schema.components[id];
  if (!node) return null;
  const definition = getPageComponentDefinition(node.type);
  if (!definition) return null;
  const Component = definition.component as unknown as ComponentType<BuilderComponentProps<PageComponentType>>;
  const compatibleNode = node as unknown as ComponentNodeOf<PageComponentType>;
  const children = node.children.map(childId => renderNode(schema, childId));
  return createElement(Component, {
    key: node.id,
    node: compatibleNode,
    className: cssClassForId('component', node.id),
    style: styleToReact({ ...definition.defaultStyles, ...node.styles }),
  }, ...children);
}

export type PageRendererProps = {
  schema: unknown;
  pageId?: string;
  slug?: string;
  className?: string;
  onInvalid?: 'render-error' | 'throw';
};

/**
 * Runtime seguro: solo monta componentes registrados con props validadas.
 * No usa eval, Function, scripts, HTML generado ni dangerouslySetInnerHTML.
 */
export function PageRenderer({ schema: input, pageId, slug, className, onInvalid = 'render-error' }: PageRendererProps) {
  const validation = validatePageSchema(input);
  if (!validation.success) {
    if (onInvalid === 'throw') throw new Error(validation.issues.map(entry => `${entry.code}@${entry.path}`).join(', '));
    return <div role="alert" data-page-schema-error="true">No se puede renderizar esta página: {validation.issues[0]?.message ?? 'schema inválido'}.</div>;
  }

  const schema = validation.data;
  const page = selectPage(schema, pageId, slug);
  if (!page) {
    if (onInvalid === 'throw') throw new Error('PAGE_NOT_FOUND');
    return <div role="alert" data-page-schema-error="true">La página solicitada no existe.</div>;
  }

  const responsiveCss = buildResponsiveCss(schema, page);
  return (
    <main
      className={className}
      data-page-schema-version={schema.schemaVersion}
      data-ps-site={schema.site.id}
      data-ps-page={page.id}
      style={{
        ...themeStyle(schema.site.theme),
        minHeight: '100%',
        background: 'var(--ps-colors-background)',
        color: 'var(--ps-colors-text)',
        fontFamily: 'var(--ps-typography-bodyFontFamily)',
      }}
    >
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      {page.sectionIds.map(sectionId => {
        const section = schema.sections[sectionId];
        return (
          <section
            key={section.id}
            id={section.id}
            data-ps-section={section.id}
            className={cssClassForId('section', section.id)}
            style={styleToReact(section.styles)}
          >
            {section.componentIds.map(componentId => renderNode(schema, componentId))}
          </section>
        );
      })}
    </main>
  );
}

export function getPageSeoMetadata(schema: PageSchema, pageId?: string): SeoMetadata {
  const page = selectPage(schema, pageId);
  return page?.seo ?? schema.site.seo;
}

export default PageRenderer;
