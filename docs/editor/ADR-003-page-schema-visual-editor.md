# ADR-003: Canvas visual y mutaciones deterministas de PageSchema

**Estado:** Accepted  
**Fecha:** 2026-09-29  
**Ruta de producto:** `/page-composer`

## Decisión

El canvas visual edita `PageSchema` directamente. El estado React local del workspace es la única fuente de verdad durante una sesión: la biblioteca, el árbol del canvas, la selección, la vista responsive y el inspector leen el mismo objeto. No existe un DOM editable paralelo ni se reconstruye HTML para representar los cambios.

El editor usa las dependencias mantenidas que ya existían en el proyecto: `@dnd-kit/core`, `@dnd-kit/sortable` y `@dnd-kit/utilities`. `PointerSensor` cubre puntero/touch y `KeyboardSensor` usa `sortableKeyboardCoordinates`. Todas las operaciones importantes también tienen botones, de modo que añadir, mover, duplicar y borrar no dependen exclusivamente de arrastrar.

## Layout

- barra superior: nombre, contadores, viewport y vista previa;
- izquierda: las definiciones del `ComponentRegistry` como biblioteca;
- centro: secciones y componentes renderizados desde `PageSchema`;
- derecha: inspector dinámico conectado a la selección actual y al registro;
- pie: estado y anuncios accesibles de cada operación.

La selección, el elemento arrastrado, las zonas de drop válidas, los destinos rechazados y el canvas vacío tienen estados visuales independientes.

## Mutaciones

`src/lib/page-builder/editor-mutations.ts` contiene funciones puras que reciben un schema y devuelven un schema nuevo o un error tipado:

| Acción | Mutación |
| --- | --- |
| Añadir desde biblioteca | `insertComponent` |
| Mover/reparentar | `moveComponent` |
| Reordenar hermanos | `moveComponentByOffset` |
| Reordenar secciones | `reorderSection` / `moveSectionByOffset` |
| Duplicar subárbol | `duplicateComponent` |
| Borrar subárbol | `deleteComponent` |

Los índices se acotan, los IDs se generan de forma predecible y cada resultado pasa por `validatePageSchema`. Un componente no puede entrar en un padre que no lo admita ni moverse dentro de uno de sus descendientes. La duplicación crea IDs nuevos para todo el subárbol y no comparte referencias mutables con el original.

## Drag-and-drop y persistencia

Los eventos de movimiento del puntero solo actualizan indicadores efímeros (`active`, `over` e `invalid`). El schema cambia una sola vez en `onDragEnd`. Esta fase no escribe en MongoDB ni llama a la API de proyectos, por lo que nunca persiste cada movimiento del puntero.

Cuando se conecte el guardado, deberá recibir el `PageSchema` validado después de una mutación confirmada y aplicar debounce o un comando explícito. El endpoint debe conservar las comprobaciones existentes de sesión, entitlement, ownership, rate limit y tamaño.

## Evolución

El panel derecho genera controles a partir de `editableProperties`, `styleControls` y `responsive` del registro; ADR-004 documenta ese contrato. Historial, autosave y futuras acciones de IA deberán invocar las mismas mutaciones (o patches estructurados equivalentes), validar el resultado y nunca introducir HTML o JavaScript arbitrarios.
