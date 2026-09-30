'use client';

/**
 * Barra superior del editor.
 *
 * Cambia de dispositivo, de página, deshace/rehace y muestra el estado del
 * autoguardado. No persiste nada por movimiento: el guardado lo decide el proveedor
 * del estado, con retardo y solo cuando el documento cambia.
 */

import { usePathname } from 'next/navigation';
import { Eye, Monitor, Redo2, Search, Smartphone, Sparkles, Tablet, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { DEVICE_ORDER, useBuilder } from './builder-context';
import { BuilderAI } from './builder-ai';
import { BuilderPublish } from './builder-publish';
import { BuilderSeo } from './builder-seo';

const DEVICE_META = {
  desktop: { label: 'Escritorio', Icon: Monitor },
  tablet: { label: 'Tableta', Icon: Tablet },
  mobile: { label: 'Móvil', Icon: Smartphone },
} as const;

export function BuilderToolbar() {
  const builder = useBuilder();
  const pathname = usePathname();
  const previewHref = pathname.replace(/\/editor$/, '');
  const [showAI, setShowAI] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const save = {
    clean: { label: 'Guardado', className: 'text-muted-foreground' },
    dirty: { label: 'Sin guardar', className: 'text-amber-600' },
    saving: { label: 'Guardando…', className: 'text-primary' },
    error: {
      label: builder.saveFailure === 'stale' ? 'Guardado obsoleto' : 'Error al guardar',
      className: 'text-destructive',
    },
  }[builder.saveStatus];

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground">Visual Website Builder</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{builder.schema.site.name}</span>
      </div>

      <label className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span className="hidden md:inline">Página</span>
        <select
          value={builder.slug ?? ''}
          onChange={event => builder.setSlug(event.target.value)}
          className="h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Página del sitio"
        >
          {builder.schema.pages.map(page => (
            <option key={page.slug} value={page.slug}>
              {page.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mx-auto flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5" role="group" aria-label="Dispositivo">
        {DEVICE_ORDER.map(device => {
          const { label, Icon } = DEVICE_META[device];
          const active = builder.device === device;
          return (
            <button
              key={device}
              type="button"
              onClick={() => builder.setDevice(device)}
              aria-pressed={active}
              aria-label={`Ver en ${label}`}
              title={label}
              className={`rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={builder.undo}
          disabled={!builder.canUndo}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40"
          aria-label="Deshacer"
        >
          <Undo2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={builder.redo}
          disabled={!builder.canRedo}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40"
          aria-label="Rehacer"
        >
          <Redo2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <span className={`hidden text-[11px] lg:inline ${save.className}`} aria-live="polite">
        {save.label}
      </span>

      <BuilderPublish />

      <button
        type="button"
        onClick={() => setShowSeo(true)}
        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        title="SEO de la página"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        SEO
      </button>

      <button
        type="button"
        onClick={() => setShowAI(true)}
        className="ml-auto flex items-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Generar con IA
      </button>

      <a
        href={previewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
        Vista previa
      </a>

      {showAI ? <BuilderAI onClose={() => setShowAI(false)} /> : null}
      {showSeo ? <BuilderSeo onClose={() => setShowSeo(false)} /> : null}
    </header>
  );
}
