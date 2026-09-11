import type { Metadata } from 'next';
import { CreditsClient } from './credits-client';

export const metadata: Metadata = { title: 'Créditos | Prompt Studio', robots: { index: false, follow: false } };

export default function CreditsPage() {
  return <main className="mx-auto w-full max-w-5xl p-4 md:p-8"><div className="mb-6"><h1 className="text-3xl font-bold tracking-tight">Créditos</h1><p className="mt-2 text-muted-foreground">Recarga cuando lo necesites. Los créditos comprados no caducan y se suman a los de tu plan.</p></div><CreditsClient /></main>;
}
