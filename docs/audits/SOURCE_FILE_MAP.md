# DOC-002 — Mapa de archivos fuente

**Fecha:** 2026-09-15  
**Backlog:** [DOC-002](https://github.com/jggjosue/prompt-studio/issues/34) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

## Alcance de esta clasificación

El árbol actual contiene **680 archivos de implementación TypeScript/TSX**. No
coincide con la línea base histórica de Swimm (575 archivos): esa medida se
tomó antes de los cambios actuales y usa su propio alcance. Este mapa fija el
alcance reproducible para las tareas siguientes: **678 archivos** merecen
consideración de documentación manual; dos módulos de `src/data/` se excluyen
por la misma política que sus catálogos estáticos.

El detalle archivo por archivo sigue en el inventario generado
[`CODEBASE_MAP.md`](../CODEBASE_MAP.md). Este documento añade responsabilidad,
prioridad de navegación y tratamiento de cobertura.

## Mapa por responsabilidad

| Área | Rutas | Archivos TS/TSX | Responsabilidad | Tratamiento documental |
|---|---|---:|---|---|
| API | [`src/app/api`](../../src/app/api) | 105 | Handlers HTTP, autorización y orquestación | Documentar por dominio y endpoint; no una guía por handler trivial |
| UI localizada | [`src/app/[locale]`](../../src/app/[locale]) | 166 | Páginas, layouts y clientes de cada feature | Documentar por feature y enlazar sus entry points |
| Server actions | [`src/app/actions`](../../src/app/actions) | 2 | Mutaciones llamadas desde UI | Documentar junto con la feature dueña |
| Sitios y rutas raíz | [`src/app/sites`](../../src/app/sites), [`src/app/actions.ts`](../../src/app/actions.ts), [`src/app/fonts.ts`](../../src/app/fonts.ts), [`src/app/robots.ts`](../../src/app/robots.ts), [`src/app/sitemap.ts`](../../src/app/sitemap.ts) | 5 | Bootstrap, SEO y acciones compartidas | Enlazar desde entry points y configuración |
| Componentes | [`src/components`](../../src/components) | 156 | UI reutilizable y componentes de dominio | Cubrir por feature, editor y componentes compartidos |
| Servicios y utilidades | [`src/lib`](../../src/lib) | 155 | Dominio, proveedores, persistencia, caché y guards | Agrupar por servicio, no por helper |
| Modelos | [`src/models`](../../src/models) | 45 | Esquemas Mongoose, índices y colecciones | Documentar desde persistencia y feature dueña |
| Hooks | [`src/hooks`](../../src/hooks) | 30 | Estado y comportamiento reutilizable de cliente | Documentar solo hooks transversales |
| IA | [`src/ai`](../../src/ai) | 7 | Genkit, flujos y servidor de desarrollo | Documentar como flujo crítico completo |
| Internacionalización | [`src/i18n`](../../src/i18n) | 3 | Detección de idioma y configuración | Enlazar desde routing y bootstrap |
| Runtime raíz | [`src/proxy.ts`](../../src/proxy.ts), [`src/middleware.ts`](../../src/middleware.ts), [`src/instrumentation.ts`](../../src/instrumentation.ts), [`src/types.d.ts`](../../src/types.d.ts) | 4 | Proxy, middleware, instrumentación y tipos globales | Alta prioridad: documentar como entry points |
| Datos de producto | [`src/data`](../../src/data) | 2 TS + 17 JSON | Catálogos y datos de producto | Excluido de documentación individual; documentar pipeline, no registros |
| **Total** | [`src`](../../src) | **680** | — | **678 en alcance manual; 2 excluidos** |

## Exclusiones explícitas

| Exclusión | Motivo | Evidencia |
|---|---|---|
| `src/data/` | Catálogos estáticos y fuentes de producto; se documenta el pipeline, no cada JSON | [`.swmignore`](../../.swmignore) |
| `public/webpages/` | Demos y plantillas estáticas masivas | [`.swmignore`](../../.swmignore) |
| `tests/`, `test-results/`, `coverage/` | Verificación y artefactos generados | [`.swmignore`](../../.swmignore) |
| `scripts/` | Automatización de mantenimiento; solo scripts con contrato operativo | [`.swmignore`](../../.swmignore) |
| `.next/`, `build/`, `dist/`, `out/` | Salida generada y cachés | [`.swmignore`](../../.swmignore) |
| Fuentes, favicon y CSS global | Activos o configuración visual sin comportamiento independiente | [`src/fonts`](../../src/fonts), [`src/app/globals.css`](../../src/app/globals.css) |

## Reglas de priorización

1. Documentar primero entry points, servicios compartidos, APIs, modelos y flujos entre capas.
2. Para UI, enlazar páginas y componentes representativos desde una guía de feature en lugar de repetir contexto en 166 archivos.
3. Para utilidades y hooks, exigir reutilización transversal o una decisión de diseño relevante antes de crear documentación dedicada.
4. Cada documento nuevo debe indicar archivos relacionados; la convención se formalizará en [DOC-015](https://github.com/jggjosue/prompt-studio/issues/47).

## Cómo refrescar el conteo

Ejecuta el siguiente comando desde la raíz. DOC-019 reemplazará este conteo
manual por una métrica de Documentation Reach completa.

```bash
rg --files src -g '*.ts' -g '*.tsx' | wc -l
```

## Siguientes tareas

Este mapa habilita [DOC-003](https://github.com/jggjosue/prompt-studio/issues/35)
para ordenar archivos por impacto, y da estructura a
[DOC-005](https://github.com/jggjosue/prompt-studio/issues/37),
[DOC-009](https://github.com/jggjosue/prompt-studio/issues/41),
[DOC-010](https://github.com/jggjosue/prompt-studio/issues/42) y
[DOC-011](https://github.com/jggjosue/prompt-studio/issues/43).
