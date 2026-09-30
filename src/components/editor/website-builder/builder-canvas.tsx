'use client';

/**
 * Lienzo central.
 *
 * Dibuja la página actual al ancho del dispositivo activo (Escritorio, Tableta o
 * Móvil). En lugar de confiar en media queries del viewport —que no responderían
 * al ancho del lienzo— cada nodo aplica sus estilos **resueltos** para ese
 * breakpoint inline (`resolveNodeStyles`), así lo que se edita es exactamente lo
 * que se hereda en cada dispositivo. Sin iframes.
 */

import { themeVariables } from '@/components/editor/page-renderer';
import { DEVICE_WIDTH, useBuilder } from './builder-context';
import { BuilderSection, DropSlot } from './builder-node';

const SCOPE = 'ps-site';

export function BuilderCanvas() {
  const builder = useBuilder();
  const page = builder.page;
  const sections = page?.sections ?? [];
  const variables = page ? themeVariables(page, builder.schema) : {};

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-muted/40" onClick={() => builder.select(null)}>
      <div className="flex-1 overflow-auto p-6">
        <div
          className="mx-auto min-h-[70vh] shrink-0 rounded-xl border border-border bg-background shadow-sm transition-[width] duration-200"
          style={{
            width: DEVICE_WIDTH[builder.device],
            minWidth: DEVICE_WIDTH[builder.device],
            maxWidth: DEVICE_WIDTH[builder.device],
          }}
        >
          <div data-ps-scope={SCOPE} style={variables}>
            {sections.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10">
                <p className="text-sm font-semibold text-muted-foreground">Lienzo vacío</p>
                <div className="w-full max-w-md">
                  <DropSlot parentId={null} index={0} empty />
                </div>
              </div>
            ) : (
              <div className="flex flex-col p-2">
                {sections.map((node, index) => (
                  <BuilderSection key={node.id} node={node} index={index} total={sections.length} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
