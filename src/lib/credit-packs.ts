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
 * Tabla de packs de recarga.
 *
 * Regla del sistema: 1 Prompt Credit = $0.01 USD (piso comercial).
 * El precio en centavos dividido entre 100 da los créditos base exactos.
 * Los créditos bonus son un incentivo adicional para packs de mayor volumen;
 * se suman al saldo pero NO cambian el precio pagado.
 *
 * ┌────────────┬──────────┬────────────┬──────────┬──────────────┐
 * │ Pack       │ Precio   │ Cr. base   │ Bonus    │ Total cr.    │
 * ├────────────┼──────────┼────────────┼──────────┼──────────────┤
 * │ 500 cr     │  $5.00   │   500 cr   │    0     │   500 cr     │
 * │ 1.000 cr   │ $10.00   │ 1.000 cr   │    0     │ 1.000 cr     │
 * │ 2.500 cr ★ │ $25.00   │ 2.500 cr   │  +50 cr  │ 2.550 cr     │
 * │ 5.000 cr   │ $50.00   │ 5.000 cr   │ +150 cr  │ 5.150 cr     │
 * │ 10.000 cr  │$100.00   │10.000 cr   │ +500 cr  │10.500 cr     │
 * └────────────┴──────────┴────────────┴──────────┴──────────────┘
 *
 * Referencia de planes de suscripción (mensual, regla 1 cr = $0.01):
 *   Premium $9/mes  →   900 cr/mes  ($9  × 100)
 *   Creator $19/mes → 1.900 cr/mes  ($19 × 100)
 *   Pro     $29/mes → 2.900 cr/mes  ($29 × 100)
 *   Studio  $39/mes → 3.900 cr/mes  ($39 × 100)
 *
 * Los packs de recarga respetan exactamente el mismo piso ($0.01/cr base).
 * Los bonus créditos de los packs grandes compensan la falta de beneficios
 * recurrentes y premian a quienes compran mayor volumen.
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
    credits: 1000, bonusCredits: 0, priceCents: 1000, currency: 'usd',
    name: { es: '1.000 Prompt Credits', en: '1,000 Prompt Credits' },
    description: { es: 'Recarga puntual de 1.000 Prompt Credits.', en: 'One-time 1,000 Prompt Credit top-up.' },
  },
  {
    id: 'topup-2500',
    credits: 2550, bonusCredits: 50, priceCents: 2500, currency: 'usd',
    name: { es: '2.500 Prompt Credits', en: '2,500 Prompt Credits' },
    description: { es: 'Recarga de 2.500 cr + 50 de regalo.', en: '2,500 credits + 50 bonus.' },
    featured: true,
  },
  {
    id: 'topup-5000',
    credits: 5150, bonusCredits: 150, priceCents: 5000, currency: 'usd',
    name: { es: '5.000 Prompt Credits', en: '5,000 Prompt Credits' },
    description: { es: 'Recarga de 5.000 cr + 150 de regalo.', en: '5,000 credits + 150 bonus.' },
  },
  {
    id: 'topup-10000',
    credits: 10500, bonusCredits: 500, priceCents: 10000, currency: 'usd',
    name: { es: '10.000 Prompt Credits', en: '10,000 Prompt Credits' },
    description: { es: 'Recarga de 10.000 cr + 500 de regalo.', en: '10,000 credits + 500 bonus.' },
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
