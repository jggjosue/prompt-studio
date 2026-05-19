import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPagesLoading() {
  return (
    <div
      className="container py-8 space-y-6"
      aria-busy="true"
      aria-label="Cargando landing pages"
    >
      <Skeleton className="h-10 w-64 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
