import { redirect } from 'next/navigation';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  redirect('/sign-in');
}
