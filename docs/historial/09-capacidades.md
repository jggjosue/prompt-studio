# Capacidades, con evidencia

> **Documento histórico.** Esta evaluación corresponde al estado del repositorio en el momento de la revisión original. Desde entonces se añadieron evaluación reproducible, regresión de modelos, contratos de salida, trazabilidad y analítica. Para el estado vigente consulta [docs/capabilities](../capabilities/README.md).

Cómo rellenar un selector de capacidades del tipo «*Select what your team can
provide*» sin marcar nada que no se pueda sostener. Cada fila apunta a un
fichero, un recuento o un commit de este repositorio.

**Por qué importa el rigor aquí.** Una capacidad marcada es una afirmación
verificable: si alguien pide la prueba y no existe, se pierde credibilidad
también en las que sí eran ciertas. Marcar menos y poder demostrarlo todo es más
sólido que marcar todo y sostener la mitad.

> **Nota sobre la captura.** El estado de partida (ocho marcadas, tres sin
> marcar) se ha leído del contraste de los botones en la imagen que me pasaste.
> Si alguna estaba en otro estado, la recomendación de esa fila sigue siendo
> válida por sí misma.

---

## 1. Recomendación en una tabla

| Capacidad | Estado en la captura | Recomendación | Fuerza de la evidencia |
|---|---|---|---|
| **Coding/SWE** | marcada | **mantener** | Alta |
| **Enterprise Tool Use** | marcada | **mantener** — es la más fuerte | Alta |
| **Cyber Security** | marcada | **mantener**, con el matiz de §2.3 | Media-alta |
| **Technical PM** | marcada | **mantener**, con el matiz de §2.4 | Media |
| **Computer Use** | marcada | **mantener**, con el matiz de §2.5 | Media-baja |
| **Synthetic** | **sin marcar** | **marcarla** | Alta |
| **ML Research** | marcada | **desmarcar** | Ninguna |
| **MCP Integrations** | marcada | **desmarcar** | Ninguna |
| **STEM QA** | marcada | **desmarcar** | Ninguna en el sentido del término |
| **Quant Trading** | sin marcar | dejarla sin marcar | Ninguna |
| **Scrape** | sin marcar | dejarla sin marcar | Ninguna |

Resultado: **seis** capacidades marcadas, todas demostrables con un enlace o un
comando. Frente a las ocho de la captura, se pierden tres sin respaldo y se gana
una que sí lo tiene.

---

## 2. Las que sí

### 2.1 Enterprise Tool Use — la más sólida

Doce servicios de terceros integrados y en producción, no en prueba de concepto:

| Servicio | Para qué | Evidencia |
|---|---|---|
| Clerk | Identidad, con webhooks verificados por `svix` | 82 ficheros, `api/webhooks` |
| Stripe | Cobros, planes, recarga de créditos | 20 ficheros, `62a043d9` |
| MongoDB / Mongoose | Almacén transaccional | 106 ficheros, 35 modelos |
| Firebase | Analítica | 5 ficheros |
| Resend | Correo transaccional | `transactional-email.test.ts` |
| AWS S3 / Cloudflare R2 | Almacenamiento de activos | `api/r2`, `@aws-sdk/client-s3` |
| Vercel | Despliegue, analítica y Speed Insights | `vercel.json` |
| Google AdSense | Publicidad | `f2d63ad8`…`e9ceb08f` |
| Google Search Console | SEO | `validate-search-console-seo.mjs` |
| OpenTelemetry / Jaeger | Trazas | `@opentelemetry/exporter-jaeger` |
| Genkit + Google GenAI | Orquestación de IA | 5 flujos en `src/ai/flows/` |
| Playwright | Pruebas de navegador en CI | `.github/workflows/quality.yml` |

**Qué enseñar si lo piden**: `package.json`, `docs/dm.md` y
`docs/operaciones/sop-comercial.md` (cobro y afiliados de punta a punta).

### 2.2 Synthetic — está sin marcar y es de lo mejor que hay

Esta es la corrección más importante de la página. Hay una **cadena completa de
generación sintética**, no un script suelto:

- **Registro de cinco familias de proveedores** detrás de una sola interfaz:
  OpenAI (chat, imagen, edición), Anthropic, Google (Gemini y Veo), Runway
  (arranque y sondeo) y DeepSeek — [`src/lib/generation/provider-adapters.ts`](../../src/lib/generation/provider-adapters.ts).
- **Cola de trabajos** con progreso, reintentos y captura de fallos:
  `api/ai/jobs/[id]/{progress,retry,feedback}`, modelo `AIGenerationJob`,
  documentada en [`ai-generation-queue.md`](../ai-generation-queue.md).
- **Generación por lotes** (`BatchGeneration`, `api/batches`) y **créditos**
  medidos por trabajo (`AICreditLedger`, `AICreditAccount`).
- **Control de calidad de la salida**: `OutputContract`, `EvaluationSuite`,
  `HumanEvaluation`, `PromptExperiment`, `PromptVersion`, con once tests
  unitarios dedicados (`output-contract`, `evaluation-suite`,
  `human-preferences`, `provider-quality`, `prompt-experiment`,
  `prompt-versioning`, `prompt-validation`, `prompt-optimizer`,
  `batch-generation`, `generation-feedback`, `generation-pricing`).
- **Producto sintético real y medible**: 301 páginas web generadas
  (`public/webpages`), 17 scripts de generación de catálogos
  (`scripts/add-*-web-pages.mjs`) y 12 scripts que derivan catálogos publicables
  (`scripts/build-*.mjs`).
- **Modo determinista para pruebas**, con inyección de fallo incluida: en
  `NEXT_PUBLIC_E2E_TEST_MODE`, un prompt con `[fail-once]` fuerza un fallo de
  proveedor la primera vez, para poder probar el reintento.

Ese último punto es el que suele distinguir a quien ha generado datos en serio
de quien ha llamado a una API: hay **camino de fallo probado**, no solo camino
feliz.

**Qué enseñar**: `provider-adapters.ts`, `docs/ai-generation-queue.md` y
`docs/operaciones/sop-generacion-ia.md`.

### 2.3 Cyber Security — defensiva y aplicada, con una cicatriz que conviene contar

Evidencia a favor:

- **Seis tests de seguridad**: `api-security-contracts`,
  `rate-limit-and-api-auth`, `security-and-limits`, `security-headers`,
  `catalog-source-exposure`, `catalog-provenance`.
- **Dos escáneres de secretos propios** en CI: `check-env-example.mjs` y
  `check-leaked-secrets.mjs`, el segundo comparando el uso actual contra **todo
  el historial**.
- **CSP con informes** (`api/csp-report`), cabeceras en
  `src/lib/security-headers.ts`, reglas de Firestore (`firestore.rules`).
- **Protección de producto de pago por directorio**, no por lista de nombres, y
  cobertura de las variantes `.br`/`.gz`
  ([T-05](02-trazas-de-decision.md#t-05--producto-de-pago-descargable-desde-public)).
- **Procedimiento de rotación** escrito
  ([`rotacion-de-credenciales.md`](../rotacion-de-credenciales.md)).

Matiz que hay que dar por delante, no esconder: **hubo secretos filtrados en el
propio historial** y hay una rotación pendiente
([T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample)). Contado bien,
suma: se detectó, se instrumentó un guardarraíl automático, y el guardarraíl se
validó introduciendo cuatro secretos reales para comprobar que los señalaba.
Contado mal —o descubierto por el revisor— resta.

**Cómo formularlo**: seguridad **defensiva de aplicaciones** (AppSec) y de
cadena de despliegue. No pentesting, no red team, no respuesta a incidentes.

### 2.4 Technical PM — con matiz de escala

Artefactos que existen y son verificables: PRD (`docs/prd.md`), modelo de datos
(`docs/dm.md`), **nueve SOPs** operativos, base de conocimiento con 16
incidentes, hoja de mejoras priorizada (`mejoras-recomendadas.md`), reparto de
trabajo en diez zonas (`agentes.md`) y este historial con 12 trazas de decisión.

El matiz: es **gestión técnica de producto propio**, documentada y trazable. No
hay evidencia de coordinar un equipo de varias personas —el repositorio
describe una operación de dos identidades que son dos modos de trabajo de la
misma persona ([06](06-metricas-del-repositorio.md) §2)—. Marcarla es
defendible; presentarla como gestión de equipo, no.

### 2.5 Computer Use — el matiz es el término

Lo que hay: **14 tests de navegador** en tres suites de Playwright
(`user-journeys` 8, `mobile-and-keyboard` 4, `performance` 2), emulación de
móvil y navegación por teclado, presupuestos de rendimiento como job aparte en
CI, y validadores que golpean el sitio en vivo por HTTP
(`validate-live-sitemap-http.mjs`).

Lo que **no** hay: control agéntico de un ordenador o de un navegador para
resolver tareas abiertas, que es lo que «Computer Use» significa habitualmente
en estos formularios. Si el formulario lo entiende como automatización de
navegador y QA end-to-end, mantenerla. Si lo entiende como agentes que operan un
escritorio, desmarcarla.

**Regla práctica**: si no sabes cuál de los dos sentidos usa el formulario,
mantenla y escribe en el campo libre «Playwright end-to-end and browser
automation in CI», que es exactamente lo que se puede demostrar.

### 2.6 Coding/SWE

345 ficheros TypeScript, 84 páginas, 93 rutas de API, 35 modelos de datos, 364
commits en siete meses, Next.js 15 con React 19, y CI que ejecuta
`verify:env-example` + `typecheck` + 46 tests + auditoría de caché en cada pull
request.

Contrapeso honesto, porque un revisor técnico lo verá en diez minutos:
`typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds` siguen a `true` en
[`next.config.ts:78-82`](../../next.config.ts). Los errores de tipo no bloquean
el build; sí bloquean el merge, porque `typecheck` está en `test:ci`. Es una
solución de compromiso y conviene llamarla así antes de que la llamen otros.

---

## 3. Las que no

### 3.1 ML Research — desmarcar

No hay **nada** de investigación en aprendizaje automático: ni entrenamiento, ni
ajuste fino, ni notebooks, ni datasets de entrenamiento, ni métricas de modelo,
ni comparativas reproducibles entre arquitecturas.

Lo que hay —y es otra cosa— es **ingeniería aplicada de LLM**: llamar a modelos
de cinco proveedores, versionar prompts, medir preferencias humanas y contratos
de salida. Eso ya está cubierto por *Synthetic* y por *Coding/SWE*.

Marcar «ML Research» invita a una pregunta técnica que el repositorio no puede
responder. Es la casilla con peor relación entre lo que promete y lo que se
puede demostrar.

### 3.2 MCP Integrations — desmarcar (hoy)

Busqué en todo el repositorio: **no hay ninguna integración MCP**. La única
coincidencia de la cadena «mcp» está dentro de `src/data/prompts/amp.json`, que
es contenido del catálogo, no código.

Usar herramientas con MCP en el entorno de desarrollo no es lo mismo que haber
construido o mantenido integraciones MCP, que es lo que la casilla afirma.

**Cómo convertirla en cierta**: hay una vía natural y corta —exponer el catálogo
o la cola de generación como servidor MCP—. Con eso construido y en un
repositorio enseñable, la casilla pasa a ser demostrable. Antes, no.

### 3.3 STEM QA — desmarcar

«STEM QA» significa habitualmente control de calidad de contenido científico o
técnico: verificar respuestas de matemáticas, física, química, ingeniería. De
eso no hay nada.

Lo que hay es **QA de ingeniería de software**: 42 tests unitarios, 3 suites
e2e, un test de integridad de catálogo, 13 validadores de SEO y CI en cada pull
request. Eso pertenece a *Coding/SWE* y a *Computer Use*, no a esta casilla.

### 3.4 Quant Trading — sin marcar

Cero evidencia. No hay datos de mercado, ni backtesting, ni nada financiero más
allá de cobrar con Stripe.

### 3.5 Scrape — sin marcar

No hay rastreador ni extractor: nada de `puppeteer` ni `cheerio`. Los `fetch` de
los scripts van contra **el propio sitio** (`validate-live-sitemap-http.mjs`,
`sync-free-demo-downloads.mjs`), que es validación, no extracción de terceros.

Y hay una razón de fondo para no marcarla incluso si se supiera hacer: la
procedencia del catálogo todavía no está cerrada
([04](04-inventario-de-fuentes-y-derechos.md) §4.3). Declararse capaz de
extraer datos de terceros mientras hay una auditoría de procedencia abierta es
invitar exactamente la pregunta que no se puede contestar todavía.

---

## 4. Texto listo para un campo libre

Si junto a las casillas hay un campo de descripción:

```text
Full-stack product engineering (Next.js 15 / React 19 / TypeScript, 84 pages,
93 API routes, 35 data models) with twelve third-party services integrated in
production: Clerk, Stripe, MongoDB, Resend, Svix, S3/R2, Cloudflare, Vercel,
AdSense, Search Console, OpenTelemetry and Genkit.

Synthetic generation pipeline across five provider families (OpenAI, Anthropic,
Google Gemini/Veo, Runway, DeepSeek) behind a single registry, with a job queue
(progress, retries, failure capture), batch generation, credit accounting,
output contracts, evaluation suites and human-preference scoring — plus a
deterministic test mode with provider-failure injection. Output to date: 301
generated web pages and 15 catalogs.

Application security as executable guardrails: six security test suites, two
secret scanners in CI (one of them diffing current usage against the entire git
history), CSP with reporting, and paid-content protection enforced per
directory rather than per filename.

Documentation as a deliverable: 20 operational documents (~25,700 words) all
derived from code and git history rather than memory, including 12 decision
traces with their intermediate failures and a 42-entry failure registry.

Scale, stated plainly: a two-identity, seven-month operation, 364 commits.
```

Última frase incluida a propósito. Cualquiera comprueba la escala con un
`git shortlog` en treinta segundos, y es mejor que la diga uno mismo.

## 5. Cómo verificar cada afirmación de esta página

```bash
# Coding/SWE
git ls-files '*.ts' '*.tsx' | wc -l
find src/app -name 'page.tsx' | wc -l && find src/app/api -name 'route.ts' | wc -l

# Enterprise Tool Use
grep -E '"(@clerk|stripe|mongoose|resend|svix|@aws-sdk|cloudflare|firebase)' package.json

# Synthetic
sed -n '25,49p' src/lib/generation/provider-adapters.ts   # registro de proveedores
ls scripts/add-*-web-pages.mjs | wc -l && ls public/webpages | wc -l
ls tests/unit | grep -E 'generation|evaluation|output|provider|prompt'

# Cyber Security
ls tests/unit | grep -E 'security|rate|catalog'
ls scripts | grep -E 'check-|audit-'

# Computer Use
grep -c 'test(' tests/e2e/*.ts

# Lo que NO hay (comprobaciones negativas)
grep -ril 'modelcontextprotocol\|mcp' src scripts | head   # MCP: sin resultados en código
grep -E '"(puppeteer|cheerio)"' package.json               # Scrape: sin resultados
```
