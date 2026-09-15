/**
 * Texto de los correos transaccionales.
 *
 * Módulo puro y sin `server-only`: el envío vive en `@/lib/transactional-email`,
 * que arrastra Resend y solo puede ejecutarse en servidor. Separarlos permite
 * comprobar el contenido de los correos en las pruebas sin montar el cliente de
 * correo, que es el mismo motivo por el que `prompt-goals` está aparte de
 * `optimize-prompt`.
 */
import { getSiteUrl } from '@/lib/site-url';

const site = () => getSiteUrl().replace(/\/$/, '');

/**
 * Recibo de compra de un componente.
 *
 * Incluye el enlace de descarga y el de reseña en el mismo correo. La reseña se
 * pide aquí, y no en un envío diferido, porque no hay planificador para
 * mensajes retardados: añadir uno es otra tarea. El coste es pedir la opinión
 * antes de que la persona haya usado el producto.
 */
export function buildPurchaseReceipt(params: {
  productName: string;
  productId: string;
  amountPaidCents: number;
  currency: string;
  receiptUrl?: string | null;
}): { subject: string; text: string } {
  const amount = (params.amountPaidCents / 100).toFixed(2);
  const lines = [
    `Gracias por tu compra: ${params.productName}.`,
    '',
    `Importe: ${amount} ${params.currency.toUpperCase()}`,
    `Descárgalo aquí: ${site()}/dashboard/library`,
  ];
  if (params.receiptUrl) lines.push(`Factura de Stripe: ${params.receiptUrl}`);
  lines.push(
    '',
    'Cuando lo hayas probado, cuéntanos qué tal te fue. Tu opinión es lo que',
    'ayuda a quien está decidiendo si comprarlo:',
    `${site()}/landing-pages/${encodeURIComponent(params.productId)}`
  );
  return { subject: `Tu compra: ${params.productName}`, text: lines.join('\n') };
}

/** Confirmación de una recarga de créditos, con el saldo resultante. */
export function buildCreditTopUpReceipt(params: {
  credits: number;
  amountPaidCents: number;
  currency: string;
  balance: number;
  receiptUrl?: string | null;
}): { subject: string; text: string } {
  const amount = (params.amountPaidCents / 100).toFixed(2);
  const lines = [
    `Se han añadido ${params.credits} créditos a tu cuenta.`,
    '',
    `Importe: ${amount} ${params.currency.toUpperCase()}`,
    `Saldo disponible: ${params.balance.toFixed(1)} créditos`,
    `Tu panel: ${site()}/dashboard/credits`,
  ];
  if (params.receiptUrl) lines.push(`Factura de Stripe: ${params.receiptUrl}`);
  lines.push('', 'Los créditos comprados no caducan.');
  return { subject: `Recarga confirmada: ${params.credits} créditos`, text: lines.join('\n') };
}
