/**
 * Configuración y validación de campos de formularios nativos.
 *
 * Módulo puro compartido entre el componente (cliente) y la API de envío
 * (servidor): ambos usan la misma definición de campos y las mismas reglas de
 * validación, de modo que lo que el editor configura es exactamente lo que el
 * servidor exige.
 */

export type FormFieldType = 'text' | 'email' | 'textarea' | 'tel';
export type FormVariant = 'contact' | 'newsletter' | 'lead' | 'waitlist' | 'custom';

export const FORM_VARIANTS: readonly FormVariant[] = ['contact', 'newsletter', 'lead', 'waitlist', 'custom'];

export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  consent: boolean;
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

function labelize(name: string): string {
  return name.length ? name[0].toUpperCase() + name.slice(1) : name;
}

/** Parsea la lista de campos de un formulario de forma tolerante. */
export function parseFormFields(raw: unknown): FormFieldConfig[] {
  if (!Array.isArray(raw)) return [];
  const out: FormFieldConfig[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.name !== 'string' || !record.name.trim()) continue;
    const type = record.type === 'email' || record.type === 'textarea' || record.type === 'tel' ? record.type : 'text';
    out.push({
      name: record.name.trim(),
      label: typeof record.label === 'string' && record.label.trim() ? record.label.trim() : labelize(record.name),
      type,
      required: record.required === true,
      consent: record.consent === true,
    });
  }
  return out;
}

/** Campos por defecto según la variante del formulario. */
export function defaultFormFields(variant: FormVariant): FormFieldConfig[] {
  const field = (name: string, type: FormFieldType, required: boolean): FormFieldConfig => ({
    name,
    label: labelize(name),
    type,
    required,
    consent: false,
  });
  switch (variant) {
    case 'newsletter':
      return [field('email', 'email', true)];
    case 'waitlist':
      return [field('name', 'text', true), field('email', 'email', true)];
    case 'lead':
      return [field('name', 'text', true), field('email', 'email', true), field('message', 'textarea', false)];
    case 'custom':
      return [];
    case 'contact':
    default:
      return [field('name', 'text', true), field('email', 'email', true), field('message', 'textarea', false)];
  }
}

/**
 * Valida un envío contra la configuración de campos.
 * Devuelve la lista de errores (vacía si el envío es válido).
 */
export function validateSubmission(
  fields: readonly FormFieldConfig[],
  values: Record<string, unknown>,
  consentRequired: boolean,
  consent: boolean
): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    const raw = values[field.name];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (field.required && !value) {
      errors.push(`El campo "${field.label}" es obligatorio.`);
      continue;
    }
    if (value && field.type === 'email' && !isValidEmail(value)) {
      errors.push(`"${field.label}" no es un email válido.`);
    }
  }
  if (consentRequired && consent !== true) {
    errors.push('Debes aceptar la política de privacidad.');
  }
  return errors;
}