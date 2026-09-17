import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';

export const FREE_ACCESS_COOKIE = 'free_access';
export const FREE_ACCESS_MAX_AGE = 30 * 24 * 60 * 60; // 30 días

export type FreeAccessResult = { granted: boolean; email?: string };

/**
 * «Ya registró su correo» se decide en el servidor, no con localStorage.
 *
 * - Si hay cookie `free_access` (token opaco emitido al registrarse), se busca
 *   el registro en la BD por el token: la cookie no se puede falsificar y el
 *   correo vive en `user_profiles`, no en el navegador.
 * - Si el usuario está autenticado con Clerk y su correo consta como `NewUser`,
 *   también cuenta como registrado.
 */
export async function freeAccessGranted(request: NextRequest): Promise<FreeAccessResult> {
  const token = request.cookies.get(FREE_ACCESS_COOKIE)?.value;

  await connectToDatabase();

  if (token) {
    const byToken = await NewUser.findOne({ visitorToken: token }).lean();
    if (byToken) return { granted: true, email: byToken.email };
  }

  const { userId } = await auth();
  if (!userId) return { granted: false };

  const user = await (await clerkClient()).users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return { granted: false };

  const byEmail = await NewUser.findOne({ email }).lean();
  if (byEmail) return { granted: true, email: byEmail.email };

  return { granted: false };
}

export function freeAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: FREE_ACCESS_MAX_AGE,
  };
}