# DOC-003 — Prioridad de archivos fuente de mayor impacto

**Fecha:** 2026-09-15  
**Backlog:** [DOC-003](https://github.com/jggjosue/prompt-studio/issues/35) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

## Método

La documentación no se prioriza solo por tamaño. Cada candidato se evalúa por:

1. **Alcance sistémico:** si afecta routing, seguridad, datos, pagos o varias features.
2. **Riesgo de cambio:** si un error impacta acceso, dinero, persistencia o trabajo asíncrono.
3. **Reutilización:** si otros módulos importan o dependen de su contrato.
4. **Volumen:** líneas que una guía puede hacer más navegables, sin premiar páginas legales o contenido mecánico.

El conteo actual del alcance manual es **678 archivos y 77,718 líneas**. Por
volumen, UI localizada aporta 36,598 líneas, componentes 17,199 y servicios
13,975; esta distribución orienta el esfuerzo, pero no sustituye el criterio de
impacto. El inventario y exclusiones están en
[DOC-002 — Source File Map](SOURCE_FILE_MAP.md).

## Tier A — Documentar primero

Estos archivos son entry points o contratos transversales. Su documentación debe
explicar flujo, invariantes, fallos y módulos dependientes.

| Dominio | Archivos de implementación | Por qué primero | Destino documental |
|---|---|---|---|
| Routing, identidad y seguridad | [`src/proxy.ts`](../../src/proxy.ts), [`src/middleware.ts`](../../src/middleware.ts), [`src/app/[locale]/layout.tsx`](../../src/app/[locale]/layout.tsx) | Protegen rutas, reescriben locale y fijan la frontera pública | [Authentication playbook](../playbooks/AUTHENTICATION.md), [DOC-007](https://github.com/jggjosue/prompt-studio/issues/39) |
| Persistencia | [`src/lib/mongoose.ts`](../../src/lib/mongoose.ts), [`src/models`](../../src/models) | Conexión compartida y contratos de datos para 137 importaciones de Mongoose | [DATABASE.md](../DATABASE.md), [Data playbook](../playbooks/DATA_PERSISTENCE.md) |
| Pagos y suscripciones | [`src/app/api/webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts), [`src/lib/stripe.ts`](../../src/lib/stripe.ts), [`src/lib/server-subscription-status.ts`](../../src/lib/server-subscription-status.ts), [`src/lib/credit-topup.ts`](../../src/lib/credit-topup.ts) | Firma de webhook, idempotencia y derechos de pago | [Stripe playbook](../playbooks/STRIPE_PAYMENTS.md) |
| Jobs de IA | [`src/app/api/ai/jobs/route.ts`](../../src/app/api/ai/jobs/route.ts), [`src/app/api/ai/jobs/process/route.ts`](../../src/app/api/ai/jobs/process/route.ts), [`src/lib/ai-job-service.ts`](../../src/lib/ai-job-service.ts), [`src/lib/ai-job-runner.ts`](../../src/lib/ai-job-runner.ts), [`src/lib/ai-job-config.ts`](../../src/lib/ai-job-config.ts), [`src/models/AIGenerationJob.ts`](../../src/models/AIGenerationJob.ts) | Reserva de crédito, reintentos, worker e idempotencia | [AI playbook](../playbooks/AI_GENERATION.md), [AI architecture](../AI_ARCHITECTURE.md) |
| Editor visual | [`src/lib/editor/document.ts`](../../src/lib/editor/document.ts), [`src/lib/editor/registry.ts`](../../src/lib/editor/registry.ts), [`src/lib/editor/store.ts`](../../src/lib/editor/store.ts), [`src/lib/editor/history.ts`](../../src/lib/editor/history.ts), [`src/app/api/editor/projects/route.ts`](../../src/app/api/editor/projects/route.ts), [`src/models/EditorProject.ts`](../../src/models/EditorProject.ts) | Árbol, reglas, estado, historial y persistencia son un solo contrato | [Visual editor playbook](../playbooks/VISUAL_EDITOR.md) |
| Superficies principales de generación | [`src/app/[locale]/generate-images/prompt-editor-client.tsx`](../../src/app/[locale]/generate-images/prompt-editor-client.tsx), [`src/app/[locale]/generate-videos/generate-videos-client.tsx`](../../src/app/[locale]/generate-videos/generate-videos-client.tsx), [`src/app/[locale]/generate-webs/generate-webs-client.tsx`](../../src/app/[locale]/generate-webs/generate-webs-client.tsx) | 7,859 líneas combinadas y entrada directa a la propuesta de valor | [DOC-008](https://github.com/jggjosue/prompt-studio/issues/40), [DOC-014](https://github.com/jggjosue/prompt-studio/issues/46) |
| Constructores visuales | [`src/app/[locale]/component-builder/component-builder-client.tsx`](../../src/app/[locale]/component-builder/component-builder-client.tsx), [`src/app/[locale]/page-composer/page-composer-client.tsx`](../../src/app/[locale]/page-composer/page-composer-client.tsx), [`src/components/editor/editor-shell.tsx`](../../src/components/editor/editor-shell.tsx), [`src/components/editor/inspector-panel.tsx`](../../src/components/editor/inspector-panel.tsx) | 3,327 líneas combinadas de UI que dependen del contrato del editor | [Visual editor playbook](../playbooks/VISUAL_EDITOR.md), [DOC-009](https://github.com/jggjosue/prompt-studio/issues/41) |

## Tier B — Documentar por dominio en la siguiente ola

| Grupo | Archivos o directorios | Enfoque |
|---|---|---|
| APIs de producto | [`src/app/api`](../../src/app/api) | Agrupar en catálogo, generación, proyectos, marketplace, publicaciones y administración; usar [API_ACCESS.md](../API_ACCESS.md) como índice |
| Componentes compartidos | [`src/components`](../../src/components), [`src/components/builder`](../../src/components/builder) | Explicar contratos de composición y accesibilidad, no controles puramente visuales |
| Hooks compartidos | [`src/hooks/use-editor-autosave.ts`](../../src/hooks/use-editor-autosave.ts), [`src/hooks/use-generation-editor.ts`](../../src/hooks/use-generation-editor.ts), [`src/hooks/use-component-library.ts`](../../src/hooks/use-component-library.ts), [`src/hooks/use-keyset-pagination.ts`](../../src/hooks/use-keyset-pagination.ts) | Cubrir lifecycle, caché, sincronización y paginación |
| Servicios transversales | [`src/lib/rate-limit.ts`](../../src/lib/rate-limit.ts), [`src/lib/cache-policy.ts`](../../src/lib/cache-policy.ts), [`src/lib/output-contract.ts`](../../src/lib/output-contract.ts), [`src/lib/r2-storage.ts`](../../src/lib/r2-storage.ts), [`src/lib/affiliate-referral.ts`](../../src/lib/affiliate-referral.ts) | Conectar con sus consumidores y límites operativos |
| Navegación e i18n | [`src/i18n`](../../src/i18n), [`src/lib/app-routes.ts`](../../src/lib/app-routes.ts) | Describir canonicalización, locale y navegación interna |

## Tier C — Documentar solo con contexto de feature

Las páginas de política, textos legales, tarjetas visuales, datos de catálogo y
helpers de un solo uso pueden ser grandes, pero rara vez son buenos puntos de
entrada arquitectónicos. Se documentan desde la feature o el pipeline que los
posee, sin una página técnica por archivo.

Ejemplos: [`src/app/[locale]/privacy/page.tsx`](../../src/app/[locale]/privacy/page.tsx),
[`src/app/[locale]/terms/page.tsx`](../../src/app/[locale]/terms/page.tsx),
[`src/components/ui`](../../src/components/ui) y [`src/data`](../../src/data).

## Orden de ejecución

1. Mantener los flujos Tier A ya iniciados en los playbooks y añadir los entry
   points que faltan con [DOC-006](https://github.com/jggjosue/prompt-studio/issues/38),
   [DOC-007](https://github.com/jggjosue/prompt-studio/issues/39) y
   [DOC-008](https://github.com/jggjosue/prompt-studio/issues/40).
2. Crear mapas por feature y servicio para Tier B con
   [DOC-009](https://github.com/jggjosue/prompt-studio/issues/41),
   [DOC-010](https://github.com/jggjosue/prompt-studio/issues/42) y
   [DOC-011](https://github.com/jggjosue/prompt-studio/issues/43).
3. Incorporar Tier C solo cuando un cambio de producto lo haga necesario.

## Revisión

Revisar la lista cuando una feature nueva alcance el orden de magnitud de un
entry point Tier A, cuando un módulo gane consumidores transversales o cuando
la métrica de DOC-019 indique una concentración significativa de líneas sin
documentación explicativa.
