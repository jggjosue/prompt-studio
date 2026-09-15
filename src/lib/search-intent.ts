export type SearchIntentFacet = {
  dimension: 'tipo' | 'industria' | 'estilo' | 'objetivo' | 'framework' | 'color' | 'mercado' | 'presupuesto';
  value: string;
  label: string;
  aliases: string[];
};

const DEFINITIONS: SearchIntentFacet[] = [
  { dimension: 'tipo', value: 'landing', label: 'Landing page', aliases: ['landing', 'pagina web', 'sitio web', 'website'] },
  { dimension: 'tipo', value: 'form', label: 'Formulario', aliases: ['formulario', 'form', 'encuesta', 'solicitud'] },
  { dimension: 'tipo', value: 'login', label: 'Login', aliases: ['login', 'acceso', 'registro', 'sign in'] },
  { dimension: 'tipo', value: 'header', label: 'Header', aliases: ['header', 'encabezado', 'cabecera'] },
  { dimension: 'tipo', value: 'card', label: 'Cards', aliases: ['card', 'tarjeta'] },
  { dimension: 'tipo', value: 'button', label: 'Botón', aliases: ['boton', 'button', 'cta'] },
  { dimension: 'tipo', value: 'navigation', label: 'Navegación', aliases: ['menu', 'navegacion', 'navbar'] },
  { dimension: 'tipo', value: 'sidebar', label: 'Sidebar', aliases: ['sidebar', 'barra lateral'] },
  { dimension: 'tipo', value: 'text', label: 'Texto', aliases: ['texto', 'tipografia', 'headline', 'titulo', 'hero'] },
  { dimension: 'industria', value: 'real-estate', label: 'Bienes raíces', aliases: ['inmobiliaria', 'bienes raices', 'propiedad', 'propiedades', 'departamento', 'departamentos', 'real estate'] },
  { dimension: 'industria', value: 'health', label: 'Salud', aliases: ['medico', 'medical', 'salud', 'clinica', 'hospital', 'doctor', 'dental'] },
  { dimension: 'industria', value: 'commerce', label: 'E-commerce', aliases: ['tienda', 'ecommerce', 'e-commerce', 'marketplace', 'amazon', 'producto'] },
  { dimension: 'industria', value: 'finance', label: 'Finanzas', aliases: ['finanzas', 'fintech', 'banco', 'inversion'] },
  { dimension: 'industria', value: 'restaurant', label: 'Restaurantes', aliases: ['restaurante', 'comida', 'reservar mesa'] },
  { dimension: 'industria', value: 'saas', label: 'SaaS', aliases: ['saas', 'software', 'startup', 'dashboard'] },
  { dimension: 'industria', value: 'fashion', label: 'Moda', aliases: ['moda', 'fashion', 'ropa', 'joyeria', 'cosmeticos'] },
  { dimension: 'industria', value: 'education', label: 'Educación', aliases: ['educacion', 'curso', 'escuela', 'academia'] },
  { dimension: 'estilo', value: 'elegant', label: 'Elegante', aliases: ['elegante', 'lujo', 'lujoso', 'sofisticado', 'refinado'] },
  { dimension: 'estilo', value: 'minimal', label: 'Minimalista', aliases: ['minimalista', 'minimal', 'limpio'] },
  { dimension: 'estilo', value: 'modern', label: 'Moderno', aliases: ['moderno', 'modern', 'contemporaneo'] },
  { dimension: 'estilo', value: 'futuristic', label: 'Futurista', aliases: ['futurista', 'futuristic', 'cyberpunk', 'neon'] },
  { dimension: 'estilo', value: 'editorial', label: 'Editorial', aliases: ['editorial', 'revista', 'magazine'] },
  { dimension: 'objetivo', value: 'sell', label: 'Vender', aliases: ['vender', 'venta', 'ventas', 'comprar', 'conversion', 'checkout'] },
  { dimension: 'objetivo', value: 'leads', label: 'Captar leads', aliases: ['lead', 'leads', 'contactos', 'cotizacion', 'solicitar informacion'] },
  { dimension: 'objetivo', value: 'booking', label: 'Reservar', aliases: ['reservar', 'reserva', 'cita', 'booking', 'agenda'] },
  { dimension: 'objetivo', value: 'signup', label: 'Crear cuenta', aliases: ['crear cuenta', 'registro', 'registrarse', 'signup'] },
  { dimension: 'objetivo', value: 'download', label: 'Descargar', aliases: ['descargar', 'download', 'instalar app'] },
  { dimension: 'framework', value: 'next', label: 'Next.js', aliases: ['next', 'nextjs', 'next.js'] },
  { dimension: 'framework', value: 'react', label: 'React', aliases: ['react'] },
  { dimension: 'framework', value: 'html', label: 'HTML', aliases: ['html'] },
  { dimension: 'framework', value: 'vue', label: 'Vue', aliases: ['vue'] },
  { dimension: 'framework', value: 'tailwind', label: 'Tailwind', aliases: ['tailwind'] },
  { dimension: 'color', value: 'dark', label: 'Oscuro', aliases: ['oscuro', 'dark', 'negro'] },
  { dimension: 'color', value: 'light', label: 'Claro', aliases: ['claro', 'light', 'blanco'] },
  { dimension: 'color', value: 'blue', label: 'Azul', aliases: ['azul', 'blue'] },
  { dimension: 'color', value: 'green', label: 'Verde', aliases: ['verde', 'green', 'menta'] },
  { dimension: 'color', value: 'purple', label: 'Morado', aliases: ['morado', 'violeta', 'purple', 'lavanda'] },
  { dimension: 'color', value: 'red', label: 'Rojo', aliases: ['rojo', 'red'] },
  { dimension: 'color', value: 'orange', label: 'Naranja', aliases: ['naranja', 'orange', 'ambar'] },
  { dimension: 'color', value: 'pink', label: 'Rosa', aliases: ['rosa', 'pink'] },
  { dimension: 'mercado', value: 'mexico', label: 'México', aliases: ['mexico', 'mexicano', 'mexicana', 'mxn', 'pesos mexicanos'] },
  { dimension: 'mercado', value: 'latam', label: 'Latinoamérica', aliases: ['latam', 'latinoamerica', 'america latina'] },
  { dimension: 'mercado', value: 'spain', label: 'España', aliases: ['espana', 'español de españa', 'euros'] },
];

export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9#+.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

const STOP_WORDS = new Set(['para', 'como', 'quiero', 'necesito', 'busco', 'una', 'uno', 'unos', 'unas', 'con', 'por', 'que', 'del', 'las', 'los', 'the', 'for', 'with', 'and']);

export function getSearchKeywords(query: string): string[] {
  return normalizeSearchText(query).split(' ').filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export function extractSearchIntent(query: string): SearchIntentFacet[] {
  const normalized = normalizeSearchText(query);
  const detected = DEFINITIONS.filter(facet => facet.aliases.some(alias => normalized.includes(normalizeSearchText(alias))));
  const budget = normalized.match(/(?:hasta|maximo|menos de|presupuesto(?: de)?|por)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (budget?.[1]) {
    detected.push({ dimension: 'presupuesto', value: budget[1], label: `Hasta $${budget[1]}`, aliases: [] });
  }
  return detected.filter((facet, index, all) => all.findIndex(item => item.dimension === facet.dimension && item.value === facet.value) === index);
}

export function scoreIntentText(text: string, intent: SearchIntentFacet[]): { score: number; reasons: string[] } {
  const normalized = normalizeSearchText(text);
  let score = 0;
  const reasons: string[] = [];
  for (const facet of intent) {
    if (facet.dimension === 'presupuesto') continue;
    if (facet.aliases.some(alias => normalized.includes(normalizeSearchText(alias))) || normalized.includes(facet.value)) {
      score += facet.dimension === 'objetivo' || facet.dimension === 'industria' ? 20 : 12;
      reasons.push(facet.label);
    }
  }
  return { score, reasons };
}
