import type { Locale } from '@/i18n/config';

type RichLocalizedValue = Record<string, unknown>;

/** Plain string (legacy) or bilingual object from catalog JSON. */
export type LocalizedField =
  | string
  | RichLocalizedValue
  | {
      en: string | RichLocalizedValue;
      es?: string | RichLocalizedValue;
    };

function localizedValueToString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);

  const record = value as RichLocalizedValue;
  if (typeof record.prompt === 'string') return record.prompt;

  return JSON.stringify(record, null, 2);
}

export function pickLocalized(
  field: LocalizedField | undefined | null,
  locale: Locale | string
): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  const key = locale === 'es' ? 'es' : 'en';
  const value = field[key] ?? field.en ?? field.es ?? field;

  return localizedValueToString(value);
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

function isLocalizedObject(
  value: unknown
): value is { en: string | RichLocalizedValue; es?: string | RichLocalizedValue } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'en' in value &&
    ['string', 'object'].includes(typeof (value as { en: unknown }).en)
  );
}
