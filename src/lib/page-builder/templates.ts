import { createPageComponent } from '@/lib/page-builder/editor-mutations';
import { createEmptyPageSchema, type PageComponentNode, type PageSchema } from '@/lib/page-builder/schema';

export type PageBuilderTemplateSeed = {
  id: string;
  name: string;
  category: string;
  description: string;
  blank?: boolean;
};

/** Semillas PageSchema: las plantillas nunca se convierten en HTML editable. */
export function createTemplatePageSchema(template: PageBuilderTemplateSeed): PageSchema {
  const schema = createEmptyPageSchema(template.name);
  if (template.blank) return schema;
  const page = schema.pages[schema.site.defaultPageId];
  const palette: Record<string, { accent: string; surface: string }> = {
    'saas-launch': { accent: '#635bff', surface: '#15132b' },
    'ai-product': { accent: '#22c55e', surface: '#081d16' },
    'creative-agency': { accent: '#f04c23', surface: '#24130d' },
    ecommerce: { accent: '#db2777', surface: '#260d1b' },
    course: { accent: '#f59e0b', surface: '#2a1a06' },
    'lead-gen': { accent: '#0ea5e9', surface: '#082033' },
  };
  const theme = palette[template.id] ?? palette['saas-launch'];
  schema.site.theme.colors.primary = theme.accent;

  const addSection = (id: string, name: string, components: PageComponentNode[], background = '#ffffff') => {
    const sectionId = `section-${id}`;
    page.sectionIds.push(sectionId);
    schema.sections[sectionId] = {
      id: sectionId,
      name,
      componentIds: components.map(component => component.id),
      styles: { background, paddingBlock: '48px' },
      responsive: { mobile: { paddingBlock: '24px' } },
    };
    for (const component of components) schema.components[component.id] = component;
  };

  addSection('navigation', 'Navegación', [
    createPageComponent('navbar', 'navbar-main', {
      brand: template.name,
      brandHref: '/',
      links: [{ label: 'Beneficios', href: '#section-features' }, { label: 'Contacto', href: '#section-cta' }],
      cta: { label: 'Comenzar', href: '#section-cta', variant: 'primary' },
    }, { maxWidth: '1200px', marginInline: 'auto' }),
  ]);

  addSection('hero', 'Hero', [
    createPageComponent('hero', 'hero-main', {
      eyebrow: template.category,
      title: template.name,
      description: template.description,
      primaryAction: { label: 'Comenzar ahora', href: '#section-cta', variant: 'primary' },
      secondaryAction: { label: 'Ver beneficios', href: '#section-features', variant: 'outline' },
    }, { maxWidth: '1200px', marginInline: 'auto', color: '#ffffff' }, { mobile: { padding: '40px 20px' } }),
  ], `linear-gradient(135deg, ${theme.surface}, #09090b)`);

  addSection('features', 'Beneficios', [
    createPageComponent('features', 'features-main', {
      heading: 'Todo lo que necesitas para avanzar',
      items: [
        { title: 'Diseño que convierte', description: 'Jerarquía visual y mensajes claros para guiar cada visita.' },
        { title: 'Flujo sin fricción', description: 'Una experiencia rápida y responsive en cualquier dispositivo.' },
        { title: 'Listo para crecer', description: 'Componentes estructurados que evolucionan con tu producto.' },
      ],
    }, { maxWidth: '1200px', marginInline: 'auto', paddingInline: '24px' }),
  ], '#f8fafc');

  addSection('proof', 'Testimonios', [
    createPageComponent('testimonials', 'testimonials-main', {
      heading: 'Resultados que se entienden',
      items: [{ quote: 'La nueva experiencia hizo que nuestro mensaje se entendiera desde el primer segundo.', name: 'Equipo de clientes', role: 'Prompt Studio' }],
    }, { maxWidth: '980px', marginInline: 'auto', paddingInline: '24px' }),
  ]);

  addSection('cta', 'Llamada a la acción', [
    createPageComponent('cta', 'cta-main', {
      title: '¿Listo para empezar?',
      description: 'Convierte tu idea en una experiencia que tus clientes puedan usar.',
      primaryAction: { label: 'Crear mi proyecto', href: '#contacto', variant: 'primary' },
    }, { maxWidth: '980px', marginInline: 'auto' }),
  ], '#f8fafc');

  addSection('footer', 'Footer', [
    createPageComponent('footer', 'footer-main', {
      brand: template.name,
      description: template.description,
      links: [{ label: 'Privacidad', href: '/privacy' }, { label: 'Términos', href: '/terms' }],
      copyright: `${template.name} · Todos los derechos reservados.`,
    }, { maxWidth: '1200px', marginInline: 'auto' }),
  ], '#ffffff');

  return schema;
}
