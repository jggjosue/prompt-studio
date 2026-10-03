import { ACTIVE_CREDIT_PACK_CATALOG } from '@/lib/commercial-pricing';

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
 * │ 2.500 cr ★ │ $25.00   │ 2.500 cr   │    0     │ 2.500 cr     │
 * │ 5.000 cr   │ $50.00   │ 5.000 cr   │    0     │ 5.000 cr     │
 * │ 10.000 cr  │$100.00   │10.000 cr   │    0     │10.000 cr     │
 * └────────────┴──────────┴────────────┴──────────┴──────────────┘
 *
 * Las recargas activas no añaden bonus: precio y cantidad se validan en servidor y webhook.\n */
export const CREDIT_PACKS: readonly CreditPack[] = ACTIVE_CREDIT_PACK_CATALOG.map(pack => ({
  ...pack,
  currency: 'usd',
  name: {
    es: `${pack.credits.toLocaleString('es-ES')} Prompt Credits`,
    en: `${pack.credits.toLocaleString('en-US')} Prompt Credits`,
  },
  description: {
    es: `Recarga puntual de ${pack.credits.toLocaleString('es-ES')} Prompt Credits.`,
    en: `One-time ${pack.credits.toLocaleString('en-US')} Prompt Credit top-up.`,
  },
}));

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
