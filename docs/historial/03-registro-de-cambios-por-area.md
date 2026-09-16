# Registro de cambios por área

El mismo historial visto por área de producto en lugar de por fecha. Cada
entrada lleva su evidencia: hash de commit cuando está versionado, o «árbol de
trabajo» cuando pertenece a la fase 7 (4-9 de septiembre de 2026), que no está
commiteada.

Las fases se refieren a [01-cronologia-de-creacion.md](01-cronologia-de-creacion.md).

---

## 1. Catálogo y datos

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-14/15 | Galería con filtro imagen/vídeo/todo; detalle de prompt; `/image-prompts` y `/video-prompts` con paginación | `354f2d07`, `be12d9fd`, `f8752115`, `be5b9714` |
| 2026-01-15 | Carga de prompts por lotes en `/image-prompts` (7 commits) y `/video-prompts` (6 commits) | `7a6a1265`…`b27510af`, `166aadd4`…`d71aed3b` |
| 2026-02-06 | Semilla de base de datos | `2e58a946` |
| 2026-02-20 | Carga de URLs de vídeo en 7 lotes | `c29f31d0`…`29d1cfeb` |
| 2026-02-21 | Cambio de imágenes, adición de vídeos y JSON expuesto en la vista | `617b3de6`, `2e58516c`, `f65075c2` |
| 2026-02 (fecha no versionada) | Separación de imágenes y vídeos en dos fuentes: 115 imágenes + 42 vídeos, tipo `VideoProp` | [`MIGRATION_SUMMARY.md`](../MIGRATION_SUMMARY.md), traza [T-03](02-trazas-de-decision.md#t-03--separación-de-vídeos-e-imágenes) |
| 2026-03-04 | Nuevo eje del producto: catálogo de prompts **por modelo de IA**. `/prompts`, `/prompts/amp`, `/prompts/anthropic` | `f5243738`, `8adee338`, `27b64f13`, `bad8a381`, `e8fc5d78`, `103522a5` |
| 2026-03-04 | Partición de prompts por delimitador `#` / `##`, 30 por fichero | `2c0372e9`, `6853397c` |
| 2026-05-16/17 | Carga de imágenes (3 lotes) y de `webpages` (5 lotes) | `9a6f2cc8`…`e4a99785` |
| 2026-06-25/28 | `web-pages.json` y catálogo de webs en 5 ficheros; minificación | `8e6e8760`, `9b4ddb3f`…`ead82dd3`, `5ba16d69` |
| Árbol de trabajo | Fuentes movidas a `src/data/prompts/` (15 catálogos, 4,2 MB); catálogos paginados derivados con `build-paged-catalogs.mjs`; agregados de reseñas con `build-review-aggregates.mjs`; ambos en `prebuild` | `package.json`, `scripts/` |
| Árbol de trabajo | Test de integridad de catálogo y auditoría de procedencia (`catalog:provenance`) | `tests/data/catalog-integrity.test.mjs`, `scripts/audit-catalog-provenance.mjs` |

Estado actual: 15 catálogos en `src/data/prompts/`, 301 directorios y 115 MB en
`public/webpages` (sin seguimiento en git).

## 2. Identidad y cuentas

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-15 | **Kinde** como proveedor de identidad; endpoint de autenticación | `b18d7be6`, `e1ca922e`, `4a2f3055`, `faf5c337` |
| 2026-05-17 | **Kinde → Clerk**, en el mismo commit que `next-intl` | `e4a99785` |
| Árbol de trabajo | Webhooks de Clerk verificados con `svix`; modelos `RegisteredUser`, `NewUser`, `UserProfile`, `UserActivity`, `UserInterest` | `src/models/`, `src/app/api/` |
| Árbol de trabajo | Nota de diagnóstico: `auth.protect()` con `Accept: */*` responde **404**, no 307 — al probar rutas protegidas hay que enviar `Accept: text/html` | [base-de-conocimiento.md](../operaciones/base-de-conocimiento.md) |

Clerk está hoy en 82 ficheros de `src/`. Traza completa:
[T-01](02-trazas-de-decision.md#t-01--autenticación-kinde--clerk).

## 3. Persistencia

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-15 | Backend de Firebase | `ed851c1e` |
| 2026-02-07 | `firebase-admin` en dependencias; fallo de semilla con `7 PERMISSION_DENIED` | `9bd8a158`, `d27d299d` |
| 2026-02-06 | Reglas de Firestore | `firestore.rules` |
| 2026-06-24 | **Mongoose/MongoDB**, el mismo día que los precios de afiliados | `3f9fadf4` |
| Árbol de trabajo | 35 modelos en `src/models/`: créditos (`AICreditAccount`, `AICreditLedger`), generación (`AIGenerationJob`, `BatchGeneration`), afiliados (7 modelos), marketplace (`MarketplaceListing`, `MarketplaceSale`), calidad (`EvaluationSuite`, `HumanEvaluation`, `OutputContract`), cumplimiento (`CookieConsent`) | `src/models/` |
| Árbol de trabajo | Corrección de índice de perfiles como script | `scripts/fix-user-profiles-index.mjs` |

Reparto actual: Mongoose en 106 ficheros, Firebase en 5 —solo analítica y la
página de cookies—. Traza:
[T-02](02-trazas-de-decision.md#t-02--datos-firestore--mongodb).

## 4. Comercio y cobros

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-15 | Primera pantalla de precios | `60b41ca9` |
| 2026-05-18 | SDK de **Stripe**, más `@aws-sdk/client-s3` y `cloudflare` | `c1606709` |
| 2026-06-24 → 2026-07-06 | Cinco iteraciones de precios | `d647078b`, `d4de4cb0`, `b644c0fd`, `55e3069d`, `4c80dd26` |
| 2026-07-03 | **Stripe** operativo | `62a043d9` |
| 2026-07-18 | Planes de suscripción | `a2c71a3f` |
| Árbol de trabajo | Recarga de créditos, compra de componentes, marketplace de creadores, checkout de componentes | `src/app/api/{credits,component-checkout,marketplace,purchases}`, tests `credit-topup`, `creator-marketplace`, `generation-pricing` |

Stripe está en 20 ficheros. Orden de construcción del negocio:
[T-10](02-trazas-de-decision.md#t-10--orden-de-construcción-del-negocio).

## 5. Afiliados

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-06-24 | Precios del programa | `d647078b` |
| 2026-06-24 | Validación | `775ccd15` |
| 2026-06-29 | Programa de afiliados; entran `resend` y `svix` | `6bebc0b7` |
| 2026-06-29 | Comisiones | `74acb576` |
| 2026-06-29 | URL canónica del sitio | `b0b2194f` |
| Árbol de trabajo | 7 modelos (`AffiliateApplication`, `AffiliateClick`, `AffiliateSale`, `AffiliateDailyStats`, `AffiliateReferralStats`, `AffiliateUserStats`, `AffiliatePayoutAccount`) y test de reclamaciones | `src/models/`, `tests/unit/affiliate-claims.test.ts` |

## 6. Publicidad y cumplimiento

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-02-02 | `ads.txt` movido a `public/` | `cd2d4757` |
| 2026-03-03 | Primeros anuncios | `0734ffdc` |
| 2026-07-07 → 10 | **AdSense** en cinco commits | `f2d63ad8`, `66ee4fa8`, `95fade52`, `ece36f8a`, `e9ceb08f` |
| 2026-07-18 | **Banner de cookies** — ocho días después de activar AdSense | `b533bf1b` |
| 2026-04-09 | «remover politicas» | `e4152ff4` |
| Árbol de trabajo | Modelo `CookieConsent`, páginas `/cookies` y `/licenses`, informes CSP (`api/csp-report`) | `src/models/CookieConsent.ts`, `src/app/[locale]/` |

## 7. IA y generación

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2025-12-10 | Genkit y `@genkit-ai/google-genai` desde el commit inicial | `f2839bc3` |
| Árbol de trabajo | 5 flujos: `generate-image`, `generate-image-video-prompts`, `optimize-prompt`, `personalize-component`, `prompt-goals` | `src/ai/flows/` |
| Árbol de trabajo | Cola de generación con créditos, reintentos y registro de fallos | [ai-generation-queue.md](../ai-generation-queue.md), `src/lib/generation/` |
| Árbol de trabajo | Generación por lotes, contratos de salida, suites de evaluación y evaluación humana | tests `batch-generation`, `evaluation-suite`, `generation-feedback` |
| Árbol de trabajo | Qué se registra hoy de cada generación y qué falta | [feedback-ia.md](../operaciones/feedback-ia.md) |

## 8. Internacionalización

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-05-17 | `next-intl` en dependencias | `e4a99785` |
| Árbol de trabajo | `src/app/[locale]/`, `src/i18n/{config,request,detect-locale}.ts`, `messages/{en,es}.json` | árbol de trabajo |
| Árbol de trabajo | Detección de idioma movida al middleware: de 121 rutas dinámicas a 60, con 202 páginas prerenderizadas | traza [T-06](02-trazas-de-decision.md#t-06--detección-de-idioma-y-cacheabilidad) |
| Árbol de trabajo | Redirección 308 de `/en/…` a la canónica sin prefijo | traza T-06 |

`next-intl` está en 84 ficheros. Los catálogos de componentes localizan **por
sufijo** (`title_es`, `title_en`), no por objeto anidado, y envuelven el array:
un lector genérico debe buscarlo con `Object.values(...).find(Array.isArray)`.

## 9. SEO

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-02-02 | Corrección de bloqueo por `robots.txt` detectado en Search Console | `cd2d4757` |
| 2026-06-29 → 30 | Tres tandas de mejoras de SEO | `9ded739b`, `30cb28f1`, `404e364b` |
| 2026-06-29 | Registro de eventos | `b38f7360` |
| Árbol de trabajo | **13 validadores** encadenados en `seo:validate-all`: canónicas, sitemap, cabeceras de robots, metadatos, schema, enlazado interno, contenido duplicado, rendimiento, cobertura de catálogo, Search Console, sitemap en vivo por HTTP, auditoría de `webpages` | `package.json`, `scripts/validate-*.mjs` |
| Árbol de trabajo | SEO programático con saneado de etiquetas (`cleanTags()`) | `src/lib/seo/programmatic-seo.ts` |

Traza: [T-09](02-trazas-de-decision.md#t-09--bloqueo-por-robotstxt).

## 10. Rendimiento

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-02-03 | Tema claro/oscuro (`next-themes`) | `599e506c` |
| 2026-05-19 | Variantes `.gz` precomprimidas | `ba3b0a65` |
| 2026-05-19 | Animaciones con `framer-motion` | `1794c7a4` |
| 2026-06-28 | Minificación | `5ba16d69` |
| 2026-07-03 | Minificación de `public/` | `5ff2cde4` |
| Árbol de trabajo | Cadena de build: `minify-public-assets` → `optimize-public-media` → `precompress-static`; AVIF primero y WebP de respaldo en `next.config.ts` | `package.json`, `next.config.ts` |
| Árbol de trabajo | Auditoría de políticas de caché (`cache:audit`, dentro de `test:ci`) y análisis de bundles por ruta (`analyze:routes`) | `scripts/`, `reports/route-bundle-analysis.json` |
| Árbol de trabajo | Presupuestos de navegador en CI con Playwright | `tests/e2e/performance.spec.ts` |

Advertencia registrada: las variantes `.br` y `.gz` **saltan los bloqueos por
extensión**; cualquier regla de bloqueo debe cubrir las tres formas.

## 11. Seguridad

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-15 | Un `KINDE_CLIENT_ID` queda escrito en el **mensaje** de un commit | `4a2f3055` |
| 2026-05-19 | «add api keys» | `1794c7a4` |
| 2026-07-03 | **78 líneas fuera de `.env.example`** — mismo día que Stripe | `2bf9a846` |
| Árbol de trabajo | `verify:env-example` y `verify:rotation` en `test:ci`; el segundo compara lo que se usa hoy contra todo lo que alguna vez estuvo en el historial | `scripts/check-env-example.mjs`, `scripts/check-leaked-secrets.mjs` |
| Árbol de trabajo | Fuentes de catálogo movidas de `public/` a `src/data/`; bloqueo **por directorio**, no por lista de nombres; cobertura de `.json`, `.json.br` y `.json.gz` | traza [T-05](02-trazas-de-decision.md#t-05--producto-de-pago-descargable-desde-public) |
| Árbol de trabajo | Cabeceras de seguridad y CSP con informes | `src/lib/security-headers.ts`, `src/app/api/csp-report` |
| Árbol de trabajo | Procedimiento de rotación de credenciales | [rotacion-de-credenciales.md](../rotacion-de-credenciales.md) |

**Pendiente y no resuelto**: los secretos borrados de HEAD siguen en el
historial. Hasta que se roten, siguen vivos. Traza
[T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample).

## 12. Calidad y CI

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-05-17 | Playwright en dependencias | `e4a99785` |
| 2026-05-20 | Configuración de despliegue | `e1e2aa22` |
| 2026-07-01, 07-04 | Validaciones de componentes | `245a04e7`, `af28ca36` |
| Árbol de trabajo | 42 tests unitarios, 3 suites e2e, 1 test de integridad de datos | `tests/` |
| Árbol de trabajo | `test:ci` = `verify:env-example` + `typecheck` + tests + `cache:audit` | `package.json` |
| Árbol de trabajo | CI en cada pull request, con presupuestos de navegador en un job aparte | `.github/workflows/quality.yml` |
| Árbol de trabajo | `check-node-version.mjs` en `preinstall`, con `.nvmrc` y `.node-version` fijados | `scripts/`, raíz |

Compromiso vigente y consciente: `typescript.ignoreBuildErrors` y
`eslint.ignoreDuringBuilds` siguen a `true` en
[`next.config.ts:78-82`](../../next.config.ts). Los errores de tipo **no**
bloquean el build; sí bloquean el merge, porque `typecheck` está en `test:ci`.

## 13. Documentación

| Fecha | Cambio | Evidencia |
|---|---|---|
| 2026-01-21 | `blueprint.md` inicial | `docs/blueprint.md` |
| 2026-06-26 | Tres actualizaciones seguidas del README | `11a46665`, `31c2065a`, `7adba51d` |
| 2026-09-04 | Nueve documentos operativos escritos entre las 15:11 y las 19:57: SOPs de generación, comercial, catálogo y despliegue; CRM; base de conocimiento; historial; feedback de IA; índice | `docs/operaciones/` |
| 2026-09-04 | PRD, modelo de datos, rotación de credenciales, observabilidad, testing, cola de generación, mejoras recomendadas | `docs/` |
| 2026-09-08 | Agentes de trabajo, marketing, FAQ de precios | `docs/agentes.md`, `docs/marketing.md`, `docs/faq-precios-rescatada.md` |
| 2026-09-09 | Este historial de creación y de cambios | `docs/historial/` |

Traza: [T-12](02-trazas-de-decision.md#t-12--documentar-como-acto-deliberado-fase-7).

---

## Cómo reproducir

```bash
# cuándo entró una dependencia
git log -S'"@clerk/nextjs"' --pretty='%h %ad %s' --date=short -- package.json | tail -1

# commits que tocaron un área
git log --pretty='%h|%ad|%s' --date=short -- src/app/api/affiliate

# uso actual de una tecnología
grep -rl '@clerk' src --include='*.ts' --include='*.tsx' | wc -l

# qué está sin commitear
git status --porcelain | awk '{print $1}' | sort | uniq -c
```
