# Hooks y utilidades reutilizadas

**Backlog:** [DOC-012](https://github.com/jggjosue/prompt-studio/issues/44) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

Esta guía prioriza hooks y utilidades usados por múltiples módulos. No es un
catálogo exhaustivo de helpers: documenta las piezas que coordinan acceso,
catálogo, generación, estado compartido, infraestructura de API o lógica de
dominio reutilizada.

## Criterio de inclusión

- Se importa desde varias rutas, componentes o dominios.
- Encapsula una regla de negocio, persistencia, autorización, cache, telemetría
  o contrato de UI.
- Cambiarlo puede afectar más de una feature o requerir pruebas cruzadas.

## Hooks compartidos

| Propósito | Hooks | Responsabilidad | Revisar también |
|---|---|---|---|
| Acceso comercial y límites | [`use-membership-access`](../../src/hooks/use-membership-access.ts), [`use-daily-copy-limit`](../../src/hooks/use-daily-copy-limit.ts), [`use-stripe-subscription`](../../src/hooks/use-stripe-subscription.ts) | Gating de membresía, límites diarios de copia y acceso al estado de suscripción desde cliente. | [`membership-access`](../../src/lib/membership-access.ts), [`daily-copy-limit`](../../src/lib/daily-copy-limit.ts), [`SubscriptionStatusProvider`](../../src/components/subscription-status-provider.tsx), [Stripe Payments](STRIPE_PAYMENTS.md). |
| Catálogo, búsqueda y paginación | [`use-paged-catalog`](../../src/hooks/use-paged-catalog.ts), [`use-infinite-scroll`](../../src/hooks/use-infinite-scroll.ts), [`use-fuzzy-filter`](../../src/hooks/use-fuzzy-filter.ts), [`use-catalog-search-url`](../../src/hooks/use-catalog-search-url.ts), [`use-keyset-pagination`](../../src/hooks/use-keyset-pagination.ts), [`use-search-field`](../../src/hooks/use-search-field.ts) | Mantener query, filtros, paginación, resultados derivados y sincronización con URL. | [`fuzzy-search`](../../src/lib/fuzzy-search.ts), [`keyset-pagination`](../../src/lib/keyset-pagination.ts), [`catalog-search-index`](../../src/lib/catalog-search-index.ts), [`catalog-ranking`](../../src/lib/catalog-ranking.ts). |
| Biblioteca y favoritos | [`use-component-library`](../../src/hooks/use-component-library.ts), [`use-landing-favorites`](../../src/hooks/use-landing-favorites.ts), [`use-recently-viewed-landings`](../../src/hooks/use-recently-viewed-landings.ts), [`use-component-catalog-data`](../../src/hooks/use-component-catalog-data.ts) | Guardar favoritos, recientes, colecciones, proyectos y datos de catálogo con cache local o API. | [`SavedItemsProvider`](../../src/components/saved-items-provider.tsx), [`/api/component-library`](../../src/app/api/component-library/route.ts), [`/api/saved`](../../src/app/api/saved/route.ts), [Priority feature components](PRIORITY_FEATURE_COMPONENTS.md). |
| Generación y editor visual | [`use-generation-editor`](../../src/hooks/use-generation-editor.ts), [`use-editor-autosave`](../../src/hooks/use-editor-autosave.ts), [`use-brand-kit-context`](../../src/hooks/use-brand-kit-context.ts) | Estado transitorio de generación, autosave del editor y contexto de marca en flujos creativos. | [`createEditorStore`](../../src/lib/editor/store.ts), [`provider-adapters`](../../src/lib/generation/provider-adapters.ts), [`brand-kit`](../../src/lib/brand-kit.ts), [Primary Generation Flow](PRIMARY_GENERATION_FLOW.md). |
| UI, feedback y viewport | [`use-toast`](../../src/hooks/use-toast.ts), [`use-mobile`](../../src/hooks/use-mobile.tsx), [`use-intersection-in-view`](../../src/hooks/use-intersection-in-view.ts), [`use-debounced-value`](../../src/hooks/use-debounced-value.ts), [`use-debounced-callback`](../../src/hooks/use-debounced-callback.ts), [`use-throttled-callback`](../../src/hooks/use-throttled-callback.ts) | Notificaciones efímeras, responsive checks, lazy rendering y control de frecuencia de eventos. | [`Toaster`](../../src/components/ui/toaster.tsx), [`LazyInView`](../../src/components/lazy-in-view.tsx), pruebas responsive y accesibilidad. |
| Experimentos y navegación | [`use-feature-flags`](../../src/hooks/use-feature-flags.ts), [`use-app-navigation`](../../src/hooks/use-app-navigation.ts), [`use-localized-catalog`](../../src/hooks/use-localized-catalog.ts) | Variantes de experimento, navegación con locale y catálogos localizados. | [`feature-experiments`](../../src/lib/feature-experiments.ts), [`app-routes`](../../src/lib/app-routes.ts), [`locale`](../../src/lib/locale.ts). |

## Utilidades reutilizadas

| Propósito | Utilidades | Responsabilidad | Riesgo al cambiar |
|---|---|---|---|
| Datos, cache y seguridad de API | [`mongoose`](../../src/lib/mongoose.ts), [`cache-policy`](../../src/lib/cache-policy.ts), [`rate-limit`](../../src/lib/rate-limit.ts), [`api-auth`](../../src/lib/api-auth.ts), [`admin-auth`](../../src/lib/admin-auth.ts), [`server-cache`](../../src/lib/server-cache.ts) | Conexión DB, headers, rate limits, auth de API/admin y cache de servidor. | Puede afectar todas las rutas API; validar [API_ACCESS.md](../API_ACCESS.md), tests de seguridad y [Services and APIs](SERVICES_AND_APIS.md). |
| Telemetría y observabilidad | [`analytics`](../../src/lib/analytics.ts), [`observability-client`](../../src/lib/observability-client.ts), [`observability-server`](../../src/lib/observability-server.ts), [`observability-safety`](../../src/lib/observability-safety.ts) | Eventos de producto, errores, métricas operativas y minimización de datos sensibles. | No enviar PII, prompts privados ni secretos; revisar dashboards y eventos principales. |
| Catálogo y SEO | [`web-pages`](../../src/lib/web-pages.ts), [`placeholder-images`](../../src/lib/placeholder-images.ts), [`placeholder-videos`](../../src/lib/placeholder-videos.ts), [`internal-link-graph`](../../src/lib/internal-link-graph.ts), [`json-ld`](../../src/lib/json-ld.ts), [`site-url`](../../src/lib/site-url.ts) | Catálogos localizados, medios, enlaces internos, schema y URLs canónicas. | Puede romper SEO, sitemap, canonical, previews o enlaces internos. |
| Comercio y acceso | [`stripe`](../../src/lib/stripe.ts), [`stripe-checkout`](../../src/lib/stripe-checkout.ts), [`credit-packs`](../../src/lib/credit-packs.ts), [`credit-topup`](../../src/lib/credit-topup.ts), [`server-subscription-status`](../../src/lib/server-subscription-status.ts), [`subscription-storage`](../../src/lib/subscription-storage.ts) | Checkout, créditos, planes y estado comercial. | No confiar en precio/créditos del cliente; revisar webhooks, ledger y [Stripe Payments](STRIPE_PAYMENTS.md). |
| IA y generación | [`ai-job-config`](../../src/lib/ai-job-config.ts), [`ai-job-service`](../../src/lib/ai-job-service.ts), [`ai-job-runner`](../../src/lib/ai-job-runner.ts), [`ai-job-serializer`](../../src/lib/ai-job-serializer.ts), [`generation-pricing`](../../src/lib/generation-pricing.ts), [`output-contract`](../../src/lib/output-contract.ts) | Configuración de jobs, ejecución, serialización, costos y contratos de salida. | Puede afectar créditos, retries, reconciliación y resultados; revisar [AI Generation](AI_GENERATION.md). |
| Editor visual | [`document`](../../src/lib/editor/document.ts), [`store`](../../src/lib/editor/store.ts), [`history`](../../src/lib/editor/history.ts), [`registry`](../../src/lib/editor/registry.ts), [`drag`](../../src/lib/editor/drag.ts), [`shortcuts`](../../src/lib/editor/shortcuts.ts) | Documento normalizado, comandos, undo/redo, registro, drag and drop y teclado. | Cambios deben pasar por tests del editor y [Visual Editor](VISUAL_EDITOR.md). |
| Producto y proyectos | [`project-context`](../../src/lib/project-context.ts), [`project-budget`](../../src/lib/project-budget.ts), [`project-collaboration`](../../src/lib/project-collaboration.ts), [`project-decision`](../../src/lib/project-decision.ts), [`brand-kit`](../../src/lib/brand-kit.ts) | Contexto del proyecto, presupuesto, colaboración, decisiones y marca. | Mantener permisos, procedencia y consistencia entre generadores, campañas y publicaciones. |
| Marketplace, reseñas y social proof | [`creator-marketplace`](../../src/lib/creator-marketplace.ts), [`marketplace-admin`](../../src/lib/marketplace-admin.ts), [`product-reviews`](../../src/lib/product-reviews.ts), [`review-moderation`](../../src/lib/review-moderation.ts), [`product-social-proof`](../../src/lib/product-social-proof.ts) | Listings, moderación, reseñas verificadas y señales públicas. | Revisar privacidad, antifraude, licencias y estados de moderación. |

## Reglas de mantenimiento

1. Si un hook empieza a usarse en más de una feature, documenta su fuente de
   verdad, cache y modo de fallo.
2. Si una utilidad cruza dominios, enlázala desde esta guía y desde el playbook
   del dominio que la posee.
3. No añadas wrappers nuevos para helpers de una línea; prioriza claridad en el
   call site.
4. Cuando un hook escriba en API, documenta la ruta, la reversión ante fallo y
   si existe actualización optimista.
5. Cuando una utilidad toque billing, auth, cache, rate limit o telemetría,
   verifica tests de contrato además del flujo visible.

## Verificación mínima

```bash
npm test
npm run typecheck
```

Para cambios de API, seguridad o generación, añade las verificaciones del
playbook del dominio correspondiente antes de cerrar el ticket.
