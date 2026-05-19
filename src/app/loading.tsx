import { Loader2 } from 'lucide-react';

/** Indicador ligero durante transiciones client-side (App Router). */
export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
      role="status"
      aria-label="Cargando"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
    </div>
  );
}
