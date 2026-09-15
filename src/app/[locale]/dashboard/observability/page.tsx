import type { Metadata } from 'next';
import ObservabilityClient from './observability-client';
export const metadata: Metadata = { title: 'Observabilidad | Prompt Studio', robots: { index: false, follow: false } };
export default function ObservabilityPage(){return <main className="mx-auto w-full max-w-7xl p-4 md:p-8"><h1 className="text-3xl font-black">Observabilidad</h1><p className="mt-2 text-sm text-muted-foreground">Rendimiento, errores, operaciones de IA y conversión en una sola vista.</p><ObservabilityClient/></main>}
