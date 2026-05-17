import type { Locale } from '@/i18n/config';

/** Plain string (legacy) or bilingual object from catalog JSON. */
export type LocalizedField = string | { en: string; es?: string };

export function pickLocalized(
  field: LocalizedField | undefined | null,
  locale: Locale | string
): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  const key = locale === 'es' ? 'es' : 'en';
  return field[key] ?? field.en ?? field.es ?? '';
}

export function localizeFields<T extends Record<string, unknown>>(
  record: T,
  locale: Locale | string,
  keys: (keyof T)[]
): T {
  const out = { ...record } as T;
  for (const key of keys) {
    const value = record[key];
    if (value != null && (typeof value === 'string' || isLocalizedObject(value))) {
      (out as Record<string, unknown>)[key as string] = pickLocalized(
        value as LocalizedField,
        locale
      );
    }
  }
  return out;
}

function isLocalizedObject(value: unknown): value is { en: string; es?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'en' in value &&
    typeof (value as { en: unknown }).en === 'string'
  );
}
