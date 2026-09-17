import { NextResponse } from 'next/server';
import { enforceIpRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import connectToDatabase from '@/lib/mongoose';
import { freeAccessCookieOptions, FREE_ACCESS_COOKIE } from '@/lib/free-access';
import NewUser from '@/models/NewUser';


export async function POST(request: Request) {
  const limited = await enforceIpRateLimit(request, 'new-users', RATE_LIMITS.publicWrite);
  if (limited) return limited;

  try {
    const { email } = await request.json();

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
      { $setOnInsert: { email, createdAt: new Date() }, $set: { visitorToken } },
      { upsert: true }
    );


    // El «ya registrado» se decide en el servidor: la cookie guarda un token
    // opaco que apunta al registro real en la BD, no a un marcador del navegador.
    const response = NextResponse.json({ success: true });
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
