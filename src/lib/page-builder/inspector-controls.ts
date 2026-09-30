import type { StyleProperty, StyleValue, ThemeTokens } from '@/lib/page-builder/schema';
import { isSafeStyleValue, resolveThemeToken } from '@/lib/page-builder/styles';

export type InspectorControlKind = 'text' | 'number' | 'select' | 'color';
export type InspectorControlGroup = 'layout' | 'spacing' | 'typography' | 'appearance';

export type StyleControlDefinition = {
  label: string;
  control: InspectorControlKind;
  group: InspectorControlGroup;
  placeholder?: string;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
  tokenGroups?: readonly (keyof ThemeTokens)[];
};

const length = (label: string, group: InspectorControlGroup = 'layout'): StyleControlDefinition => ({
  label,
  group,
  control: 'text',
  placeholder: 'auto, 24px, 2rem, 100%…',
  tokenGroups: group === 'spacing' ? ['spacing'] : undefined,
});

const STYLE_CONTROLS: Partial<Record<StyleProperty, StyleControlDefinition>> = {
  display: { label: 'Display', group: 'layout', control: 'select', options: ['block', 'flex', 'grid', 'inline', 'inline-block', 'none'] },
  width: length('Ancho'), height: length('Alto'), maxWidth: length('Ancho máximo'), minHeight: length('Alto mínimo'),
  padding: length('Padding', 'spacing'), paddingBlock: length('Padding vertical', 'spacing'), paddingInline: length('Padding horizontal', 'spacing'),
  margin: length('Margen', 'spacing'), marginBlock: length('Margen vertical', 'spacing'), marginInline: length('Margen horizontal', 'spacing'), gap: length('Gap', 'spacing'),
  alignItems: { label: 'Alinear elementos', group: 'layout', control: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
  justifyContent: { label: 'Justificar contenido', group: 'layout', control: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
  fontFamily: { label: 'Tipografía', group: 'typography', control: 'text', placeholder: 'Inter, sans-serif', tokenGroups: ['typography'] },
  fontSize: { ...length('Tamaño de fuente', 'typography'), tokenGroups: undefined },
  fontWeight: { label: 'Peso', group: 'typography', control: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'] },
  lineHeight: { label: 'Interlineado', group: 'typography', control: 'text', placeholder: '1.5, 24px…' },
  textAlign: { label: 'Alineación de texto', group: 'typography', control: 'select', options: ['left', 'center', 'right', 'justify'] },
  color: { label: 'Color de texto', group: 'appearance', control: 'color', placeholder: '#0f172a', tokenGroups: ['colors'] },
  background: { label: 'Fondo', group: 'appearance', control: 'color', placeholder: '#ffffff o gradiente', tokenGroups: ['colors'] },
  border: { label: 'Borde', group: 'appearance', control: 'text', placeholder: '1px solid #e2e8f0' },
  borderColor: { label: 'Color de borde', group: 'appearance', control: 'color', placeholder: '#e2e8f0', tokenGroups: ['colors'] },
  borderRadius: { ...length('Radio del borde', 'appearance'), tokenGroups: ['radii'] },
  boxShadow: { label: 'Sombra', group: 'appearance', control: 'text', placeholder: '0 12px 35px rgba(0,0,0,.15)', tokenGroups: ['shadows'] },
  opacity: { label: 'Opacidad', group: 'appearance', control: 'number', min: 0, max: 1, step: 0.05 },
  objectFit: { label: 'Ajuste de imagen', group: 'layout', control: 'select', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
  gridTemplateColumns: { label: 'Columnas grid', group: 'layout', control: 'text', placeholder: 'repeat(3, minmax(0, 1fr))' },
};

function humanize(property: string): string {
  return property.replace(/[A-Z]/g, match => ` ${match.toLowerCase()}`).replace(/^./, match => match.toUpperCase());
}

export function styleControlDefinition(property: StyleProperty): StyleControlDefinition {
  return STYLE_CONTROLS[property] ?? { label: humanize(property), control: 'text', group: 'layout' };
}

export type StyleDraftValidation =
  | { success: true; value: StyleValue | undefined }
  | { success: false; error: string };

export function validateStyleDraft(property: StyleProperty, draft: string, theme: ThemeTokens): StyleDraftValidation {
  const value = draft.trim();
  if (!value) return { success: true, value: undefined };
  if (value.startsWith('token:')) {
    return resolveThemeToken(theme, value)
      ? { success: true, value }
      : { success: false, error: 'El token de tema no existe.' };
  }
  if (!isSafeStyleValue(value)) return { success: false, error: 'El valor contiene CSS no permitido.' };
  const definition = styleControlDefinition(property);
  if (definition.options && !definition.options.includes(value)) {
    return { success: false, error: 'Selecciona uno de los valores permitidos.' };
  }
  if (property === 'opacity') {
    const opacity = Number(value);
    return Number.isFinite(opacity) && opacity >= 0 && opacity <= 1
      ? { success: true, value: opacity }
      : { success: false, error: 'Usa un valor entre 0 y 1.' };
  }
  if (property === 'lineHeight' && /^\d+(\.\d+)?$/.test(value)) return { success: true, value: Number(value) };
  return { success: true, value };
}

export function parseStructuredDraft(draft: string): { success: true; value: unknown } | { success: false; error: string } {
  try {
    return { success: true, value: JSON.parse(draft) as unknown };
  } catch {
    return { success: false, error: 'El JSON no es válido.' };
  }
}
