import { getSiteUrl } from '@/lib/site-url';

const site = () => getSiteUrl().replace(/\/$/, '');

export function buildAccountWelcomeEmail(params: {
  firstName?: string | null;
  locale: 'en' | 'es';
}): { subject: string; text: string } {
  const { firstName, locale } = params;
  const english = locale === 'en';
  const greeting = english
    ? firstName
      ? `Hi ${firstName},`
      : 'Hi,'
    : firstName
      ? `Hola ${firstName},`
      : 'Hola,';
  const subject = english
    ? 'Welcome to Prompt Studio'
    : 'Bienvenido a Prompt Studio';
  const text = [
    greeting,
    '',
    english
      ? 'Your Prompt Studio account has been created successfully.'
      : 'Tu cuenta de Prompt Studio se ha creado correctamente.',
    '',
    english
      ? `Start exploring: ${site()}/landing-pages`
      : `Empieza a explorar: ${site()}/landing-pages`,
    '',
    english
      ? 'You can access your dashboard at any time from your profile.'
      : 'Puedes acceder a tu panel en cualquier momento desde tu perfil.',
  ].join('\n');
  return { subject, text };
}