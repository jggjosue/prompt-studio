import { Resend } from 'resend';

/**
 * El cliente se construye en el primer uso, no al importar el módulo.
 *
 * Lanzar al importar convertía un `RESEND_API_KEY` ausente en un fallo de build:
 * `next build` importa cada módulo de ruta para recolectar datos de página. Un
 * secreto que falta debe romper el envío del correo, no la compilación.
 *
 * Valor de ejemplo en el entorno local: `RESEND_API_KEY=re_xxxxxxxxx`.
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

export async function upsertResendContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  const contact = {
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    unsubscribed: false,
    ...(audienceId ? { audienceId } : {}),
  };

  const created = await resend.contacts.create(contact);
  if (!created.error) return created;

  // Resend returns an error when the email already exists. Updating by email
  // makes Clerk user.created/user.updated events safely replayable.
  const updated = await resend.contacts.update(contact);
  return updated.error ? created : updated;
}
