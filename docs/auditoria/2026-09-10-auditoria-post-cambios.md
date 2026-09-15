# Auditoría posterior a los cambios — 10 de septiembre de 2026

## 0. El límite de esta auditoría, antes de nada

**No existe un "después" medible en tráfico ni en conversión.** Dos motivos, los
dos verificados:

1. **Nada de lo hecho está desplegado.** Producción sirve el build del 18 de
   julio (`b533bf1b`). HEAD tiene 13 modelos de datos y 31 rutas de API; el árbol
   de trabajo tiene 42 y 102. Las páginas nuevas responden **404 en producción**.
2. **La instrumentación del embudo tampoco está desplegada.** `ObservabilityEvent`,
   `api/observability/events` e `instrumentation.ts` **no están en HEAD**: en
   producción no se ha recogido ni un evento de rendimiento o de comercio. De los
   16 eventos de analítica que hay en el código, solo **4** están vivos.

A eso se suma que esta sesión **no tiene acceso a Search Console, Analytics ni
Stripe** (los conectores exigen una autorización que no puede completarse aquí).

Consecuencia: de las 17 dimensiones pedidas, **7 son medibles hoy** y 10 no
tienen dato ni lo tendrán hasta desplegar y esperar. Lo que sigue distingue una
cosa de la otra en cada apartado, y el roadmap del §5 sale de eso.

---

## 1. Qué es BEFORE y qué es AFTER

| | Contenido | Cómo se midió |
|---|---|---|
| **BEFORE** | `https://www.prompstudio.com` — build del 18-jul-2026 | Peticiones HTTP reales al sitio en vivo |
| **AFTER** | Árbol de trabajo, compilado con `npm run build` y servido con `next start` | Build local (exit 0, 3,8 min) y mediciones sobre él |

Toda cifra de este documento se obtuvo hoy con los comandos del §6.

---

## 2. Resultados por dimensión

### 2.1 SEO técnico — **el hallazgo principal**

`npm run seo:validate-all` **estaba completamente roto**: abortaba en el primer
paso con `ENOENT` y los otros once validadores no llegaban a ejecutarse. Llevaba
así desde los refactores de septiembre, y nadie lo notó porque **`seo:validate-all`
no está en CI** (`test:ci` solo ejecuta `verify:env-example`, `typecheck`, los
tests y `cache:audit`).

Cinco causas distintas, todas verificadas:

| Causa | Validadores afectados |
|---|---|
| El catálogo se movió de `public/webpages/web-pages.json` a `src/data/` al sacar el producto de pago de `public/` | `audit-webpages`, `validate-duplicate-content`, `validate-seo-performance`, `validate-catalog-coverage`, `validate-search-console`, `validate-live-sitemap-http` |
| Las páginas se movieron a `src/app/[locale]/…` | `validate-canonicals`, `validate-seo-performance` |
| `/pricing` dejó de tener layout: hoy es una redirección en el middleware | `validate-canonicals` (esperaba un fichero borrado **y** la forma antigua del proxy) |
| Dos validadores tenían el informe comentado (`//console.log`) y salían con código 1 **sin imprimir nada** | `validate-seo-performance`, `validate-duplicate-content` |
| `const DEFAULT_SITE_URL = 'process.env.DOMAIN'` — la cadena literal, no la variable | `validate-live-sitemap-http` |

**Arreglados hoy los siete.** Estado actual, ejecutando cada uno por separado:

| Validador | Antes de hoy | Ahora |
|---|---|---|
| `validate-canonicals` | crash ENOENT | **OK** |
| `validate-robots` | no se ejecutaba | **OK** |
| `validate-metadata` | no se ejecutaba | **OK** — 4 páginas + 244 landings |
| `validate-schema` | no se ejecutaba | **OK** |
| `validate-internal-links` | no se ejecutaba | **OK** — 244 landings |
| `validate-search-console` | crash ENOENT | **OK** |
| `cache:audit` (sí estaba en CI) | OK | **OK** |
| `audit-webpages` | crash ENOENT | falla con **11 hallazgos reales** |
| `validate-sitemap` | fallaba | falla con **10 hallazgos** |
| `validate-catalog-coverage` | crash ENOENT | falla con **~110 hallazgos** |
| `validate-duplicates` | fallo silencioso | falla con **43 grupos** |
| `validate-performance` | fallo silencioso | falla con **115 hallazgos** |
| `validate-live-sitemap-http` | URL basura por el bug literal | falla con **2 hallazgos** (de 472 URLs) |

**Veredicto**: el SEO técnico no mejoró ni empeoró por los cambios; lo que
cambió es que **ahora se puede ver**. Antes el gate daba falsa tranquilidad.

### 2.2 Indexación

| Métrica | BEFORE | AFTER | Δ |
|---|---|---|---|
| URLs en el sitemap | **472** | **817** | +345 (+73 %) |
| URLs del sitemap que responden bien | 470 / 472 | — (sin desplegar) | — |
| Páginas marcadas `noindex` a propósito | 0 de las auditadas | 2 (`/component-builder`, `/my-components`) | +2 |

Defectos de indexación **vivos hoy en producción**, encontrados al reparar el
validador:

- `https://www.prompstudio.com/landing-pages/https%3A//nexora.work/` → 308. Una
  URL basura **dentro del sitemap**, causada por una entrada de catálogo cuyo
  `demoUrl` guarda una URL externa en vez de un slug.
- `/landing-pages/cozyloft-home-decor` → 308 hacia `/landing-pages`: está en el
  sitemap y no existe en producción.
- **7 carpetas de demo huérfanas** en `public/webpages` sin entrada en catálogo
  (`albiceleste`, `cipher-cyberpunk-neon`, `cr7`, `cristiano-ronaldo`, `el-tri`,
  `eternal-glory`, `kylian`): rastreables y sin enlace, gasto de rastreo puro.
- **3 entradas de catálogo sin carpeta en disco** (`editorial-minimal`,
  `cyberpunk-neon`, `cats`): previsualización rota.

### 2.3 CTR · Rankings · Clics orgánicos · Clics non-brand · Móvil · Escritorio · Países

**Sin datos, y no por falta de intento.** No hay acceso a Search Console en esta
sesión, y aunque lo hubiera: el AFTER no está publicado, así que no existe un
periodo posterior que comparar. `validate-search-console-seo.mjs`, pese al
nombre, es una comprobación estática de ficheros — no consulta la API.

Lo único que se puede afirmar es **direccional y sin confirmar**: el sitemap
crecería un 73 % y la home pasaría de 0 a 4 bloques de datos estructurados, lo
que afecta a impresiones y a CTR potencial. Cualquier número concreto sería
inventado.

### 2.4 Core Web Vitals

**Campo: no hay dato, ni antes ni después.** La instrumentación que los
recogería no está desplegada, y su esquema borra cada evento a los **90 días**
(`expires: 60 * 60 * 24 * 90`), así que ni retroactivamente se podrá reconstruir
una serie larga.

**Laboratorio** (home, mediana de 3 cargas, Chrome 1366×900):

| Métrica | BEFORE (producción) | AFTER (build local) | Δ |
|---|---|---|---|
| **CLS** | **0,122** | **0** | −100 % |
| JS transferido | 1 086 kB | **502 kB** | −54 % |
| Recursos solicitados | 132 | **44** | −67 % |
| Total transferido | **91,8 MB** | **22,4 MB** | −76 % |
| HTML del documento | 833 011 B | **259 349 B** | −69 % |
| TTFB / FCP / LCP | 197 / 1 768 / 5 276 ms | 6 034 / 16 708 / 23 344 ms | **no comparable** |

Las tres últimas **no valen como comparación**: el BEFORE es un sitio remoto con
CDN y caché caliente; el AFTER es un `next start` en frío, en la misma máquina
que compilaba, con render dinámico y llamadas a Mongo y Clerk en la primera
petición. Se listan para que nadie las cite como regresión.

CLS y los bytes sí son comparables, y mejoran mucho. **Los 91,8 MB de la home de
julio** son el dato más llamativo de toda la auditoría.

Del build (AFTER): 84 rutas SSG + 3 estáticas + **112 dinámicas**; JS compartido
102 kB; middleware 89,2 kB. Las más pesadas: `gallery/[id]` 381 kB,
`web-animations` 321 kB, `landing-pages` 310 kB, `my-components` 295 kB.

> **Discrepancia a resolver**: la documentación de septiembre afirma «de 121
> rutas dinámicas a 60, con 202 páginas prerenderizadas». El build medido hoy da
> **112 patrones dinámicos**. Puede que se contaran páginas generadas frente a
> patrones de ruta; hasta aclararlo, la cifra de la documentación no se sostiene.

Los presupuestos de rendimiento del propio proyecto (`tests/e2e/performance.spec.ts`)
no se pudieron ejecutar en local: falta el binario `chrome-headless-shell` de
Playwright. En CI sí corren.

### 2.5 Datos estructurados

| | BEFORE | AFTER |
|---|---|---|
| Bloques `application/ld+json` en la home | **0** | **4** |
| Bloques en una landing (`/landing-pages/linear-clone`) | **0** | — (sin desplegar) |
| Tipos declarados en el código | — | 14 (`WebSite`, `Organization`, `Product`, `Offer`, `BreadcrumbList`, `VideoObject`, `Review`, `SoftwareApplication`, `ImageObject`, `Person`, `Brand`, `Rating`, `ListItem`, `ShippingDeliveryTime`) |

Producción **no emite datos estructurados en absoluto**, ni en la home ni en las
landings. Es la mejora potencial más limpia del lote: de cero a cuatro bloques
solo por desplegar.

### 2.6 Enlazado interno

| Métrica | BEFORE | AFTER |
|---|---|---|
| Enlaces `<a>` en el HTML inicial de la home | 26 | **29** |
| Entradas de menú para los kits de UI | 9 sueltas | **1** con submenú en rejilla |
| `validate-internal-links` | no se ejecutaba | **OK**, 244 landings |

Comprobé el riesgo obvio de la fusión —que los nueve kits perdieran enlaces
sitewide— y **no se materializa**: esos enlaces nunca estuvieron en el HTML
inicial, porque el menú de Radix se renderiza al abrirse. Antes y después, cero.
El enlazado rastreable hacia esos kits depende del pie de página y de
`/component-kits`, no del menú.

### 2.7 Conversión de landing · Registro · Activación · Pago

**Sin datos.** Eventos vivos en producción: `web_buy_button_premium`,
`web_download_free`, `web_download_premium`, `web_view_prompt`. Y nada más.

Los **12 eventos del embudo** están escritos y sin desplegar:
`web_checkout_start`, `free_to_premium_conversion`, `credit_topup_click`,
`component_prompt_copy`, `component_preview_view`, `component_purchase_click`,
`component_favorite_add`, `component_project_add`, `component_category_view`,
`next_project_download`, `web_preview_customize`, `smart_search_no_results`.

Es decir: **no hay medición de checkout iniciado, de conversión free→premium, de
recarga de créditos ni de activación**. Ni antes ni ahora.

Y sobre eso se han puesto dos puertas nuevas: `/component-builder` exige pago y
`/my-components` exige cuenta. Son cambios que **mueven la conversión por
definición** y hoy se harían a ciegas.

---

## 3. Veredictos

### Qué mejoró (medido)

1. **Peso de la home**: −76 % de bytes transferidos (91,8 → 22,4 MB), −67 % de
   recursos, −54 % de JavaScript, −69 % de HTML.
2. **CLS**: 0,122 → 0.
3. **Datos estructurados**: 0 → 4 bloques en la home.
4. **Superficie indexable**: sitemap de 472 → 817 URLs.
5. **Visibilidad del SEO técnico**: de un gate roto que no comprobaba nada a 7
   validadores en verde y 5 fallando con hallazgos accionables.
6. **Superficie de producto**: 50 → 90 páginas, 31 → 102 rutas de API, 13 → 42
   modelos, 0 → 56 ficheros de test.
7. **Enlaces en la home**: 26 → 29, con el menú de 9 entradas reducido a 1.

### Qué empeoró

1. **Un duplicado que introduje yo**: al arreglar el `demoUrl` malformado de
   `caselab-ux-design-portfolio` creé una segunda entrada con el mismo slug,
   mismo id y mismo precio. **Ya está corregido** (catálogo de 245 → 244
   entradas), y lo detectó `validate-catalog-coverage` en cuanto volvió a
   funcionar.
2. **Riesgo de conversión sin red**: dos puertas nuevas sin un solo evento
   desplegado para medir su efecto.
3. **Biblioteca de componentes sin migración**: lo que los usuarios tengan hoy
   en `localStorage` no sube a la cuenta; al entrar verán su biblioteca vacía.

### Qué no cambió

1. `seo:validate-all` **sigue fuera de CI**. Los validadores arreglados hoy
   volverán a podrirse igual.
2. `typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds` siguen a `true`.
   El import muerto que rompió el HMR ayer pasó por ahí.
3. **Nada está desplegado ni commiteado**: 431 ficheros sin seguimiento.
4. Los secretos del historial siguen sin rotar.
5. Defectos de catálogo preexistentes, ahora visibles y sin tocar: **~85
   entradas sin `description`**, **10 con precio inválido**, **43 grupos de
   títulos casi idénticos**, **115 hallazgos de rendimiento** (demos cargando
   `three.js` y `gsap` desde cdnjs), y 2 duplicados de `demoUrl` anteriores a
   mis cambios (`buffer-clone`, `mononote-writing-app`, con precios distintos:
   15,00 frente a 5,00).
6. Aviso de Mongoose sin atender: `errors` es un pathname reservado y se usa en
   `AIGenerationJob.outputValidation.errors`.

### Qué deberíamos revertir

**Nada por datos, porque no hay datos que lo justifiquen.** Con una excepción de
criterio, no de medición:

- **El muro de pago de `/component-builder`**, tal como está, cierra de golpe una
  página que hasta ahora era gratuita y que muestra componentes etiquetados como
  `Free`. El propio repositorio tiene un precedente mejor: `PRO_PLAN_ENFORCED`,
  una bandera que arranca desactivada precisamente porque «desplegar el código no
  cambia nada hasta que se pone a 1». Recomiendo envolver la puerta en una
  bandera equivalente y activarla cuando los eventos estén midiendo. Coste: una
  hora. Alternativa a probar: modo plantilla en solo lectura para quien no paga y
  Composición/exportación tras la puerta.

### Qué deberíamos escalar

1. **Las capturas de demo**: 43 generadas con `build-webpage-previews.mjs`; el
   catálogo tiene 244 entradas. Escalarlo elimina la última imagen ausente y da
   material para `og:image`.
2. **Datos estructurados**: de 4 bloques en la home a las plantillas de landing,
   galería y componentes, que ya tienen los tipos declarados en `json-ld.ts`.
3. **El patrón de validador arreglado**: `seo:validate-all` a CI, con el mismo
   criterio que ya funcionó en `test:ci`.

### Qué deberíamos probar después

Por orden de valor esperado, y ninguna de estas pruebas es posible hasta
desplegar y medir:

1. **Puerta del builder**: muro duro frente a plantilla gratis + Composición de
   pago. Métrica: registros iniciados y conversión free→premium.
2. **Migración de biblioteca local → cuenta** en el primer inicio de sesión.
   Métrica: retención de favoritos y % de cuentas con al menos una colección.
3. **El prompt con composición** (el que describe los bloques arrastrados)
   frente al prompt de plantilla. Métrica: `component_prompt_copy` y descargas.
4. **Home nueva frente a la de julio**: hay una diferencia de 69 MB de bytes; el
   efecto en rebote y en LCP de campo es la incógnita más grande del proyecto.

---

## 4. Cuadro resumen

| Dimensión | BEFORE | AFTER | Veredicto |
|---|---|---|---|
| SEO técnico | gate roto, 0 validadores útiles | 7 OK · 5 con hallazgos | **Mejoró** (visibilidad) |
| Indexación | 472 URLs, 2 defectos vivos | 817 URLs proyectadas | **Mejoró**, con deuda |
| CTR | sin datos | sin datos | **Sin medir** |
| Rankings | sin datos | sin datos | **Sin medir** |
| Clics orgánicos | sin datos | sin datos | **Sin medir** |
| Clics non-brand | sin datos | sin datos | **Sin medir** |
| Móvil | sin datos | sin datos | **Sin medir** |
| Escritorio | sin datos | sin datos | **Sin medir** |
| Países | sin datos | sin datos | **Sin medir** |
| Core Web Vitals | campo: nada · CLS lab 0,122 | campo: nada · CLS lab 0 | **Mejoró** (lab) |
| Datos estructurados | 0 bloques | 4 bloques | **Mejoró** |
| Enlazado interno | 26 enlaces · 9 entradas | 29 enlaces · 1 entrada | **Mejoró** |
| Conversión de landing | 4 eventos | 4 eventos (12 sin desplegar) | **Sin medir** |
| Conversión de registro | sin eventos | sin eventos desplegados | **Sin medir** |
| Activación | sin eventos | sin eventos desplegados | **Sin medir** |
| Conversión de pago | sin eventos | sin eventos desplegados | **Sin medir** |

---

## 5. Roadmap de 90 días

Sale de una sola observación: **el trabajo está hecho y no está ni desplegado ni
medido**, así que cualquier plan que empiece por optimizar optimizaría a ciegas.

### Días 1-30 — Que exista un "después" que medir

| # | Acción | Por qué (observado) | Hecho cuando |
|---|---|---|---|
| 1 | **Rotar los secretos del historial** | Bloqueante: hay un `sk_live_` de Clerk en commits antiguos | `verify:rotation` en verde |
| 2 | **Commitear la fase 7 por bloques** | 431 ficheros sin seguimiento; 6 días de trabajo sin trazabilidad | `git status` limpio |
| 3 | **Desplegar** | Producción sirve julio; el AFTER no existe para nadie | `/component-kits` responde 200 |
| 4 | **Desplegar la observabilidad y revisar el TTL de 90 días** | En producción no se recoge ni un evento; el TTL impide series largas | `api/observability/events` responde 200 |
| 5 | **Desplegar los 12 eventos del embudo** | Hoy solo 4 vivos; sin ellos no hay conversión medible | Los 16 aparecen en analítica |
| 6 | **`seo:validate-all` a CI** | El gate llevaba semanas roto sin que nadie lo notara | El workflow lo ejecuta |
| 7 | **Envolver el muro del builder en una bandera** | Precedente `PRO_PLAN_ENFORCED`; hoy quita acceso sin medición | Bandera desactivada por defecto |
| 8 | **Arreglar los 2 defectos del sitemap en vivo** | URL basura indexable + landing inexistente | `validate-live-sitemap-http` en verde |
| 9 | **Decidir las 7 carpetas huérfanas**: catalogar o borrar | Gasto de rastreo sin enlace | `audit-webpages` en verde |

### Días 31-60 — Cerrar los defectos que el validador ya señala

| # | Acción | Cifra observada |
|---|---|---|
| 10 | Rellenar `description` en el catálogo | ~85 entradas vacías |
| 11 | Corregir precios inválidos | 10 entradas |
| 12 | Resolver duplicados de `demoUrl` con precios distintos | `buffer-clone`, `mononote-writing-app` |
| 13 | Diferenciar los 43 grupos de títulos casi idénticos | 43 grupos, muchos «X 3D» vs «X Light Mode 3D» |
| 14 | Autoalojar o diferir `three.js`/`gsap` en las demos | 115 hallazgos de rendimiento |
| 15 | Escalar capturas de demo a las 244 entradas | 43 hechas |
| 16 | Datos estructurados en landings, galería y componentes | Home ya en 4 bloques; 14 tipos declarados |
| 17 | **Línea base de Search Console y analítica a 14 días del despliegue** | Sin ella no habrá comparación posible en el bloque siguiente |
| 18 | Atender el aviso de Mongoose (`errors` reservado) | 1 modelo afectado |

### Días 61-90 — Primeras decisiones con datos

| # | Acción | Métrica que la decide |
|---|---|---|
| 19 | **Leer la línea base**: CTR, rankings, clics orgánicos y non-brand, móvil/escritorio, países | Search Console, 30 días post-despliegue |
| 20 | **Core Web Vitals de campo** frente al lab de hoy | `web_vital` en `observability_events` |
| 21 | **Decidir la puerta del builder** con la bandera | Registros iniciados y free→premium |
| 22 | **Migración de biblioteca local → cuenta** | % de cuentas con ≥1 colección |
| 23 | **Primer A/B real** usando `PromptExperiment`/`EvaluationSuite`, que ya existen | Conversión del embudo medido |
| 24 | Segunda auditoría con este mismo documento como BEFORE | Todas las filas «sin medir» con número |

**Lo que este roadmap no incluye a propósito**: optimizar CTR, perseguir
rankings o retocar el embudo. Son las tres cosas que más piden los planes de 90
días y las tres que hoy no tienen ni un dato detrás. Entran en el bloque 61-90 y
solo si los bloques anteriores se cumplen.

---

## 6. Cómo reproducir cada cifra

```bash
# SEO técnico: cada validador por separado (la cadena aborta en el primer fallo)
for v in audit-webpages validate-canonicals validate-sitemap validate-robots \
         validate-metadata validate-schema validate-internal-links \
         validate-duplicates validate-performance validate-catalog-coverage \
         validate-search-console validate-live-sitemap-http; do
  npm run "seo:$v" >/dev/null 2>&1; echo "$v exit=$?"
done
SEO_REPORT=1 node scripts/validate-seo-performance.mjs   # informe completo

# Indexación
curl -s https://www.prompstudio.com/sitemap.xml | grep -c "<loc>"   # BEFORE: 472
curl -s http://localhost:3046/sitemap.xml | grep -c "<loc>"         # AFTER: 817
node scripts/validate-live-sitemap-http.mjs                          # 2 defectos

# Datos estructurados y enlazado
curl -s https://www.prompstudio.com/ | grep -c 'application/ld+json'   # 0
curl -s http://localhost:3100/       | grep -c 'application/ld+json'   # 4
curl -s https://www.prompstudio.com/ | grep -o '<a ' | wc -l           # 26

# Superficie desplegada frente a la actual
git ls-tree -r --name-only HEAD -- src/models | wc -l   # 13
ls src/models | wc -l                                   # 42

# Eventos del embudo vivos hoy
for f in $(git grep -l 'trackAnalyticsEvent' HEAD -- src | sed 's/^HEAD://'); do
  git show "HEAD:$f" | grep -ohE "trackAnalyticsEvent\('[a-z_]+'"
done | sort -u

# Build y Core Web Vitals de laboratorio
npm run build && npx next start -p 3100
# medición: PerformanceObserver de largest-contentful-paint y layout-shift,
# mediana de 3 cargas — ver §2.4 para por qué TTFB/FCP/LCP no son comparables
```
