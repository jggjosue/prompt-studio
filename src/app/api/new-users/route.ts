import { NextResponse } from 'next/server';
import { enforceIpRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import connectToDatabase from '@/lib/mongoose';
import { freeAccessCookieOptions, FREE_ACCESS_COOKIE } from '@/lib/free-access';
import NewUser from '@/models/NewUser';
import { createNewsletterConfirmation } from '@/lib/newsletter-confirmation';
import { getSiteUrl } from '@/lib/site-url';


export async function POST(request: Request) {
  const limited = await enforceIpRateLimit(request, 'new-users', RATE_LIMITS.publicWrite);
  if (limited) return limited;

  try {
    const { email: rawEmail, marketingConsent = false, locale = 'es' } = await request.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Correo electrónico no válido' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    /**
     * Upsert en lugar de consultar y luego crear: dos envíos simultáneos del
     * mismo correo entraban los dos por la ventana entre `findOne` y `create`.
     *
     * Este es el punto donde se capturan los leads de las descargas gratuitas,
     * así que un fallo aquí se traduce en un contacto perdido para siempre.
     */
    const visitorToken = crypto.randomUUID();
    await NewUser.updateOne(
      { email },
      {
        $setOnInsert: { email, createdAt: new Date(), marketingStatus: 'not_requested' },
        $set: { visitorToken },
      },
      { upsert: true }
    );

    let confirmationRequired = false;
    if (marketingConsent === true) {
      try {
        const confirmation = createNewsletterConfirmation();
        const pending = await NewUser.findOneAndUpdate(
          { email, marketingStatus: { $ne: 'confirmed' } },
          {
            $set: {
              marketingStatus: 'pending',
              marketingConsentRequestedAt: new Date(),
              marketingConfirmationTokenHash: confirmation.tokenHash,
              marketingConfirmationExpiresAt: confirmation.expiresAt,
            },
          },
          { returnDocument: 'after' }
        );

        if (pending) {
          const { resend } = await import('@/lib/resend');
          const baseUrl = getSiteUrl().replace(/\/$/, '');
          const confirmationUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(confirmation.token)}&locale=${locale === 'en' ? 'en' : 'es'}`;
          const english = locale === 'en';
          const { error } = await resend.emails.send({
            from: process.env.RESEND_EMAIL as string,
            to: email,
            subject: english ? 'Confirm your Prompt Studio newsletter subscription' : 'Confirma tu suscripción al newsletter de Prompt Studio',
            text: english
              ? `You requested Prompt Studio marketing emails. Confirm within 48 hours: ${confirmationUrl}\n\nIf you did not request this, ignore this message.`
              : `Solicitaste recibir correos de marketing de Prompt Studio. Confirma en un plazo de 48 horas: ${confirmationUrl}\n\nSi no lo solicitaste, ignora este mensaje.`,
          });
          confirmationRequired = !error;
          if (error) {
            console.error('Newsletter confirmation delivery failed');
          }
        }
      } catch {
        console.error('Newsletter confirmation could not be queued');
      }
    }


    // El «ya registrado» se decide en el servidor: la cookie guarda un token
    // opaco que apunta al registro real en la BD, no a un marcador del navegador.
    const response = NextResponse.json({
      success: true,
      confirmationRequired,
    });
    response.cookies.set(FREE_ACCESS_COOKIE, visitorToken, freeAccessCookieOptions());
    return response;
  } catch (error) {
    console.error('Error saving new user:', error);
    return NextResponse.json(
      { error: 'Error al guardar el usuario' },
      { status: 500 }
    );
  }
}
