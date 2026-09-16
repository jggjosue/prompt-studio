# DOC-005 — Mapa de documentación a código

**Fecha:** 2026-09-15  
**Backlog:** [DOC-005](https://github.com/jggjosue/prompt-studio/issues/37) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

## Propósito y uso

Este mapa permite partir de un subsistema documentado y llegar a sus archivos
de implementación. No sustituye el inventario exhaustivo de
[DOC-002 — Source File Map](SOURCE_FILE_MAP.md): mantiene solo los entry points
y contratos que un mantenedor necesita abrir para entender o modificar un
subsistema.

Cuando se añade un subsistema, ruta transversal o contrato compartido, se debe
actualizar su fila —o crear una nueva— en el mismo pull request. La prioridad
de qué explicar primero se decide con
[DOC-003 — High-Impact Source Priorities](HIGH_IMPACT_SOURCE_PRIORITIES.md).

## Mapa de subsistemas

| Documentación | Subsistema | Implementación navegable |
|---|---|---|
| [README.md](../../README.md) | Bootstrap y estructura de la aplicación | [`package.json`](../../package.json), [`src/proxy.ts`](../../src/proxy.ts), [`src/app/[locale]`](<../../src/app/[locale]>), [`src/components`](../../src/components) |
| [Runtime entry points](RUNTIME_ENTRY_POINTS.md) | Bootstrap, routing, providers, configuración global y metadatos | [`src/middleware.ts`](../../src/middleware.ts), [`src/proxy.ts`](../../src/proxy.ts), [`src/app/[locale]/layout.tsx`](<../../src/app/[locale]/layout.tsx>), [`next.config.ts`](../../next.config.ts), [`src/instrumentation.ts`](../../src/instrumentation.ts) |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Capas, ciclo de request, fronteras y caché | [`src/proxy.ts`](../../src/proxy.ts), [`src/app/api`](../../src/app/api), [`src/lib`](../../src/lib), [`src/models`](../../src/models), [`next.config.ts`](../../next.config.ts) |
| [AI_ARCHITECTURE.md](../AI_ARCHITECTURE.md) | Cola de IA, proveedores, créditos y contratos de salida | [`src/app/api/ai/jobs/route.ts`](../../src/app/api/ai/jobs/route.ts), [`src/app/api/ai/jobs/process/route.ts`](../../src/app/api/ai/jobs/process/route.ts), [`src/lib/ai-job-service.ts`](../../src/lib/ai-job-service.ts), [`src/lib/ai-job-runner.ts`](../../src/lib/ai-job-runner.ts), [`src/lib/generation`](../../src/lib/generation), [`src/models/AIGenerationJob.ts`](../../src/models/AIGenerationJob.ts) |
| [DATABASE.md](../DATABASE.md) | Conexión MongoDB, colecciones, índices y modelos | [`src/lib/mongoose.ts`](../../src/lib/mongoose.ts), [`src/models`](../../src/models), [`src/models/AICreditLedger.ts`](../../src/models/AICreditLedger.ts), [`src/models/EditorProject.ts`](../../src/models/EditorProject.ts) |
| [API_ACCESS.md](../API_ACCESS.md) | Autorización, handlers y validación de acceso por ruta | [`src/app/api`](../../src/app/api), [`src/lib/api-auth.ts`](../../src/lib/api-auth.ts), [`src/lib/admin-auth.ts`](../../src/lib/admin-auth.ts), [`src/lib/rate-limit.ts`](../../src/lib/rate-limit.ts), [`scripts/mjs/build-route-access-matrix.mjs`](../../scripts/mjs/build-route-access-matrix.mjs) |
| [Services and APIs](../playbooks/SERVICES_AND_APIS.md) | Fronteras HTTP, servicios, adapters y contratos de IA, editor, comercio, afiliados y plataforma | [`src/app/api`](../../src/app/api), [`src/lib`](../../src/lib), [`src/models`](../../src/models), [`src/lib/mongoose.ts`](../../src/lib/mongoose.ts) |
| [SECURITY.md](../SECURITY.md) | Frontera de rutas, secretos, webhooks y producto protegido | [`src/proxy.ts`](../../src/proxy.ts), [`src/middleware.ts`](../../src/middleware.ts), [`src/app/api/webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts), [`src/app/api/webhooks/clerk/route.ts`](../../src/app/api/webhooks/clerk/route.ts), [`next.config.ts`](../../next.config.ts) |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Build, entorno, headers y despliegue | [`package.json`](../../package.json), [`next.config.ts`](../../next.config.ts), [`vercel.json`](../../vercel.json), [`.env.example`](../../.env.example), [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml) |
| [TESTING.md](../TESTING.md) | Cobertura, contratos y configuración de pruebas | [`scripts/mjs/build-coverage-report.mjs`](../../scripts/mjs/build-coverage-report.mjs), [`tests/unit/route-access-matrix.test.ts`](../../tests/unit/route-access-matrix.test.ts), [`package.json`](../../package.json), [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml) |
| [CONTRIBUTING.md](../../CONTRIBUTING.md) | Flujo de contribución y verificaciones locales | [`package.json`](../../package.json), [`eslint.config.mjs`](../../eslint.config.mjs), [`scripts/mjs/check-env-example.mjs`](../../scripts/mjs/check-env-example.mjs), [`scripts/mjs/check-node-version.mjs`](../../scripts/mjs/check-node-version.mjs) |
| [Authentication playbook](../playbooks/AUTHENTICATION.md) | Sesión, locale, guards y administración | [`src/proxy.ts`](../../src/proxy.ts), [`src/i18n/request.ts`](../../src/i18n/request.ts), [`src/lib/server-subscription-status.ts`](../../src/lib/server-subscription-status.ts), [`src/lib/marketplace-admin.ts`](../../src/lib/marketplace-admin.ts) |
| [AI Generation playbook](../playbooks/AI_GENERATION.md) | Inicio, proceso y resultado de una generación | [`src/app/api/ai/jobs/route.ts`](../../src/app/api/ai/jobs/route.ts), [`src/app/api/ai/jobs/[id]/progress/route.ts`](../../src/app/api/ai/jobs/[id]/progress/route.ts), [`src/lib/ai-job-config.ts`](../../src/lib/ai-job-config.ts), [`src/models/AICreditAccount.ts`](../../src/models/AICreditAccount.ts) |
| [Primary generation flow](../playbooks/PRIMARY_GENERATION_FLOW.md) | UI, estado, adaptador, server action y ejecución durable de imágenes, videos y webs | [`src/hooks/use-generation-editor.ts`](../../src/hooks/use-generation-editor.ts), [`src/lib/generation/provider-adapters.ts`](../../src/lib/generation/provider-adapters.ts), [`src/app/actions.ts`](../../src/app/actions.ts), [`src/app/api/ai/jobs`](../../src/app/api/ai/jobs) |
| [Data Persistence playbook](../playbooks/DATA_PERSISTENCE.md) | Persistencia compartida y dominios de datos | [`src/lib/mongoose.ts`](../../src/lib/mongoose.ts), [`src/models`](../../src/models), [`src/models/CreativeProject.ts`](../../src/models/CreativeProject.ts), [`src/models/MarketplaceListing.ts`](../../src/models/MarketplaceListing.ts) |
| [Visual Editor playbook](../playbooks/VISUAL_EDITOR.md) | Documento, store, historial, UI y persistencia del editor | [`src/lib/editor/document.ts`](../../src/lib/editor/document.ts), [`src/lib/editor/registry.ts`](../../src/lib/editor/registry.ts), [`src/lib/editor/store.ts`](../../src/lib/editor/store.ts), [`src/lib/editor/history.ts`](../../src/lib/editor/history.ts), [`src/components/editor`](../../src/components/editor), [`src/app/api/editor/projects/route.ts`](../../src/app/api/editor/projects/route.ts) |
| [Priority feature components](../playbooks/PRIORITY_FEATURE_COMPONENTS.md) | Component Builder, Page Composer, editor, biblioteca y generación con sus dependencias | [`src/components/editor`](../../src/components/editor), [`src/hooks/use-editor-autosave.ts`](../../src/hooks/use-editor-autosave.ts), [`src/hooks/use-component-library.ts`](../../src/hooks/use-component-library.ts), [`src/components/generation`](../../src/components/generation) |
| [State Management playbook](../playbooks/STATE_MANAGEMENT.md) | Stores reactivos (`useSyncExternalStore`), contextos, cachés de sesión y cachés LRU en servidor | [`src/lib/editor/store.ts`](../../src/lib/editor/store.ts), [`src/components/editor/editor-store-context.tsx`](../../src/components/editor/editor-store-context.tsx), [`src/components/subscription-status-provider.tsx`](../../src/components/subscription-status-provider.tsx), [`src/components/saved-items-provider.tsx`](../../src/components/saved-items-provider.tsx), [`src/lib/lru-cache-store.ts`](../../src/lib/lru-cache-store.ts) |
| [Stripe Payments playbook](../playbooks/STRIPE_PAYMENTS.md) | Webhook, créditos, suscripción y checkout | [`src/app/api/webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts), [`src/app/api/credits`](../../src/app/api/credits), [`src/app/api/subscription`](../../src/app/api/subscription), [`src/lib/stripe.ts`](../../src/lib/stripe.ts), [`src/lib/credit-topup.ts`](../../src/lib/credit-topup.ts) |
| [dm.md](../dm.md) | Modelo de datos de producto | [`src/models`](../../src/models), [`src/lib/mongoose.ts`](../../src/lib/mongoose.ts), [`src/data`](../../src/data) |

## Rutas de navegación rápidas

- Para un cambio de API: empezar en [API_ACCESS.md](../API_ACCESS.md), abrir el
  handler listado y seguir su contrato en `src/lib` y `src/models`.
- Para un cambio de generación: seguir [AI Generation playbook](../playbooks/AI_GENERATION.md)
  desde el cliente hasta `AIGenerationJob` y el ledger de créditos.
- Para un cambio del editor: seguir [Visual Editor playbook](../playbooks/VISUAL_EDITOR.md)
  desde el documento normalizado hasta el endpoint de proyectos.
- Para un cambio de configuración u operación: usar [DEPLOYMENT.md](../DEPLOYMENT.md)
  y abrir el archivo de configuración de su fila antes de modificar el runtime.

## Límites

Este documento mide navegación, no cobertura explicativa por líneas. Los
catálogos de [`src/data`](../../src/data), la UI de un solo uso y las páginas
legales se documentan desde la feature o pipeline que las posee; no requieren
una entrada individual aquí.
