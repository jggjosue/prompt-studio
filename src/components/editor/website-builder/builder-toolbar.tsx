'use client';

/**
 * Barra superior del editor.
 *
 * Cambia de dispositivo, de página, deshace/rehace y muestra el estado del
 * autoguardado. No persiste nada por movimiento: el guardado lo decide el proveedor
 * del estado, con retardo y solo cuando el documento cambia.
 */

import { usePathname } from 'next/navigation';
import { Eye, Laptop, Monitor, Redo2, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { DEVICE_ORDER, useBuilder } from './builder-context';

const DEVICE_META = {
  desktop: { label: 'Escritorio', Icon: Monitor },
  laptop: { label: 'Portátil', Icon: Laptop },
  tablet: { label: 'Tableta', Icon: Tablet },
  mobile: { label: 'Móvil', Icon: Smartphone },
} as const;

export function BuilderToolbar() {
  const builder = useBuilder();
  const pathname = usePathname();
  const previewHref = pathname.replace(/\/editor$/, '');
  const savedLabel = builder.savedAt
    ? `Guardado ${new Date(builder.savedAt).toLocaleTimeString()}`
    : 'Sin cambios';

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

      <span className="hidden text-[11px] text-muted-foreground lg:inline" aria-live="polite">
        {savedLabel}
      </span>

      <a
        href={previewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
        Vista previa
      </a>
    </header>
  );
}
