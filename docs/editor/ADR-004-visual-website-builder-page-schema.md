# ADR-004: Visual Website Builder sobre un PageSchema tipado

**Estado:** Accepted  
**Fecha:** 2026-09-29  
**Decisores:** Prompt Studio engineering

## Contexto

`/page-composer` ya editaba un `EditorDocument` con canvas, historial y autoguardado (ADR-001/003), pero ese árbol es de propósito general y no describe un sitio web publicado: no tiene páginas, SEO, tema ni un contrato de props por componente. El objetivo es que la IA genere y edite páginas de marketing, y que ese resultado se renderice sin ejecutar código generado.

La decisión central es dónde vive la verdad: ¿la IA escribe React/HTML, o escribe datos que un renderizador fijo convierte en React?

| Opción | Resultado |
|---|---|
| La IA escribe JSX o HTML | Hay que evaluar/inyectar código no confiable; rompe el responsive, la accesibilidad y cualquier validación. |
| La IA edita `PageSchema` (datos) | El renderizador es fijo y auditado; toda entrada se valida antes de renderizar. |
| La IA configura Tailwind suelto | No hay contrato de props ni hijos; el editor visual no puede garantizar estructura. |

## Decisión

Se introduce **PageSchema v1**, un documento JSON tipado y serializable, como único formato de entrada del builder. La IA manipula datos, nunca código.

- **Datos puros** en `src/lib/editor/page-schema.ts` (sin React): tipos `SiteSchema`/`SitePage`/`PageSection`/`PageNode`, `PAGE_PROP_FIELDS` y `PAGE_CHILDREN` como fuente única de verdad, `validatePageSchema`, límites y `createLandingSchema` como semilla. Renderiza la semilla con los 16 tipos de componente.
- **Registro React** en `src/components/editor/page-components.tsx`: `PAGE_COMPONENT_REGISTRY` es exhaustivo sobre `PAGE_COMPONENT_TYPES` y deriva props por defecto, props editables e hijos permitidos del contrato puro. Los componentes son `memo`, semánticos y estilados con tokens `var(--ps-*)`.
- **Renderer seguro** en `src/components/editor/page-renderer.tsx`: servidor, sin `eval`, sin `dangerouslySetInnerHTML` y sin `new Function`. Envuelve cada nodo en `div[data-ps-id]` y emite una hoja de estilos con media queries.
- **Árbol acotado:** solo `container` y `columns` aceptan hijos; el resto son hojas (se repiten con `items`, no anidando). `navbar` es única y debe ir primero, `footer` es única, toda página tiene al menos una sección.
- **Seguridad de entrada:** `safeUrl` restringe enlaces, `UNSAFE_CSS_VALUE` (`;{}<>`) rechaza valores de estilo, `TOKEN_KEY_PATTERN` valida claves de token, `FORBIDDEN_KEYS` bloquea `__proto__`/`constructor`/`prototype`, y `MAX_DEPTH`/`MAX_NODES`/`MAX_PAGES` acotan el documento.
- **Responsive y tema por datos:** `NodeStyles` reutiliza `resolveStyles`/`INHERITANCE` del editor; los tokens se emiten como variables CSS `--ps-*` y las variantes responsive como media queries (`1279.98 / 1023.98 / 767.98` px).
- **Vista previa real:** `src/app/[locale]/page-composer/website/page.tsx` renderiza `createLandingSchema()` con `PageRenderer`; `?slug=` abre cualquier página del sitio. Es la prueba viva de datos → React.

### Fase 2: editor visual con drag & drop

- **Mutaciones puras:** `src/lib/editor/page-schema-ops.ts` concentra insertar, mover, reordenar, duplicar y borrar. Cada operación devuelve un documento nuevo o un rechazo tipado (`invalid-nesting`, `cycle`, `depth-limit`, `node-limit`, `single-instance`, …). La UI nunca toca el árbol.
- **DnD con `@dnd-kit`** (ya dependencia del proyecto, compatible con React 19 / Next 15): la biblioteca y los nodos son `useDraggable`; cada hueco entre hermanos es un `useDroppable` que codifica `{ parentId, index }`. Al soltar, el gesto se traduce en una mutación pura. Un soltar inválido no hace nada.
- **Indicadores:** selección (anillo + chrome), huecos que se iluminan en verde/rojo según compatibilidad, overlay de arrastre, nodo atenuado mientras se arrastra y lienzo vacío como zona de soltar.
- **Accesibilidad:** nodos focales (`Alt+↑/↓` reordenar, `Alt+D` duplicar, `Supr` borrar, `Esc` soltar selección) y controles reales con `aria-label`.
- **Sin persistencia por puntero:** el autoguardado escribe en `localStorage` con retardo (900 ms) cuando el documento cambia, nunca durante el arrastre.
- **Rutas:** `/page-composer/website/editor` (editor) y `/page-composer/website` (vista previa, con enlace al editor). No toca ninguna ruta existente.

### Fase 3: inspector de propiedades dinámico

- **Metadatos, no inspectores por componente:** `src/lib/editor/property-controls.ts` define `ControlDescriptor` y `buildControls`, que derivan los controles de cada tipo a partir de `PAGE_PROP_FIELDS`, los `styleControls` del registro y conjuntos compartidos de layout, borde y tipografía. El inspector (`builder-properties.tsx`) es un único componente genérico: pinta un campo por control y no conoce ningún componente.
- **Cobertura:** texto, URL, imágenes, fondo, ancho/alto, relleno, margen, separación, alineación, display, tipografía (tamaño, peso, interlineado, alineación de texto), colores, borde (grosor, estilo, color), radio, sombra y opacidad.
- **Mutaciones puras:** `setNodeProp`, `setNodeStyle`, `clearNodeStyle`, `resetNodeProp`, `resetNodeStyles` y `resetNode` en `page-schema-ops.ts`. Cada cambio actualiza `PageSchema` y el lienzo al instante, sin recargar.
- **Validación:** las props se validan contra el contrato (tipo, opciones, `safeUrl`); los estilos contra `styleValueToCss` (rechaza `;{}<>`) y un patrón de propiedad. Los rechazos son `invalid-prop` / `invalid-style`.
- **Tokens y restablecer:** los colores aceptan `token:*`; cada control tiene restablecer individual, además de "Restablecer estilos" y "Restablecer todo" (valores por defecto del catálogo).

### Fase 4: edición responsive

- **Tres breakpoints de editor:** Escritorio, Tableta y Móvil (`src/lib/editor/responsive.ts`, `EDITOR_BREAKPOINTS`). La barra superior cambia el ancho del lienzo (1440/768/390) y el inspector edita los estilos del breakpoint activo.
- **PageSchema ya guarda overrides:** `styles` es `Partial<Record<Breakpoint, StyleMap>>` con `desktop` como base; `tablet`/`mobile` solo declaran lo que sobrescriben. Un solo documento, no tres páginas.
- **Herencia:** `resolveNodeStyles` aplica base → tablet → mobile; `findStyleSource` dice si un valor es local o de qué breakpoint se hereda; `overrideBreakpoints` lista dónde vive cada override. La página publicada resuelve igual por cascada de media queries.
- **Lienzo sin iframes:** cada nodo aplica inline sus estilos **resueltos** para el dispositivo activo (`styleMapToCssProperties`), en lugar de depender de media queries del viewport que no responderían al ancho del lienzo.
- **Indicadores:** el inspector marca cada control como `Local` o heredado (con el breakpoint origen) y dibuja un punto por breakpoint con override local; pulsar un punto salta a ese breakpoint.
- **Compatibilidad:** los documentos sin overrides resuelven igual en los tres breakpoints; `laptop` sigue en el schema y en el renderer publicado para no romper nada.

### Fase 5: gestión profesional del estado de edición

- **Comandos:** cada cambio es un `EditorCommand` (`ADD_COMPONENT`, `REMOVE_COMPONENT`, `MOVE_COMPONENT`, `UPDATE_PROPS`, `UPDATE_STYLES`, `DUPLICATE_COMPONENT`, `UPDATE_PAGE_SETTINGS`) con las instantáneas antes/después. El historial (`EditorHistory`) deshace y rehace comandos.
- **Undo/Redo** con `Cmd/Ctrl+Z` y `Cmd/Ctrl+Shift+Z` (ignorados dentro de inputs).
- **Autoguardado** (`SaveManager`): debounced (1200 ms), nunca por movimiento de ratón; estados `clean / dirty / saving / error`; serializado — un solo guardado en vuelo y la ráfaga más reciente gana.
- **Protección:** concurrencia optimista por `version` (el backend responde 409 si otra pestaña guardó antes, y el gestor marca `stale` sin reintentar en bucle); los fallos transitorios reintentan con espera; el borrador pendiente nunca se pierde; `beforeunload` fuerza un guardado best-effort.
- **Persistencia en MongoDB:** modelo `PageComposerProject` y API `PUT/GET /api/page-composer/projects/[id]` (auth + plan + límite de peticiones + validación del schema); `/page-composer/website/editor?project=<id>` carga un borrador existente.

## Consecuencias

- Publicar, persistir y editar el sitio son extensiones de `EditorProject` (slug, status, `PageSchema`), no un segundo motor: el renderizador no cambia.
- `tests/unit/page-schema.test.ts` cubre contrato, validación, seguridad y el render real (`renderToStaticMarkup`): 20/20. `tests/unit/page-schema-ops.test.ts` cubre add, move, reorder, duplicate, delete, anidación inválida, ciclos y límites: 14/14. `tests/unit/property-controls.test.ts` cubre metadatos de controles y las mutaciones del inspector: 12/12. `tests/unit/responsive.test.ts` cubre la herencia base → tablet → mobile, orígenes de override y conversión a CSS: 12/12. `tests/unit/editor-commands.test.ts` cubre la taxonomía y el historial: 4/4. `tests/unit/save-manager.test.ts` cubre debounce, carreras, reintentos y `stale`: 6/6.
- Pendiente fuera de alcance: edición de listas (props `list`) en el inspector, prompt de IA que emita el documento, página pública con SEO y la migración de `web-page-generator-prompt.ts` a este contrato.
- Deuda registrada: dos warnings `@next/next/no-img-element` en el registro, coherentes con el resto del proyecto; se resolverán al migrar a `next/image`.
