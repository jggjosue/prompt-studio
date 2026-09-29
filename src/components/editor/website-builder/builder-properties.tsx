'use client';

/**
 * Panel de propiedades (derecha).
 *
 * Placeholder de la fase: muestra el nodo seleccionado y el contrato de props que
 * el inspector editará después. No inventa edición todavía — solo deja visible qué
 * se va a poder cambiar y desde dónde.
 */

import { getPageComponent } from '@/components/editor/page-components';
import type { PropField } from '@/lib/editor/page-schema';
import { useBuilder } from './builder-context';

function PropRow({ field, value }: { field: PropField; value: unknown }) {
  const text = value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <dt className="truncate text-[11px] text-muted-foreground">{field.label}</dt>
      <dd className="truncate text-right text-[11px] font-medium text-foreground" title={text}>
        {text}
      </dd>
    </div>
  );
}

export function BuilderProperties() {
  const builder = useBuilder();
  const selected = builder.selected;

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-muted/30">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Propiedades</h2>
      </div>

      {!selected ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Nada seleccionado</p>
          <p className="text-xs text-muted-foreground">
            Haz clic en un componente del lienzo o navega con el teclado para ver su contrato.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-3">
          <section>
            <h3 className="text-sm font-semibold text-foreground">
              {getPageComponent(selected.node.type)?.label ?? selected.node.type}
            </h3>
            <dl className="mt-2 flex flex-col gap-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>Tipo</dt>
                <dd className="font-mono text-foreground">{selected.node.type}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>ID</dt>
                <dd className="truncate font-mono text-foreground" title={selected.node.id}>
                  {selected.node.id}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Padre</dt>
                <dd className="font-mono text-foreground">{selected.parentId ?? '(sección)'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Posición</dt>
                <dd className="font-mono text-foreground">{selected.index + 1}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Profundidad</dt>
                <dd className="font-mono text-foreground">{selected.depth}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Props editables
            </h4>
            <div className="mt-1 divide-y divide-border/60">
              {(getPageComponent(selected.node.type)?.editableProps ?? []).map(field => (
                <PropRow key={field.key} field={field} value={selected.node.props[field.key]} />
              ))}
            </div>
          </section>

          <p className="rounded-md border border-dashed border-border bg-background/60 p-2 text-[11px] text-muted-foreground">
            La edición de props y estilos llega en la siguiente fase. El documento sigue viviendo en
            PageSchema.
          </p>
        </div>
      )}
    </aside>
  );
}
