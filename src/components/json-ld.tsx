import { safeJsonLd } from '@/lib/json-ld';

export function JsonLd({ data }: { data: unknown | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
