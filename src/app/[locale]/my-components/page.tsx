import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import MyComponentsClient from './my-components-client';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Favoritos y proyectos | Prompt Studio',
  description:
    'Organiza componentes en favoritos, colecciones y proyectos, y descarga kits completos.',
  alternates: { canonical: '/my-components' },
  // Página privada: no debe indexarse.
  robots: { index: false, follow: false },
};

/**
 * La biblioteca vive en la base de datos (`component_libraries`), así que sin
 * cuenta no hay nada que mostrar ni dónde guardar. Se manda a **registrarse**
 * —no a iniciar sesión— porque es el paso que falta para tener biblioteca;
 * quien ya tenga cuenta encontrará el enlace de acceso en esa misma pantalla.
 *
 * `redirect_url` conserva el destino para volver aquí al terminar.
 */
export default async function MyComponentsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent('/my-components')}`);
  }

  return <MyComponentsClient />;
}
