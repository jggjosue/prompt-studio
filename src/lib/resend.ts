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
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: params.to,
    subject: 'Welcome to Prompt Studio',
    html: `<p>Hi${params.name ? ` ${params.name}` : ''}, welcome to Prompt Studio.</p>`,
  });
}

export async function sendProductAnnouncementEmail(params: {
  to: string;
  name?: string;
  title: string;
  href?: string;
  category: string;
}) {
  return resend.emails.send({
    from: 'onboarding@resend.dev',
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
    from: 'onboarding@resend.dev',
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
