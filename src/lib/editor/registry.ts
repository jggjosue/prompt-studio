/**
 * Registro de componentes del editor visual.
 *
 * Un único sitio donde se declara cada tipo: su etiqueta, categoría, valores por
 * defecto y —lo importante— **las reglas de anidamiento**. Añadir un componente
 * nuevo es añadir una entrada aquí; ni el lienzo, ni el árbol, ni el panel de
 * propiedades necesitan cambiar.
 *
 * Las reglas evitan que el usuario rompa el documento: un `button` dentro de un
 * `text` o una `row` dentro de un `input` no son estados que convenga permitir.
 */

export type EditorCategory =
  | 'basic'
  | 'layout'
  | 'form'
  | 'navigation'
  | 'content'
  | 'media'
  | 'advanced';

export type ComponentRules = {
  /** Si `false`, es una hoja: nunca acepta hijos. */
  canHaveChildren: boolean;
  /** Lista blanca de tipos admitidos. `undefined` = cualquiera. */
  allowedChildren?: string[];
  /** Lista blanca de padres admitidos. `undefined` = cualquiera. */
  allowedParents?: string[];
  /** Tope de hijos directos. `undefined` = sin tope. */
  maxChildren?: number;
};

export type ComponentDefinition = {
  type: string;
  label: string;
  category: EditorCategory;
  /** Nombre del icono de lucide; el render lo resuelve, el registro no importa React. */
  icon: string;
  /** Props iniciales al insertar. */
  defaultProps: Record<string, unknown>;
  /** Estilos iniciales del breakpoint base. */
  defaultStyles: Record<string, string | number>;
  rules: ComponentRules;
  /** Prop que se edita con doble clic en el lienzo. */
  inlineTextProp?: string;
  /** Palabras extra para la búsqueda difusa («cta» encuentra `button`). */
  keywords?: string[];
};

const LEAF: ComponentRules = { canHaveChildren: false };
const CONTAINER: ComponentRules = { canHaveChildren: true };

/** Contenedores: lo único que puede tener hijos por defecto. */
export const CONTAINER_TYPES = [
  'root',
  'section',
  'container',
  'row',
  'column',
  'grid',
  'flex',
  'stack',
  'form',
  'card',
  'navbar',
  'sidebar',
  'tabs',
  'modal',
  'list',
] as const;

function def(
  type: string,
  label: string,
  category: EditorCategory,
  icon: string,
  extra: Partial<ComponentDefinition> = {}
): ComponentDefinition {
  return {
    type,
    label,
    category,
    icon,
    defaultProps: {},
    defaultStyles: {},
    rules: (CONTAINER_TYPES as readonly string[]).includes(type) ? CONTAINER : LEAF,
    ...extra,
  };
}

const DEFINITIONS: ComponentDefinition[] = [
  // raíz: no se puede arrastrar ni borrar; solo acepta secciones y contenedores
  def('root', 'Página', 'layout', 'File', {
    rules: { canHaveChildren: true, allowedChildren: ['section', 'container', 'navbar', 'sidebar'] },
  }),

  // BASIC
  def('text', 'Texto', 'basic', 'Type', {
    defaultProps: { text: 'Escribe aquí tu texto.' },
    defaultStyles: { fontSize: '15px', lineHeight: '1.6', color: 'token:color.muted' },
    inlineTextProp: 'text',
    keywords: ['parrafo', 'paragraph', 'copy'],
  }),
  def('heading', 'Título', 'basic', 'Heading', {
    defaultProps: { text: 'Título de sección', level: 2 },
    defaultStyles: { fontSize: '32px', fontWeight: '800', color: 'token:color.ink' },
    inlineTextProp: 'text',
    keywords: ['h1', 'h2', 'titulo', 'title'],
  }),
  def('button', 'Botón', 'basic', 'MousePointerClick', {
    defaultProps: { label: 'Continuar', href: '', variant: 'primary' },
    defaultStyles: { paddingInline: '20px', paddingBlock: '12px', borderRadius: 'token:radius.md' },
    inlineTextProp: 'label',
    keywords: ['cta', 'accion', 'link'],
  }),
  def('link', 'Enlace', 'basic', 'Link', {
    defaultProps: { text: 'Conocer más', href: '' },
    defaultStyles: { color: 'token:color.primary', textDecoration: 'underline' },
    inlineTextProp: 'text',
    keywords: ['anchor', 'url', 'href'],
  }),
  def('image', 'Imagen', 'basic', 'Image', {
    defaultProps: { src: '', alt: '' },
    defaultStyles: { width: '100%', borderRadius: 'token:radius.md' },
    keywords: ['foto', 'picture', 'media'],
  }),
  def('icon', 'Icono', 'basic', 'Sparkles', { defaultProps: { name: 'sparkles', size: 24 } }),
  def('divider', 'Separador', 'basic', 'Minus', { defaultStyles: { height: '1px' } }),
  def('spacer', 'Espaciador', 'basic', 'MoveVertical', { defaultStyles: { height: '32px' } }),

  // LAYOUT
  def('section', 'Sección', 'layout', 'Rows3', {
    defaultStyles: { paddingBlock: 'token:spacing.xl', width: '100%' },
    rules: { canHaveChildren: true, allowedParents: ['root'] },
  }),
  def('container', 'Contenedor', 'layout', 'Square', {
    defaultStyles: { maxWidth: '1200px', marginInline: 'auto', paddingInline: 'token:spacing.md' },
  }),
  def('row', 'Fila', 'layout', 'Columns3', {
    defaultStyles: { display: 'flex', flexDirection: 'row', gap: 'token:spacing.md' },
    rules: { canHaveChildren: true, allowedChildren: ['column'] },
  }),
  def('column', 'Columna', 'layout', 'Columns2', {
    defaultStyles: { display: 'flex', flexDirection: 'column', flex: '1 1 0' },
    rules: { canHaveChildren: true, allowedParents: ['row', 'grid'] },
  }),
  def('grid', 'Grid', 'layout', 'Grid3x3', {
    defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'token:spacing.md' },
  }),
  def('flex', 'Flex', 'layout', 'StretchHorizontal', {
    defaultStyles: { display: 'flex', gap: 'token:spacing.sm', alignItems: 'center' },
  }),
  def('stack', 'Stack', 'layout', 'Layers', {
    defaultStyles: { display: 'flex', flexDirection: 'column', gap: 'token:spacing.sm' },
  }),

  // FORM
  def('form', 'Formulario', 'form', 'ClipboardList', {
    defaultProps: { action: '', method: 'post' },
    defaultStyles: { display: 'grid', gap: 'token:spacing.md' },
  }),
  def('login', 'Login', 'form', 'LogIn', {
    defaultProps: { title: 'Bienvenido de nuevo', emailLabel: 'Correo electrónico', passwordLabel: 'Contraseña', submitLabel: 'Iniciar sesión', helper: '¿Olvidaste tu contraseña?' },
    defaultStyles: { maxWidth: '420px', marginInline: 'auto', padding: '32px', borderRadius: 'token:radius.lg' },
    keywords: ['signin', 'sign in', 'acceso', 'sesion', 'authentication'],
  }),
  def('input', 'Campo', 'form', 'TextCursorInput', {
    defaultProps: { label: 'Correo electrónico', placeholder: 'user@example.com', required: false, inputType: 'email' },
    rules: { canHaveChildren: false, allowedParents: ['form', 'column', 'container', 'stack', 'card'] },
    inlineTextProp: 'placeholder',
  }),
  def('textarea', 'Área de texto', 'form', 'AlignLeft', {
    defaultProps: { label: 'Mensaje', placeholder: 'Cuéntanos…', rows: 4 },
    inlineTextProp: 'placeholder',
  }),
  def('select', 'Desplegable', 'form', 'ChevronsUpDown', {
    defaultProps: { label: 'Plan', options: ['Free', 'Premium'] },
  }),
  def('checkbox', 'Casilla', 'form', 'CheckSquare', { defaultProps: { label: 'Acepto los términos' }, inlineTextProp: 'label' }),
  def('radio', 'Radio', 'form', 'CircleDot', { defaultProps: { label: 'Opción', options: ['A', 'B'] } }),
  def('switch', 'Interruptor', 'form', 'ToggleLeft', { defaultProps: { label: 'Activar' }, inlineTextProp: 'label' }),
  def('submitButton', 'Enviar formulario', 'form', 'Send', {
    defaultProps: { label: 'Enviar' },
    defaultStyles: { paddingInline: '20px', paddingBlock: '12px', borderRadius: 'token:radius.md' },
    inlineTextProp: 'label',
    keywords: ['submit', 'enviar', 'cta'],
  }),

  // NAVIGATION
  def('navbar', 'Navbar', 'navigation', 'Menu', {
    defaultStyles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  }),
  def('sidebar', 'Sidebar', 'navigation', 'PanelLeft', {
    defaultStyles: { display: 'flex', flexDirection: 'column', width: '260px' },
  }),
  def('tabs', 'Pestañas', 'navigation', 'AppWindow', { defaultProps: { tabs: ['Uno', 'Dos'] } }),
  def('breadcrumbs', 'Migas', 'navigation', 'ChevronRight', { defaultProps: { items: ['Inicio', 'Sección'] } }),

  // CONTENT
  def('card', 'Card', 'content', 'CreditCard', {
    defaultStyles: { padding: 'token:spacing.md', borderRadius: 'token:radius.lg', display: 'grid', gap: 'token:spacing.sm' },
  }),
  def('badge', 'Etiqueta', 'content', 'Tag', {
    defaultProps: { text: 'Nuevo' },
    defaultStyles: { display: 'inline-flex', paddingInline: '10px', paddingBlock: '4px', borderRadius: '999px', background: 'token:color.primary', color: '#fff' },
    inlineTextProp: 'text',
  }),
  def('avatar', 'Avatar', 'content', 'CircleUserRound', {
    defaultProps: { src: '', alt: 'Avatar', initials: 'PS' },
    defaultStyles: { width: '48px', height: '48px', borderRadius: '999px' },
  }),
  def('list', 'Lista', 'content', 'List', { defaultProps: { items: ['Primero', 'Segundo'] } }),
  def('table', 'Tabla', 'content', 'Table', { defaultProps: { columns: ['Plan', 'Precio'], rows: [['Free', '$0']] } }),
  def('accordion', 'Acordeón', 'content', 'ChevronDown', { defaultProps: { items: [{ title: 'Pregunta', body: 'Respuesta' }] } }),
  def('carousel', 'Carrusel', 'content', 'GalleryHorizontal', { defaultProps: { slides: 3 } }),
  def('modal', 'Modal', 'content', 'SquareStack', { defaultProps: { title: 'Título' } }),
  def('tooltip', 'Tooltip', 'content', 'MessageSquare', { defaultProps: { text: 'Ayuda' }, inlineTextProp: 'text' }),

  // MEDIA
  def('video', 'Vídeo', 'media', 'Video', { defaultProps: { src: '', poster: '' } }),
  def('audio', 'Audio', 'media', 'AudioLines', { defaultProps: { src: '' } }),
  def('gallery', 'Galería', 'media', 'Images', { defaultProps: { images: [] } }),

  // ADVANCED
  def('chart', 'Gráfico', 'advanced', 'BarChart3', { defaultProps: { kind: 'bar', data: [] } }),
  def('code', 'Bloque de código', 'advanced', 'Code2', { defaultProps: { language: 'tsx', code: '' } }),
  def('embed', 'Embed', 'advanced', 'Braces', { defaultProps: { html: '' } }),
  def('html', 'HTML seguro', 'advanced', 'FileCode2', { defaultProps: { html: '' }, keywords: ['custom', 'markup'] }),
  def('apiData', 'Datos de API', 'advanced', 'Database', { defaultProps: { url: '', path: '' } }),
  def('dynamic', 'Componente dinámico', 'advanced', 'Wand2', { defaultProps: { source: '' } }),
];

const BY_TYPE = new Map(DEFINITIONS.map(d => [d.type, d]));

/** Registra o sustituye una definición. Pensado para plugins. */
export function registerComponent(definition: ComponentDefinition): void {
  BY_TYPE.set(definition.type, definition);
}

export function getDefinition(type: string): ComponentDefinition | undefined {
  return BY_TYPE.get(type);
}

export function allDefinitions(): ComponentDefinition[] {
  return [...BY_TYPE.values()];
}

export function definitionsByCategory(): Array<{ category: EditorCategory; items: ComponentDefinition[] }> {
  const order: EditorCategory[] = ['basic', 'layout', 'form', 'navigation', 'content', 'media', 'advanced'];
  return order.map(category => ({
    category,
    items: allDefinitions().filter(d => d.category === category && d.type !== 'root'),
  }));
}

/**
 * Búsqueda difusa por etiqueta, tipo y palabras clave: «btn» encuentra `button`
 * sin necesitar el nombre exacto.
 */
export function searchDefinitions(query: string): ComponentDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return allDefinitions().filter(d => d.type !== 'root');
  const matches = (text: string) => {
    const haystack = text.toLowerCase();
    if (haystack.includes(q)) return true;
    let index = 0;
    for (const char of q) {
      index = haystack.indexOf(char, index);
      if (index === -1) return false;
      index += 1;
    }
    return true;
  };
  return allDefinitions().filter(
    d =>
      d.type !== 'root' &&
      (matches(d.label) || matches(d.type) || (d.keywords ?? []).some(matches))
  );
}

export type DropRejection =
  | 'unknown-type'
  | 'leaf-parent'
  | 'child-not-allowed'
  | 'parent-not-allowed'
  | 'max-children'
  | 'cycle';

/** `null` si el movimiento es válido; el motivo si no. Lo usa el lienzo para pintar el rechazo. */
export function validateChild(
  parentType: string,
  childType: string,
  currentChildCount: number
): DropRejection | null {
  const parent = getDefinition(parentType);
  const child = getDefinition(childType);
  if (!parent || !child) return 'unknown-type';
  if (!parent.rules.canHaveChildren) return 'leaf-parent';
  if (parent.rules.allowedChildren && !parent.rules.allowedChildren.includes(childType)) {
    return 'child-not-allowed';
  }
  if (child.rules.allowedParents && !child.rules.allowedParents.includes(parentType)) {
    return 'parent-not-allowed';
  }
  if (parent.rules.maxChildren !== undefined && currentChildCount >= parent.rules.maxChildren) {
    return 'max-children';
  }
  return null;
}
