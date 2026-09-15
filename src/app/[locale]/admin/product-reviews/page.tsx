import type { Metadata } from 'next';
import { ReviewModerationClient } from './review-moderation-client';

export const metadata: Metadata = { title: 'Moderación de reseñas | Prompt Studio', robots: { index: false, follow: false } };

export default function ProductReviewModerationPage() {
  return <main className="mx-auto w-full max-w-4xl p-4 md:p-8"><div className="mb-6"><h1 className="text-3xl font-bold tracking-tight">Moderación de reseñas</h1><p className="mt-2 text-muted-foreground">Reseñas retenidas por el cribado automático. Rechazar no borra: deja de contar para la media pero se conserva.</p></div><ReviewModerationClient /></main>;
}
