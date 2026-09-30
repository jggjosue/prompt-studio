/**
 * Biblioteca de plantillas del Website Builder.
 *
 * Cada plantilla es un `PageSchema` válido (un `SiteSchema`) compuesto con las
 * secciones de `page-sections` y un tema propio. Se reutilizan los componentes
 * del catálogo y las secciones de la biblioteca: nada se duplica.
 *
 * `createTemplateSchema` devuelve siempre un documento nuevo con ids frescos,
 * de modo que "usar una plantilla" es crear una copia editable, nunca mutar el
 * original.
 */

import {
  PAGE_SCHEMA_VERSION,
  validatePageSchema,
  type PageComponentType,
  type PageNode,
  type SitePage,
  type SiteSchema,
} from './page-schema';
import { DEFAULT_TOKENS } from './tokens';
import { createSection, sectionIdFactory, type SectionCopy, type SectionId } from './page-sections';

export const TEMPLATE_IDS = [
  'saas',
  'agency',
  'restaurant',
  'portfolio',
  'ecommerce',
  'real-estate',
  'education',
  'personal',
  'event',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateDefinition = {
  id: TemplateId;
  category: string;
  label: string;
  description: string;
  imageUrl: string;
  access: 'free' | 'premium';
};

export type TemplateConfig = {
  id: TemplateId;
  category: string;
  label: string;
  description: string;
  imageUrl: string;
  access: 'free' | 'premium';
  siteName: string;
  /** Token de acento del tema. */
  primary: string;
  copy: SectionCopy;
  /** Orden de secciones de la página; el footer va el último. */
  sections: SectionId[];
};

export const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
  saas: {
    id: 'saas',
    category: 'SaaS',
    label: 'SaaS Launch',
    description: 'Landing de conversión para un producto de software, con precios y prueba social.',
    imageUrl: '/images/webpages/loopline-devtool.webp',
    access: 'free',
    siteName: 'Nimbus SaaS',
    primary: '#7c3aed',
    copy: { eyebrow: 'Producto SaaS', title: 'Tu producto, listo para escalar', subtitle: 'La plataforma que tu equipo necesita para lanzar más rápido y medir mejor.' },
    sections: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'contact', 'footer'],
  },
  agency: {
    id: 'agency',
    category: 'Agency',
    label: 'Creative Agency',
    description: 'Portafolio editorial para agencias y estudios creativos.',
    imageUrl: '/images/webpages/earthy-brutalist.webp',
    access: 'free',
    siteName: 'Estudio Aurelia',
    primary: '#f04c23',
    copy: { eyebrow: 'Agencia creativa', title: 'Ideas que se convierten en marcas', subtitle: 'Estrategia, diseño y desarrollo en un solo equipo.' },
    sections: ['hero', 'features', 'gallery', 'testimonials', 'cta', 'contact', 'footer'],
  },
  restaurant: {
    id: 'restaurant',
    category: 'Restaurant',
    label: 'Restaurante',
    description: 'Carta, ambiente y reservas para restaurantes y cafeterías.',
    imageUrl: '/images/webpages/pizzaalta-neapolitan.webp',
    access: 'premium',
    siteName: 'La Brasa',
    primary: '#d97706',
    copy: { eyebrow: 'Restaurante', title: 'Cocina que se recuerda', subtitle: 'Ingredientes frescos, recetas de temporada y un espacio pensado para compartir.' },
    sections: ['hero', 'features', 'gallery', 'testimonials', 'contact', 'footer'],
  },
  portfolio: {
    id: 'portfolio',
    category: 'Portfolio',
    label: 'Portfolio',
    description: 'Muestra tu trabajo con una galería editorial y testimonios.',
    imageUrl: '/images/webpages/3d-photography-portfolio-video-projections.webp',
    access: 'free',
    siteName: 'Portafolio de Lucía',
    primary: '#0ea5e9',
    copy: { eyebrow: 'Portafolio', title: 'Trabajos que hablan por sí solos', subtitle: 'Una selección de proyectos recientes, de la idea al resultado final.' },
    sections: ['hero', 'gallery', 'testimonials', 'cta', 'contact', 'footer'],
  },
  ecommerce: {
    id: 'ecommerce',
    category: 'E-commerce',
    label: 'E-commerce',
    description: 'Landing de producto enfocada en una conversión rápida.',
    imageUrl: '/images/webpages/luxethread-fashion-store.webp',
    access: 'premium',
    siteName: 'Nube Store',
    primary: '#db2777',
    copy: { eyebrow: 'Tienda online', title: 'Compra fácil, entrega rápido', subtitle: 'Productos curados y envíos que no se hacen esperar.' },
    sections: ['hero', 'features', 'pricing', 'gallery', 'testimonials', 'faq', 'cta', 'footer'],
  },
  'real-estate': {
    id: 'real-estate',
    category: 'Real Estate',
    label: 'Inmobiliaria',
    description: 'Propiedades destacadas con galería y contacto directo.',
    imageUrl: '/images/webpages/airbnb-clone.webp',
    access: 'premium',
    siteName: 'Horizonte Inmobiliaria',
    primary: '#059669',
    copy: { eyebrow: 'Inmobiliaria', title: 'El hogar que buscabas', subtitle: 'Propiedades seleccionadas y acompañamiento en cada paso.' },
    sections: ['hero', 'features', 'gallery', 'testimonials', 'contact', 'footer'],
  },
  education: {
    id: 'education',
    category: 'Education',
    label: 'Educación',
    description: 'Curso o academia: beneficios, precios y preguntas frecuentes.',
    imageUrl: '/images/webpages/3d-educational-library-search.webp',
    access: 'free',
    siteName: 'Academia Vértice',
    primary: '#2563eb',
    copy: { eyebrow: 'Educación', title: 'Aprende con un método que funciona', subtitle: 'Clases prácticas, mentores y una comunidad que impulsa.' },
    sections: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
  },
  personal: {
    id: 'personal',
    category: 'Personal',
    label: 'Personal',
    description: 'Página personal o de marca con contacto directo.',
    imageUrl: '/images/webpages/3d-personal-brand-cube.webp',
    access: 'free',
    siteName: 'Hola, soy Martín',
    primary: '#9333ea',
    copy: { eyebrow: 'Personal', title: 'Hola, soy Martín', subtitle: 'Ayudo a equipos a lanzar productos digitales que importan.' },
    sections: ['hero', 'features', 'testimonials', 'cta', 'contact', 'footer'],
  },
  event: {
    id: 'event',
    category: 'Event',
    label: 'Evento',
    description: 'Evento o conferencia: agenda, precios y registro.',
    imageUrl: '/images/webpages/amplive-concert-tickets.webp',
    access: 'premium',
    siteName: 'Summit 2026',
    primary: '#e11d48',
    copy: { eyebrow: 'Evento', title: 'Un día que no querrás perderte', subtitle: 'Charlas, talleres y networking con los mejores del sector.' },
    sections: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
  },
};

export function listPageTemplates(): TemplateDefinition[] {
  return TEMPLATE_IDS.map(id => {
    const config = TEMPLATE_CONFIGS[id];
    return {
      id,
      category: config.category,
      label: config.label,
      description: config.description,
      imageUrl: config.imageUrl,
      access: config.access,
    };
  });
}

export function getPageTemplate(id: TemplateId): TemplateDefinition | undefined {
  return listPageTemplates().find(template => template.id === id);
}

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === 'string' && (TEMPLATE_IDS as readonly string[]).includes(value);
}

function navbarNode(makeId: (type: PageComponentType) => string, brand: string): PageNode {
  return {
    id: makeId('navbar'),
    type: 'navbar',
    props: {
      brand,
      brandHref: '/',
      links: [{ label: 'Características', href: '#caracteristicas' }, { label: 'Precios', href: '#precios' }],
      showCta: true,
      ctaLabel: 'Empezar',
      ctaHref: '#contacto',
    },
    styles: { desktop: { background: 'var(--ps-color-surface)' } },
    children: [],
  };
}

/** Construye el `PageSchema` de un sitio vacío para "crear desde cero". */
export function createBlankSchema(): SiteSchema {
  return {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      name: 'Mi sitio',
      defaultLocale: 'es',
      seo: { title: 'Mi sitio', description: '' },
      theme: { tokens: { ...DEFAULT_TOKENS }, fontFamily: 'Inter, system-ui, sans-serif' },
    },
    pages: [
      {
        id: 'page-1',
        name: 'Inicio',
        slug: '/',
        seo: { title: 'Mi sitio', description: '', canonical: '/' },
        sections: [],
      },
    ],
  };
}

export function createTemplateSchema(id: TemplateId): SiteSchema {
  const config = TEMPLATE_CONFIGS[id];
  const makeId = sectionIdFactory('tpl');

  const sections = config.sections.map(sectionId =>
    createSection(sectionId, makeId, { ...config.copy, title: config.copy.title })
  );

  const page: SitePage = {
    id: 'page-1',
    name: config.label,
    slug: '/',
    seo: {
      title: `${config.label} — ${config.siteName}`,
      description: config.description,
      canonical: '/',
    },
    sections: [navbarNode(makeId, config.siteName), ...sections],
  };

  const schema: SiteSchema = {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      name: config.siteName,
      defaultLocale: 'es',
      seo: {
        title: `${config.label} — ${config.siteName}`,
        description: config.description,
      },
      theme: {
        tokens: {
          ...DEFAULT_TOKENS,
          'color.primary': config.primary,
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    pages: [page],
  };

  const result = validatePageSchema(schema);
  if (!result.ok) {
    // No debería ocurrir: las secciones y el armado son internos y conocidos.
    throw new Error(`Plantilla ${id} inválida: ${result.issues[0]?.message ?? 'error desconocido'}`);
  }
  return result.schema;
}
