/**
 * Design tokens del editor.
 *
 * Los `defaultStyles` del registro guardan referencias como `token:radius.md`
 * en lugar de valores. Así, cambiar un token actualiza todos los nodos que lo
 * usan sin recorrer el documento: la resolución ocurre al pintar.
 */
export type TokenGroup = 'color' | 'spacing' | 'radius' | 'shadow' | 'font';

export type DesignTokens = Record<string, string>;

export const DEFAULT_TOKENS: DesignTokens = {
  'color.primary': '#8b5cf6',
  'color.secondary': '#ec4899',
  'color.ink': '#0f172a',
  'color.muted': '#64748b',
  'color.surface': '#ffffff',
  'color.background': '#f8fafc',
  'color.border': 'rgba(15,23,42,.12)',
  'spacing.xs': '4px',
  'spacing.sm': '8px',
  'spacing.md': '16px',
  'spacing.lg': '24px',
  'spacing.xl': '48px',
  'radius.sm': '6px',
  'radius.md': '12px',
  'radius.lg': '20px',
  'radius.full': '999px',
  'shadow.sm': '0 1px 2px rgba(15,23,42,.08)',
  'shadow.md': '0 12px 35px rgba(15,23,42,.14)',
  'shadow.lg': '0 24px 60px rgba(15,23,42,.22)',
  'font.sans': 'Inter, system-ui, sans-serif',
  'font.serif': 'Georgia, serif',
  'font.mono': 'ui-monospace, SFMono-Regular, monospace',
};

export const DARK_TOKENS: DesignTokens = {
  ...DEFAULT_TOKENS,
  'color.ink': '#f8fafc',
  'color.muted': '#a1a1aa',
  'color.surface': '#131722',
  'color.background': '#09090b',
  'color.border': 'rgba(255,255,255,.12)',
};

export const TOKEN_PREFIX = 'token:';

export function isTokenRef(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(TOKEN_PREFIX);
}

/** `token:color.primary` → `#8b5cf6`. Un token inexistente se devuelve tal cual. */
export function resolveToken(value: string, tokens: DesignTokens): string {
  if (!isTokenRef(value)) return value;
  const key = value.slice(TOKEN_PREFIX.length);
  return tokens[key] ?? value;
}

export function tokensByGroup(tokens: DesignTokens, group: TokenGroup): Array<[string, string]> {
  return Object.entries(tokens).filter(([key]) => key.startsWith(`${group}.`));
}

/* ------------------------------------------------------------- unidades --- */

export const UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'auto'] as const;
export type Unit = (typeof UNITS)[number];

export type ParsedLength = { value: number; unit: Unit };

/** `'24px'` → `{ value: 24, unit: 'px' }`. `'auto'` no tiene número. */
export function parseLength(raw: string | number | undefined): ParsedLength | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') return { value: raw, unit: 'px' };
  if (raw === 'auto') return { value: 0, unit: 'auto' };
  const match = /^(-?[\d.]+)\s*(px|%|rem|em|vw|vh)?$/.exec(raw.trim());
  if (!match) return null;
  return { value: Number(match[1]), unit: (match[2] as Unit) ?? 'px' };
}

export function formatLength(parsed: ParsedLength): string {
  return parsed.unit === 'auto' ? 'auto' : `${parsed.value}${parsed.unit}`;
}
