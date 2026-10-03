import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isPremiumJoAdmin } from '@/lib/admin-auth';

import EmailSyncClient from './email-sync-client';

export const metadata: Metadata = {
  title: 'Sincronización de email | Prompt Studio',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EmailSyncPage() {
  if (!(await isPremiumJoAdmin())) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
          Superadministrador
        </p>
        <h1 className="text-3xl font-black">Sincronización de email</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Actualiza en Resend los usuarios registrados almacenados en MongoDB,
          respetando su consentimiento, bajas y supresiones.
        </p>
      </div>

      <EmailSyncClient />
    </main>
  );
}
