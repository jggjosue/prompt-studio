# Registro de fallos

Un solo sitio con todos los fallos conocidos del proyecto: los 26 que están en
el historial de git, los 16 documentados en la base de conocimiento, y qué los
protege hoy. Es la parte del historial con más valor por byte
([05](05-valor-y-licenciamiento-del-historial.md) §4) y hasta ahora estaba
repartida en tres lugares.

## Cómo leer una entrada

- **Síntoma**: lo que se vio. Cuando viene de un commit, es el texto literal del
  mensaje, **truncado a 72 caracteres por la herramienta** —así que se conserva
  el tipo de error, no su texto completo ([06](06-metricas-del-repositorio.md) §5).
- **Causa**: deducida del diff cuando no está escrita. Marcada como *(inferida)*
  en ese caso.
- **Corrección**: qué se cambió, con el volumen del diff.
- **Guardarraíl**: qué impide hoy que vuelva. «Ninguno» es una respuesta
  frecuente y honesta.

Fuentes: `git` (F-01 a F-26) y
[base-de-conocimiento.md](../operaciones/base-de-conocimiento.md) (F-27 a F-42,
sin commit porque pertenecen a la fase 7, no versionada).

---

## Familia A — Frontera servidor/cliente del App Router

Diez fallos, todos la misma clase: código que asume navegador ejecutándose en el
servidor. Es la familia más numerosa del proyecto y la que más tardó en
estabilizarse (tres meses).

| ID | Fecha | Commit | Síntoma | Causa | Corrección | Guardarraíl |
|---|---|---|---|---|---|---|
| F-01 | 2026-01-15 | `2842ca04` | `Console Error` | Hook de detección de móvil leyendo `window` en render *(inferida)* | `use-mobile.tsx`, +7/−6 | Ninguno |
| F-02 | 2026-01-15 | `e8c9e391` | `ReactDOM.useFormState has been re…` | API retirada en React 19 | `prompt-generator.tsx`, +2/−2 | `typecheck` en CI (hoy) |
| F-03 | 2026-01-15 | `d8389fb2` | `A tree hydrated but some attribut…` | Atributos divergentes en el layout raíz *(inferida)* | `layout.tsx`, +2/−2 | Ninguno |
| F-04 | 2026-01-15 | `64c4482a` | `A tree hydrated but some attribut…` | Cabecera interactiva dentro de componente de servidor | Extracción de `header-client.tsx`: +163/−161 | Ninguno |
| F-05 | 2026-01-22 | `e2fb27ed` | Error de Next reportado por la app | Mismo patrón en galería y rejilla *(inferida)* | `gallery/[id]/page.tsx`, `image-prompts/page.tsx`, `content-grid.tsx` | Ninguno |
| F-06 | 2026-02-02 | `780d6e06`, `fd268e25` | `Build Error: Ecmascript file had an error` | Páginas de servidor con lógica de cliente dentro | Partición en `*-client.tsx`: 470 líneas movidas en `image-prompts`, `video-prompts`, `prompt/edit` | Ninguno |
| F-07 | 2026-02-02 | `22068625` | `ReactDOM.useFormState has been re…` | **Reaparición de F-02** en otro fichero | `prompt/edit/page.tsx`, +3/−3 | `typecheck` en CI (hoy) |
| F-08 | 2026-02-03 | `7c634c4b` | `` `DialogContent` requires a `Dialo… `` | Requisito de accesibilidad de Radix sin cumplir | `header-client.tsx`, +26/−15 | `tests/e2e/mobile-and-keyboard.spec.ts` (parcial) |
| F-09 | 2026-02-06 | `7851b9ef` | `A tree hydrated but some attribut…` | Estado inicial distinto en servidor y cliente *(inferida)* | `image-prompts-client.tsx` y `video-prompts-client.tsx`, +51 cada uno | Ninguno |
| F-10 | 2026-02-06 | `1ab8c38c` | `A tree hydrated but some attribut…` | Igual que F-09 en cuatro ficheros más | 4 ficheros de galería y listado | Ninguno |

**Lo que dice esta familia.** El mismo error de hidratación aparece el 15 de
enero (F-03, F-04) y otra vez el 6 de febrero (F-09, F-10); `useFormState`
aparece en F-02 y reaparece en F-07 tres semanas después. Se corrigió por
síntoma, fichero a fichero, no por clase. La corrección estructural —extraer
componentes de cliente— llegó en F-04 y F-06, después de cuatro apariciones.

## Familia B — Tres rejillas que hacen lo mismo

| ID | Fecha | Commit | Síntoma | Causa | Corrección | Guardarraíl |
|---|---|---|---|---|---|---|
| F-11 | 2026-02-21 | `8802e6ca` | `Runtime Error` | Rejilla de imágenes con acceso a datos ya movidos *(inferida)* | `gallery-detail-client.tsx`, `image-prompts-client.tsx`, `content-grid.tsx`, `image-examples.tsx` | Ninguno |
| F-12 | 2026-02-21 | `33261260` | `Console Error` | **La misma corrección, aplicada al lado de vídeo** | `gallery-video-detail-client.tsx`, `video-prompts-client.tsx`, `video-examples.tsx`, `placeholder-videos.ts` | Ninguno |
| F-13 | 2026-02-21 | `b27e4d5b` | `corrige el error` | Igual, en la vista de etiquetas | `video-tags-client.tsx`, `placeholder-images.ts`, `placeholder-videos.{json,ts}` | Ninguno |

**Lo que dice.** Tres correcciones consecutivas el mismo día para el mismo
problema en tres componentes que renderizan rejillas. Se corresponde con el dato
de churn: `content-grid.tsx`, `image-examples.tsx` y `video-examples.tsx` suman
**145 commits** entre los tres ([06](06-metricas-del-repositorio.md) §3). El
coste no fue el fallo, fue no tener una abstracción única.

## Familia C — Datos de catálogo sin contrato

| ID | Fecha | Commit | Síntoma | Causa | Corrección | Guardarraíl |
|---|---|---|---|---|---|---|
| F-14 | 2026-02-13 | `b875530d` | «The app isn't starting» | JSON de vídeos malformado tras carga en lote *(inferida)* | `placeholder-videos.json`, +1 398/−852 | `tests/data/catalog-integrity.test.mjs` |
| F-15 | 2026-02-20 | `bf5273cb` | `corrige el error` | Entradas duplicadas o inválidas | `placeholder-videos.json`, +131/−1 051 | idem |
| F-16 | 2026-02-21 | `79b3146f` | `Console Error` | Igual, más desincronización del exportador `.ts` | `placeholder-videos.{json,ts}` | idem |
| F-17 | 2026-02-21 | `10c610f4` | `ReferenceError: dynamicVideoVideoTagsDat…` | Variable renombrada en un sitio y no en otro | `video-tags-client.tsx`, 1 línea | `typecheck` en CI (hoy) |
| F-18 | 2026-02-07 | `f054fadb` | `Build Error: Parsing ecmascript source code fail…` | Sintaxis rota en el mismo fichero de etiquetas | `video-tags-client.tsx`, 1 línea | `typecheck` en CI (hoy) |
| F-19 | (fase 7) | — | `Cannot read properties of null (reading 'normalize')` **en el despliegue, no en desarrollo** | 52 valores no-`string` en `tags` llegando a `slugify()` desde `generateStaticParams` | `cleanTags()` en `src/lib/seo/programmatic-seo.ts` | `tests/data/catalog-integrity.test.mjs` |

**Lo que dice.** Cinco fallos en nueve días, todos de la misma raíz: el catálogo
entró por conversación, en lotes, sin esquema de validación. F-19 es el más
caro de los cinco porque solo se manifiesta al generar rutas estáticas, es decir
en producción. Traza completa en
[T-07](02-trazas-de-decision.md#t-07--datos-del-catálogo-sin-validar-en-la-entrada).

## Familia D — Firebase

| ID | Fecha | Commit | Síntoma | Causa | Corrección | Guardarraíl |
|---|---|---|---|---|---|---|
| F-20 | 2026-02-07 | `d27d299d` | `{"message":"Error seeding database.","error":"7 PERMISSION_DENIED…` | Reglas de Firestore denegando la escritura de la semilla | `firestore.rules`, 1 línea | Ninguno |
| F-21 | 2026-02-07 | `1a7e8dba` | `Console Error` | Proveedor de Firebase inicializado en cliente sin guarda | `firebase/provider.tsx`, +11/−5 | Ninguno |
| F-22 | 2026-02-07 | `bb5bbd03` | `corrige el error` | Configuración leída de variables ausentes *(inferida)* | `firebase/config.ts`, +7/−6 | `verify:env-example` (hoy, parcial) |
| F-23 | 2026-02-20 | `b3c50cbe` | «The app isn't starting» | Falta de inicialización idempotente | `firebase/init.ts`, +41 | Ninguno |

**Lo que dice.** Cuatro fallos de infraestructura de datos en dos semanas, sobre
un stack que en junio se sustituyó por Mongoose (traza
[T-02](02-trazas-de-decision.md#t-02--datos-firestore--mongodb)). Firebase quedó
después reducido a 5 ficheros: el coste de aprendizaje se pagó sobre una pieza
que casi desapareció.

## Familia E — Módulos y resolución

| ID | Fecha | Commit | Síntoma | Causa | Corrección | Guardarraíl |
|---|---|---|---|---|---|---|
| F-24 | 2026-03-04 | `26a902f3` | `Runtime TypeError: {imported module [project]/sr…` | Lista de modelos definida dentro de un componente de cliente | Extracción a `src/lib/models-list.ts` (+40), −37 en `prompts-client.tsx` | Ninguno |
| F-25 | 2026-05-19 | `ab574f99` | `fixes` (sin descripción) | Desconocida — el mensaje no dice nada | 4+ ficheros: `api/subscription/status`, `layout.tsx`, `prices/*` | Ninguno |
| F-26 | 2026-02-02 | `cd2d4757` | «Bloqueo por robots.txt» (informe de Search Console) | `robots.txt` impidiendo el rastreo; `ads.txt` fuera de la raíz pública | +5 líneas en `robots.txt`, `ads.txt` → `public/` | `seo:validate-robots` y 12 validadores más |

**F-25 merece una nota.** Es el único fallo del proyecto del que **no se puede
saber qué se arregló**: mensaje de una palabra, cinco ficheros tocados en tres
áreas distintas. Está en el registro precisamente para que se vea el coste de un
mensaje vacío.

## Familia F — Entorno y verificación (fase 7, sin commit)

Los 16 incidentes de la base de conocimiento. No tienen commit porque la fase 7
no está versionada; el texto completo, con el detalle técnico, está en
[base-de-conocimiento.md](../operaciones/base-de-conocimiento.md).

| ID | Síntoma | Causa | Guardarraíl |
|---|---|---|---|
| F-27 | `dev` funciona y `build` falla con `Module not found: Can't resolve 'http'` | `instrumentation.ts` → mongoose → `agent-base` → `require('http')`, metido por webpack en el bundle *edge*; Turbopack lo resolvía | Alias a `false` en `webpack.resolve.alias` con ruta absoluta, solo en runtime edge |
| F-28 | `Failed to load SWC binary for darwin/arm64` | `node` x64 bajo Rosetta instalando binarios opcionales de la otra arquitectura | `scripts/check-node-version.mjs` en `preinstall` |
| F-29 | SWC de `next@15.5.9` fijado a `15.5.7` | No es error del lockfile: Next lo declara así. Si falla, la descarga se truncó (debe pesar ~129 MB) | Documentado |
| F-30 | `Cannot read properties of null (reading 'normalize')` en build | Igual que F-19 | `cleanTags()` + test de integridad |
| F-31 | `description` parece vacío en `public/catalog/` | Se vacía **a propósito** en el derivado; el prompt de pago vive en las fuentes | `catalog-source-exposure.test.ts` |
| F-32 | Recuento de componentes erróneo (170 donde hay 450) | Los ficheros de componentes localizan por sufijo y envuelven el array; `len()` sobre el primer valor cuenta caracteres de `title_es` | Documentado; leer con `Object.values(...).find(Array.isArray)` |
| F-33 | `.env.example` versionado con 54 valores reales, incluida una `sk_live_` | `.gitignore` lo exceptúa con `!.env.example` | `verify:env-example` en `test:ci` |
| F-34 | Un bloqueo contra `*.json` deja abierto `*.json.br` | `precompress-static.mjs` genera variantes `.br`/`.gz` | Regla que cubre las tres formas |
| F-35 | 9 ficheros con producto de pago sin proteger | La lista blanca enumeraba 8 nombres y envejeció | Bloqueo por directorio + test que recorre el directorio real |
| F-36 | Clerk responde 404 en vez de 307 | `auth.protect()` con `Accept: */*` — comportamiento documentado | `api-security-contracts.test.ts`; probar con `Accept: text/html` |
| F-37 | Ninguna página cacheable; 121 rutas dinámicas | `cookies()`/`headers()` leídos en el layout raíz | Detección en middleware; `locale-routing.test.ts` |
| F-38 | `/en/prices` re-prefijado a `/en/en/prices` → 404 opaco | Prefijo de idioma no consolidado | Redirección 308 a la canónica; `redirect-query-preservation.test.ts` |
| F-39 | `headers()` de `next.config.ts` aplicando **al revés** | Dos lookaheads negativos en el parámetro de ruta | Un solo lookahead; `security-headers.test.ts` |
| F-40 | El `Vary` del middleware desaparece | Next lo gestiona para RSC y lo sobrescribe | Documentado (no corregible desde el middleware) |
| F-41 | `curl` responde con el build anterior tras un `EADDRINUSE` | Un servidor viejo sigue ocupando el puerto | Procedimiento: `lsof -ti:PUERTO \| xargs kill -9` antes de verificar |
| F-42 | Un test en verde que no mira donde debe | Falta de validación negativa | Regla: comprobar que el test **falla** al introducir el fallo a propósito |

---

## Resumen por familia

| Familia | Fallos | Periodo | Coste visible | ¿Protegido hoy? |
|---|---|---|---|---|
| A · Frontera servidor/cliente | 10 | ene – feb 2026 | 4 reapariciones del mismo error | Parcial (`typecheck` en CI) |
| B · Rejillas duplicadas | 3 | 21-feb-2026 | 145 commits de churn en 3 componentes | **No** |
| C · Datos sin contrato | 6 | feb 2026 + fase 7 | 5 fallos en 9 días, uno solo visible en producción | Sí (test de integridad) |
| D · Firebase | 4 | feb 2026 | Sobre un stack casi retirado después | **No** |
| E · Módulos y resolución | 3 | feb – may 2026 | Uno irreconstruible (F-25) | No |
| F · Entorno y verificación | 16 | fase 7 | Horas de diagnóstico | Sí, en su mayoría |

**Cifra que resume el estado**: de los 26 fallos versionados, **17 no tienen hoy
ningún guardarraíl específico**. De los 16 de la fase 7, casi todos sí — porque
se documentaron *mientras* se resolvían y se convirtieron en test o en script.
Esa es toda la diferencia.

## Los cinco patrones que dejaron

Sacados de los 42 fallos, no de la teoría:

1. **Un cambio no está verificado hasta que `next build` pasa.** `dev` y `build`
   usan resolvedores distintos (F-27).
2. **Los tests que enumeran lo que hay que proteger caducan; los que recorren el
   directorio real, no** (F-35).
3. **Verificar que el test detecta, no solo que pasa** (F-42).
4. **Corregir por el texto del error resuelve la aparición, no la clase.** Se
   nota cuando el mismo mensaje sale dos veces (F-02/F-07, F-03/F-09).
5. **Los datos que entran por conversación entran sin contrato**, y se validan
   en el peor momento posible: el build de producción (F-14 a F-19).

---

## Cómo reproducir

```bash
# commits de fallo (24 por el patrón estrecho, 26 incluyendo «isn't starting»)
git log --pretty='%h|%ad|%s' --date=short | grep -Ei 'error|fix|corrig|soluciona'
git log --pretty='%h|%ad|%s' --date=short | grep -Ei "isn't starting"

# qué tocó cada corrección
git show --stat --pretty=format: <hash>

# incidentes documentados en la fase 7
grep '^### ' docs/operaciones/base-de-conocimiento.md
```
