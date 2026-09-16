# Componentes de features prioritarias

**Backlog:** [DOC-009](https://github.com/jggjosue/prompt-studio/issues/41) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

Este mapa identifica los componentes que componen las features de mayor impacto
y las dependencias que no se deben ignorar al modificarlos. Es un mapa de
ownership, no un inventario de cada control visual.

## Features y dependencias

| Feature | Entrada y componentes | Hooks y servicios | Persistencia, acceso y contrato |
|---|---|---|---|
| Component Builder | [Page](<../../src/app/[locale]/component-builder/page.tsx>) → [editor client](<../../src/app/[locale]/component-builder/component-builder-editor-client.tsx>) → [`EditorWorkspace`](../../src/components/editor/editor-workspace.tsx) → [`EditorShell`](../../src/components/editor/editor-shell.tsx) | [`use-editor-autosave`](../../src/hooks/use-editor-autosave.ts), [`src/lib/editor`](../../src/lib/editor) | [`server-subscription-status`](../../src/lib/server-subscription-status.ts), [`/api/editor/projects`](../../src/app/api/editor/projects/route.ts), [`EditorProject`](../../src/models/EditorProject.ts) |
| Page Composer | [Page](<../../src/app/[locale]/page-composer/page.tsx>) → [editor client](<../../src/app/[locale]/page-composer/page-composer-editor-client.tsx>) → [`EditorWorkspace`](../../src/components/editor/editor-workspace.tsx) | [`createDocument`](../../src/lib/editor/document.ts), [`createNode`](../../src/lib/editor/document.ts), [`use-editor-autosave`](../../src/hooks/use-editor-autosave.ts) | [`server-subscription-status`](../../src/lib/server-subscription-status.ts), [`/api/editor/projects`](../../src/app/api/editor/projects/route.ts), [`EditorProject`](../../src/models/EditorProject.ts) |
| Núcleo de editor visual | [`EditorShell`](../../src/components/editor/editor-shell.tsx), [`ComponentsPanel`](../../src/components/editor/components-panel.tsx), [`EditorCanvas`](../../src/components/editor/editor-canvas.tsx), [`LayersPanel`](../../src/components/editor/layers-panel.tsx), [`InspectorPanel`](../../src/components/editor/inspector-panel.tsx), [`NodeView`](../../src/components/editor/node-view.tsx) | [`registry`](../../src/lib/editor/registry.ts), [`document`](../../src/lib/editor/document.ts), [`store`](../../src/lib/editor/store.ts), [`history`](../../src/lib/editor/history.ts), [`drag`](../../src/lib/editor/drag.ts) | El documento normalizado y las reglas de nesting son el contrato; consulta [Visual Editor playbook](VISUAL_EDITOR.md) antes de cambiar cualquiera de estas piezas. |
| Dashboard principal | [Page](<../../src/app/[locale]/dashboard/page.tsx>) → [`DashboardShell`](../../src/components/dashboard/dashboard-shell.tsx), [`DashboardMobileNav`](../../src/components/dashboard/dashboard-mobile-nav.tsx), [`DashboardUpgradeCard`](../../src/components/dashboard/dashboard-upgrade-card.tsx), [`PersonalizedRecommendations`](../../src/components/dashboard/personalized-recommendations.tsx) | [`project-funnel-events`](../../src/lib/project-funnel-events.ts), [`project-budget`](../../src/lib/project-budget.ts), [`review-aggregates`](../../src/lib/review-aggregates.ts), [`server-subscription-status`](../../src/lib/server-subscription-status.ts) | [`/api/recommendations`](../../src/app/api/recommendations/route.ts), [`/api/credits`](../../src/app/api/credits/route.ts), [`ProjectFunnelEvent`](../../src/models/ProjectFunnelEvent.ts), [`AICreditAccount`](../../src/models/AICreditAccount.ts), [`AICreditLedger`](../../src/models/AICreditLedger.ts) |
| Proyectos y Brand Kits | [`/api/projects`](../../src/app/api/projects/route.ts), [`/api/brand-kits`](../../src/app/api/brand-kits/route.ts), [`PostPurchaseCustomization`](../../src/components/post-purchase-customization.tsx), [`ComponentCommercialPanel`](../../src/components/component-commercial-panel.tsx) | [`project-context`](../../src/lib/project-context.ts), [`brand-kit`](../../src/lib/brand-kit.ts), [`use-brand-kit-context`](../../src/hooks/use-brand-kit-context.ts), [`project-collaboration`](../../src/lib/project-collaboration.ts), [`project-decision`](../../src/lib/project-decision.ts) | [`CreativeProject`](../../src/models/CreativeProject.ts), [`BrandKit`](../../src/models/BrandKit.ts). El contexto de proyecto y marca debe viajar junto con generaciones, publicaciones y campañas. |
| Biblioteca de componentes | [`ComponentLibraryActions`](../../src/components/component-library-actions.tsx), [composición canvas](../../src/components/builder/composition-canvas.tsx), [composición panel](../../src/components/builder/composition-panel.tsx) | [`use-component-library`](../../src/hooks/use-component-library.ts), [`use-component-catalog-data`](../../src/hooks/use-component-catalog-data.ts), [`builder-blocks`](../../src/lib/builder-blocks.ts) | [`/api/component-library`](../../src/app/api/component-library/route.ts), [export endpoint](../../src/app/api/component-library/export/route.ts), [`ComponentLibrary`](../../src/models/ComponentLibrary.ts) |
| Generación interactiva | [Image client](<../../src/app/[locale]/generate-images/prompt-editor-client.tsx>), [Video client](<../../src/app/[locale]/generate-videos/generate-videos-client.tsx>), [Web client](<../../src/app/[locale]/generate-webs/generate-webs-client.tsx>), [feedback](../../src/components/generation/generation-feedback.tsx) | [`use-generation-editor`](../../src/hooks/use-generation-editor.ts), [`provider-adapters`](../../src/lib/generation/provider-adapters.ts) | [`src/app/actions.ts`](../../src/app/actions.ts); para ejecución durable, [`/api/ai/jobs`](../../src/app/api/ai/jobs/route.ts) y [Primary Generation Flow](PRIMARY_GENERATION_FLOW.md) |
| Prompt Lab y optimización | [Prompt Optimizer page](<../../src/app/[locale]/prompt-optimizer/page.tsx>) → [client](<../../src/app/[locale]/prompt-optimizer/prompt-optimizer-client.tsx>), [`PromptVersionManager`](../../src/components/prompt-version-manager.tsx), [`PromptValidationCard`](../../src/components/prompt-validation-card.tsx) | [`prompt-versioning`](../../src/lib/prompt-versioning.ts), [`prompt-experiment`](../../src/lib/prompt-experiment.ts), [`prompt-validation`](../../src/lib/prompt-validation.ts), [`prompt-edit`](../../src/lib/prompt-edit.ts) | [`/api/prompt-versions`](../../src/app/api/prompt-versions/route.ts), [`/api/prompt-experiments`](../../src/app/api/prompt-experiments/route.ts), [`/api/prompt-optimizer`](../../src/app/api/prompt-optimizer/route.ts), [`PromptVersion`](../../src/models/PromptVersion.ts), [`PromptExperiment`](../../src/models/PromptExperiment.ts), [`HumanEvaluation`](../../src/models/HumanEvaluation.ts) |
| Campañas y publicación | [`/api/campaign-workflows`](../../src/app/api/campaign-workflows/route.ts), [`/api/publications`](../../src/app/api/publications/route.ts), [`/api/publication-quality`](../../src/app/api/publication-quality/route.ts), [`GlobalResponsivePreview`](../../src/components/global-responsive-preview.tsx), [`WebPageCodePreview`](../../src/components/web-page-code-preview.tsx) | [`campaign-orchestrator`](../../src/lib/campaign-orchestrator.ts), [`campaign-control-center`](../../src/lib/campaign-control-center.ts), [`publication-quality`](../../src/lib/publication-quality.ts), [`web-page-code-preview`](../../src/lib/web-page-code-preview.ts) | [`CampaignWorkflow`](../../src/models/CampaignWorkflow.ts), [`LandingPublication`](../../src/models/LandingPublication.ts), [`PublicationQualityAudit`](../../src/models/PublicationQualityAudit.ts), [`ProjectClientLink`](../../src/models/ProjectClientLink.ts) |
| Catálogo y marketplace | [Marketplace page](<../../src/app/[locale]/marketplace/page.tsx>) → [client](<../../src/app/[locale]/marketplace/marketplace-client.tsx>), [`PromptCatalogCard`](../../src/components/prompt-catalog-card.tsx), [`ProductReviews`](../../src/components/product-reviews.tsx), [`ProductSocialProof`](../../src/components/product-social-proof.tsx) | [`prompt-catalog`](../../src/lib/prompt-catalog.ts), [`creator-marketplace`](../../src/lib/creator-marketplace.ts), [`marketplace-admin`](../../src/lib/marketplace-admin.ts), [`product-reviews`](../../src/lib/product-reviews.ts), [`review-moderation`](../../src/lib/review-moderation.ts) | [`/api/marketplace`](../../src/app/api/marketplace/route.ts), [`/api/product-reviews`](../../src/app/api/product-reviews/route.ts), [`MarketplaceListing`](../../src/models/MarketplaceListing.ts), [`MarketplaceSale`](../../src/models/MarketplaceSale.ts), [`ProductReview`](../../src/models/ProductReview.ts) |

## Límite de responsabilidad

```mermaid
flowchart LR
    Page[Page and access gate] --> Client[Feature client]
    Client --> Workspace[Shared workspace or hook]
    Workspace --> Core[Domain service/store]
    Core --> API[Authenticated API]
    API --> Model[Persistent model]
```

- Las páginas deciden locale, sesión y plan; no reimplementan el editor ni su persistencia.
- Los clientes de feature componen UI y configuran props; el estado reutilizable pertenece a un hook o workspace compartido.
- `EditorShell` presenta un store; `EditorWorkspace` crea ese store, carga el documento y conecta el autoguardado.
- La API valida al usuario y el modelo persiste el contrato. Ningún componente debe dar por autorizado un cambio solo porque una UI está oculta.

## Cambios por tipo

| Si cambias… | Revisa también… |
|---|---|
| Un panel, canvas o inspector del editor | [`EditorShell`](../../src/components/editor/editor-shell.tsx), [`store`](../../src/lib/editor/store.ts), [`history`](../../src/lib/editor/history.ts), teclado/drag y [tests del editor](../../tests/unit/editor-ui-contracts.test.ts) |
| El schema o un nodo del editor | [`registry`](../../src/lib/editor/registry.ts), [`document`](../../src/lib/editor/document.ts), migración, [`EditorProject`](../../src/models/EditorProject.ts) y [editor core tests](../../tests/unit/editor-core.test.ts) |
| Acceso a Builder o Composer | Page entry point, [`server-subscription-status`](../../src/lib/server-subscription-status.ts) y el fallback/gate de la feature |
| Guardado de editor o biblioteca | El hook correspondiente, su endpoint API, `keepalive`/debounce y el modelo que recibe el payload |
| UI de generación | [Primary Generation Flow](PRIMARY_GENERATION_FLOW.md), el adaptador de proveedor y el estado de feedback |
| Proyectos, campañas o publicación | El contexto de proyecto, Brand Kit, presupuesto, procedencia de activos y estados de revisión/publicación |
| Catálogo o marketplace | Validación de datos de producto, moderación, reseñas, social proof, licencias y rutas de compra |

## Convenciones de mantenimiento

1. Agrega una fila cuando una feature nueva tenga su propio page entry point y combine componentes compartidos con estado o persistencia.
2. Enlaza el cliente activo. Los clientes de composición heredados sólo se documentan cuando siguen siendo una ruta disponible del producto.
3. Si un componente se vuelve transversal, muévelo a una dependencia compartida en la tabla y documenta su contrato, en vez de duplicarlo por feature.
4. Mantén enlaces relativos a archivos reales del repositorio; este documento alimenta la cobertura de documentación y debe seguir siendo navegable desde GitHub.
5. Cuando una feature use datos sensibles o comerciales, documenta también el modelo persistente y la API que aplican autorización del servidor.
