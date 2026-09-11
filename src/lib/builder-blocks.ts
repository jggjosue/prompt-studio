/**
 * Composición por bloques del constructor visual.
 *
 * El constructor tenía una plantilla fija por tipo de componente: se podían
 * cambiar colores y textos, pero no la estructura. Aquí vive el modelo que
 * permite componer arrastrando: qué bloques admite cada tipo, cuál es la
 * composición de partida y cómo se reordena.
 *
 * Todo son funciones puras y sin dependencias. Los ids se generan con una
 * factoría inyectable para que las pruebas no dependan del azar.
 */

export type BuilderBlockKind =
  | 'media'
  | 'badge'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'divider'
  | 'meta'
  | 'price'
  | 'rating'
  | 'avatar'
  | 'field'
  | 'checkbox'
  | 'primaryCta'
  | 'secondaryCta'
  | 'socialRow'
  | 'navLinks'
  | 'search'
  | 'menuItem'
  | 'footnote'
  | 'feature'
  | 'stat'
  | 'logoCloud'
  | 'testimonial'
  | 'faq'
  | 'progress'
  | 'footerLinks';

export type BuilderBlock = {
  id: string;
  kind: BuilderBlockKind;
  /** Texto editable. Los bloques sin texto (media, divider) lo dejan vacío. */
  text: string;
  /** Oculto en el lienzo, pero conservado en la composición. */
  hidden?: boolean;
};

/** Tipos de componente del catálogo que admiten composición. */
export type BuilderComponentType =
  | 'login'
  | 'header'
  | 'text'
  | 'form'
  | 'button'
  | 'card'
  | 'navigation'
  | 'sidebar';

type BlockSpec = {
  label: { es: string; en: string };
  defaultText: { es: string; en: string };
  /** Cuántas veces puede repetirse en una composición. */
  max: number;
  /** Se dibuja a lo ancho completo del lienzo. */
  block?: boolean;
};

export const BLOCK_SPECS: Record<BuilderBlockKind, BlockSpec> = {
  media: { label: { es: 'Imagen', en: 'Media' }, defaultText: { es: '', en: '' }, max: 2, block: true },
  badge: { label: { es: 'Etiqueta', en: 'Badge' }, defaultText: { es: 'Nuevo', en: 'New' }, max: 3 },
  title: { label: { es: 'Título', en: 'Title' }, defaultText: { es: 'Título del componente', en: 'Component title' }, max: 2, block: true },
  subtitle: { label: { es: 'Subtítulo', en: 'Subtitle' }, defaultText: { es: 'Una línea de apoyo', en: 'A supporting line' }, max: 2, block: true },
  body: { label: { es: 'Párrafo', en: 'Body' }, defaultText: { es: 'Describe el valor en una o dos frases cortas.', en: 'Describe the value in one or two short sentences.' }, max: 3, block: true },
  divider: { label: { es: 'Separador', en: 'Divider' }, defaultText: { es: '', en: '' }, max: 4, block: true },
  meta: { label: { es: 'Metadatos', en: 'Meta' }, defaultText: { es: 'Actualizado hoy · 4 min', en: 'Updated today · 4 min' }, max: 2 },
  price: { label: { es: 'Precio', en: 'Price' }, defaultText: { es: '$29 /mes', en: '$29 /mo' }, max: 2 },
  rating: { label: { es: 'Valoración', en: 'Rating' }, defaultText: { es: '4,9 · 212 reseñas', en: '4.9 · 212 reviews' }, max: 1 },
  avatar: { label: { es: 'Avatar', en: 'Avatar' }, defaultText: { es: 'Ana Ruiz', en: 'Ann Ruiz' }, max: 2 },
  field: { label: { es: 'Campo', en: 'Field' }, defaultText: { es: 'Correo electrónico', en: 'Email address' }, max: 6, block: true },
  checkbox: { label: { es: 'Casilla', en: 'Checkbox' }, defaultText: { es: 'Acepto los términos', en: 'I accept the terms' }, max: 3, block: true },
  primaryCta: { label: { es: 'Botón principal', en: 'Primary CTA' }, defaultText: { es: 'Continuar', en: 'Continue' }, max: 2 },
  secondaryCta: { label: { es: 'Botón secundario', en: 'Secondary CTA' }, defaultText: { es: 'Cancelar', en: 'Cancel' }, max: 2 },
  socialRow: { label: { es: 'Accesos sociales', en: 'Social row' }, defaultText: { es: 'Google · GitHub · Apple', en: 'Google · GitHub · Apple' }, max: 1, block: true },
  navLinks: { label: { es: 'Enlaces', en: 'Nav links' }, defaultText: { es: 'Producto · Precios · Docs', en: 'Product · Pricing · Docs' }, max: 2, block: true },
  search: { label: { es: 'Buscador', en: 'Search' }, defaultText: { es: 'Buscar…', en: 'Search…' }, max: 1, block: true },
  menuItem: { label: { es: 'Elemento de menú', en: 'Menu item' }, defaultText: { es: 'Panel', en: 'Dashboard' }, max: 8, block: true },
  footnote: { label: { es: 'Nota al pie', en: 'Footnote' }, defaultText: { es: 'Sin tarjeta. Cancela cuando quieras.', en: 'No card required. Cancel anytime.' }, max: 2, block: true },
  feature: { label: { es: 'Beneficio', en: 'Feature' }, defaultText: { es: 'Automatiza el trabajo repetitivo', en: 'Automate repetitive work' }, max: 6, block: true },
  stat: { label: { es: 'Métrica', en: 'Stat' }, defaultText: { es: '98% · satisfacción', en: '98% · satisfaction' }, max: 4 },
  logoCloud: { label: { es: 'Logos de confianza', en: 'Trust logos' }, defaultText: { es: 'Acme · Vertex · Nova', en: 'Acme · Vertex · Nova' }, max: 2, block: true },
  testimonial: { label: { es: 'Testimonio', en: 'Testimonial' }, defaultText: { es: '“El equipo lanzó en días, no semanas.”', en: '“Our team launched in days, not weeks.”' }, max: 3, block: true },
  faq: { label: { es: 'Pregunta frecuente', en: 'FAQ' }, defaultText: { es: '¿Puedo cancelar cuando quiera?', en: 'Can I cancel anytime?' }, max: 6, block: true },
  progress: { label: { es: 'Progreso', en: 'Progress' }, defaultText: { es: 'Configuración · 75%', en: 'Setup · 75%' }, max: 3, block: true },
  footerLinks: { label: { es: 'Enlaces de footer', en: 'Footer links' }, defaultText: { es: 'Privacidad · Términos · Contacto', en: 'Privacy · Terms · Contact' }, max: 2, block: true },
};

/** Bloques que ofrece la paleta para cada tipo, en orden de utilidad. */
export const PALETTE_BY_TYPE: Record<BuilderComponentType, BuilderBlockKind[]> = {
  login: ['title', 'subtitle', 'field', 'checkbox', 'primaryCta', 'secondaryCta', 'socialRow', 'divider', 'footnote', 'badge'],
  header: ['badge', 'title', 'subtitle', 'navLinks', 'search', 'logoCloud', 'primaryCta', 'secondaryCta', 'avatar', 'divider'],
  text: ['badge', 'title', 'subtitle', 'body', 'meta', 'stat', 'testimonial', 'faq', 'divider', 'footnote'],
  form: ['title', 'subtitle', 'field', 'checkbox', 'primaryCta', 'secondaryCta', 'progress', 'divider', 'footnote'],
  button: ['primaryCta', 'secondaryCta', 'badge', 'footnote'],
  card: ['media', 'badge', 'title', 'subtitle', 'body', 'price', 'rating', 'meta', 'avatar', 'feature', 'testimonial', 'divider', 'primaryCta', 'secondaryCta'],
  navigation: ['navLinks', 'search', 'menuItem', 'stat', 'primaryCta', 'avatar', 'divider', 'badge'],
  sidebar: ['avatar', 'search', 'menuItem', 'progress', 'divider', 'badge', 'primaryCta', 'footnote'],
};

const DEFAULT_BY_TYPE: Record<BuilderComponentType, BuilderBlockKind[]> = {
  login: ['title', 'subtitle', 'field', 'field', 'primaryCta', 'divider', 'socialRow', 'footnote'],
  header: ['badge', 'title', 'navLinks', 'primaryCta'],
  text: ['badge', 'title', 'body', 'meta'],
  form: ['title', 'field', 'field', 'checkbox', 'primaryCta'],
  button: ['primaryCta', 'secondaryCta', 'footnote'],
  card: ['media', 'badge', 'title', 'body', 'price', 'primaryCta'],
  navigation: ['navLinks', 'search', 'primaryCta'],
  sidebar: ['avatar', 'menuItem', 'menuItem', 'menuItem', 'divider', 'footnote'],
};

export type IdFactory = (kind: BuilderBlockKind, index: number) => string;

/** Ids estables y legibles: `card-title-3`. Determinista a propósito. */
export function sequentialIds(prefix: string): IdFactory {
  let n = 0;
  return (kind) => `${prefix}-${kind}-${++n}`;
}

export function blockLabel(kind: BuilderBlockKind, locale: string): string {
  return BLOCK_SPECS[kind].label[locale.startsWith('es') ? 'es' : 'en'];
}

export function blockDefaultText(kind: BuilderBlockKind, locale: string): string {
  return BLOCK_SPECS[kind].defaultText[locale.startsWith('es') ? 'es' : 'en'];
}

export function defaultComposition(
  type: BuilderComponentType,
  locale = 'es',
  makeId: IdFactory = sequentialIds(type)
): BuilderBlock[] {
  return DEFAULT_BY_TYPE[type].map((kind, index) => ({
    id: makeId(kind, index),
    kind,
    text: blockDefaultText(kind, locale),
  }));
}

/** Cuántos bloques de ese tipo caben todavía. */
export function remainingSlots(blocks: BuilderBlock[], kind: BuilderBlockKind): number {
  const used = blocks.filter(b => b.kind === kind).length;
  return Math.max(0, BLOCK_SPECS[kind].max - used);
}

export function canAddBlock(blocks: BuilderBlock[], kind: BuilderBlockKind): boolean {
  return remainingSlots(blocks, kind) > 0;
}

/**
 * Mueve un bloque a otra posición.
 *
 * Índices fuera de rango devuelven la lista intacta en vez de lanzar: el evento
 * `drop` puede llegar con un índice viejo si la lista cambió durante el arrastre.
 */
export function moveBlock(blocks: BuilderBlock[], from: number, to: number): BuilderBlock[] {
  if (from === to) return blocks;
  if (from < 0 || from >= blocks.length) return blocks;
  const target = Math.min(Math.max(to, 0), blocks.length - 1);
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

export function insertBlockAt(
  blocks: BuilderBlock[],
  kind: BuilderBlockKind,
  index: number,
  locale = 'es',
  makeId: IdFactory = sequentialIds('block')
): BuilderBlock[] {
  if (!canAddBlock(blocks, kind)) return blocks;
  const at = Math.min(Math.max(index, 0), blocks.length);
  const next = [...blocks];
  next.splice(at, 0, { id: makeId(kind, at), kind, text: blockDefaultText(kind, locale) });
  return next;
}

export function removeBlock(blocks: BuilderBlock[], id: string): BuilderBlock[] {
  return blocks.filter(b => b.id !== id);
}

export function duplicateBlock(
  blocks: BuilderBlock[],
  id: string,
  makeId: IdFactory = sequentialIds('copy')
): BuilderBlock[] {
  const index = blocks.findIndex(b => b.id === id);
  if (index === -1) return blocks;
  const source = blocks[index];
  if (!canAddBlock(blocks, source.kind)) return blocks;
  const next = [...blocks];
  next.splice(index + 1, 0, { ...source, id: makeId(source.kind, index + 1) });
  return next;
}

export function toggleBlockHidden(blocks: BuilderBlock[], id: string): BuilderBlock[] {
  return blocks.map(b => (b.id === id ? { ...b, hidden: !b.hidden } : b));
}

export function updateBlockText(blocks: BuilderBlock[], id: string, text: string): BuilderBlock[] {
  return blocks.map(b => (b.id === id ? { ...b, text } : b));
}

/**
 * Descripción de la composición para el prompt.
 *
 * Es lo que convierte el arrastrar y soltar en algo útil: sin esto, el prompt
 * seguiría describiendo la plantilla genérica y no lo que el usuario montó.
 */
export function describeComposition(blocks: BuilderBlock[], locale = 'es'): string {
  const es = locale.startsWith('es');
  const visibles = blocks.filter(b => !b.hidden);
  if (visibles.length === 0) {
    return es ? 'Sin bloques visibles.' : 'No visible blocks.';
  }
  const lineas = visibles.map((b, i) => {
    const label = blockLabel(b.kind, locale);
    const text = b.text.trim();
    return text ? `${i + 1}. ${label}: "${text}"` : `${i + 1}. ${label}`;
  });
  const cabecera = es
    ? `Estructura, de arriba abajo (${visibles.length} bloques):`
    : `Structure, top to bottom (${visibles.length} blocks):`;
  return [cabecera, ...lineas].join('\n');
}
