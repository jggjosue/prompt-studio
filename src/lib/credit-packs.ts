/**
 * Catálogo de packs de créditos para recarga puntual.
 *
 * Módulo puro y sin dependencias de servidor: lo importan tanto la ruta de
 * checkout como el webhook y los componentes de cliente, de modo que el precio
 * y la cantidad de créditos tienen una única fuente de verdad. Nunca se confía
 * en el importe que llega desde el navegador; el webhook revalida contra este
 * catálogo antes de abonar nada.
 */

export type CreditPack = {
  id: string;
  /** Créditos que se abonan al saldo, bonus incluido. */
  credits: number;
  /** Créditos de regalo respecto a la tarifa base del pack más pequeño. */
  bonusCredits: number;
  priceCents: number;
  currency: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  /** Marca el pack que se resalta en la interfaz. */
  featured?: boolean;
};

/**
 * Tabla de packs de recarga. Precio por crédito:
 *
 * ┌──────────┬──────────┬──────────┬─────────────────┬──────────────────────────┐
 * │ Pack     │ Precio   │ Créditos │ Bonus           │ $/cr efectivo            │
 * ├──────────┼──────────┼──────────┼─────────────────┼──────────────────────────┤
 * │ 500 cr   │ $5.00    │  500     │  0 bonus        │ $0.0100 (tarifa base)    │
 * │ 1.000 cr │ $9.00    │ 1.000    │  0 bonus        │ $0.0090 ← equivale Plan  │
 * │           │          │          │                 │ Premium ($9/500 cr=0.018)│
 * │ 2.500 cr │ $19.00   │ 2.500    │  +100 = 2.600   │ $0.0073 ← ~Creator level │
 * │ 5.000 cr │ $29.00   │ 5.000    │  +300 = 5.300   │ $0.0055 ← ~Pro level     │
 * │ 10.000cr │ $39.00   │ 10.000   │  +800 = 10.800  │ $0.0036 ← ~Studio level  │
 * └──────────┴──────────┴──────────┴─────────────────┴──────────────────────────┘
 *
 * La escala de precios refleja la jerarquía de planes:
 * – Premium: $9/mes · 500 cr   → aquí $9 · 1.000 cr (doble créditos, mismo precio)
 * – Creator:  $19/mes · 1.000 cr → aquí $19 · 2.600 cr efectivos
 * – Pro:      $29/mes · 1.500 cr → aquí $29 · 5.300 cr efectivos
 * – Studio:   $39/mes · 3.000 cr → aquí $39 · 10.800 cr efectivos
 *
 * Todos los packs respetan el piso de $0.01/cr del sistema (el precio por crédito
 * del pack más barato es exactamente $0.01). Los bonus créditos sólo se conceden
 * en packs ≥ 2.500 cr para incentivar recargas de mayor volumen.
 */
export const CREDIT_PACKS: readonly CreditPack[] = [
  {
    id: 'topup-500',
    credits: 500, bonusCredits: 0, priceCents: 500, currency: 'usd',
    name: { es: '500 Prompt Credits', en: '500 Prompt Credits' },
    description: { es: 'Recarga puntual de 500 Prompt Credits.', en: 'One-time 500 Prompt Credit top-up.' },
  },
  {
    id: 'topup-1000',
    credits: 1000, bonusCredits: 0, priceCents: 900, currency: 'usd',
    name: { es: '1.000 Prompt Credits', en: '1,000 Prompt Credits' },
    description: { es: 'Recarga puntual de 1.000 Prompt Credits. Mismo precio que el plan Premium.', en: 'One-time 1,000 Prompt Credit top-up. Same price as Premium plan.' },
  },
  {
    id: 'topup-2500',
    credits: 2600, bonusCredits: 100, priceCents: 1900, currency: 'usd',
    name: { es: '2.500 Prompt Credits', en: '2,500 Prompt Credits' },
    description: { es: 'Recarga de 2.500 cr + 100 de regalo. Mismo precio que el plan Creator.', en: '2,500 credits + 100 bonus. Same price as Creator plan.' },
    featured: true,
  },
  {
    id: 'topup-5000',
    credits: 5300, bonusCredits: 300, priceCents: 2900, currency: 'usd',
    name: { es: '5.000 Prompt Credits', en: '5,000 Prompt Credits' },
    description: { es: 'Recarga de 5.000 cr + 300 de regalo. Mismo precio que el plan Pro.', en: '5,000 credits + 300 bonus. Same price as Pro plan.' },
  },
  {
    id: 'topup-10000',
    credits: 10800, bonusCredits: 800, priceCents: 3900, currency: 'usd',
    name: { es: '10.000 Prompt Credits', en: '10,000 Prompt Credits' },
    description: { es: 'Recarga de 10.000 cr + 800 de regalo. Mismo precio que el plan Studio.', en: '10,000 credits + 800 bonus. Same price as Studio plan.' },
  },
] as const;

/** Legacy IDs remain readable so an already-paid Stripe session can settle. */
const LEGACY_CREDIT_PACKS: readonly CreditPack[] = [
  { id: 'topup-20', credits: 20, bonusCredits: 0, priceCents: 900, currency: 'usd', name: { es: 'Recarga legacy 20 créditos', en: 'Legacy 20 credit top-up' }, description: { es: 'Pack legacy', en: 'Legacy pack' } },
  { id: 'topup-60', credits: 66, bonusCredits: 6, priceCents: 2400, currency: 'usd', name: { es: 'Recarga legacy 60 créditos', en: 'Legacy 60 credit top-up' }, description: { es: 'Pack legacy', en: 'Legacy pack' }, featured: true },
  { id: 'topup-150', credits: 172, bonusCredits: 22, priceCents: 5400, currency: 'usd', name: { es: 'Recarga legacy 150 créditos', en: 'Legacy 150 credit top-up' }, description: { es: 'Pack legacy', en: 'Legacy pack' } },
];

export function getCreditPack(id: unknown): CreditPack | null {
  if (typeof id !== 'string' || !id) return null;
  return [...CREDIT_PACKS, ...LEGACY_CREDIT_PACKS].find(pack => pack.id === id) ?? null;
}

export function isCreditPackId(id: unknown): id is string {
  return getCreditPack(id) !== null;
}

/** Precio por crédito en céntimos, para mostrar el ahorro entre packs. */
export function centsPerCredit(pack: CreditPack): number {
  return pack.priceCents / pack.credits;
}

export function formatCreditPackPrice(pack: CreditPack, locale = 'es'): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: pack.currency.toUpperCase(),
  }).format(pack.priceCents / 100);
}

/**
 * Revalida una compra de créditos contra el catálogo antes de abonar saldo.
 *
 * Réplica deliberada de `isValidComponentPurchase`: el importe y la moneda que
 * confirma Stripe deben coincidir exactamente con el pack, y el usuario de los
 * metadatos con el de la referencia de cliente. Cualquier discrepancia implica
 * metadatos manipulados y el webhook debe rechazar el abono.
 */
export function isValidCreditTopUp(input: {
  expectedPackId: string;
  expectedUserId: string;
  expectedAmountCents: number;
  expectedCurrency: string;
  metadataPackId?: string | null;
  metadataUserId?: string | null;
  buyerKey?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
}): boolean {
  return (
    input.metadataPackId === input.expectedPackId &&
    input.metadataUserId === input.expectedUserId &&
    input.buyerKey === input.expectedUserId &&
    input.amountTotal === input.expectedAmountCents &&
    input.currency?.toLowerCase() === input.expectedCurrency.toLowerCase()
  );
}
