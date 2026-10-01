import 'server-only';
import { Resend } from 'resend';

/**
 * El cliente se construye en el primer uso, no al importar el módulo.
 *
 * Lanzar al importar convertía un `RESEND_API_KEY` ausente en un fallo de build:
 * `next build` importa cada módulo de ruta para recolectar datos de página. Un
 * secreto que falta debe romper el envío del correo, no la compilación.
 *
 * La misma variable debe configurarse con credenciales distintas por entorno
 * en el proveedor de despliegue. Nunca se expone mediante `NEXT_PUBLIC_*`.
 */
let cliente: Resend | null = null;

function instancia(): Resend {
  if (cliente) return cliente;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('Falta RESEND_API_KEY: no se puede enviar correo.');
  cliente = new Resend(apiKey);
  return cliente;
}

export const resend = new Proxy({} as Resend, {
  get(_destino, propiedad) {
    const real = instancia() as unknown as Record<PropertyKey, unknown>;
    const valor = real[propiedad];
    return typeof valor === 'function' ? valor.bind(real) : valor;
  },
});

export type ResendContactSyncInput = {
  email: string;
  marketingOptIn?: boolean;
  unsubscribeTimestamp?: Date | null;
  emailSuppressedAt?: Date | null;
  emailSuppressionReason?: string | null;
  emailDoNotContact?: boolean;
  locale?: string | null;
  topics?: string[];
};

export function resendContactState(input: ResendContactSyncInput) {
  const suppressed = Boolean(
    input.unsubscribeTimestamp ||
    input.emailSuppressedAt ||
    input.emailSuppressionReason ||
    input.emailDoNotContact
  );
  return {
    email: input.email.trim().toLowerCase(),
    // Clerk/account presence never grants marketing permission.
    unsubscribed: suppressed || input.marketingOptIn !== true,
  };
}

export async function upsertResendContact(input: ResendContactSyncInput) {
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  const state = resendContactState(input);
  const contact = {
    ...state,
    ...(audienceId ? { audienceId } : {}),
  };

  // Segments/topics are intentionally not inferred here. Provider membership
  // is reconciled by the dedicated #674 rebuild workflow from source facts and
  // explicit preferences; contact creation itself never grants consent.

  const created = await resend.contacts.create(contact);
  if (!created.error) return created;

  // Update-by-email makes sync replayable/idempotent. Local suppression and
  // explicit opt-in are recalculated on every run, so imports cannot revive a
  // contact that the product considers unsubscribed.
  const updated = await resend.contacts.update(contact);
  return updated.error ? created : updated;
}
