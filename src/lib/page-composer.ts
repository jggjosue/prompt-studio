/**
 * Lógica pura del generador de páginas por componentes.
 *
 * Aquí viven los límites, los pares seed->bloques y la sanitización que la API
 * y la página comparten, sin dependencias de Next para que sea testeable.
 */

export const PAGE_COMPOSER_KEYS = [
  'header',
  'sidebar',
  'hero',
  'card',
  'form',
  'button',
  'footer',
  'logoCloud',
  'stats',
  'features',
  'testimonial',
  'pricing',
  'faq',
  'newsletter',
] as const;

export type PageComposerKey = (typeof PAGE_COMPOSER_KEYS)[number];

export type PageComposerChoice = { id: string; title: string; prompt: string };

export type PageComposerBlock = {
  instanceId: string;
  key: PageComposerKey;
  choiceId: string;
  title: string;
  prompt: string;
  content?: Record<string, string>;
};

export type PageComposerSeedSlot = 'header' | 'sidebar' | 'card' | 'form' | 'button';

export type PageComposerSeed = {
  kit?: string | null;
  projectName?: string | null;
  brand?: string | null;
  description?: string | null;
  primary?: string | null;
  secondary?: string | null;
  background?: string | null;
  header?: string | null;
  sidebar?: string | null;
  card?: string | null;
  form?: string | null;
  button?: string | null;
};

export const PAGE_COMPOSER_LIMITS = {
  nameLength: 120,
  brandLength: 120,
  descriptionLength: 2000,
  colorLength: 40,
  choiceIdLength: 80,
  titleLength: 200,
  promptLength: 8000,
  contentKeyLength: 80,
  contentValueLength: 2000,
  maxContentFields: 30,
  maxBlocks: 200,
} as const;

/** Orden por defecto cuando la página se abre sin kit seleccionado. */
export const DEFAULT_ORDER: PageComposerKey[] = [
  'header',
  'hero',
  'logoCloud',
  'features',
  'card',
  'stats',
  'testimonial',
  'pricing',
  'form',
  'faq',
  'newsletter',
  'footer',
];

/**
 * Par de semilla->clave: qué campo del kit selecciona cada slot.
 * Las claves que vienen en el kit encajan con los catálogos del compositor.
 */
export const SEED_SLOTS: PageComposerSeedSlot[] = ['header', 'sidebar', 'card', 'form', 'button'];

function embedExtraSections(order: PageComposerKey[], seed: PageComposerSeed): PageComposerKey[] {
  const result = [...order];
  if (seed.sidebar && !result.includes('sidebar')) {
    const headerIndex = result.indexOf('header');
    result.splice(headerIndex + 1, 0, 'sidebar');
  }
  if (seed.button && !result.includes('button')) {
    const cardIndex = result.indexOf('card');
    const formIndex = result.indexOf('form');
    result.splice(cardIndex >= 0 ? cardIndex + 1 : formIndex, 0, 'button');
  }
  return result;
}

/**
 * Compone los bloques iniciales desde la semilla del kit seleccionado.
 *
 * Si el kit trae `sidebar` o `button`, se colocan en su posición natural sobre
 * la página tipo; el resto de slots usa el componente del kit cuando la semilla
 * lo trae, o el primer componente del catálogo cuando no (modo estático).
 */
export function composeBlocksFromSeed(
  seed: PageComposerSeed,
  options: Record<PageComposerKey, PageComposerChoice[]>,
  makeId: () => string
): PageComposerBlock[] {
  const order = embedExtraSections(DEFAULT_ORDER, seed);

  return order.map((key) => {
    const slot = SEED_SLOTS.find((candidate) => candidate === key);
    const choiceId = slot ? seed[slot] ?? null : null;
    const choice = choiceId
      ? options[key].find((option) => option.id === choiceId)
      : undefined;
    const fallback = options[key][0];
    const selected = choice ?? fallback;

    return {
      instanceId: makeId(),
      key,
      choiceId: selected.id,
      title: selected.title,
      prompt: selected.prompt,
    };
  });
}

export type SanitizedBlocks =
  | { blocks: PageComposerBlock[] }
  | { error: string };

/**
 * Sanitiza los bloques que llegan del cliente antes de persistirlos.
 * Recorta todo a los límites y rechaza estructuras desconocidas.
 */
export function sanitizeBlocks(raw: unknown): SanitizedBlocks {
  if (!Array.isArray(raw)) return { error: 'bloques inválidos' };
  if (raw.length > PAGE_COMPOSER_LIMITS.maxBlocks) {
    return { error: `demasiados bloques (${raw.length})` };
  }

  const blocks: PageComposerBlock[] = [];
  for (const rawBlock of raw) {
    if (!rawBlock || typeof rawBlock !== 'object') return { error: 'bloque inválido' };
    const candidate = rawBlock as Record<string, unknown>;

    const instanceId = candidate.instanceId;
    const key = candidate.key;
    const choiceId = candidate.choiceId;
    const title = candidate.title;
    const prompt = candidate.prompt;
    const content = candidate.content;

    if (typeof instanceId !== 'string' || instanceId.length > PAGE_COMPOSER_LIMITS.choiceIdLength) {
      return { error: 'bloque inválido' };
    }
    if (typeof key !== 'string' || !PAGE_COMPOSER_KEYS.includes(key as PageComposerKey)) {
      return { error: 'bloque inválido' };
    }
    if (typeof choiceId !== 'string' || choiceId.length > PAGE_COMPOSER_LIMITS.choiceIdLength) {
      return { error: 'bloque inválido' };
    }
    if (typeof title !== 'string' || title.length > PAGE_COMPOSER_LIMITS.titleLength) {
      return { error: 'bloque inválido' };
    }
    if (typeof prompt !== 'string' || prompt.length > PAGE_COMPOSER_LIMITS.promptLength) {
      return { error: 'bloque inválido' };
    }

    let cleanContent: Record<string, string> | undefined;
    if (content !== undefined && content !== null) {
      if (typeof content !== 'object' || Array.isArray(content)) {
        return { error: 'bloque inválido' };
      }
      const pairs = Object.entries(content as Record<string, unknown>);
      if (pairs.length > PAGE_COMPOSER_LIMITS.maxContentFields) {
        return { error: 'bloque inválido' };
      }
      cleanContent = {};
      for (const [contentKey, value] of pairs) {
        if (typeof contentKey !== 'string' || contentKey.length > PAGE_COMPOSER_LIMITS.contentKeyLength) {
          return { error: 'bloque inválido' };
        }
        if (typeof value !== 'string') return { error: 'bloque inválido' };
        cleanContent[contentKey] = value.slice(0, PAGE_COMPOSER_LIMITS.contentValueLength);
      }
    }

    blocks.push({
      instanceId,
      key: key as PageComposerKey,
      choiceId,
      title,
      prompt,
      ...(cleanContent ? { content: cleanContent } : {}),
    });
  }

  return { blocks };
}

export type SanitizedSettings =
  | {
      name: string;
      brand: string;
      description: string;
      primary: string;
      secondary: string;
      background: string;
    }
  | { error: string };

/** Sanitiza los ajustes globales del proyecto usando los mismos límites. */
export function sanitizeSettings(raw: Record<string, unknown>): SanitizedSettings {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const brand = typeof raw.brand === 'string' ? raw.brand.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const primary = typeof raw.primary === 'string' ? raw.primary.trim() : '';
  const secondary = typeof raw.secondary === 'string' ? raw.secondary.trim() : '';
  const background = typeof raw.background === 'string' ? raw.background.trim() : '';

  if (!name || name.length > PAGE_COMPOSER_LIMITS.nameLength) {
    return { error: 'nombre de proyecto inválido' };
  }
  if (brand.length > PAGE_COMPOSER_LIMITS.brandLength) {
    return { error: 'marca inválida' };
  }
  if (description.length > PAGE_COMPOSER_LIMITS.descriptionLength) {
    return { error: 'descripción inválida' };
  }
  for (const color of [primary, secondary, background]) {
    if (color.length > PAGE_COMPOSER_LIMITS.colorLength) return { error: 'color inválido' };
  }

  return { name, brand, description, primary, secondary, background };
}