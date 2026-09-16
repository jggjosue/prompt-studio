# Trazas de decisión

Doce decisiones reales del proyecto, reconstruidas con la secuencia completa:

```
problema → conversación → análisis → decisión → acción → error → corrección → resultado
```

Convenciones de este documento:

- **Conversación** significa lo que se pidió y cómo se pidió. En este proyecto
  el registro de la conversación *es* el mensaje de commit durante las fases 1 a
  3 (los mensajes son la instrucción literal en lenguaje natural), y es
  documentación escrita a posteriori en la fase 7. Cuando no existe registro se
  dice «sin registro» en lugar de inventarlo.
- **Error** no significa fracaso de la decisión, sino lo que se rompió entre
  decidir y que funcionara. Es la parte que normalmente se pierde.
- Los estados marcados como **inferido** no constan por escrito: se deducen del
  orden de los commits o del código resultante.

---

## T-01 — Autenticación: Kinde → Clerk

| Campo | Contenido |
|---|---|
| **Problema** | Un prototipo con galería, favoritos y biblioteca personal necesita identidad de usuario desde el primer día. |
| **Conversación** | Registrada, y es literal. `b18d7be6`: «sigue estos pasos: Kinde Starter Kit - NextJS with full App Router suppo…». `e1ca922e`: «sigue estos pasos: Setup Kinde Within your back-end web application upda…». `4a2f3055`: «agrega este environment: KINDE_CLIENT_ID=…». Se está pegando la documentación del proveedor como instrucción. |
| **Análisis** | Sin registro. La elección de Kinde no está justificada en ningún sitio del repositorio. |
| **Decisión** | Kinde como proveedor de identidad (2026-01-15). |
| **Acción** | `b18d7be6`, `e1ca922e`, `4a2f3055`, `faf5c337` (endpoint de API). |
| **Error** | Dos: (1) el `KINDE_CLIENT_ID` queda escrito en el **mensaje** de un commit, donde no se puede borrar sin reescribir el historial; (2) la decisión no sobrevivió cuatro meses. |
| **Corrección** | 2026-05-17, commit `e4a99785`: sale Kinde, entra `@clerk/nextjs`. En el **mismo** commit entra `next-intl`. El mensaje del commit es «web pages 5». |
| **Resultado** | Clerk está hoy en 82 ficheros de `src/`. La sustitución funcionó, pero dejó dos deudas: un secreto en el historial y el cambio de proveedor de identidad más internacionalización mezclados en un commit cuyo mensaje no menciona ninguno de los dos. |
| **Lección** | El coste de un commit mal etiquetado no se paga al hacerlo, se paga al auditarlo. Cuatro meses después no hay forma de saber por qué se cambió de proveedor. |

## T-02 — Datos: Firestore → MongoDB

| Campo | Contenido |
|---|---|
| **Problema** | Persistir usuarios, favoritos y, más tarde, créditos, ventas y comisiones de afiliados. |
| **Conversación** | Parcial. `ed851c1e` (2026-01-15): «Set up a Firebase backend». Del cambio a MongoDB no hay conversación registrada. |
| **Análisis** | Inferido. El detonante es de negocio, no de arquitectura: Mongoose entra en `package.json` el 2026-06-24 (`3f9fadf4`), **el mismo día** que los precios del programa de afiliados (`d647078b`). Comisiones, ventas y liquidaciones son datos relacionales con agregados por periodo; el modelo documental de Firestore obliga a duplicar y a mantener contadores a mano. |
| **Decisión** | Mongoose/MongoDB como almacén transaccional; Firebase se queda solo para analítica. |
| **Acción** | `3f9fadf4` (2026-06-24) y, en la fase 7, los 35 modelos de `src/models/`. |
| **Error** | La convivencia de los dos stacks provocó un fallo de build no evidente: `instrumentation.ts` → `observability-server` → mongoose → drivers de mongodb → `agent-base` → `require('http')`, que webpack mete en el bundle *edge* y revienta con `Module not found: Can't resolve 'http'`. `npm run dev` no lo veía porque usa Turbopack, que resuelve distinto. |
| **Corrección** | Alias a `false` en `webpack.resolve.alias` solo cuando `nextRuntime === 'edge'`, y usando la **ruta absoluta** como clave: aliasear la petición `@/lib/…` no funciona porque el plugin de paths de TypeScript la resuelve antes. Documentado en [base-de-conocimiento.md](../operaciones/base-de-conocimiento.md). |
| **Resultado** | Mongoose en 106 ficheros; Firebase reducido a 5, y solo en analítica y en la página de cookies. Los dos SDK siguen en `package.json`. |
| **Lección** | La que quedó escrita como regla: **un cambio no está verificado hasta que `next build` pasa**. Que el servidor de desarrollo funcione no prueba nada cuando dev y build usan resolvedores distintos. |

## T-03 — Separación de vídeos e imágenes

Es la única decisión de las fases 1 a 6 que se documentó **en su momento**, en
[`MIGRATION_SUMMARY.md`](../MIGRATION_SUMMARY.md). Sirve de referencia de lo
que las demás no tienen.

| Campo | Contenido |
|---|---|
| **Problema** | Un solo `placeholder-images.json` con 156 entradas mezclaba imágenes y vídeos, y cada consumidor filtraba por `item.type === 'video'`. |
| **Conversación** | Registrada por escrito, con el «antes/después» de cada fichero afectado. |
| **Análisis** | Lógica de filtrado repetida en tres componentes, tipos acoplados, y ningún sitio donde un vídeo pudiera tener campos propios. |
| **Decisión** | Dos fuentes independientes y un tipo `VideoProp` propio. |
| **Acción** | Se crean `placeholder-videos.json` (42 vídeos) y `placeholder-videos.ts`; se sacan 41 entradas de vídeo del fichero de imágenes (quedan 115); se actualizan `video-prompts-client.tsx`, `video-examples.tsx`, `sitemap.ts`, `gallery/[id]/page.tsx` y `gallery-detail-client.tsx`. |
| **Error** | El detalle de galería buscaba el `id` solo en imágenes, así que ningún vídeo tenía página de detalle tras la separación. |
| **Corrección** | Búsqueda en ambas fuentes: `const item = imageItem ?? videoItem`, y el componente pasa a aceptar `ImagePlaceholder \| VideoProp`. |
| **Resultado** | 115 imágenes + 42 vídeos, sin pérdida, con paginación funcionando en ambas páginas y sitemap cubriendo los dos tipos. El documento cierra con una lista de verificación pendiente («ejecutar `npm run build`»), es decir, se escribió **antes** de validar el build. |
| **Lección** | Separar una fuente de datos rompe siempre a los consumidores que asumían la fuente única. El coste real no está en partir el fichero, está en encontrar todos los que lo leían. |

## T-04 — Secretos en `.env.example`

| Campo | Contenido |
|---|---|
| **Problema** | `.gitignore` exceptúa `.env.example` con `!.env.example`, así que está versionado por diseño. Llegó a contener 54 valores idénticos a `.env`, entre ellos una clave `sk_live_` de Clerk. |
| **Conversación** | Sin registro previo. El único rastro es el mensaje del commit que lo corrige. |
| **Análisis** | Inferido por la fecha: la limpieza (`2bf9a846`) es del **2026-07-03**, el mismo día que la integración de Stripe (`62a043d9`). La revisión del material versionado se disparó al empezar a manejar cobros reales. |
| **Decisión** | Vaciar el fichero de valores reales y, después, impedir que vuelva a ocurrir con una comprobación automática. |
| **Acción** | `2bf9a846`: −78 líneas en `.env.example`. En la fase 7: `scripts/check-env-example.mjs`, expuesto como `npm run verify:env-example` e incluido en `test:ci`. |
| **Error** | **Borrar de HEAD no borra del historial.** Los valores siguen recuperables en los commits antiguos. La limpieza resolvió la exposición futura, no la pasada. |
| **Corrección** | `scripts/check-leaked-secrets.mjs` (`npm run verify:rotation`), que compara lo que se usa hoy contra todo lo que alguna vez estuvo en el historial, para saber qué hay que **rotar**. La rotación es la única corrección real; el `git rm` no lo es. |
| **Resultado** | El guardarraíl está en CI y se validó como se debe validar: copiando cuatro secretos reales al fichero y comprobando que el test los señalaba —verificar que el test **detecta**, no solo que pasa. Las credenciales expuestas siguen pendientes de rotación hasta que se ejecute el procedimiento de [rotacion-de-credenciales.md](../rotacion-de-credenciales.md). |
| **Lección** | Un secreto commiteado es un secreto quemado. Todo lo demás es contención. |

## T-05 — Producto de pago descargable desde `public/`

| Campo | Contenido |
|---|---|
| **Problema** | Los ficheros fuente del catálogo estaban bajo `public/`, es decir, servidos como estáticos y descargables **con los prompts de pago dentro**. |
| **Conversación** | Sin registro; el hallazgo es de la auditoría de la fase 7. |
| **Análisis** | El derivado público sí se vacía a propósito (`build-paged-catalogs.mjs` borra `description`, que es donde vive el prompt de pago), pero eso no protege a las **fuentes** si las fuentes están en `public/`. |
| **Decisión** | Mover las fuentes a `src/data/` y bloquear el acceso por directorio, no por lista de nombres. |
| **Acción** | `src/data/prompts/` con 15 catálogos (4,2 MB) y regla de bloqueo sobre el directorio completo. |
| **Error** | Tres, encadenados: (1) el bloqueo original enumeraba **8 nombres** de fichero, y una auditoría real encontró **9 ficheros más** con producto de pago que nadie había añadido a la lista, incluidas cuatro copias huérfanas; (2) `precompress-static.mjs` genera variantes `.br` y `.gz`, así que una regla contra `*.json` deja abierto `*.json.br`; (3) los `headers()` de `next.config.ts` con dos lookaheads en el parámetro se comportaron **al revés** —aplicaban a `/api/*`, que estaba excluido, y no a `/terms`, que sí casaba. |
| **Corrección** | Bloqueo por directorio en lugar de por nombre; cobertura de las tres formas (`.json`, `.json.br`, `.json.gz`); un solo lookahead en el patrón de rutas; y un test que **recorre el directorio real** en vez de enumerar lo que hay que proteger. |
| **Resultado** | `src/data/` fuera del alcance público. Quedan 301 directorios y 115 MB en `public/webpages`, sin seguimiento en git y pendientes de la misma revisión. |
| **Lección** | Escrita como patrón general en la base de conocimiento: **los tests que enumeran lo que hay que proteger caducan; los que recorren el directorio real, no.** |

## T-06 — Detección de idioma y cacheabilidad

| Campo | Contenido |
|---|---|
| **Problema** | Con `next-intl`, `src/i18n/request.ts` leía `cookies()` y `headers()` en el layout raíz para detectar el idioma. |
| **Conversación** | Documentada a posteriori en la base de conocimiento. |
| **Análisis** | Leer cabeceras en el layout raíz hace **dinámico todo el sitio**: las 121 rutas pasaban a dinámicas y ninguna página se podía cachear. Poner `revalidate` no servía de nada. |
| **Decisión** | Detectar el idioma en el middleware y reescribir a `/{locale}/…`, de modo que las páginas reciban el idioma como parámetro de ruta y se prerendericen, manteniendo la URL pública sin prefijo. |
| **Acción** | `src/app/[locale]/`, `src/i18n/detect-locale.ts`, reescritura en middleware. |
| **Error** | Tres: (1) sin `setRequestLocale(locale)` en el layout, `getMessages()` vuelve a leer cabeceras y se pierde todo lo ganado; (2) una petición externa a `/en/prices` se re-prefijaba a `/en/en/prices` y daba un 404 opaco —y si algún día dejara de dar 404, serían dos URLs con el mismo contenido; (3) el `Vary` que fija el middleware lo sobrescribe Next para RSC (`x-locale` sí sobrevive). |
| **Corrección** | `setRequestLocale` en el layout; redirección 308 de la forma prefijada a la canónica; y aceptar que `Vary` no es controlable desde el middleware. |
| **Resultado** | De 121 rutas dinámicas a 60, con 202 páginas prerenderizadas. |
| **Lección** | En el App Router, una sola lectura de `cookies()` en el sitio equivocado anula la estrategia de caché de todo el proyecto, y no lo dice ningún error: lo dice el recuento de páginas del build. |

## T-07 — Datos del catálogo sin validar en la entrada

| Campo | Contenido |
|---|---|
| **Problema** | El catálogo se cargó por lotes mediante instrucciones en lenguaje natural (fases 2 y 3), sin esquema ni validación. |
| **Conversación** | Registrada como ráfagas de commits idénticos en su enunciado: `Agrega estas url al placeholder-videos.json en este formato…` ×7 el 2026-02-20. |
| **Análisis** | Hay 52 valores no-`string` en `tags` de `placeholder-images.json`. Un `null` llega a `slugify()` desde `generateStaticParams` de `/tags/[slug]`. |
| **Decisión** | Sanear en el punto de consumo y añadir un test de integridad del catálogo. |
| **Acción** | `cleanTags()` en `src/lib/seo/programmatic-seo.ts`; `tests/data/catalog-integrity.test.mjs`. |
| **Error** | El fallo revienta con `Cannot read properties of null (reading 'normalize')` **en el despliegue, no en desarrollo**, porque solo se ejecuta al generar rutas estáticas. Además, en la ráfaga original del 20-21 de febrero la carga en lote rompió el render cuatro veces seguidas (`bf5273cb`, `79b3146f`, `8802e6ca`, `33261260`) y produjo un `ReferenceError: dynamicVideoVideoTagsData…` (`10c610f4`). |
| **Corrección** | Filtrado defensivo en el consumidor, más el test de integridad como puerta. |
| **Resultado** | El build ya no depende de que los datos estén limpios. Los datos siguen sucios; lo que cambió es que ya no rompen el despliegue. |
| **Lección** | Los datos que entran por conversación entran sin contrato. Si no se valida en la entrada, se valida en el peor momento posible: el build de producción. |

## T-08 — Errores de hidratación y APIs de React retiradas

| Campo | Contenido |
|---|---|
| **Problema** | Serie de errores de consola desde el primer mes: «A tree hydrated but some attributes…» y «ReactDOM.useFormState has been renamed…». |
| **Conversación** | Registrada, y con el texto del error como mensaje de commit: `e8c9e391`, `d8389fb2`, `64c4482a` (enero), `22068625`, `1ab8c38c`, `7851b9ef` (febrero). |
| **Análisis** | Sin registro por caso. El patrón —el mismo error reapareciendo en enero y otra vez en febrero— indica que se corrigió por síntoma, en el componente que lo mostraba, no por causa. |
| **Decisión** | Inferida: corregir cada aparición pegando el error al asistente. |
| **Acción** | Seis commits de corrección, más `7c634c4b` (`DialogContent` requiere `DialogTitle`), `f054fadb` y `fd268e25`/`780d6e06` (fallos de parseo en el build). |
| **Error** | Que el mismo error volviera. `useFormState` aparece en `e8c9e391` (2026-01-15) y otra vez en `22068625` (2026-02-02). |
| **Corrección** | Estructural y tardía: `typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds` siguen a `true` en [`next.config.ts:78-82`](../../next.config.ts), pero `npm run typecheck` está dentro de `test:ci`, que CI ejecuta en cada pull request. La red existe fuera del build. |
| **Resultado** | Los errores de tipo no bloquean el build; sí bloquean el merge. Es una solución de compromiso, y conviene llamarla así. |
| **Lección** | Corregir por el texto del error resuelve la aparición, no la clase. Se nota cuando el historial muestra el mismo mensaje dos veces. |

## T-09 — Bloqueo por `robots.txt`

| Campo | Contenido |
|---|---|
| **Problema** | Páginas no indexables. El mensaje del commit `cd2d4757` (2026-02-02) empieza así: «Da solucion a este error: 2. Bloqueo por robots.txt Es posible que tenga…», copiado de un informe de Search Console. |
| **Conversación** | El propio mensaje del commit, con el diagnóstico externo pegado dentro. |
| **Análisis** | Sin registro. |
| **Decisión** | Corregir `robots.txt` y mover `ads.txt` a la raíz pública. |
| **Acción** | `cd2d4757`: +5 líneas en `public/robots.txt`, `ads.txt` → `public/ads.txt`. |
| **Error** | La corrección fue puntual y no verificable: no había forma de saber si el siguiente cambio la rompía. |
| **Corrección** | Cuatro meses después, en las tandas de SEO de junio (`9ded739b`, `30cb28f1`, `404e364b`) y en la fase 7: **13 validadores** encadenados en `seo:validate-all` —canónicas, sitemap, cabeceras de robots, metadatos, schema, enlazado interno, contenido duplicado, rendimiento, cobertura de catálogo, Search Console y sitemap en vivo por HTTP. |
| **Resultado** | El SEO pasó de corregirse por incidencia a comprobarse por script. |
| **Lección** | Un problema detectado por una herramienta externa se arregla una vez; para que no vuelva hace falta reproducir esa comprobación en casa. |

## T-10 — Orden de construcción del negocio

| Campo | Contenido |
|---|---|
| **Problema** | Un catálogo grande sin forma de cobrar por él. |
| **Conversación** | Solo los mensajes de commit, breves y sin justificación. |
| **Análisis** | Inferido del orden, que es informativo por sí mismo: afiliados (24-29 jun) → Stripe (3 jul) → AdSense (7-10 jul) → planes de suscripción (18 jul). Se probó primero el canal que no requiere infraestructura de cobro. |
| **Decisión** | Monetizar en cuatro capas acumulativas en lugar de elegir una. |
| **Acción** | `d647078b`, `6bebc0b7`, `74acb576` (afiliados); `c1606709`, `62a043d9` (Stripe); `f2d63ad8`…`e9ceb08f` (AdSense); `a2c71a3f` (planes). |
| **Error** | El cumplimiento llegó detrás: el banner de cookies (`b533bf1b`) es de **ocho días después** de activar AdSense, y del mismo día que los planes. Se sirvió publicidad antes de tener el mecanismo de consentimiento. |
| **Corrección** | `b533bf1b` y el modelo `CookieConsent` en `src/models/`. |
| **Resultado** | Cuatro vías de ingreso operativas y consentimiento implementado. Hay una ventana de ocho días en la que la configuración no era defendible. |
| **Lección** | Activar publicidad y activar consentimiento son la misma tarea. Separarlas ocho días no ahorra trabajo, solo mueve el riesgo. |

## T-11 — Diagnóstico sobre un servidor equivocado

| Campo | Contenido |
|---|---|
| **Problema** | Cambios que «no funcionaban» y cambios que «sí funcionaban» sin haberse desplegado. |
| **Conversación** | Documentada en la base de conocimiento, sección de diagnóstico. |
| **Análisis** | `next start` falla con `EADDRINUSE`, pero el `curl` siguiente **responde igual**: lo sirve el proceso anterior, con el build anterior. Los dos commits «The app isn't starting…» (`b875530d`, `b3c50cbe`) son de la misma familia de problema. También: en macOS con Apple Silicon, un `node` x64 bajo Rosetta instala binarios opcionales de la arquitectura equivocada y nada arranca (`Failed to load SWC binary for darwin/arm64`). |
| **Decisión** | Convertir la comprobación del entorno en un paso previo obligatorio. |
| **Acción** | `scripts/check-node-version.mjs` en `preinstall`, `.node-version` y `.nvmrc` fijados, y el procedimiento escrito: `lsof -ti:PUERTO \| xargs kill -9` antes de verificar. |
| **Error** | El coste ya estaba pagado: se dieron por buenos cambios que no estaban desplegados. |
| **Corrección** | La de arriba, más la nota de que `next@15.5.9` fija `@next/swc-darwin-arm64@15.5.7` **a propósito** —si ese binario falla es que la descarga se truncó; debe pesar unos 129 MB. |
| **Resultado** | `preinstall` bloquea la instalación con una versión de Node incorrecta. |
| **Lección** | Buena parte del tiempo perdido en un proyecto de una persona no se pierde programando, se pierde diagnosticando sobre un entorno que no es el que se cree. |

## T-12 — Documentar como acto deliberado (fase 7)

| Campo | Contenido |
|---|---|
| **Problema** | Siete meses de trabajo con mensajes de commit del tipo `add`, `addd`, `update`, `adds`, `fixes`. El conocimiento estaba en la cabeza de dos personas y en diffs sin explicar. |
| **Conversación** | Es la propia serie de documentos de `docs/`, 20 ficheros, escritos entre el 4 y el 8 de septiembre de 2026. |
| **Análisis** | Explícito en [`docs/operaciones/README.md`](../operaciones/README.md): todo se deriva del código y del historial, **no de entrevistas ni de memoria**, y cada procedimiento apunta al fichero que lo implementa «de modo que se puede verificar y, cuando el código cambie, se puede detectar que el documento quedó obsoleto». |
| **Decisión** | Documentación derivada y verificable, con las cifras leídas de la fuente en el momento de escribir, no estimadas. |
| **Acción** | 9 documentos operativos (SOPs, CRM, base de conocimiento, historial), más PRD, modelo de datos, rotación de credenciales, observabilidad, testing, cola de generación, agentes, marketing. |
| **Error** | Toda la fase está **sin commitear**: 349 ficheros modificados sobre HEAD y 431 sin seguimiento a 9 de septiembre de 2026. No hay diffs, ni orden verificable dentro del día, ni mensaje que explique cada cambio. La reconstrucción depende de marcas de tiempo del sistema de ficheros. |
| **Corrección** | Pendiente. Es la acción de mayor rendimiento inmediato del proyecto: commitear la fase 7 por bloques temáticos con mensajes que digan qué y por qué. |
| **Resultado** | La documentación existe y es de buena calidad; su trazabilidad, no. |
| **Lección** | La que este documento intenta corregir: **un cambio sin registro de por qué se hizo vale una fracción de lo que costó**. Aplica igual a un commit mal etiquetado que a seis días de trabajo sin commitear. |

---

## Resumen: qué falta en las trazas de las fases 1-6

De las doce trazas, **una sola** (T-03) tiene los ocho eslabones documentados en
su momento. Las demás tienen huecos sistemáticos:

| Eslabón | Cobertura en fases 1-6 |
|---|---|
| Problema | Alta — está en el mensaje del commit |
| Conversación | Alta en fases 1-3 (el mensaje *es* la instrucción), nula en fases 4-6 |
| Análisis | **Casi nula** — documentado en su momento en **1 de 12** trazas (T-03); reconstruido a posteriori en 5; sigue sin documentar en **6** |
| Decisión | Inferible del diff, casi nunca declarada |
| Acción | Completa — es el diff |
| Error | Alta — 24 commits llevan el error en el mensaje (26 contando los dos de «la aplicación no arranca») |
| Corrección | Completa — es el diff siguiente |
| Resultado | Baja — casi nunca se dice si funcionó |

El eslabón perdido es el **análisis**: qué se consideró y qué se descartó.
Precisando, porque la diferencia importa:

| Estado del análisis | Trazas |
|---|---|
| Documentado **en su momento** | T-03 |
| Reconstruido **a posteriori** en la fase 7 | T-05, T-06, T-07, T-11, T-12 |
| **Sin documentar** | T-01, T-02, T-04, T-08, T-09, T-10 |

Los seis últimos son los que están en
[preguntas-abiertas.md](preguntas-abiertas.md), porque ya no se pueden derivar
del repositorio: solo los sabe quien tomó la decisión. Es el eslabón más caro de
reconstruir y el que más peso tiene cuando lo que se quiere demostrar es cómo se
razona, no qué se entregó (ver
[05](05-valor-y-licenciamiento-del-historial.md)).

Consulta equivalente sobre el dataset:

```bash
jq -r '.id + " " + .analisis.momento' datos/trazas.jsonl
```
