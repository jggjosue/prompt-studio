/**
 * Cribado automático de reseñas antes de publicarlas.
 *
 * Módulo puro y sin dependencias: lo usan la ruta de API y los tests, y podría
 * usarlo un panel de moderación. No pretende decidir si una reseña es justa
 * —una crítica dura es legítima y debe publicarse— sino apartar lo que no es
 * una reseña: spam con enlaces, datos de contacto y texto degenerado.
 *
 * El criterio es deliberadamente conservador en una sola dirección: ante la
 * duda se manda a revisión manual, nunca se rechaza en silencio. Una reseña
 * retenida se puede publicar después; una borrada se pierde.
 */

export type ReviewScreening = {
  /** `published` se muestra ya; `pending` espera revisión humana. */
  status: 'published' | 'pending';
  /** Motivos por los que se retuvo, para que el moderador no relea a ciegas. */
  reasons: string[];
};

/** Detecta URLs, incluidas las escritas sin protocolo para esquivar filtros. */
const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|es|mx|ru|xyz|top|shop|info|biz|link)\b)/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+/;
/** Teléfonos y handles de mensajería: el patrón habitual del spam de servicios. */
const CONTACT_PATTERN = /(\+?\d[\d\s().-]{7,}\d)|\b(whatsapp|telegram|wa\.me|t\.me)\b/i;

export const REVIEW_COMMENT_MAX = 1500;
export const REVIEW_COMMENT_MIN = 15;

/**
 * Criba el texto de una reseña.
 *
 * Devuelve siempre un resultado: la decisión de rechazar de plano por longitud
 * corresponde a la validación de la ruta, no a la moderación.
 */
export function screenReviewText(comment: string): ReviewScreening {
  const reasons: string[] = [];
  const text = comment.trim();

  if (URL_PATTERN.test(text)) reasons.push('contiene enlaces');
  if (EMAIL_PATTERN.test(text)) reasons.push('contiene una dirección de correo');
  if (CONTACT_PATTERN.test(text)) reasons.push('contiene datos de contacto');

  const letters = text.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '');
  if (letters.length >= 20) {
    const upper = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').length;
    if (upper / letters.length > 0.6) reasons.push('escrito casi todo en mayúsculas');
  }

  // Un mismo carácter repetido muchas veces suele ser relleno para alcanzar el
  // mínimo de longitud.
  if (/(.)\1{9,}/.test(text)) reasons.push('carácter repetido en exceso');

  // Muy pocas palabras distintas sobre un texto largo: relleno copiado.
  const words = text.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  if (words.length >= 20 && new Set(words).size / words.length < 0.3) {
    reasons.push('texto repetitivo');
  }

  return { status: reasons.length ? 'pending' : 'published', reasons };
}

/** Normaliza el texto que llega del cliente antes de guardarlo. */
export function normalizeReviewComment(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, REVIEW_COMMENT_MAX);
}

export function isValidRating(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Nombre público del reseñador: nombre de pila más inicial del apellido.
 *
 * Nunca se expone el correo ni el apellido completo. Si no hay nombre, se usa
 * un genérico antes que el identificador de la cuenta, que es un dato interno.
 */
export function buildAuthorName(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName ?? '').trim();
  const initial = (lastName ?? '').trim().charAt(0);
  if (!first) return 'Cliente verificado';
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}
