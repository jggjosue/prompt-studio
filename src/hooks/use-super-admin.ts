'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Super administrador de Prompt Studio.
 *
 * El email del admin vive en variables de servidor (`PROMPT_STUDIO_PREMIUM_JO`,
 * `PROMPT_STUDIO_CREATOR_JO`, `PROMPT_STUDIO_PRO_JO`, `PROMPT_STUDIO_STUDIO_JO`),
 * y `isPromptStudioAdminEmail` los acepta a todos. Como el menú es un componente
 * de cliente, cada uno necesita además su gemelo `NEXT_PUBLIC_*`: sin él,
 * `ADMIN_EMAILS` queda vacío y el hook devuelve `false` siempre, que es
 * exactamente el síntoma de «en desarrollo no le aparece a nadie».
 *
 * Se comparan los cuatro para no atar el menú a una sola variable, igual que
 * hace el lado servidor. El plan no distingue al admin de otros suscriptores,
 * por eso se compara contra el email primario del usuario.
 */
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_PROMPT_STUDIO_PREMIUM_JO,
  process.env.NEXT_PUBLIC_PROMPT_STUDIO_CREATOR_JO,
  process.env.NEXT_PUBLIC_PROMPT_STUDIO_PRO_JO,
  process.env.NEXT_PUBLIC_PROMPT_STUDIO_STUDIO_JO,
]
  .map(value => value?.trim().toLowerCase())
  .filter((value): value is string => Boolean(value));

export function useSuperAdmin(): boolean {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn || !user || ADMIN_EMAILS.length === 0) return false;
  const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  return Boolean(email && ADMIN_EMAILS.includes(email));
}
