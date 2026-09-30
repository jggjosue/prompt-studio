import { getPageComponentDefinition } from '@/components/page-builder/registry';
import type { EditorDocument, EditorNode, NodeStyles } from '@/lib/editor/document';
import {
  DEFAULT_PAGE_THEME,
  PAGE_SCHEMA_VERSION,
  STYLE_PROPERTIES,
  type ComponentNodeOf,
  type ComponentPropsMap,
  type ComponentStyles,
  type PageComponentNode,
  type PageComponentType,
  type PageSchema,
  type ResponsiveOverrides,
} from '@/lib/page-builder/schema';
import { isSafeStyleValue } from '@/lib/page-builder/styles';

const STYLE_SET = new Set<string>(STYLE_PROPERTIES);

function normalizeToken(value: string): string {
  return value
    .replace('token:color.ink', 'token:colors.text')
    .replace('token:color.', 'token:colors.')
    .replace('token:radius.', 'token:radii.')
    .replace('token:shadow.', 'token:shadows.')
    .replace('token:font.sans', 'token:typography.bodyFontFamily')
    .replace('token:font.serif', 'token:typography.headingFontFamily');
}

function stylesOf(styles: Record<string, string | number> | undefined): ComponentStyles {
  const output: ComponentStyles = {};
  for (const [property, raw] of Object.entries(styles ?? {})) {
    const value = typeof raw === 'string' ? normalizeToken(raw) : raw;
    if (STYLE_SET.has(property) && isSafeStyleValue(value)) output[property as keyof ComponentStyles] = value;
  }
  return output;
}

function responsiveOf(styles: NodeStyles): ResponsiveOverrides {
  return {
    ...(styles.laptop ? { laptop: stylesOf(styles.laptop) } : {}),
    ...(styles.tablet ? { tablet: stylesOf(styles.tablet) } : {}),
    ...(styles.mobile ? { mobile: stylesOf(styles.mobile) } : {}),
  };
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function objectArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>> : [];
}

function targetType(type: string): PageComponentType {
  if (['heading', 'text', 'image', 'button', 'navbar', 'gallery'].includes(type)) return type as PageComponentType;
  if (type === 'link' || type === 'submitButton') return 'button';
  if (type === 'row' || type === 'grid') return 'columns';
  if (type === 'accordion') return 'faq';
  if (type === 'login') return 'contactForm';
  if (['container', 'column', 'flex', 'stack', 'card', 'form', 'sidebar', 'tabs', 'modal', 'list'].includes(type)) return 'container';
  return 'text';
}

function mappedProps<K extends PageComponentType>(type: K, node: EditorNode): ComponentPropsMap[K] {
  const defaults = getPageComponentDefinition(type).defaultProps;
  const props = node.props;
  let patch: Record<string, unknown> = {};
  switch (type) {
    case 'heading': patch = { text: text(props.text, 'Título'), level: Math.min(6, Math.max(1, Number(props.level) || 2)) }; break;
    case 'text': patch = { text: text(props.text ?? props.label ?? props.code, node.type), as: node.type === 'badge' ? 'span' : 'p' }; break;
    case 'image': patch = { src: text(props.src), alt: text(props.alt), loading: 'lazy' }; break;
    case 'button': patch = { label: text(props.label ?? props.text, 'Continuar'), href: text(props.href, '#'), variant: props.variant === 'secondary' ? 'secondary' : 'primary' }; break;
    case 'navbar': patch = { brand: text(props.brand, 'Mi marca'), brandHref: '/', links: Array.isArray(props.links) ? props.links : [{ label: 'Inicio', href: '/' }] }; break;
    case 'gallery': patch = { images: objectArray(props.images).map(item => ({ src: text(item.src), alt: text(item.alt), ...(item.caption ? { caption: text(item.caption) } : {}) })), columns: 3 }; break;
    case 'columns': patch = { columns: node.type === 'row' ? Math.min(4, Math.max(2, node.children.length || 2)) : 3, gap: text(node.styles.desktop?.gap, '24px'), stackAt: 'mobile' }; break;
    case 'faq': patch = { heading: text(props.heading, 'Preguntas frecuentes'), items: objectArray(props.items).map(item => ({ question: text(item.title ?? item.question, 'Pregunta'), answer: text(item.body ?? item.answer, 'Respuesta') })) }; break;
    case 'contactForm': patch = { heading: text(props.title, 'Iniciar sesión'), description: '', fields: [{ name: 'email', label: text(props.emailLabel, 'Correo'), type: 'email', required: true }, { name: 'password', label: text(props.passwordLabel, 'Contraseña'), type: 'text', required: true }], submitLabel: text(props.submitLabel, 'Enviar'), method: 'post' }; break;
    case 'container': patch = { as: 'div', maxWidth: text(props.maxWidth, '1200px') }; break;
  }
  return { ...defaults, ...patch } as ComponentPropsMap[K];
}

function createMappedNode<K extends PageComponentType>(node: EditorNode, type: K, children: string[]): ComponentNodeOf<K> {
  return {
    id: node.id,
    type,
    props: mappedProps(type, node),
    styles: stylesOf(node.styles.desktop),
    responsive: responsiveOf(node.styles),
    children,
  };
}

/**
 * Puente de migración: permite que el editor existente previsualice con el
 * runtime PageSchema sin cambiar todavía su store, historial ni autosave.
 */
export function editorDocumentToPageSchema(document: EditorDocument, name = 'Mi página'): PageSchema {
  const components: Record<string, PageComponentNode> = {};

  const convert = (id: string): string => {
    const node = document.nodes[id];
    const type = targetType(node.type);
    const definition = getPageComponentDefinition(type);
    const childIds = definition.allowedChildren === '*' || definition.allowedChildren.length > 0
      ? node.children.map(convert)
      : [];
    components[id] = createMappedNode(node, type, childIds) as PageComponentNode;
    return id;
  };

  const root = document.nodes[document.rootId];
  const sections: PageSchema['sections'] = {};
  const sectionIds: string[] = [];
  for (const rootChildId of root.children) {
    const rootChild = document.nodes[rootChildId];
    if (rootChild.type === 'section') {
      sections[rootChild.id] = {
        id: rootChild.id,
        name: rootChild.name || 'Sección',
        componentIds: rootChild.children.map(convert),
        styles: stylesOf(rootChild.styles.desktop),
        responsive: responsiveOf(rootChild.styles),
      };
      sectionIds.push(rootChild.id);
    } else {
      const sectionId = `section-${rootChild.id}`;
      sections[sectionId] = { id: sectionId, name: rootChild.name || 'Sección', componentIds: [convert(rootChild.id)], styles: {}, responsive: {} };
      sectionIds.push(sectionId);
    }
  }

  const pageId = 'page-home';
  const seo = { title: name, description: `${name} creada con Prompt Studio.` };
  return {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: { id: 'site-page-composer', name, locale: 'es', defaultPageId: pageId, pageIds: [pageId], seo, theme: structuredClone(DEFAULT_PAGE_THEME) },
    pages: { [pageId]: { id: pageId, name: 'Inicio', slug: '/', sectionIds, seo } },
    sections,
    components,
  };
}
