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

### Fase 6: sistema de plantillas y secciones

- **Secciones** (`src/lib/editor/page-sections.ts`): biblioteca de 9 secciones (Hero, Características, Precios, Testimonios, FAQ, CTA, Contacto, Footer, Galería) construidas con los 16 componentes del catálogo — no se duplica ningún componente. `createSection(id, makeId, copy)` devuelve un `PageNode` con ids frescos y textos personalizables.
- **Plantillas** (`src/lib/editor/page-templates.ts`): 9 categorías (SaaS, Agency, Restaurant, Portfolio, E-commerce, Real Estate, Education, Personal, Event). Cada plantilla es un `PageSchema` válido (`createTemplateSchema`) con navbar, secciones y footer, tema propio por categoría e ids únicos. `createBlankSchema` cubre "crear desde cero".
- **Flujos:** crear desde cero / desde plantilla, insertar sección (clic o arrastre a un hueco del primer nivel), preview de plantilla y de sección (render real del `PageSchema`). Las plantillas son copias editables tras la inserción.
- **Compatibilidad de versiones:** `migratePageSchema` acepta v1 (o sin versión) y rechaza v2+ con `null`; una página sin secciones pasa a ser válida (se muestra el lienzo vacío) para soportar el arranque en blanco.

### Fase 7: generación de sitios por IA

- **Capa de planificación** (`src/lib/editor/ai-site-planner.ts`): petición en lenguaje natural → prompt estructurado → el modelo devuelve **JSON puro** (nunca HTML ejecutable) → `migratePageSchema` + `repairSiteSchema` (descarta componentes desconocidos, corrige anidamiento, limpia props inválidas, URLs inseguras y estilos peligrosos). Errores tipados (`AIPlanError` con `code`).
- **Genera:** estructura del sitio, páginas, secciones, copy, configuración de componentes, tokens de tema y SEO básico.
- **Proveedor y créditos** (`src/lib/ai-site-plan.ts`): usa la abstracción de proveedores existente (server actions `proxyGemini`/`proxyOpenAIChat`/`proxyAnthropicChat`), `estimateAICredits` para el coste y `AICreditAccount`/`AICreditLedger` para cobrar solo cuando el schema es válido.
- **Coste estimado** antes de generar: `POST /api/page-composer/ai/estimate`. **Generación:** `POST /api/page-composer/ai/plan` (auth + créditos + validación). UI: botón "Generar con IA" en la barra que muestra el coste estimado y carga el schema en el editor (`loadSchema`).
- **Observabilidad:** `recordObservabilityEvent` (`ai_generation`) con éxito/error, duración, créditos y coste estimado.

### Fase 8: edición contextual por IA

- **Arquitectura:** subconjunto del `PageSchema` + id del componente + instrucción → IA → **operaciones estructuradas** (nunca código ejecutable) → validación contra el documento real → `PageSchema`.
- **Operaciones** (`src/lib/editor/ai-edit-ops.ts`): `updateProps`, `updateStyles`, `addChild`, `removeChild`, `reorderChildren`, `replaceSection`. Cada una se valida antes de aplicarse (nodos existentes, anidamiento permitido, props según el contrato, estilos seguros, permutaciones reales); lo inválido se rechaza con su motivo.
- **Planner** (`src/lib/editor/ai-edit-planner.ts`): prompt de operaciones + parse + errores tipados.
- **Servidor** (`src/lib/ai-edit.ts`) y `POST /api/page-composer/ai/edit`: créditos (estima y cobra solo si generó operaciones), proveedor existente y observabilidad.
- **UI:** botón "Editar con IA" en el chrome del nodo seleccionado → diálogo con coste estimado, ejemplos, diff de operaciones, preview (render real del resultado) y "Aplicar". Aplicar pasa por `applyAIEditOps` (validación estricta) y entra en el historial de **deshacer** (`applyAIEdit`).
- **Nunca se salta la validación:** el modelo no produce el documento final; solo operaciones que la capa pura valida una a una.

### Fase 9: versiones de borrador y publicación inmutable

- **El borrador nunca toca lo publicado:** `PageComposerProject` guarda el borrador editable y solo un **puntero** (`publishedVersionId`); la versión publicada vive en `PageComposerPublishedVersion` (inmutable, `{ siteId, version }` único).
- **Flujo de publicación** (`src/lib/publish-site-core.ts`, testeable): 1) valida el schema, 2) valida los assets (URLs de imagen seguras), 3) crea la versión inmutable, 4) apunta el sitio, 5) invalida cachés (`revalidatePath`). La impl real (`publish-site.ts`) corre todo en una **transacción Mongo**: un fallo aborta y deja la versión anterior online; el núcleo compensa borrando la versión huérfana si el apuntado falla.
- **Acciones:** Publicar / Republish / Despublicar en la barra del editor (`BuilderPublish`) y rutas `/api/page-composer/sites/[id]/publish|unpublish|publication`. La web pública (`/page-composer/website/published/[siteId]`) sirve **solo la versión inmutable**, nunca el borrador.
- **Metadata de despliegue:** histórico `deployments` por versión, fecha, autor y versión de borrador origen; observabilidad `page_composer_publish`.

### Fase 10: arquitectura multi-tenant de publicación

- **Sin proyecto Vercel por cliente:** todos los sitios viven en la misma app. El middleware (`proxy.ts`) resuelve el hostname `customer.prompstudio.com` y reescribe a `/p/<subdominio>` **antes** de Clerk y de la locale.
- **Resolución:** hostname → subdominio (`tenant-sites.ts`, edge-pura: normalización, nombres reservados, patrón) → `resolveTenantSite` (servidor, cacheado) → `publishedVersionId` → versión **inmutable** → renderer.
- **Requisitos:** subdominios únicos (índice `subdomain` único), reservados (`www`, `api`, `admin`, …), normalización (minúsculas, sin puerto/punto), sitio inválido → 404, no publicado → 404, aislamiento (solo la versión publicada; nunca el borrador), cabeceras de seguridad en la respuesta del tenant y SEO correcto (title/description/canonical).
- **Subdominio** se reserva al publicar (`reserveSubdomain`) y la web pública se revalida al publicar/despublicar.

## Consecuencias

- Publicar, persistir y editar el sitio son extensiones de `EditorProject` (slug, status, `PageSchema`), no un segundo motor: el renderizador no cambia.
- `tests/unit/page-schema.test.ts` cubre contrato, validación, seguridad y el render real (`renderToStaticMarkup`): 20/20. `tests/unit/page-schema-ops.test.ts` cubre add, move, reorder, duplicate, delete, anidación inválida, ciclos y límites: 14/14. `tests/unit/property-controls.test.ts` cubre metadatos de controles y las mutaciones del inspector: 12/12. `tests/unit/responsive.test.ts` cubre la herencia base → tablet → mobile, orígenes de override y conversión a CSS: 12/12. `tests/unit/editor-commands.test.ts` cubre la taxonomía y el historial: 4/4. `tests/unit/save-manager.test.ts` cubre debounce, carreras, reintentos y `stale`: 6/6. `tests/unit/page-sections.test.ts` y `tests/unit/page-templates.test.ts` cubren la biblioteca de secciones y las 9 plantillas como `PageSchema` válido: 20/20. `tests/unit/page-schema-migration.test.ts` cubre la compatibilidad de versiones: 5/5. `tests/unit/ai-site-planner.test.ts` cubre el planner de IA con modelo simulado: 13/13. `tests/unit/ai-edit-ops.test.ts` cubre las operaciones estructuradas de edición contextual (validación de props/estilos, anidamiento, reordenación, reemplazo y deshacer): 14/14. `tests/unit/publish-site.test.ts` cubre la publicación atómica y el rollback (schema inválido, assets, fallo de apuntado e inserción): 7/7. `tests/unit/tenant-sites.test.ts` cubre la resolución de hostname, nombres reservados, normalización y el aislamiento entre tenants (nunca se expone el borrador): 14/14.
- Pendiente fuera de alcance: edición de listas (props `list`) en el inspector, página pública con SEO y la migración de `web-page-generator-prompt.ts` a este contrato (el prompt de IA del planner ya emite `PageSchema`).
- Deuda registrada: dos warnings `@next/next/no-img-element` en el registro, coherentes con el resto del proyecto; se resolverán al migrar a `next/image`.
