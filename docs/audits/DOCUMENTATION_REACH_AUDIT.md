# DOC-001 — Auditoría de Documentation Reach

**Fecha:** 2026-09-15  
**Backlog:** [DOC-001](https://github.com/jggjosue/prompt-studio/issues/33) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)  
**Línea base histórica de Swimm:** 3 de 575 archivos y 0% de 75,995 líneas.

## Propósito y método

Esta auditoría no usa el número histórico como si describiera el árbol actual:
las fases previas ya añadieron enlaces locales. En cambio, registra el corpus de
nueve documentos técnicos prioritarios, su propósito, sus rutas de código
enlazadas y los huecos explicativos que continúan abiertos.

Se consideró una referencia útil cuando un enlace Markdown local apunta a un
archivo o directorio bajo `src/` o `scripts/`. Un nombre de archivo escrito como
texto no cuenta como enlace navegable. El conteo es de enlaces, no de archivos
únicos; [`CODEBASE_MAP.md`](../CODEBASE_MAP.md) es un inventario generado y no
una explicación arquitectónica de cada archivo.

## Corpus prioritario

| Documento | Qué explica | Enlaces de código directos | Estado de navegación | Huecos a tratar |
|---|---|---:|---|---|
| [README.md](../../README.md) | Producto, comandos y puntos de entrada para contribuidores | 0 | Índice documental, no guía de implementación | Estructura de código y bootstrap: [DOC-006](https://github.com/jggjosue/prompt-studio/issues/38), [DOC-007](https://github.com/jggjosue/prompt-studio/issues/39) |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Capas, request lifecycle, seguridad, IA y editor | 22 | Enlaza capas y módulos centrales | Convertir los flujos restantes en feature docs: [DOC-004](https://github.com/jggjosue/prompt-studio/issues/36), [DOC-014](https://github.com/jggjosue/prompt-studio/issues/46) |
| [AI_ARCHITECTURE.md](../AI_ARCHITECTURE.md) | Jobs, proveedores, créditos y contratos de salida | 10 | Flujo crítico enlazado | Flujos UI y rutas que inician cada generación: [DOC-008](https://github.com/jggjosue/prompt-studio/issues/40), [DOC-010](https://github.com/jggjosue/prompt-studio/issues/42) |
| [DATABASE.md](../DATABASE.md) | Conexión Mongo, modelos, colecciones e índices | 58 | Modelos y conector enlazados | Ownership, migración y módulos de acceso de cada feature: [DOC-010](https://github.com/jggjosue/prompt-studio/issues/42), [DOC-014](https://github.com/jggjosue/prompt-studio/issues/46) |
| [API_ACCESS.md](../API_ACCESS.md) | Matriz generada de autorización de rutas | 121 | Cada fila llega a su handler | Semántica de servicio, clientes y contratos: [DOC-010](https://github.com/jggjosue/prompt-studio/issues/42) |
| [CODEBASE_MAP.md](../CODEBASE_MAP.md) | Inventario generado de fuente | 680 | Cobertura de inventario | Carece de agrupación por responsabilidad: [DOC-002](https://github.com/jggjosue/prompt-studio/issues/34), [DOC-003](https://github.com/jggjosue/prompt-studio/issues/35) |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Build, variables, despliegue y operación | 0 | Referencias operativas, sin código navegable | Configuración, build y entry points: [DOC-007](https://github.com/jggjosue/prompt-studio/issues/39), [DOC-013](https://github.com/jggjosue/prompt-studio/issues/45) |
| [SECURITY.md](../SECURITY.md) | Secretos, acceso, producto pago y dependencias | 0 | Política, sin implementación enlazada | Guards, middleware y handlers de webhook: [DOC-007](https://github.com/jggjosue/prompt-studio/issues/39), [DOC-010](https://github.com/jggjosue/prompt-studio/issues/42) |
| [TESTING.md](../TESTING.md) | Suite, cobertura y ejecución de pruebas | 1 | Un script de cobertura enlazado | Contratos de tests por feature y configuración: [DOC-013](https://github.com/jggjosue/prompt-studio/issues/45), [DOC-016](https://github.com/jggjosue/prompt-studio/issues/48) |

## Áreas con referencia insuficiente

Aunque el inventario generado lista gran parte del árbol, las siguientes áreas
no tienen todavía una explicación navegable proporcional a su importancia:

1. **Estructura y bootstrap:** [`src/proxy.ts`](../../src/proxy.ts),
   [`src/app`](../../src/app), [`src/i18n`](../../src/i18n) y configuración
   global no están conectados desde el README.
2. **Estado y hooks compartidos:** [`src/hooks`](../../src/hooks) y los stores
   de [`src/lib/editor`](../../src/lib/editor) necesitan una guía por
   responsabilidad, no solo una lista de rutas.
3. **Features de interfaz:** [`src/components`](../../src/components) y las
   páginas bajo [`src/app/[locale]`](../../src/app/[locale]) requieren mapas por
   feature que expliquen sus dependencias.
4. **Servicios transversales:** [`src/lib`](../../src/lib) contiene autenticación,
   Stripe, caché, generación, rate limiting y acceso a datos que necesitan un
   mapa de servicio a API.
5. **Configuración y entrega:** archivos como
   [`next.config.ts`](../../next.config.ts),
   [`eslint.config.mjs`](../../eslint.config.mjs),
   [`tsconfig.json`](../../tsconfig.json) y
   [`.github/workflows`](../../.github/workflows) deben estar enlazados desde
   guías de desarrollo y despliegue.

## Decisiones de alcance

- Los catálogos bajo [`src/data`](../../src/data), resultados de pruebas y
  scripts auxiliares siguen fuera del objetivo de documentación individual,
  conforme a [`.swmignore`](../../.swmignore).
- Los documentos de política, historial y material de referencia no se cuentan
  como sustitutos de una guía que lleve a la implementación.
- El siguiente indicador automatizado debe distinguir **inventario enlazado** de
  **cobertura explicativa**, para no confundir un índice masivo con comprensión
  de arquitectura; véanse [DOC-018](https://github.com/jggjosue/prompt-studio/issues/50)
  y [DOC-019](https://github.com/jggjosue/prompt-studio/issues/51).

## Próximos pasos

La secuencia P0 queda confirmada: [DOC-002](https://github.com/jggjosue/prompt-studio/issues/34),
[DOC-003](https://github.com/jggjosue/prompt-studio/issues/35),
[DOC-006](https://github.com/jggjosue/prompt-studio/issues/38),
[DOC-007](https://github.com/jggjosue/prompt-studio/issues/39) y
[DOC-008](https://github.com/jggjosue/prompt-studio/issues/40). La medición
posterior debe compararse con el baseline histórico, sin declarar éxito hasta
que Swimm publique la nueva evaluación.
