import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsLoading() {
  return (
    <div className="grid min-h-[70vh] gap-5 xl:grid-cols-[300px_1fr]" aria-label="Cargando proyectos">
      <aside className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </aside>
      <main className="space-y-5">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </main>
    </div>
  );
}
