# Matriz de acceso de la API

> **Documento generado.** Lo produce `node scripts/mjs/build-route-access-matrix.mjs`
> a partir del código de cada ruta. No se edita a mano: para cambiar una fila,
> cambia la ruta.

El proyecto autoriza con siete mecanismos distintos. Esta tabla dice cuál usa
cada una de las 105 rutas, que antes solo se podía averiguar leyendo
los ficheros uno a uno.

La prueba `tests/unit/route-access-matrix.test.ts` falla si aparece una ruta sin
mecanismo reconocido y sin justificación explícita, así que una ruta nueva
desprotegida rompe el pipeline.

## Resumen

| Mecanismo | Rutas |
|---|---|
| Firma de webhook | 2 |
| Secreto de cron o admin | 6 |
| Administrador | 9 |
| Plan de suscripción | 12 |
| Sesión de usuario | 60 |
| Token del worker de IA | 1 |
| Límite por IP | 34 |
| Deshabilitada (501) | 2 |
| **Total de rutas** | **105** |

## Rutas públicas por diseño

Son públicas a propósito, cada una con su motivo. Ninguna expone producto de
pago ni datos de otra cuenta.

- `/api/catalog/[kind]` — Catálogo público paginado; no expone prompts de pago
- `/api/catalog/web-pages/[id]` — Ficha pública de una demo del catálogo
- `/api/landing-pages/catalog` — Listado público de landings
- `/api/landing-pages/[pageId]/content` — Contenido público de una landing publicada
- `/api/landing-pages/readability-index` — Índice de legibilidad, dato agregado y público
- `/api/community-reviews` — Reseñas visibles sin cuenta; la escritura sí exige sesión
- `/api/marketplace` — Escaparate público del marketplace
- `/api/provider-quality` — Métricas agregadas de calidad de proveedores
- `/api/demo/reproducible/report` — Informe de la demo reproducible, pensado para auditoría externa
- `/api/refactory-online/[slug]` — Cargador de demos estáticas
- `/api/webpages/assets/[...path]` — Activos estáticos de las demos
- `/api/web-pages/validate-demo-url` — Validación de formato de URL, sin efectos
- `/api/web-page-checkout` — Inicio de checkout de invitado; Stripe valida la sesión de pago
- `/api/stripe/demo-buy-button` — Configuración pública del botón de compra
- `/api/r2/buckets` — Listado de buckets configurados, sin credenciales
- `/api/affiliate/applications` — Alta de solicitud de afiliado desde el formulario público

## Matriz completa

| Ruta | Verbos | Protección |
|---|---|---|
| `/api/activity/ping` | POST | Sesión de usuario |
| `/api/admin/affiliate-applications/[applicationId]` | PATCH | Administrador |
| `/api/admin/affiliate-sales` | GET | Administrador |
| `/api/admin/feature-experiments` | GET, POST, PATCH | Secreto de cron o admin |
| `/api/admin/main-funnel` | GET | Secreto de cron o admin |
| `/api/admin/marketplace` | GET | Administrador |
| `/api/admin/marketplace/[id]` | PATCH | Administrador |
| `/api/admin/observability` | GET | Administrador + Sesión de usuario |
| `/api/admin/product-reviews` | GET, PATCH | Administrador + Sesión de usuario |
| `/api/affiliate/applications` | POST | Límite por IP |
| `/api/affiliate/click` | POST | Límite por IP |
| `/api/ai/jobs` | POST, GET | Plan de suscripción + Sesión de usuario + Límite por IP |
| `/api/ai/jobs/[id]` | GET | Sesión de usuario |
| `/api/ai/jobs/[id]/feedback` | POST, DELETE | Sesión de usuario + Límite por IP |
| `/api/ai/jobs/[id]/progress` | PATCH | Token del worker de IA |
| `/api/ai/jobs/[id]/retry` | POST | Sesión de usuario |
| `/api/ai/jobs/process` | — | Secreto de cron o admin |
| `/api/ai/providers/recommend` | GET | Sesión de usuario |
| `/api/assets/provenance` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/batches` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/batches/[id]` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/batches/[id]/export` | GET | Sesión de usuario |
| `/api/brand-kits` | GET, POST | Plan de suscripción + Sesión de usuario + Límite por IP |
| `/api/brand-kits/[id]` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/cache/invalidate` | POST | Administrador |
| `/api/cache/stats` | GET | Administrador |
| `/api/campaign-workflows` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/campaign-workflows/[id]` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/campaign-workflows/[id]/export` | GET | Sesión de usuario |
| `/api/catalog-engagement` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/catalog/[kind]` | GET | Pública — Catálogo público paginado; no expone prompts de pago |
| `/api/catalog/components/[id]` | GET | Plan de suscripción + Sesión de usuario |
| `/api/catalog/web-pages/[id]` | GET | Pública — Ficha pública de una demo del catálogo |
| `/api/community-reviews` | GET | Pública — Reseñas visibles sin cuenta; la escritura sí exige sesión |
| `/api/component-bundle-checkout` | POST | Sesión de usuario |
| `/api/component-checkout` | POST | Sesión de usuario |
| `/api/component-composer/export` | POST | Plan de suscripción |
| `/api/component-export/download` | POST | Plan de suscripción |
| `/api/component-export/sandbox` | POST | Plan de suscripción |
| `/api/component-library` | GET, PUT | Sesión de usuario + Límite por IP |
| `/api/component-library/export` | POST | Plan de suscripción |
| `/api/component-personalization` | POST | Plan de suscripción |
| `/api/creator/listings` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/creator/listings/[id]` | PATCH | Sesión de usuario |
| `/api/credits` | GET | Sesión de usuario |
| `/api/credits/checkout` | POST | Sesión de usuario + Límite por IP |
| `/api/csp-report` | POST | Límite por IP |
| `/api/demo/reproducible/report` | GET | Pública — Informe de la demo reproducible, pensado para auditoría externa |
| `/api/editor/projects` | GET, PUT, DELETE | Plan de suscripción + Sesión de usuario + Límite por IP |
| `/api/evaluation-suites` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/evaluation-suites/[id]` | GET | Sesión de usuario |
| `/api/evaluation-suites/[id]/export` | GET | Sesión de usuario |
| `/api/feature-flags` | GET | Sesión de usuario |
| `/api/human-evaluations` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/interests/track` | POST | Sesión de usuario + Límite por IP |
| `/api/landing-pages/[pageId]/content` | GET | Pública — Contenido público de una landing publicada |
| `/api/landing-pages/[pageId]/download` | GET | Plan de suscripción |
| `/api/landing-pages/[pageId]/readability` | GET, POST | Sesión de usuario |
| `/api/landing-pages/catalog` | GET | Pública — Listado público de landings |
| `/api/landing-pages/readability-index` | GET | Pública — Índice de legibilidad, dato agregado y público |
| `/api/like` | POST | Deshabilitada (501) |
| `/api/marketplace` | GET | Pública — Escaparate público del marketplace |
| `/api/marketplace/[id]/checkout` | POST | Sesión de usuario |
| `/api/marketplace/[id]/download` | GET | Sesión de usuario |
| `/api/model-regressions` | GET, POST | Sesión de usuario |
| `/api/new-users` | POST | Límite por IP |
| `/api/observability/events` | POST | Sesión de usuario |
| `/api/output-contracts` | GET, POST, PATCH | Sesión de usuario + Límite por IP |
| `/api/product-reviews` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/product-reviews/me` | GET | Sesión de usuario |
| `/api/profile/paypal` | POST | Sesión de usuario |
| `/api/project-client/[token]` | GET, POST | Límite por IP |
| `/api/projects` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/projects/[id]` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/projects/[id]/collaboration` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/prompt-experiments` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/prompt-experiments/[id]` | GET, PATCH | Sesión de usuario + Límite por IP |
| `/api/prompt-optimizer` | POST | Sesión de usuario + Límite por IP |
| `/api/prompt-versions` | GET, POST | Sesión de usuario + Límite por IP |
| `/api/provider-quality` | GET | Administrador |
| `/api/publication-quality` | GET | Sesión de usuario |
| `/api/publications` | GET, POST | Plan de suscripción + Sesión de usuario + Límite por IP |
| `/api/publications/[id]` | PATCH | Sesión de usuario |
| `/api/publications/[id]/export` | GET | Sesión de usuario |
| `/api/purchases` | GET | Sesión de usuario |
| `/api/purchases/[purchaseId]/download-token` | POST | Sesión de usuario |
| `/api/purchases/download` | GET | Sesión de usuario |
| `/api/r2/buckets` | GET | Pública — Listado de buckets configurados, sin credenciales |
| `/api/recommendations` | GET | Sesión de usuario |
| `/api/refactory-online/[slug]` | GET | Pública — Cargador de demos estáticas |
| `/api/saved` | GET, POST, DELETE | Sesión de usuario + Límite por IP |
| `/api/search/intent` | GET | Límite por IP |
| `/api/seed` | GET | Deshabilitada (501) |
| `/api/stripe/demo-buy-button` | GET | Pública — Configuración pública del botón de compra |
| `/api/subscription/invoice` | GET | Sesión de usuario |
| `/api/subscription/portal` | POST | Sesión de usuario |
| `/api/subscription/status` | GET | Plan de suscripción |
| `/api/sync-clerk` | GET | Secreto de cron o admin |
| `/api/sync-registered-users-to-resend` | GET | Secreto de cron o admin |
| `/api/sync-resend` | GET | Secreto de cron o admin |
| `/api/web-page-checkout` | — | Pública — Inicio de checkout de invitado; Stripe valida la sesión de pago |
| `/api/web-pages/validate-demo-url` | GET | Pública — Validación de formato de URL, sin efectos |
| `/api/webhooks/clerk` | POST | Firma de webhook |
| `/api/webhooks/stripe` | POST | Firma de webhook |
| `/api/webpages/assets/[...path]` | GET | Pública — Activos estáticos de las demos |
