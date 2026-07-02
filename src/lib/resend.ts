import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(apiKey);

export async function sendOnboardingEmail(params: {
  to: string;
  name?: string;
}) {
  // Nota: Debes cambiar 'onboarding@resend.dev' por un dominio verificado tuyo (ej. hola@promptstudio.com)
  // para poder enviar correos a cualquier persona. El dominio de prueba solo te deja enviarte a ti mismo.
  return resend.emails.send({
    from: process.env.RESEND_EMAIL as string,
    to: params.to,
    subject: '¡Bienvenido a Prompt Studio!',
    html: `<p>Hola${params.name ? ` ${params.name}` : ''},</p>
      <p>¡Te damos la bienvenida a Prompt Studio!</p>
      <p>Estamos muy felices de tenerte aquí. Ahora puedes empezar a explorar y descargar las mejores plantillas 3D y componentes para tus proyectos.</p>
      <br/>
      <p>Un saludo,<br/>El equipo de Prompt Studio</p>`,
  });
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!
  );
}

export async function sendGuestPurchaseEmail(params: {
  to: string;
  productName: string;
  downloadUrl: string;
  stripeCheckoutSessionId: string;
}) {
  const productName = escapeHtml(params.productName);
  const downloadUrl = escapeHtml(params.downloadUrl);

  return resend.emails.send(
    {
      from: process.env.RESEND_EMAIL as string,
      to: params.to,
      subject: `¡Bienvenido! Descarga tu producto: ${params.productName}`,
      html: `<p>Hola,</p>
        <p>¡Gracias por tu compra y bienvenido a Prompt Studio!</p>
        <p>Tu producto <strong>${productName}</strong> ya está listo.</p>
        <p><a href="${downloadUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Descargar producto</a></p>
        <p>Por seguridad, este enlace vence en 7 días. Guarda el archivo después de descargarlo.</p>
        <p>Un saludo,<br/>El equipo de Prompt Studio</p>`,
    },
    {
      idempotencyKey: `guest-purchase-${params.stripeCheckoutSessionId}`,
    }
  );
}

export async function sendProductAnnouncementEmail(params: {
  to: string;
  name?: string;
  title: string;
  href?: string;
  category: string;
}) {
  return resend.emails.send({
    from: process.env.RESEND_EMAIL as string,
    to: params.to,
    subject: `Nuevo ${params.category}: ${params.title}`,
    html: `<p>Hola${params.name ? ` ${params.name}` : ''},</p>
      <p>Publicamos un nuevo ${params.category.toLowerCase()} que podría interesarte: <strong>${params.title}</strong>.</p>
      <p>${params.href ? `<a href="${params.href}">Ver ahora</a>` : ''}</p>`,
  });
}

export async function sendBirthdayEmail(params: {
  to: string;
  name?: string;
}) {
  return resend.emails.send({
    from: process.env.RESEND_EMAIL as string,
    to: params.to,
    subject: '¡Feliz cumpleaños de parte de Prompt Studio!',
    html: `<p>Hola${params.name ? ` ${params.name}` : ''},</p>
      <p>¡Feliz cumpleaños! Gracias por ser parte de Prompt Studio.</p>
      <p>Hoy queremos desearte un gran día y recordarte que tenemos nuevas ideas, prompts y landing pages para ti.</p>`,
  });
}

/**
 * Replace `re_xxxxxxxxx` with your real Resend API key in `RESEND_API_KEY`.
 * Example local env value:
 * RESEND_API_KEY=re_xxxxxxxxx
 */

export async function upsertResendContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  return resend.contacts.create({
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    unsubscribed: false,
  });
}
