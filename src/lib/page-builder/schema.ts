/**
 * Contrato canónico del Visual Website Builder.
 *
 * El documento guarda intención y datos estructurados, nunca HTML, JSX ni
 * JavaScript generado. Los ids permiten editar un nodo sin clonar el sitio
 * completo y hacen que los parches futuros de IA sean pequeños y auditables.
 */

export const PAGE_SCHEMA_VERSION = 1 as const;

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
  'contactForm',
  'cta',
  'footer',
] as const;

export type PageComponentType = (typeof PAGE_COMPONENT_TYPES)[number];
export type PageId = string;
export type SectionId = string;
export type ComponentId = string;

export type SeoMetadata = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
};

export type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    secondary: string;
    border: string;
  };
  typography: {
    bodyFontFamily: string;
    headingFontFamily: string;
  };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string };
  radii: { sm: string; md: string; lg: string; full: string };
  shadows: { sm: string; md: string; lg: string };
};

export const STYLE_PROPERTIES = [
  'alignItems', 'alignSelf', 'background', 'border', 'borderColor', 'borderRadius',
  'borderStyle', 'borderWidth', 'boxShadow', 'color', 'display', 'flex',
  'flexDirection', 'flexWrap', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight',
  'gap', 'gridColumn', 'gridTemplateColumns', 'height', 'justifyContent',
  'letterSpacing', 'lineHeight', 'margin', 'marginBlock', 'marginBlockEnd',
  'marginBlockStart', 'marginInline', 'maxWidth', 'minHeight', 'objectFit',
  'opacity', 'overflow', 'padding', 'paddingBlock', 'paddingInline', 'textAlign',
  'textDecoration', 'textTransform', 'width',
] as const;

export type StyleProperty = (typeof STYLE_PROPERTIES)[number];
export type StyleValue = string | number;
export type ComponentStyles = Partial<Record<StyleProperty, StyleValue>>;
export type ResponsiveBreakpoint = 'laptop' | 'tablet' | 'mobile';
export type ResponsiveOverrides = Partial<Record<ResponsiveBreakpoint, ComponentStyles>>;

export type LinkItem = { label: string; href: string };
export type Action = LinkItem & { variant?: 'primary' | 'secondary' | 'outline' | 'link' };
export type ImageItem = { src: string; alt: string; caption?: string };

export type NavbarProps = { brand: string; brandHref: string; links: LinkItem[]; cta?: Action };
export type HeroProps = { eyebrow?: string; title: string; description: string; primaryAction?: Action; secondaryAction?: Action; image?: ImageItem };
export type HeadingProps = { text: string; level: 1 | 2 | 3 | 4 | 5 | 6 };
export type TextProps = { text: string; as: 'p' | 'span' | 'blockquote' };
export type ImageProps = ImageItem & { loading: 'lazy' | 'eager' };
export type ButtonProps = Action;
export type ContainerProps = { as: 'div' | 'main' | 'article' | 'aside'; maxWidth: string };
export type ColumnsProps = { columns: 2 | 3 | 4; gap: string; stackAt: 'laptop' | 'tablet' | 'mobile' };
export type FeaturesProps = { heading?: string; items: Array<{ title: string; description: string; icon?: string }> };
export type GalleryProps = { images: ImageItem[]; columns: 2 | 3 | 4 };
export type PricingProps = { heading?: string; plans: Array<{ name: string; price: string; description?: string; features: string[]; action?: Action; featured?: boolean }> };
export type TestimonialsProps = { heading?: string; items: Array<{ quote: string; name: string; role?: string; avatar?: string }> };
export type FaqProps = { heading?: string; items: Array<{ question: string; answer: string }> };
export type ContactFormProps = { heading?: string; description?: string; fields: Array<{ name: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea'; placeholder?: string; required?: boolean }>; submitLabel: string; action?: string; method: 'get' | 'post' };
export type CtaProps = { title: string; description?: string; primaryAction: Action; secondaryAction?: Action };
export type FooterProps = { brand: string; description?: string; links: LinkItem[]; copyright: string };

export type ComponentPropsMap = {
  navbar: NavbarProps;
  hero: HeroProps;
  heading: HeadingProps;
  text: TextProps;
  image: ImageProps;
  button: ButtonProps;
  container: ContainerProps;
  columns: ColumnsProps;
  features: FeaturesProps;
  gallery: GalleryProps;
  pricing: PricingProps;
  testimonials: TestimonialsProps;
  faq: FaqProps;
  contactForm: ContactFormProps;
  cta: CtaProps;
  footer: FooterProps;
};

export type ComponentNodeOf<K extends PageComponentType> = {
  id: ComponentId;
  type: K;
  props: ComponentPropsMap[K];
  styles: ComponentStyles;
  responsive: ResponsiveOverrides;
  children: ComponentId[];
};

export type PageComponentNode = {
  [K in PageComponentType]: ComponentNodeOf<K>;
}[PageComponentType];

export type PageSection = {
  id: SectionId;
  name: string;
  componentIds: ComponentId[];
  styles: ComponentStyles;
  responsive: ResponsiveOverrides;
};

export type PageDefinition = {
  id: PageId;
  name: string;
  slug: string;
  sectionIds: SectionId[];
  seo: SeoMetadata;
};

export type PageSchema = {
  schemaVersion: typeof PAGE_SCHEMA_VERSION;
  site: {
    id: string;
    name: string;
    locale: string;
    defaultPageId: PageId;
    pageIds: PageId[];
    seo: SeoMetadata;
    theme: ThemeTokens;
  };
  pages: Record<PageId, PageDefinition>;
  sections: Record<SectionId, PageSection>;
  components: Record<ComponentId, PageComponentNode>;
};

export const DEFAULT_PAGE_THEME: ThemeTokens = {
  colors: {
    background: '#ffffff', surface: '#f8fafc', text: '#0f172a', muted: '#64748b',
    primary: '#7c3aed', secondary: '#db2777', border: 'rgba(15,23,42,.12)',
  },
  typography: { bodyFontFamily: 'Inter, system-ui, sans-serif', headingFontFamily: 'Inter, system-ui, sans-serif' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '48px' },
  radii: { sm: '6px', md: '12px', lg: '20px', full: '999px' },
  shadows: { sm: '0 1px 2px rgba(15,23,42,.08)', md: '0 12px 35px rgba(15,23,42,.14)', lg: '0 24px 60px rgba(15,23,42,.22)' },
};

export function createEmptyPageSchema(name = 'Mi sitio'): PageSchema {
  const pageId = 'page-home';
  return {
    schemaVersion: PAGE_SCHEMA_VERSION,
    site: {
      id: 'site-main', name, locale: 'es', defaultPageId: pageId, pageIds: [pageId],
      seo: { title: name, description: `${name} creado con Prompt Studio.` },
      theme: structuredClone(DEFAULT_PAGE_THEME),
    },
    pages: {
      [pageId]: { id: pageId, name: 'Inicio', slug: '/', sectionIds: [], seo: { title: name, description: `${name} creado con Prompt Studio.` } },
    },
    sections: {},
    components: {},
  };
}
