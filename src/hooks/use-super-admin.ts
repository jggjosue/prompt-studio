'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Super administrador de Prompt Studio.
 *
 * El email del admin vive en `PROMPT_STUDIO_PREMIUM_JO` (server). Para que el
 * menú (componente de cliente) pueda consultarlo, el valor debe exponerse también
 * como `NEXT_PUBLIC_PROMPT_STUDIO_PREMIUM_JO`. El plan no distingue al admin de
 * otros suscriptores, por eso se compara el email primario del usuario.
 */
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_PROMPT_STUDIO_PREMIUM_JO ?? '').trim().toLowerCase();

export function useSuperAdmin(): boolean {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn || !user) return false;
  const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  return Boolean(ADMIN_EMAIL && email === ADMIN_EMAIL);
}