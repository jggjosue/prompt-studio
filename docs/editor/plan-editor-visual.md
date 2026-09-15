# Editor visual de componentes — diagnóstico, plan y estado

Objetivo: convertir `/component-builder` en un editor visual tipo Webflow /
Framer / Builder.io **evolucionando** la implementación actual, no reescribiéndola.

---

## 1. Diagnóstico del constructor actual (medido, 10-sep-2026)

`src/app/[locale]/component-builder/component-builder-client.tsx` —
**40 124 bytes, 1 121 líneas, un solo componente cliente.**

| Aspecto | Estado real |
|---|---|
| **Arquitectura** | Un componente (`ComponentBuilderContent`) que lo hace todo: catálogo, lienzo, controles y paneles. Dentro, un `Canvas` que recibe **18 props** y elige entre **8 plantillas fijas** según `type`. |
| **Componentes existentes** | 8 plantillas (`login`, `header`, `text`, `form`, `button`, `card`, `navigation`, `sidebar`) + 5 paneles cargados con `dynamic()` (personalizador IA, exportación, biblioteca, variantes, generador de prompt). |
| **Drag & drop** | Existe, pero **solo para una lista plana de bloques** (`CompositionCanvas`, HTML5 nativo). No hay anidamiento, ni zonas de soltado dentro/entre contenedores, ni autoscroll. |
| **Gestión del estado** | **25 `useState`** en un único componente, todos escalares planos (`primary`, `radius`, `heading`, `fieldLabels`…). Ningún `useReducer`, ningún store, 2 `useMemo`, 0 `useCallback`. |
| **Limitaciones** | Sin árbol: no hay jerarquía, ni padres, ni hijos. El resultado es **una cadena de prompt**, no un documento editable. |
| **UX** | Todo cambio pasa por el panel derecho; no hay edición inline, ni selección de elementos en el lienzo, ni capas, ni atajos. |
| **Rendimiento** | Cada `setState` repinta el componente completo, lienzo incluido. Con la forma actual no hay forma de memorizar por nodo porque no hay nodos. La ruta ya pesa ~300 kB de JS. |
| **Extensibilidad** | Añadir un tipo de componente obliga a tocar `Canvas`, el conmutador de tipos, la paleta y los textos: **cuatro sitios y ningún registro**. |
| **Acoplamiento** | El lienzo conoce cada tipo por nombre; los controles conocen cada prop por nombre; el prompt se construye interpolando las mismas 18 variables. |
| **Edición** | Solo por formularios laterales. El doble clic no hace nada; no hay copiar, pegar, duplicar, bloquear ni ocultar. |
| **Responsividad** | **No existe.** Un único juego de estilos; no hay breakpoints ni sobrescrituras. |
| **Persistencia** | **Cero.** Ni `localStorage` ni API: al recargar se pierde todo. No hay autoguardado, ni versiones. |
| **Deuda técnica** | Fichero monolítico; estilos como escalares sueltos; `mode: 'template' \| 'compose'` como parche para no tocar la plantilla; sin tests del constructor antes de hoy. |

**Conclusión del diagnóstico**: el bloqueo no es la interfaz, es que **no hay
documento**. Anidamiento, historial, persistencia, responsive, componentes
reutilizables, multiselección e IA dependen todos de lo mismo: un árbol de nodos
direccionable. Por eso la primera entrega es ese árbol y no un panel nuevo.

---

## 2. Tabla de funcionalidades

Prioridad: **P0** bloquea al resto · **P1** valor alto · **P2** mejora · **P3** más adelante.
Tiempo en jornadas de una persona.

| # | Funcionalidad | ¿Existe hoy? | Problema | Mejora | Librería | Prio | Dificultad | Tiempo |
|---|---|---|---|---|---|---|---|---|
| 40 | Component registry | No | Añadir un tipo toca 4 sitios | Registro único con reglas | — | **P0** | Media | **hecho** |
| 29 | Modelo de datos / documento | No | Estado plano, sin árbol | Árbol normalizado + `schemaVersion` | — | **P0** | Alta | **hecho** |
| 12 | Undo / redo | No | Sin historial | Comandos con inverso | — | **P0** | Alta | **hecho** |
| 35 | Arquitectura de estado | No | 25 `useState` | Store por selector, 6 slices | — (`useSyncExternalStore`) | **P0** | Alta | **hecho** |
| 39 | Guardrails de anidamiento | No | Cualquier cosa dentro de cualquier cosa | `canHaveChildren`/`allowed*`/`maxChildren` | — | **P0** | Baja | **hecho** |
| 8 | Responsive por breakpoint | No | Un solo juego de estilos | Herencia desktop→mobile + overrides | — | **P0** | Media | **hecho** (modelo) |
| 1 | Drag & drop anidado | Parcial (lista plana) | Sin contenedores ni indicadores | Zonas antes/dentro/después + autoscroll | HTML5 nativo | **P0** | Alta | 3 |
| 2 | Canvas editable | No | El lienzo no es editable | Selección, bounding box, acciones rápidas | — | **P0** | Alta | 3 |
| 9 | Layers / árbol | No | No hay jerarquía visible | Panel de capas con DnD y renombrado | — | **P0** | Media | 2 |
| 5 | Panel de propiedades | Parcial | Controles fijos globales | 6 pestañas dirigidas por el registro | — | **P0** | Alta | 3 |
| 29 | Persistencia en BD | No | Se pierde al recargar | Colección + API | — | **P0** | Media | 1,5 |
| 30 | Autosave | No | — | Debounce + estados de guardado | — | **P0** | Baja | 0,5 |
| 3 | Edición inline | No | Todo por paneles | Doble clic → editar en el lienzo | — | **P1** | Media | 2 |
| 4 | Panel de componentes | Parcial | Paleta plana por tipo | Categorías, búsqueda difusa, favoritos, recientes | — | **P1** | Media | 1,5 |
| 6 | Sistema de estilos | Parcial | Escalares sin unidades | Control de unidades, vincular/desvincular | — | **P1** | Media | 2,5 |
| 7 | Flex y grid visuales | No | — | Controles gráficos | — | **P1** | Media | 2 |
| 13 | Copy / paste | No | — | Portapapeles de subárbol | — | **P1** | Baja | 0,5 |
| 14 | Atajos de teclado | No | — | Mapa de atajos + ayuda | — | **P1** | Baja | 1 |
| 17 | Multiselección | No | — | Shift+clic, marco, alinear | — | **P1** | Alta | 2,5 |
| 18 | Menú contextual | No | — | Clic derecho sobre nodo | Radix (ya está) | **P1** | Baja | 0,5 |
| 19 | Command palette | No | — | ⌘K sobre el registro | Radix + búsqueda propia | **P1** | Media | 1 |
| 20 | Búsqueda de componentes | Parcial (exacta) | No tolera errores | Difusa | — | **P1** | Baja | **hecho** |
| 15 | Zoom y pan | No | — | Pasos, ⌘+rueda, espacio+arrastrar | — | **P1** | Media | 1,5 |
| 32 | Modo preview | No | — | Oculta todo lo del editor | — | **P1** | Baja | 0,5 |
| 33 | Fullscreen y paneles | No | Layout fijo | Paneles colapsables y redimensionables | React Resizable Panels (evaluar) | **P1** | Media | 1,5 |
| 10 | Componentes reutilizables | No | — | Definiciones + instancias + overrides | — | **P2** | Alta | 3 |
| 11 | Bloques y secciones | No | — | Biblioteca de bloques como subárboles | — | **P2** | Media | 2 |
| 16 | Snap y guías | No | — | Guías inteligentes y distancias | — | **P2** | Alta | 2,5 |
| 21 | Animaciones | No | — | Editor visual de animaciones | Framer Motion (ya está) | **P2** | Media | 2 |
| 22 | Interactions | No | — | Trigger → acción | — | **P2** | Alta | 3 |
| 25 | Design tokens | Parcial (`token:` en defaults) | Sin resolución | Tokens globales + cascada | — | **P2** | Media | 2 |
| 26 | Themes | Parcial (claro/oscuro) | Valores fijos | Temas sobre tokens | next-themes (ya está) | **P2** | Baja | 1 |
| 27 | Estados de componente | Parcial (`loading`/`error`) | Ad hoc | Estados por nodo | — | **P2** | Media | 1,5 |
| 31 | Version history | No | — | Versiones con etiqueta y restaurar | — | **P2** | Media | 1,5 |
| 34 | Rendimiento a 1 000 nodos | No | Repinta todo | Selectores + memo + virtualización | TanStack Virtual (evaluar) | **P2** | Alta | 2 |
| 37 | Accesibilidad | Parcial | DnD sin alternativa completa | Teclado, ARIA, foco visible | — | **P1** | Media | 1,5 |
| 38 | Touch | No | — | Long press, áreas mayores | — | **P3** | Media | 1,5 |
| 23 | Data binding | No | — | Fuentes y expresiones | — | **P3** | Alta | 3 |
| 24 | Variables | No | — | `{{…}}` en props y estilos | — | **P3** | Media | 1,5 |
| 28 | Form builder | Parcial (bloques) | Sin validación | Validación declarativa | Zod (ya está) | **P3** | Media | 2 |
| 41 | Plugins | No | — | Registro abierto + puntos de extensión | — | **P3** | Media | 1,5 |
| 42 | Asistente de IA | Parcial (personalizador) | Devuelve escalares, no árbol | Que emita **comandos** del editor | Genkit (ya está) | **P2** | Media | 2 |
| 43 | Export | Parcial (panel) | Exporta la plantilla | React / HTML / JSON desde el árbol | — | **P2** | Media | 2 |
| 44 | Seguridad de HTML/CSS propio | No | `embed` sin sanear | Sanear y aislar | DOMPurify (evaluar) | **P1** | Media | 1 |

---

## 3. Decisiones de librerías

### Drag & drop: **seguir con HTML5 nativo**, no dnd-kit (por ahora)

- **Qué resolvería dnd-kit**: colisiones, sensores de teclado, autoscroll y
  ordenación en listas, ya resueltos y probados.
- **Por qué no ahora**: el arrastre desde la paleta al lienzo ya funciona con la
  API nativa, que además da gratis el arrastre desde fuera del documento. La
  ruta ya carga ~300 kB de JS y dnd-kit (core + sortable) añade ~30 kB. Y la
  alternativa por teclado hay que construirla igual, porque el diseño exige no
  depender del arrastre: teniéndola, el sensor de teclado de dnd-kit aporta poco.
- **Cuándo cambiar**: cuando entre **multiselección arrastrable** o arrastre
  entre contenedores con scroll propio. Ahí la detección de colisiones propia
  deja de ser razonable. El contrato de arrastre está aislado en
  `src/components/builder/block-drag.ts`, que es el único fichero que habría que
  sustituir.

### Estado: **`useSyncExternalStore`**, no Zustand

- **Qué hace falta**: suscripción por selector, para que mover un nodo no
  re-renderice los otros 999.
- **Por qué no Zustand**: eso ya lo da React 19 de serie. Zustand (1,2 kB)
  aportaría azúcar y middlewares (`persist`, `devtools`) que hoy no se usan.
- **Cuándo cambiar**: si hacen falta middlewares o *transient updates* durante el
  arrastre. `src/lib/editor/store.ts` es la única pieza a reemplazar y expone la
  misma forma (`getState`/`subscribe`/selector).

### Ya en el proyecto, a reutilizar antes que añadir

Radix (menús, popovers, pestañas), Framer Motion (animaciones), Lucide (iconos),
Zod (validación), next-themes (temas), Recharts (`chart`).

### A evaluar cuando toque su fase

React Resizable Panels (§33), TanStack Virtual (§34, solo si el árbol de capas
pasa de ~300 nodos visibles), DOMPurify (§44, obligatorio antes de permitir
`embed`), Tiptap (§3, solo si se quiere texto rico de verdad).

---

## 4. Fases

### FASE 1 — Núcleo del editor

**Estado: la base ya está implementada y probada (23 tests).**

| | |
|---|---|
| **Ficheros nuevos** | `src/lib/editor/registry.ts` (282 líneas) · `document.ts` (427) · `history.ts` (213) · `store.ts` (217) · `tests/unit/editor-core.test.ts` (23 tests) |
| **Cambios de arquitectura** | El documento pasa a ser un **árbol normalizado** (`nodes: Record<id, node>` + `children: id[]`). Toda escritura entra por `store.run(command)`. El registro es la única fuente de tipos y reglas. |
| **Dependencias nuevas** | **ninguna** |
| **Estado global** | 6 slices separados: `document`, `selection`, `editor`, `ui`, `history`, `runtime` |
| **Modelo de datos** | `EditorDocument { schemaVersion, rootId, nodes, definitions }`; estilos por breakpoint con herencia |
| **Migraciones** | `migrateDocument()` con `schemaVersion` desde la v1; rechaza documentos de versión futura |
| **Tests** | Reglas de anidamiento, ciclos, reordenado, borrar/restaurar, duplicar sin referencias compartidas, envolver, herencia y overrides de estilos, ida y vuelta completa de deshacer/rehacer, tope del historial, store y migración |
| **Riesgos** | Convivir dos modelos (plantilla actual + documento nuevo) mientras dure la migración de la interfaz |
| **Pendiente de la fase** | Lienzo sobre el documento, panel de capas, panel de propiedades por registro, persistencia + autosave |
| **Definition of Done** | Insertar, mover, anidar, seleccionar, deshacer y guardar funcionando sobre el árbol, con la plantilla actual intacta detrás de su conmutador |

### FASE 2 — Estilado visual

| | |
|---|---|
| **Ficheros** | `src/components/builder/inspector/*` (spacing, typography, color, border, shadow, layout), `src/lib/editor/units.ts`, `tokens.ts` |
| **Arquitectura** | Los controles escriben **comandos** `setStyles` con breakpoint; nunca tocan el DOM. Los valores admiten `px/%/rem/em/vw/vh/auto` y `token:*` |
| **Dependencias** | ninguna |
| **Estado** | `editor.breakpoint` ya existe; se añade `editor.styleTab` |
| **Modelo** | `NodeStyles` ya soporta breakpoints; los tokens entran como documento aparte para poder cambiarlos en cascada |
| **Migraciones** | ninguna (los estilos ya son por breakpoint) |
| **Tests** | Conversión de unidades, vincular/desvincular spacing, resolución de tokens, marca de sobrescritura |
| **Riesgos** | Mezclar `token:*` con valores literales en el mismo campo |
| **DoD** | Editar spacing, tipografía, color, borde, sombra, flex y grid por breakpoint, con indicador de sobrescritura |

### FASE 3 — Productividad

| | |
|---|---|
| **Ficheros** | `src/lib/editor/clipboard.ts`, `shortcuts.ts`, `src/components/builder/command-palette.tsx`, `context-menu.tsx`, `src/lib/editor/reusable.ts` |
| **Arquitectura** | Portapapeles en memoria + `navigator.clipboard` con subárbol serializado; atajos en un mapa declarativo, no `keydown` sueltos |
| **Dependencias** | Radix (ya está) para menú contextual y diálogo de la paleta |
| **Estado** | `runtime.clipboard`, `ui.palette` |
| **Modelo** | `definitions` del documento pasa a usarse: instancias con `instanceOf.overrides` |
| **Migraciones** | ninguna (el campo ya existe en la v1) |
| **Tests** | Pegar preserva estilos y props; multiselección; instancias y `detach`; cada atajo |
| **Riesgos** | Colisión de atajos con el navegador; foco dentro de campos de texto |
| **DoD** | ⌘C/⌘V/⌘D, multiselección, ⌘K, clic derecho y componentes reutilizables con overrides |

### FASE 4 — Avanzado

| | |
|---|---|
| **Ficheros** | `src/lib/editor/interactions.ts`, `animations.ts`, `bindings.ts`, `variables.ts` |
| **Arquitectura** | Interacciones y animaciones como **datos** en el nodo, no como código; el runtime las interpreta |
| **Dependencias** | Framer Motion (ya está) |
| **Estado** | `runtime.previewInteractions` |
| **Modelo** | `node.interactions[]`, `node.animations[]`, `node.bindings{}` → **`schemaVersion: 2`** |
| **Migraciones** | v1→v2: añadir arrays vacíos; `migrateDocument` ya tiene el interruptor |
| **APIs** | `POST /api/editor/resolve-binding` para fuentes de datos con secreto |
| **Tests** | Serialización de interacciones, resolución de variables, ciclos en bindings |
| **Riesgos** | Ejecución arbitraria en bindings y embeds: sanear antes de pintar (§44) |
| **DoD** | Trigger→acción sin código, animaciones con duración/delay/easing, y `{{variable}}` en props |

### FASE 5 — IA

| | |
|---|---|
| **Ficheros** | `src/ai/flows/editor-commands.ts`, `src/app/api/editor/ai/route.ts` |
| **Arquitectura** | La IA **no genera HTML**: emite un array de `EditorCommand` que pasa por el mismo `store.run`, y por tanto por las mismas reglas de anidamiento y por el historial. Una generación mala se deshace con ⌘Z |
| **Dependencias** | Genkit (ya está) |
| **Estado** | `runtime.aiPending` |
| **Modelo** | ninguno nuevo: los comandos ya son datos serializables |
| **APIs** | `POST /api/editor/ai` con el árbol y la instrucción; devuelve comandos validados con Zod y **plan premium**, como el resto de rutas del constructor |
| **Tests** | Comandos inválidos se rechazan sin tocar el documento; «crea una sección de precios con tres planes» produce un árbol que cumple las reglas |
| **Riesgos** | Comandos masivos: aplicar en una sola transacción con un único punto de deshacer |
| **DoD** | Generar y modificar secciones por lenguaje natural, deshacer en un paso, sin salirse del árbol |

---

## 5. Lo implementado hoy

```
src/lib/editor/registry.ts   40 tipos en 7 categorías, reglas de anidamiento, búsqueda difusa
src/lib/editor/document.ts   árbol normalizado, breakpoints con herencia, migración versionada
src/lib/editor/history.ts    comandos con inverso, tope de 100, invalidación de rehacer
src/lib/editor/store.ts      6 slices, escritura única por comando, selectores
tests/unit/editor-core.test.ts   23 tests, todos en verde
```

Nada de esto ha cambiado todavía la interfaz: la plantilla y el modo Composición
actuales siguen funcionando igual. Es deliberado — la base entra primero, sin
tocar lo que ya usa la gente.

**Siguiente paso**: el lienzo sobre el documento (`EditorCanvas`), el panel de
capas y la persistencia, que son el resto de la Fase 1.
