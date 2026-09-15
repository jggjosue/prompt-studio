'use client';

import EditorWorkspace from '@/components/editor/editor-workspace';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Layers3, Sparkles } from 'lucide-react';

/**
 * Experiencia principal del Constructor de Componentes.
 *
 * El anterior configurador de plantillas permanece aislado como legado, pero
 * este punto de entrada monta directamente el editor de documento: una sola
 * fuente de verdad para canvas, capas, inspector, historial y persistencia.
 */
export default function ComponentBuilderEditorClient() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-white">
      <Header />
      <main className="flex-1 px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-[1800px]">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <Badge className="mb-2 border-violet-400/20 bg-violet-500/15 text-violet-200 hover:bg-violet-500/15">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Componentes reutilizables
              </Badge>
              <h1 className="flex items-center gap-2 text-lg font-black tracking-tight sm:text-xl">
                <Layers3 className="h-5 w-5 text-violet-300" /> Component Builder
              </h1>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-zinc-400">
              Crea componentes independientes: login, formularios, pestañas, menús, navegación y bloques de interfaz. Arrastra desde la biblioteca o pulsa para insertarlo.
            </p>
          </header>
          <EditorWorkspace name="Component Builder" showCanvasCoordinates />
        </div>
      </main>
      <Footer />
    </div>
  );
}
