import type { Metadata } from 'next';
import { ClientReview } from './client-review';
export const metadata: Metadata = { title: 'Revisión privada | Prompt Studio', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <ClientReview token={token} />; }
