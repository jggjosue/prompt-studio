'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProjectsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="mx-auto max-w-xl border-destructive/40">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 size-10 text-destructive" />
        <h1 className="text-xl font-bold">No pudimos cargar tus proyectos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tu trabajo permanece guardado. Vuelve a intentar la consulta.</p>
        <Button className="mt-5" onClick={reset}>Reintentar</Button>
      </CardContent>
    </Card>
  );
}
