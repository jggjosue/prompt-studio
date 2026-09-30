/**
 * Biblioteca de secciones del Website Builder.
 *
 * Una sección es un `PageNode` de primer nivel construido con los componentes del
 * catálogo existente (`page-components`), listo para insertarse en cualquier
 * página. No se define ningún componente nuevo aquí: se reutilizan los 16 tipos
 * y se les dan props/estilos por defecto coherentes.
 *
 * Cada sección se instancia con ids nuevos (vía `makeId`), de modo que insertar
 * la misma sección dos veces produce dos subárboles independientes.
 */

import {
  PAGE_SCHEMA_VERSION,
  validatePageSchema,
  type PageComponentType,
  type PageNode,
  type SiteSchema,
  type StyleMap,
} from './page-schema';
import { DEFAULT_TOKENS } from './tokens';

export const SECTION_IDS = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'faq',
  'cta',
  'contact',
  'footer',
  'gallery',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Textos que una sección acepta por encima de sus valores por defecto. */
export type SectionCopy = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  secondary?: string;
};

export type SectionDefinition = {
  id: SectionId;
  label: string;
  description: string;
  /** Tipo de componente raíz de la sección. */
  type: PageComponentType;
};

export const SECTION_DEFINITIONS: Record<SectionId, SectionDefinition> = {
  hero: { id: 'hero', label: 'Hero', description: 'Título, subtítulo y llamadas a la acción de portada.', type: 'hero' },
  features: { id: 'features', label: 'Características', description: 'Rejilla de beneficios con iconos.', type: 'features' },
  pricing: { id: 'pricing', label: 'Precios', description: 'Planes con destacado y acciones.', type: 'pricing' },
  testimonials: { id: 'testimonials', label: 'Testimonios', description: 'Citas de clientes con autor.', type: 'testimonials' },
  faq: { id: 'faq', label: 'FAQ', description: 'Preguntas frecuentes con respuesta.', type: 'faq' },
  cta: { id: 'cta', label: 'CTA', description: 'Llamada a la acción de cierre.', type: 'cta' },
  contact: { id: 'contact', label: 'Contacto', description: 'Formulario de contacto con campos.', type: 'contact-form' },
  footer: { id: 'footer', label: 'Footer', description: 'Pie de página único por página.', type: 'footer' },
  gallery: { id: 'gallery', label: 'Galería', description: 'Cuadrícula de imágenes.', type: 'gallery' },
};

export function getSectionDefinition(id: SectionId): SectionDefinition {
  return SECTION_DEFINITIONS[id];
}

export function listPageSections(): SectionDefinition[] {
  return SECTION_IDS.map(id => SECTION_DEFINITIONS[id]);
}

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && (SECTION_IDS as readonly string[]).includes(value);
}

/** Estilos base comunes a la mayoría de secciones. */
const block = (extra: StyleMap = {}): PageNode['styles'] => ({
  desktop: { paddingBlock: 64, ...extra },
});

type RawSection = {
  type: PageComponentType;
  props: Record<string, unknown>;
  styles?: PageNode['styles'];
  children?: RawSection[];
};

/** Asigna ids nuevos a todo el subárbol. */
function assignIds(raw: RawSection, makeId: (type: PageComponentType) => string): PageNode {
  return {
    id: makeId(raw.type),
    type: raw.type,
    props: raw.props,
    styles: raw.styles ?? {},
    children: (raw.children ?? []).map(child => assignIds(child, makeId)),
  };
}

const DEFAULT_COPY: SectionCopy = {
  eyebrow: 'Presenta tu proyecto',
  title: 'Un título que vende tu idea',
  subtitle: 'Una descripción breve que deja claro qué ofreces y por qué importa.',
  cta: 'Empezar ahora',
  secondary: 'Saber más',
};

/** Construye una sección nueva con ids frescos y textos personalizables. */
export function createSection(
  id: SectionId,
  makeId: (type: PageComponentType) => string,
  copy: SectionCopy = {}
): PageNode {
  const c = { ...DEFAULT_COPY, ...copy };

  switch (id) {
    case 'hero':
      return assignIds(
        {
          type: 'hero',
          props: {
            eyebrow: c.eyebrow,
            title: c.title,
            subtitle: c.subtitle,
            primaryLabel: c.cta,
            primaryHref: '#contacto',
            secondaryLabel: c.secondary,
            secondaryHref: '#',
            align: 'center',
          },
          styles: { desktop: { paddingBlock: 112, background: 'var(--ps-color-background)' }, mobile: { paddingBlock: 64 } },
        },
        makeId
      );
    case 'features':
      return assignIds(
        {
          type: 'features',
          props: {
            heading: c.title,
            intro: c.subtitle,
            items: [
              { title: 'Diseño que convierte', description: 'Jerarquía clara y llamadas a la acción visibles.', icon: '✦' },
              { title: 'Flujo sin fricción', description: 'De la idea a la página publicada en minutos.', icon: '◆' },
              { title: 'Listo para crecer', description: 'Añade secciones sin rehacer las que ya funcionan.', icon: '▲' },
            ],
            layout: 'cards',
          },
          styles: block(),
        },
        makeId
      );
    case 'pricing':
      return assignIds(
        {
          type: 'pricing',
          props: {
            heading: c.title,
            plans: [
              { name: 'Básico', price: '0 €', period: '/mes', features: [{ label: 'Funciones esenciales' }], cta: 'join' },
              { name: 'Pro', price: '29 €', period: '/mes', features: [{ label: 'Todo lo esencial' }, { label: 'Soporte prioritario' }], cta: 'join' },
            ],
            highlight: 'last',
          },
          styles: block(),
        },
        makeId
      );
    case 'testimonials':
      return assignIds(
        {
          type: 'testimonials',
          props: {
            heading: c.title,
            items: [
              { quote: 'El resultado superó lo que esperábamos y el flujo fue rapidísimo.', author: 'Ana Ruiz', role: 'Directora de Marketing' },
              { quote: 'Editar secciones sin romper el diseño es un cambio de juego.', author: 'Marco Díaz', role: 'Ingeniero de Plataforma' },
            ],
          },
          styles: block(),
        },
        makeId
      );
    case 'faq':
      return assignIds(
        {
          type: 'faq',
          props: {
            heading: c.title,
            items: [
              { question: '¿Necesito saber programar?', answer: 'No. Editas datos estructurados y el renderer produce el React.' },
              { question: '¿Puedo usar mi propia marca?', answer: 'Sí. Los tokens del tema se publican como variables CSS.' },
            ],
          },
          styles: block(),
        },
        makeId
      );
    case 'cta':
      return assignIds(
        {
          type: 'cta',
          props: { title: c.title, subtitle: c.subtitle, buttonLabel: c.cta, buttonHref: '#contacto', align: 'center' },
          styles: block(),
        },
        makeId
      );
    case 'contact':
      return assignIds(
        {
          type: 'contact-form',
          props: {
            heading: c.title,
            intro: c.subtitle,
            fields: [{ name: 'name' }, { name: 'email' }, { name: 'message' }],
            submitLabel: c.cta,
            successMessage: 'Recibimos tu mensaje. Gracias.',
          },
          styles: block(),
        },
        makeId
      );
    case 'footer':
      return assignIds(
        {
          type: 'footer',
          props: {
            brand: c.title,
            tagline: c.subtitle,
            columns: [
              { title: 'Producto', links: [{ label: 'Inicio', href: '/' }] },
              { title: 'Contacto', links: [{ label: 'Email', href: 'mailto:hola@ejemplo.com' }] },
            ],
            copyright: `© ${c.title}. Todos los derechos reservados.`,
          },
          styles: { desktop: { paddingBlock: 56, background: 'var(--ps-color-surface)' } },
        },
        makeId
      );
    case 'gallery':
      return assignIds(
        {
          type: 'gallery',
          props: {
            heading: c.title,
            images: [
              { src: '/images/webpages/notion-clone.webp', alt: 'Proyecto 1' },
              { src: '/images/webpages/cozyloft-home-decor.webp', alt: 'Proyecto 2' },
              { src: '/images/webpages/atelier-creative-studio-portfolio.webp', alt: 'Proyecto 3' },
            ],
            columns: '3',
          },
          styles: block(),
        },
        makeId
      );
  }
}

/** Factoria de ids única por instancia, reutilizable por secciones y plantillas. */
export function sectionIdFactory(prefix = 'sec'): (type: PageComponentType) => string {
  const seed = Math.random().toString(36).slice(2, 7);
  let counter = 0;
  return type => `${prefix}-${type}-${seed}-${(counter += 1)}`;
}

/**
 * Envuelve una sección en un PageSchema real para que su preview use exactamente
 * el mismo renderer, tema y validación que el lienzo editable.
 */
export function createSectionPreviewSchema(id: SectionId): SiteSchema {
  const definition = getSectionDefinition(id);
  const section = createSection(id, sectionIdFactory('preview'));
  const schema: SiteSchema = {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      name: `Preview: ${definition.label}`,
      defaultLocale: 'es',
      seo: { title: definition.label, description: definition.description },
      theme: { tokens: { ...DEFAULT_TOKENS }, fontFamily: 'Inter, system-ui, sans-serif' },
    },
    pages: [{
      id: 'preview-page',
      name: definition.label,
      slug: '/',
      seo: { title: definition.label, description: definition.description, canonical: '/' },
      sections: [section],
    }],
  };
  const result = validatePageSchema(schema);
  if (!result.ok) {
    throw new Error(`Sección ${id} inválida: ${result.issues[0]?.message ?? 'error desconocido'}`);
  }
  return result.schema;
}
