# Features — mapa documental por feature

**Backlog:** [DOC-014](https://github.com/jggjosue/prompt-studio/issues/46) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

Organiza los flujos de producto priorizados y señala, para cada uno, los
ficheros de implementación navegables y la forma de verificarlo. Es un índice de
ownership: no repite los despieces de los playbooks de flujo, los enlaza.

Convención de cada sección: **Implementation files** enlaza los archivos de
implementación reales; **Verificación** da el comando o prueba que confirma que
el flujo sigue operativo. Todo enlace debe ser navegable y apuntar a un archivo
existente (ver DOC-016).

---

## Catálogo y tienda

Marketplace de prompts y componentes, listados, detalle, buscador y facetas sobre
los catálogos derivados de `src/data`.

### Implementation files

- Entradas: [home](<../../src/app/[locale]/page.tsx>), [detalle de landing](<../../src/app/[locale]/gallery/[id]/page.tsx>), [detalle de vídeo](<../../src/app/[locale]/gallery-videos/[id]/page.tsx>), [categoría](<../../src/app/[locale]/category/[slug]/page.tsx>), [etiqueta](<../../src/app/[locale]/tags/[slug]/page.tsx>)
- Páginas de producto: [prompts](<../../src/app/[locale]/prompts/page.tsx>), [modelos](<../../src/app/[locale]/prompts/[modelId]/page.tsx>)
- Búsqueda: [smart-search](<../../src/app/[locale]/smart-search/page.tsx>), ruta [intent API](../../src/app/api/search/intent/route.ts), [`fuzzy-search`](../../src/lib/fuzzy-search.ts)
- Catálogos: `use-paged-catalog` ([hook](../../src/hooks/use-paged-catalog.ts)), [catalog API](<../../src/app/api/catalog/[kind]/route.ts>), [`catalog-keyset-api`](../../src/lib/catalog-keyset-api.ts), [`models-data`](../../src/lib/models-data.ts)
- Navegación y SEO: [`app-routes`](../../src/lib/app-routes.ts), [`internal-link-graph`](../../src/lib/internal-link-graph.ts)

### Verificación

```bash
npm run validate
npx tsx --test tests/unit/route-access-matrix.test.ts
npm run build
```

---

## Superficies de generación

Imagen, vídeo y web a partir de los modelos declarados; flujo interactivo y
pago por generación. El detalle del pipeline está en
[Primary Generation Flow](PRIMARY_GENERATION_FLOW.md).

### Implementation files

- Entradas: [página de imágenes](<../../src/app/[locale]/generate-images/page.tsx>), [cliente de imágenes](<../../src/app/[locale]/generate-images/prompt-editor-client.tsx>), [cliente de vídeos](<../../src/app/[locale]/generate-videos/generate-videos-client.tsx>), [cliente de webs](<../../src/app/[locale]/generate-webs/generate-webs-client.tsx>)
- Estado compartido: [`use-generation-editor`](../../src/hooks/use-generation-editor.ts)
- Contratos: [`output-contract`](../../src/lib/output-contract.ts), [`generation-pricing`](../../src/lib/generation-pricing.ts), [`provider-adapters`](../../src/lib/generation/provider-adapters.ts)
- Ejecución durable: [`ai-job-service`](../../src/lib/ai-job-service.ts), server actions en [`src/app/actions.ts`](../../src/app/actions.ts)

### Verificación

```bash
npm run typecheck
npm run lint
npx tsx --test tests/unit/route-access-matrix.test.ts
```

---

## Component Builder y Page Composer

Constructores visuales sobre el núcleo del editor. El contrato del árbol y el
estado están en el [playbook de editor visual](VISUAL_EDITOR.md) y en
[Componentes prioritarios](PRIORITY_FEATURE_COMPONENTS.md).

### Implementation files

- Component Builder: [página](<../../src/app/[locale]/component-builder/page.tsx>), [cliente de composición](<../../src/app/[locale]/component-builder/component-builder-client.tsx>), [cliente del editor](<../../src/app/[locale]/component-builder/component-builder-editor-client.tsx>)
- Page Composer: [página](<../../src/app/[locale]/page-composer/page.tsx>), [cliente](<../../src/app/[locale]/page-composer/page-composer-client.tsx>)
- Núcleo del editor: [`editor/document`](../../src/lib/editor/document.ts), [`editor/registry`](../../src/lib/editor/registry.ts), [`editor/store`](../../src/lib/editor/store.ts), [`editor/history`](../../src/lib/editor/history.ts)
- Persistencia: [API de proyectos](../../src/app/api/editor/projects/route.ts), [`EditorProject`](../../src/models/EditorProject.ts)

### Verificación

```bash
npx tsx --test tests/unit/editor-core.test.ts
npx tsx --test tests/unit/editor-ui-contracts.test.ts
npm run typecheck
```

---

## Landing pages y su editor

Catálogo de landing pages con editor propio en dashboard, preview y
publicación.

### Implementation files

- Catálogo: [listado](<../../src/app/[locale]/landing-pages/page.tsx>), [detalle](<../../src/app/[locale]/landing-pages/[slug]/page.tsx>), [preview](<../../src/app/[locale]/landing-pages/[slug]/preview/page.tsx>)
- Editor: [página de edición](<../../src/app/[locale]/landing-pages/[slug]/edit/page.tsx>), [editor en dashboard](<../../src/app/[locale]/dashboard/landing-editor/page.tsx>), [cliente](<../../src/app/[locale]/dashboard/landing-editor/landing-editor-client.tsx>)
- Publicación y calidad: [`landing-publishing`](../../src/lib/landing-publishing.ts), [`landing-readability-store`](../../src/lib/landing-readability-store.ts), [`use-landing-favorites`](../../src/hooks/use-landing-favorites.ts)

### Verificación

```bash
npm run build
npx tsx --test tests/unit/route-access-matrix.test.ts
```

---

## Checkout y suscripción

Planes, checkout por tier, estado de suscripción y recarga de créditos. El
procesado de webhooks está en [Stripe payments](STRIPE_PAYMENTS.md).

### Implementation files

- Planes: [precios](<../../src/app/[locale]/prices/page.tsx>)
- Checkout: [mini](<../../src/app/[locale]/checkout/mini/page.tsx>), [professional](<../../src/app/[locale]/checkout/professional/page.tsx>), [entrepreneur](<../../src/app/[locale]/checkout/entrepreneur/page.tsx>), [elite](<../../src/app/[locale]/checkout/elite/page.tsx>)
- Estado y créditos: [`server-subscription-status`](../../src/lib/server-subscription-status.ts), [`use-stripe-subscription`](../../src/hooks/use-stripe-subscription.ts), [`credit-topup`](../../src/lib/credit-topup.ts), [`credit-packs`](../../src/lib/credit-packs.ts), [créditos en dashboard](<../../src/app/[locale]/dashboard/credits/page.tsx>)
- Cliente Stripe: [`stripe`](../../src/lib/stripe.ts)

### Verificación

```bash
npm run validate
npx tsx --test tests/unit/route-access-matrix.test.ts
```

---

## Dashboard

Panel de gestión: generaciones, creaciones, créditos, facturación, ajustes y el
resto de módulos, todos bajo un layout compartido.

### Implementation files

- Shell: [layout](<../../src/app/[locale]/dashboard/layout.tsx>), [índice](<../../src/app/[locale]/dashboard/page.tsx>)
- Módulos centrales: [generaciones](<../../src/app/[locale]/dashboard/generations/page.tsx>) y [cliente](<../../src/app/[locale]/dashboard/generations/generations-client.tsx>), [creaciones](<../../src/app/[locale]/dashboard/creations/page.tsx>), [analítica](<../../src/app/[locale]/dashboard/analytics/page.tsx>), [facturación](<../../src/app/[locale]/dashboard/billing/page.tsx>), [ajustes](<../../src/app/[locale]/dashboard/settings/page.tsx>)
- Acceso y telemetría: [`membership-access`](../../src/lib/membership-access.ts), [`use-membership-access`](../../src/hooks/use-membership-access.ts), [`analytics`](../../src/lib/analytics.ts)

### Verificación

```bash
npm run validate
npx tsx --test tests/unit/route-access-matrix.test.ts
```

---

## Programa de afiliados

Programa de referidos: registro, seguimiento de clics, solicitudes y notificación.

### Implementation files

- Público: [programa](<../../src/app/[locale]/affiliate-program/page.tsx>), [términos](<../../src/app/[locale]/affiliate-program-terms/page.tsx>)
- Dashboard: [solicitudes](<../../src/app/[locale]/dashboard/affiliate-applications/page.tsx>) y [cliente](<../../src/app/[locale]/dashboard/affiliate-applications/affiliate-applications-client.tsx>)
- API: [applications](../../src/app/api/affiliate/applications/route.ts), [click](../../src/app/api/affiliate/click/route.ts)
- Lógica y modelo: [`affiliate`](../../src/lib/affiliate.ts), [`affiliate-referral`](../../src/lib/affiliate-referral.ts), [`AffiliateApplication`](../../src/models/AffiliateApplication.ts)

### Verificación

```bash
npx tsx --test tests/unit/route-access-matrix.test.ts
```

`/api/affiliate/applications` es una escritura pública: si se elimina su límite
de tasa por IP, la matriz de acceso debe dejar de pasar (véase `SECURITY.md`).

---

## Legal y políticas de contenido

Páginas legislativas de producto y normativa de publicación del catálogo.

### Implementation files

- Política: [privacidad](<../../src/app/[locale]/privacy/page.tsx>), [términos](<../../src/app/[locale]/terms/page.tsx>), [cookies](<../../src/app/[locale]/cookies/page.tsx>), [reembolsos](<../../src/app/[locale]/refunds/page.tsx>), [licencias](<../../src/app/[locale]/licenses/page.tsx>)
- Publicación: [guías para publicadores](<../../src/app/[locale]/publisher-guidelines/page.tsx>), [`google-publisher-policy`](../../src/lib/google-publisher-policy.ts)

### Verificación

Estas páginas son de prerender estático:

```bash
npm run build
npm run validate
```

---

## Paginación reutilizable

Hook de paginación por keyset y sus consumidores de catálogo. Es el patrón
transversal que cualquier listado con paginación por cursor debe reutilizar.

### Implementation files

- Hook: [`use-keyset-pagination`](../../src/hooks/use-keyset-pagination.ts)
- Lógica server: [`keyset-pagination`](../../src/lib/keyset-pagination.ts)
- Consumidores: [`use-paged-catalog`](../../src/hooks/use-paged-catalog.ts), [`use-infinite-scroll`](../../src/hooks/use-infinite-scroll.ts), [`catalog-keyset-api`](../../src/lib/catalog-keyset-api.ts)

### Verificación

```bash
npm run typecheck
npx tsx --test tests/unit/route-access-matrix.test.ts
```

---

## Cómo mantener este mapa

1. Añade una feature cuando tenga un page entry point propio bajo
   `src/app/[locale]` y combine UI, estado y persistencia.
2. Cada sección debe listar entre 3 y 8 ficheros de implementación y una forma
   de verificación reproducible.
3. Los playbooks de flujo (`docs/playbooks/*.md`) son la explicación profunda;
   este mapa es el índice. No dupliques un flujo aquí si ya tiene playbook.
4. Re-ejecuta `node scripts/mjs/check-doc-links.mjs` antes de abrir el PR (DOC-016):
   todos los enlaces de este archivo deben resolver a ficheros reales.