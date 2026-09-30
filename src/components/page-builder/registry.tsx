import type { ComponentType } from 'react';
import { z } from 'zod';
import {
  ButtonComponent,
  ColumnsComponent,
  ContactFormComponent,
  ContainerComponent,
  CtaComponent,
  FaqComponent,
  FeaturesComponent,
  FooterComponent,
  GalleryComponent,
  HeadingComponent,
  HeroComponent,
  ImageComponent,
  NavbarComponent,
  PricingComponent,
  TestimonialsComponent,
  TextComponent,
  type BuilderComponentProps,
} from '@/components/page-builder/components';
import {
  PAGE_COMPONENT_TYPES,
  type ComponentPropsMap,
  type ComponentStyles,
  type PageComponentType,
  type StyleProperty,
} from '@/lib/page-builder/schema';

export type PropertyControl = 'text' | 'textarea' | 'number' | 'select' | 'url' | 'image' | 'images' | 'list' | 'object';
export type EditableProperty<K extends PageComponentType> = {
  key: keyof ComponentPropsMap[K] & string;
  label: string;
  control: PropertyControl;
  options?: readonly string[];
};

export type ResponsiveCapabilities = {
  enabled: boolean;
  properties: readonly StyleProperty[];
};

export type PageComponentDefinition<K extends PageComponentType> = {
  type: K;
  label: string;
  component: ComponentType<BuilderComponentProps<K>>;
  propsSchema: z.ZodType<ComponentPropsMap[K]>;
  defaultProps: ComponentPropsMap[K];
  defaultStyles: ComponentStyles;
  editableProperties: readonly EditableProperty<K>[];
  allowedChildren: '*' | readonly PageComponentType[];
  styleControls: readonly StyleProperty[];
  responsive: ResponsiveCapabilities;
};

export type AnyPageComponentDefinition = {
  [K in PageComponentType]: PageComponentDefinition<K>;
}[PageComponentType];

type ComponentRegistry = { [K in PageComponentType]: PageComponentDefinition<K> };

const actionSchema = z.object({
  label: z.string().min(1).max(120),
  href: z.string().max(2048),
  variant: z.enum(['primary', 'secondary', 'outline', 'link']).optional(),
}).strict();
const linkSchema = z.object({ label: z.string().min(1).max(120), href: z.string().max(2048) }).strict();
const imageSchema = z.object({ src: z.string().max(2048), alt: z.string().max(300), caption: z.string().max(300).optional() }).strict();
const baseStyleControls = [
  'display', 'width', 'height', 'maxWidth',
  'padding', 'margin', 'gap', 'alignItems', 'justifyContent',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign',
  'color', 'background', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'opacity',
] as const satisfies readonly StyleProperty[];
const responsiveStyleControls = [
  'display', 'width', 'height', 'maxWidth', 'padding', 'margin', 'gap',
  'alignItems', 'justifyContent', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'textAlign', 'color', 'background', 'border', 'borderColor', 'borderRadius',
  'boxShadow', 'opacity', 'gridTemplateColumns',
] as const satisfies readonly StyleProperty[];
const responsive = (properties: readonly StyleProperty[] = responsiveStyleControls): ResponsiveCapabilities => ({ enabled: true, properties });

function define<K extends PageComponentType>(definition: PageComponentDefinition<K>): PageComponentDefinition<K> {
  return definition;
}

export const PAGE_COMPONENT_REGISTRY: ComponentRegistry = {
  navbar: define({
    type: 'navbar', label: 'Navbar', component: NavbarComponent,
    propsSchema: z.object({ brand: z.string().min(1).max(120), brandHref: z.string().max(2048), links: z.array(linkSchema).max(20), cta: actionSchema.optional() }).strict(),
    defaultProps: { brand: 'Mi marca', brandHref: '/', links: [{ label: 'Inicio', href: '/' }, { label: 'Contacto', href: '#contacto' }] },
    defaultStyles: { width: '100%', background: 'token:colors.background' },
    editableProperties: [{ key: 'brand', label: 'Marca', control: 'text' }, { key: 'brandHref', label: 'URL de marca', control: 'url' }, { key: 'links', label: 'Enlaces', control: 'list' }, { key: 'cta', label: 'Acción', control: 'object' }],
    allowedChildren: ['image', 'text', 'button', 'container'], styleControls: baseStyleControls, responsive: responsive(),
  }),
  hero: define({
    type: 'hero', label: 'Hero', component: HeroComponent,
    propsSchema: z.object({ eyebrow: z.string().max(120).optional(), title: z.string().min(1).max(240), description: z.string().max(1200), primaryAction: actionSchema.optional(), secondaryAction: actionSchema.optional(), image: imageSchema.optional() }).strict(),
    defaultProps: { eyebrow: 'Nuevo', title: 'Una idea clara merece una gran página', description: 'Crea una experiencia rápida, accesible y preparada para convertir.', primaryAction: { label: 'Comenzar', href: '#contacto', variant: 'primary' } },
    defaultStyles: { width: '100%' },
    editableProperties: [{ key: 'eyebrow', label: 'Etiqueta', control: 'text' }, { key: 'title', label: 'Título', control: 'textarea' }, { key: 'description', label: 'Descripción', control: 'textarea' }, { key: 'primaryAction', label: 'Acción principal', control: 'object' }, { key: 'secondaryAction', label: 'Acción secundaria', control: 'object' }, { key: 'image', label: 'Imagen', control: 'image' }],
    allowedChildren: ['heading', 'text', 'image', 'button', 'container', 'columns'], styleControls: baseStyleControls, responsive: responsive(),
  }),
  heading: define({
    type: 'heading', label: 'Heading', component: HeadingComponent,
    propsSchema: z.object({ text: z.string().max(500), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]) }).strict(),
    defaultProps: { text: 'Título de sección', level: 2 }, defaultStyles: { color: 'token:colors.text', fontSize: '2rem', lineHeight: 1.15 },
    editableProperties: [{ key: 'text', label: 'Texto', control: 'textarea' }, { key: 'level', label: 'Nivel semántico', control: 'select', options: ['1', '2', '3', '4', '5', '6'] }],
    allowedChildren: [], styleControls: [...baseStyleControls, 'fontSize', 'fontWeight', 'lineHeight'], responsive: responsive(['fontSize', 'textAlign', 'margin']),
  }),
  text: define({
    type: 'text', label: 'Text', component: TextComponent,
    propsSchema: z.object({ text: z.string().max(10000), as: z.enum(['p', 'span', 'blockquote']) }).strict(),
    defaultProps: { text: 'Escribe aquí tu contenido.', as: 'p' }, defaultStyles: { color: 'token:colors.muted', fontSize: '1rem', lineHeight: 1.65 },
    editableProperties: [{ key: 'text', label: 'Texto', control: 'textarea' }, { key: 'as', label: 'Elemento', control: 'select', options: ['p', 'span', 'blockquote'] }],
    allowedChildren: [], styleControls: [...baseStyleControls, 'fontSize', 'fontWeight', 'lineHeight'], responsive: responsive(['fontSize', 'textAlign', 'margin']),
  }),
  image: define({
    type: 'image', label: 'Image', component: ImageComponent,
    propsSchema: imageSchema.extend({ loading: z.enum(['lazy', 'eager']) }).strict(),
    defaultProps: { src: '', alt: '', loading: 'lazy' }, defaultStyles: { width: '100%', borderRadius: 'token:radii.md' },
    editableProperties: [{ key: 'src', label: 'Imagen', control: 'image' }, { key: 'alt', label: 'Texto alternativo', control: 'text' }, { key: 'caption', label: 'Pie', control: 'text' }, { key: 'loading', label: 'Carga', control: 'select', options: ['lazy', 'eager'] }],
    allowedChildren: [], styleControls: [...baseStyleControls, 'width', 'height', 'objectFit'], responsive: responsive(['width', 'height', 'borderRadius']),
  }),
  button: define({
    type: 'button', label: 'Button', component: ButtonComponent, propsSchema: actionSchema,
    defaultProps: { label: 'Continuar', href: '#', variant: 'primary' }, defaultStyles: {},
    editableProperties: [{ key: 'label', label: 'Etiqueta', control: 'text' }, { key: 'href', label: 'Destino', control: 'url' }, { key: 'variant', label: 'Variante', control: 'select', options: ['primary', 'secondary', 'outline', 'link'] }],
    allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(['display', 'width', 'margin']),
  }),
  container: define({
    type: 'container', label: 'Container', component: ContainerComponent,
    propsSchema: z.object({ as: z.enum(['div', 'main', 'article', 'aside']), maxWidth: z.string().min(1).max(40) }).strict(),
    defaultProps: { as: 'div', maxWidth: '1200px' }, defaultStyles: { width: '100%', marginInline: 'auto' },
    editableProperties: [{ key: 'as', label: 'Elemento', control: 'select', options: ['div', 'main', 'article', 'aside'] }, { key: 'maxWidth', label: 'Ancho máximo', control: 'text' }],
    allowedChildren: '*', styleControls: [...baseStyleControls, 'display', 'gap', 'alignItems', 'justifyContent'], responsive: responsive(),
  }),
  columns: define({
    type: 'columns', label: 'Columns', component: ColumnsComponent,
    propsSchema: z.object({ columns: z.union([z.literal(2), z.literal(3), z.literal(4)]), gap: z.string().min(1).max(40), stackAt: z.enum(['laptop', 'tablet', 'mobile']) }).strict(),
    defaultProps: { columns: 2, gap: '24px', stackAt: 'mobile' }, defaultStyles: { width: '100%' },
    editableProperties: [{ key: 'columns', label: 'Columnas', control: 'select', options: ['2', '3', '4'] }, { key: 'gap', label: 'Espacio', control: 'text' }, { key: 'stackAt', label: 'Apilar en', control: 'select', options: ['laptop', 'tablet', 'mobile'] }],
    allowedChildren: ['container', 'heading', 'text', 'image', 'button', 'features', 'gallery', 'pricing', 'testimonials', 'faq', 'contactForm', 'cta'], styleControls: [...baseStyleControls, 'gap', 'gridTemplateColumns'], responsive: responsive(['gridTemplateColumns', 'gap', 'padding', 'margin']),
  }),
  features: define({
    type: 'features', label: 'Features', component: FeaturesComponent,
    propsSchema: z.object({ heading: z.string().max(240).optional(), items: z.array(z.object({ title: z.string().min(1).max(160), description: z.string().max(1000), icon: z.string().max(20).optional() }).strict()).max(24) }).strict(),
    defaultProps: { heading: 'Todo lo que necesitas', items: [{ title: 'Rápido', description: 'Una experiencia optimizada de principio a fin.' }, { title: 'Flexible', description: 'Contenido estructurado que evoluciona contigo.' }, { title: 'Seguro', description: 'Sin ejecutar código arbitrario.' }] }, defaultStyles: {},
    editableProperties: [{ key: 'heading', label: 'Título', control: 'text' }, { key: 'items', label: 'Beneficios', control: 'list' }], allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(),
  }),
  gallery: define({
    type: 'gallery', label: 'Gallery', component: GalleryComponent,
    propsSchema: z.object({ images: z.array(imageSchema).max(50), columns: z.union([z.literal(2), z.literal(3), z.literal(4)]) }).strict(),
    defaultProps: { images: [], columns: 3 }, defaultStyles: {}, editableProperties: [{ key: 'images', label: 'Imágenes', control: 'images' }, { key: 'columns', label: 'Columnas', control: 'select', options: ['2', '3', '4'] }],
    allowedChildren: [], styleControls: [...baseStyleControls, 'gap', 'gridTemplateColumns'], responsive: responsive(['gridTemplateColumns', 'gap']),
  }),
  pricing: define({
    type: 'pricing', label: 'Pricing', component: PricingComponent,
    propsSchema: z.object({ heading: z.string().max(240).optional(), plans: z.array(z.object({ name: z.string().min(1).max(120), price: z.string().max(80), description: z.string().max(500).optional(), features: z.array(z.string().max(200)).max(30), action: actionSchema.optional(), featured: z.boolean().optional() }).strict()).max(12) }).strict(),
    defaultProps: { heading: 'Planes simples', plans: [{ name: 'Starter', price: '$0', features: ['Una página', 'Responsive'] }, { name: 'Pro', price: '$29', features: ['Páginas ilimitadas', 'SEO avanzado'], featured: true }] }, defaultStyles: {}, editableProperties: [{ key: 'heading', label: 'Título', control: 'text' }, { key: 'plans', label: 'Planes', control: 'list' }],
    allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(),
  }),
  testimonials: define({
    type: 'testimonials', label: 'Testimonials', component: TestimonialsComponent,
    propsSchema: z.object({ heading: z.string().max(240).optional(), items: z.array(z.object({ quote: z.string().min(1).max(1500), name: z.string().min(1).max(120), role: z.string().max(160).optional(), avatar: z.string().max(2048).optional() }).strict()).max(24) }).strict(),
    defaultProps: { heading: 'Lo que dicen nuestros clientes', items: [{ quote: 'La página comunica nuestro valor desde el primer segundo.', name: 'Cliente Prompt Studio', role: 'Founder' }] }, defaultStyles: {}, editableProperties: [{ key: 'heading', label: 'Título', control: 'text' }, { key: 'items', label: 'Testimonios', control: 'list' }],
    allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(),
  }),
  faq: define({
    type: 'faq', label: 'FAQ', component: FaqComponent,
    propsSchema: z.object({ heading: z.string().max(240).optional(), items: z.array(z.object({ question: z.string().min(1).max(300), answer: z.string().max(2000) }).strict()).max(30) }).strict(),
    defaultProps: { heading: 'Preguntas frecuentes', items: [{ question: '¿Puedo editar el contenido?', answer: 'Sí. Todo se guarda como datos estructurados y editables.' }] }, defaultStyles: {}, editableProperties: [{ key: 'heading', label: 'Título', control: 'text' }, { key: 'items', label: 'Preguntas', control: 'list' }],
    allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(),
  }),
  contactForm: define({
    type: 'contactForm', label: 'Contact Form', component: ContactFormComponent,
    propsSchema: z.object({ heading: z.string().max(240).optional(), description: z.string().max(1000).optional(), fields: z.array(z.object({ name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/), label: z.string().min(1).max(160), type: z.enum(['text', 'email', 'tel', 'textarea']), placeholder: z.string().max(300).optional(), required: z.boolean().optional() }).strict()).min(1).max(20), submitLabel: z.string().min(1).max(120), action: z.string().max(2048).optional(), method: z.enum(['get', 'post']) }).strict(),
    defaultProps: { heading: 'Hablemos', fields: [{ name: 'name', label: 'Nombre', type: 'text', required: true }, { name: 'email', label: 'Correo', type: 'email', required: true }, { name: 'message', label: 'Mensaje', type: 'textarea', required: true }], submitLabel: 'Enviar', method: 'post' }, defaultStyles: { maxWidth: '720px' },
    editableProperties: [{ key: 'heading', label: 'Título', control: 'text' }, { key: 'description', label: 'Descripción', control: 'textarea' }, { key: 'fields', label: 'Campos', control: 'list' }, { key: 'submitLabel', label: 'Botón', control: 'text' }, { key: 'action', label: 'Destino', control: 'url' }, { key: 'method', label: 'Método', control: 'select', options: ['get', 'post'] }],
    allowedChildren: [], styleControls: baseStyleControls, responsive: responsive(),
  }),
  cta: define({
    type: 'cta', label: 'CTA', component: CtaComponent,
    propsSchema: z.object({ title: z.string().min(1).max(240), description: z.string().max(1000).optional(), primaryAction: actionSchema, secondaryAction: actionSchema.optional() }).strict(),
    defaultProps: { title: '¿Listo para empezar?', description: 'Convierte tu idea en una página real.', primaryAction: { label: 'Comenzar', href: '#', variant: 'primary' } }, defaultStyles: {},
    editableProperties: [{ key: 'title', label: 'Título', control: 'text' }, { key: 'description', label: 'Descripción', control: 'textarea' }, { key: 'primaryAction', label: 'Acción principal', control: 'object' }, { key: 'secondaryAction', label: 'Acción secundaria', control: 'object' }],
    allowedChildren: ['heading', 'text', 'button', 'container'], styleControls: baseStyleControls, responsive: responsive(),
  }),
  footer: define({
    type: 'footer', label: 'Footer', component: FooterComponent,
    propsSchema: z.object({ brand: z.string().min(1).max(120), description: z.string().max(1000).optional(), links: z.array(linkSchema).max(30), copyright: z.string().max(300) }).strict(),
    defaultProps: { brand: 'Mi marca', description: 'Una experiencia creada con Prompt Studio.', links: [{ label: 'Privacidad', href: '/privacy' }], copyright: 'Todos los derechos reservados.' }, defaultStyles: {},
    editableProperties: [{ key: 'brand', label: 'Marca', control: 'text' }, { key: 'description', label: 'Descripción', control: 'textarea' }, { key: 'links', label: 'Enlaces', control: 'list' }, { key: 'copyright', label: 'Copyright', control: 'text' }],
    allowedChildren: ['image', 'text', 'button', 'container', 'columns'], styleControls: baseStyleControls, responsive: responsive(),
  }),
};

export function getPageComponentDefinition<K extends PageComponentType>(type: K): PageComponentDefinition<K>;
export function getPageComponentDefinition(type: string): AnyPageComponentDefinition | undefined;
export function getPageComponentDefinition(type: string): AnyPageComponentDefinition | undefined {
  return PAGE_COMPONENT_REGISTRY[type as PageComponentType] as AnyPageComponentDefinition | undefined;
}

export function allPageComponentDefinitions(): AnyPageComponentDefinition[] {
  return PAGE_COMPONENT_TYPES.map(type => PAGE_COMPONENT_REGISTRY[type]) as AnyPageComponentDefinition[];
}
