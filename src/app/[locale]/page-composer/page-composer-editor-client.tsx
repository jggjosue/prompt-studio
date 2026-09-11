'use client';

import EditorWorkspace from '@/components/editor/editor-workspace';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createDocument, createNode, incrementalIds, insertNode, type EditorDocument } from '@/lib/editor/document';
import { ArrowLeft, Crown, Eye, Monitor, PencilLine, Search, Sparkles, Tablet, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Template = { id: string; name: string; category: string; description: string; image: string; preview: string; tags: string[]; blank?: boolean };

const TEMPLATES: Template[] = [
  { id: 'blank-canvas', name: 'Iniciar desde cero', category: 'Blank', description: 'Un lienzo vacío para crear tu propia página, sección por sección.', image: '', preview: '', tags: ['Blank', 'Custom', 'Libre'], blank: true },
  { id: 'saas-launch', name: 'SaaS Launch', category: 'SaaS', description: 'Landing de conversión para un producto de software.', image: '/images/webpages/buffer-clone.webp', preview: 'buffer-clone', tags: ['B2B', 'Producto', 'Trial'] },
  { id: 'ai-product', name: 'AI Product', category: 'AI Tools', description: 'Presenta una herramienta de IA con prueba social y CTA.', image: '/images/webpages/notion-clone.webp', preview: 'notion-clone', tags: ['AI', 'Demo', 'Moderno'] },
  { id: 'creative-agency', name: 'Creative Agency', category: 'Agencies', description: 'Portafolio editorial para servicios creativos.', image: '/images/webpages/atelier-creative-studio-portfolio.webp', preview: 'atelier-creative-studio-portfolio', tags: ['Servicios', 'Portfolio', 'Editorial'] },
  { id: 'ecommerce', name: 'Commerce Drop', category: 'Ecommerce', description: 'Página de producto enfocada en una conversión rápida.', image: '/images/webpages/cozyloft-home-decor.webp', preview: 'cozyloft-home-decor', tags: ['Producto', 'Shop', 'CTA'] },
  { id: 'course', name: 'Creator Course', category: 'Courses', description: 'Venta de curso con módulos, beneficios y testimonios.', image: '/images/webpages/chorus-music-lessons.webp', preview: 'chorus-music-lessons', tags: ['Curso', 'Leads', 'Pricing'] },
  { id: 'lead-gen', name: 'Lead Gen', category: 'Lead Generation', description: 'Landing optimizada para captar solicitudes y demos.', image: '/images/webpages/insuregrid-insurtech.webp', preview: 'insuregrid-insurtech', tags: ['Formulario', 'Demo', 'B2B'] },
];

/**
 * El generador web recibe el contenido editable mediante `prompt`. Mandar solo
 * el id de la plantilla dejaba el formulario vacío porque `/generate-webs` no
 * consume ese parámetro. Esta especificación incluye todas las secciones que
 * el Page Composer crea en el borrador.
 */
function templateGeneratorHref(template: Template): string {
  const prompt = template.blank
    ? 'Crea una página web completa desde cero. Permite editar estructura, textos, colores, imágenes, navegación, secciones, llamadas a la acción y footer.'
    : [
        `Edita y regenera la página completa de la plantilla “${template.name}”.`,
        `Categoría: ${template.category}.`,
        `Objetivo: ${template.description}`,
        `Etiquetas: ${template.tags.join(', ')}.`,
        'Contenido actual: hero con categoría, título, descripción y CTA “Comenzar ahora”; sección de beneficios con “Diseño que convierte”, “Flujo sin fricción” y “Listo para crecer”; testimonio de cliente; CTA final “¿Listo para empezar?” con botón “Crear mi proyecto”; footer con derechos reservados.',
        'Genera la página completa y mantén editables todos los textos, colores, imágenes, componentes, navegación, secciones, estilos responsive y footer.',
      ].join('\n');
  const params = new URLSearchParams({ prompt, template: template.id, source: 'page-composer' });
  return `/generate-webs?${params.toString()}`;
}

function templateDocument(template: Template): EditorDocument {
  const ids = incrementalIds();
  let document = createDocument(ids);
  if (template.blank) return document;
  const palette: Record<string, { accent: string; surface: string }> = {
    'saas-launch': { accent: '#635bff', surface: '#15132b' },
    'ai-product': { accent: '#22c55e', surface: '#081d16' },
    'creative-agency': { accent: '#f04c23', surface: '#24130d' },
    ecommerce: { accent: '#db2777', surface: '#260d1b' },
    course: { accent: '#f59e0b', surface: '#2a1a06' },
    'lead-gen': { accent: '#0ea5e9', surface: '#082033' },
  };
  const theme = palette[template.id] ?? palette['saas-launch'];
  const add = (type: string, parentId: string) => {
    const node = createNode(type, ids);
    const result = insertNode(document, node, parentId, document.nodes[parentId].children.length);
    if ('document' in result) document = result.document;
    return node.id;
  };
  const patch = (id: string, props: Record<string, unknown> = {}, styles: Record<string, string | number> = {}) => {
    const node = document.nodes[id];
    document = { ...document, nodes: { ...document.nodes, [id]: { ...node, props: { ...node.props, ...props }, styles: { ...node.styles, desktop: { ...(node.styles.desktop ?? {}), ...styles } } } } };
  };
  const section = (background?: string) => {
    const id = add('section', document.rootId);
    patch(id, {}, { paddingBlock: '88px', background: background ?? 'transparent' });
    return id;
  };
  const hero = section(`linear-gradient(135deg, ${theme.surface}, #09090b)`);
  const heroContent = add('container', hero);
  patch(heroContent, {}, { maxWidth: '980px', textAlign: 'center', paddingInline: '32px' });
  const eyebrow = add('badge', heroContent); patch(eyebrow, { text: template.category }, { background: theme.accent, marginBottom: '20px' });
  const heading = add('heading', heroContent); patch(heading, { text: template.name }, { fontSize: '56px', color: '#ffffff', marginBottom: '18px' });
  const text = add('text', heroContent); patch(text, { text: template.description }, { fontSize: '19px', color: '#c4c4ce', marginBottom: '30px' });
  const button = add('button', heroContent); patch(button, { label: 'Comenzar ahora' }, { background: theme.accent, color: '#ffffff' });

  const features = section('#0d0d12');
  const featuresContent = add('container', features);
  const featuresTitle = add('heading', featuresContent); patch(featuresTitle, { text: 'Todo lo que necesitas para avanzar' }, { color: '#ffffff', fontSize: '36px', marginBottom: '32px' });
  const grid = add('grid', featuresContent); patch(grid, {}, { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' });
  ['Diseño que convierte', 'Flujo sin fricción', 'Listo para crecer'].forEach((title, index) => { const card = add('card', grid); patch(card, {}, { background: index === 1 ? theme.surface : '#17171f', padding: '28px' }); const cardTitle = add('heading', card); patch(cardTitle, { text: title, level: 3 }, { fontSize: '21px', color: '#ffffff' }); const cardText = add('text', card); patch(cardText, { text: 'Una experiencia clara, rápida y pensada para tus clientes.' }, { color: '#b4b4c0' }); });

  const proof = section(theme.surface);
  const proofContent = add('container', proof); patch(proofContent, {}, { textAlign: 'center', maxWidth: '820px' });
  const quote = add('heading', proofContent); patch(quote, { text: '“La nueva experiencia hizo que nuestro mensaje se entendiera desde el primer segundo.”', level: 2 }, { fontSize: '32px', color: '#ffffff', marginBottom: '16px' });
  const author = add('text', proofContent); patch(author, { text: '— Equipo de clientes' }, { color: theme.accent });

  const finalCta = section('#0d0d12');
  const finalContent = add('container', finalCta); patch(finalContent, {}, { textAlign: 'center' });
  const finalHeading = add('heading', finalContent); patch(finalHeading, { text: '¿Listo para empezar?' }, { color: '#ffffff', fontSize: '40px', marginBottom: '20px' });
  const finalButton = add('button', finalContent); patch(finalButton, { label: 'Crear mi proyecto' }, { background: theme.accent, color: '#ffffff' });

  const footer = section('#070708');
  const footerContent = add('container', footer); patch(footerContent, {}, { textAlign: 'center', paddingBlock: '32px' });
  const footerText = add('text', footerContent); patch(footerText, { text: `${template.name} · Todos los derechos reservados.` }, { color: '#777784', fontSize: '13px' });
  return document;
}

function TemplateThumbnail({ template }: { template: Template }) {
  const [failed, setFailed] = useState(false);
  if (template.blank) return <div className="grid h-40 place-items-center bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px]"><span className="rounded-full border border-dashed bg-background/80 px-3 py-1 text-xs font-bold">Lienzo vacío</span></div>;
  if (failed) return <div className="grid h-40 place-items-center bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-400/20 p-6 text-center"><span className="text-sm font-black text-white">{template.name}</span></div>;
  return <img src={template.image} alt={`Vista previa de ${template.name}`} onError={() => setFailed(true)} className="h-40 w-full object-cover" />;
}

export default function PageComposerEditorClient({ canEdit }: { canEdit: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [preview, setPreview] = useState<Template | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  // El árbol de la plantilla se crea una vez por selección. Sin esta memoria,
  // cualquier re-render de la galería podía reemplazar el borrador en curso.
  const editableDocument = useMemo(() => (editing ? templateDocument(editing) : null), [editing]);
  const templates = useMemo(() => TEMPLATES.filter(template =>
    (category === 'Todas' || template.category === category) &&
    `${template.name} ${template.category} ${template.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);
  const categories = ['Todas', ...new Set(TEMPLATES.map(template => template.category))];

  if (editing) {
    return (
      <div className="flex min-h-screen flex-col bg-[#090a0f]">
        <Header />
        <main className="flex-1 px-3 py-3 sm:px-5 sm:py-5">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-white">
              <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Volver a plantillas"><ArrowLeft className="size-4" /></Button><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">Borrador desde plantilla</p><h1 className="text-sm font-bold">{editing.name}</h1></div></div>
              <span className="text-xs text-zinc-400">Copia editable · Guardado automático</span>
            </div>
            <EditorWorkspace key={editing.id} name={`${editing.name} · Mi página`} initialDocument={editableDocument} previewUrl={editing.preview ? `/webpages/${encodeURIComponent(editing.preview)}/index.html` : null} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background"><Header />
      <main className="flex-1"><section className="border-b bg-[radial-gradient(circle_at_18%_0%,rgba(124,58,237,.18),transparent_36%)] px-4 py-12"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-500">Page Composer</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Elige una plantilla y hazla tuya.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Las plantillas son inmutables. Al usar una se crea una copia estructurada que puedes editar, guardar y continuar después.</p></div></section>
        <section className="mx-auto max-w-7xl px-4 py-8"><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={event => setQuery(event.target.value)} className="pl-9" placeholder="Buscar plantilla…" /></div><div className="flex flex-wrap gap-2">{categories.map(item => <Button key={item} variant={category === item ? 'default' : 'outline'} size="sm" onClick={() => setCategory(item)}>{item}</Button>)}</div></div>
          {!canEdit ? <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4"><p className="text-sm">Esta funcionalidad está disponible para usuarios Premium.</p><Button asChild><Link href="/prices?plan=premium"><Crown className="mr-2 size-4"/>Actualizar a Premium</Link></Button></div> : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{templates.map(template => <article key={template.id} className="overflow-hidden rounded-2xl border bg-card"><TemplateThumbnail template={template} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-violet-500">{template.category}</p><h2 className="mt-1 font-black">{template.name}</h2></div><span className="rounded-full bg-muted px-2 py-1 text-[10px]">Plantilla</span></div><p className="mt-3 min-h-10 text-sm text-muted-foreground">{template.description}</p><div className="mt-3 flex flex-wrap gap-1">{template.tags.map(tag => <span key={tag} className="rounded bg-muted px-2 py-1 text-[10px]">{tag}</span>)}</div><div className="mt-5 flex flex-wrap gap-2">{template.blank ? null : <Button variant="outline" size="sm" onClick={() => setPreview(template)}><Eye className="mr-1.5 size-3.5"/>Preview</Button>}<Button variant="secondary" size="sm" asChild><Link href={templateGeneratorHref(template)}><PencilLine className="mr-1.5 size-3.5"/>Editar</Link></Button><Button size="sm" disabled={!canEdit} onClick={() => setEditing(template)}><Sparkles className="mr-1.5 size-3.5"/>Usar plantilla</Button></div></div></article>)}</div>
        </section></main><Footer />
      {preview ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-2 sm:p-3"><div className="flex h-[94dvh] w-[97vw] max-w-none flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"><div className="flex shrink-0 items-center justify-between gap-3 border-b p-3"><strong className="min-w-0 truncate">{preview.name}</strong><div className="ml-auto flex items-center gap-1 text-muted-foreground"><Monitor className="size-4"/><Tablet className="size-4"/><Smartphone className="size-4"/></div><Button size="sm" asChild><Link href={templateGeneratorHref(preview)}><PencilLine className="mr-1.5 size-3.5"/>Editar</Link></Button><Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Cerrar</Button></div><iframe title={`Vista previa de ${preview.name}`} src={`/webpages/${encodeURIComponent(preview.preview)}/index.html`} className="min-h-0 w-full flex-1 bg-white" /></div></div> : null}
    </div>
  );
}
