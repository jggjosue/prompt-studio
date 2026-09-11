import type { Metadata } from 'next';
import { GenerationsClient } from './generations-client';

export const metadata: Metadata = { title: 'Generaciones | Prompt Studio', robots: { index: false, follow: false } };

export default function GenerationsPage() {
  return <main className="mx-auto w-full max-w-5xl p-4 md:p-8"><div className="mb-6"><h1 className="text-3xl font-bold tracking-tight">Generaciones</h1><p className="mt-2 text-muted-foreground">Tus imágenes, videos y proyectos continúan procesándose aunque cierres esta página.</p></div><GenerationsClient /></main>;
}
