# ADR-001: Editor visual estructurado para Page Composer

**Estado:** Accepted  
**Fecha:** 2026-09-10  
**Decisores:** Prompt Studio engineering

## Contexto

La ruta `/page-composer` usaba una lista plana de bloques con previews y estado local. Ese enfoque era adecuado para componer secciones prediseñadas, pero impedía anidamiento, estilos por breakpoint, guardado editable y operaciones fiables de undo/redo. El repositorio ya dispone de un núcleo de editor independiente: documento normalizado, registro, historial por comandos, dnd-kit, autosave y API protegida.

## Decisión

La ruta monta `page-composer-editor-client.tsx`, que carga `EditorWorkspace`. El documento normalizado es la fuente de verdad. El compositor anterior queda aislado para no meter su catálogo y previews en el bundle del nuevo editor mientras se migra su flujo de exportación.

No se añaden dependencias: `@dnd-kit` ya está instalado y cubre drag desde biblioteca, reordenamiento, drop zones, indicadores y alternativa por teclado/capas. El store externo con `useSyncExternalStore` evita introducir Zustand antes de necesitar middleware o devtools.

## Diagnóstico y plan

| Funcionalidad | Existía | Problema | Mejora | Librería | Prioridad | Dificultad | Estimación |
|---|---|---|---|---|---|---|---|
| Documento | Lista plana | Sin hijos ni migración | Árbol normalizado versionado | Ninguna | P0 | Media | Hecho |
| Drag/drop | Reordenamiento plano | Sin contenedores ni reglas | Drop entre padres, zonas e indicadores | dnd-kit existente | P0 | Alta | Hecho |
| Selección/edición | Bloque completo | No era edición de componente | Overlay, inline text, acciones rápidas | Ninguna | P0 | Media | Hecho |
| Inspector | Campos fijos | Acoplado a cada bloque | Tabs y estilos por breakpoint | Ninguna | P0 | Alta | Hecho |
| Capas | Lista plana | Sin árbol ni accesibilidad alternativa | Árbol renombrable, mover, ocultar, bloquear | Ninguna | P0 | Media | Hecho |
| Historial/persistencia | Snapshots locales | Sin autosave ni escala | Comandos inversos + debounce + API | Ninguna | P0 | Media | Hecho |
| Flex/Grid/tokens | Global limitado | Sin herencia responsive | Controles visuales y tokens | Ninguna | P1 | Alta | Parcial |
| Productividad | Básica | Sin paleta de comandos o grupos | Clipboard, multiselect, palette y reusable | Ninguna | P2 | Alta | Parcial |
| Runtime avanzado | No | Sin interacción, datos ni animación | Esquema y runtime desacoplados | Evaluar según fase | P3 | Alta | Pendiente |
| IA/exportación | Prompt desconectado | No modifica el documento | Patches validados sobre el árbol | Ninguna inicialmente | P4 | Alta | Pendiente |

## Arquitectura por fases

1. **Core (entregado):** `src/lib/editor/*`, `src/components/editor/*`, `src/hooks/use-editor-autosave.ts`, API y `EditorProject`. Document, editor, selection, history, UI y runtime están separados.
2. **Visual styling:** completar Grid (spans/auto-flow), guías/snap y estados visuales. Extender `NodeStyles`; no cambiar la forma del documento.
3. **Productividad:** grupo, context menu, command palette y reusable instances. Añadir comandos a `history.ts` y no mutaciones directas.
4. **Advanced:** `interactions`, `bindings` y `variables` como campos versionados de nodo; sanitizar embeds y CSS al ejecutar/exportar.
5. **AI:** traducir lenguaje natural a patches validados con `registry.ts`; nunca insertar HTML arbitrario.

## Modelo y migraciones

`EditorDocument` contiene `schemaVersion`, `rootId`, `nodes` y `definitions`. Cada nodo conserva `props`, `styles` por breakpoint, hijos y relación de padre. Las migraciones entran por `migrateDocument`, antes de montar o persistir. La API limita nodos y versiones y requiere sesión y plan autorizado.

## Riesgos y Definition of Done

- Los cambios de fase no deben romper documentos con versiones anteriores.
- Las operaciones estructurales deben validar `allowedParents`, `allowedChildren`, `canHaveChildren` y ciclos.
- Cambiar un nodo no debe re-renderizar nodos no afectados.
- Todo control de drag debe tener alternativa de teclado/capas y foco visible.
- Las pruebas de documento, historial, registro y breakpoints deben continuar pasando; añadir tests de migración para cada versión nueva.
