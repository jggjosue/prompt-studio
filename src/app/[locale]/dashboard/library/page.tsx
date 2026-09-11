import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LibraryClient from './library-client';

export const metadata: Metadata = { title: 'Mis compras | Prompt Studio', robots: { index: false, follow: false } };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/dashboard/library');
  const query = await searchParams;
  return <LibraryClient checkoutSuccess={query.checkout === 'success'} />;
}
