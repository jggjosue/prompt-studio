# Cronología de creación

Siete fases, del 10 de diciembre de 2025 al 9 de septiembre de 2026. Las fechas
y los hashes son de `git log`; las cifras de la última fase, de `git status` y
del árbol de trabajo.

## Cifras generales

| Dato | Valor |
|---|---|
| Commits versionados | 364 |
| Primer commit | `f2839bc3` — 2025-12-10 |
| Último commit | `b533bf1b` — 2026-07-18 |
| Autores | `Josue Glez` (252), `Joshuesito` (113), `VS Code` (4), `Firebase Studio` (1) |
| Ficheros bajo seguimiento en HEAD | 1 185 |
| Ficheros `.ts` / `.tsx` | 345 |
| Rutas de página (`page.tsx`) | 84 |
| Rutas de API (`route.ts`) | 93 |
| Modelos de datos | 35 |
| Scripts de build y auditoría | 81 (75 `.mjs`) |
| Tests unitarios | 42 · e2e: 3 suites · integridad de datos: 1 |
| Commits que mencionan un error en el mensaje | 25 |

Ritmo mensual:

| Mes | Commits | Fase |
|---|---|---|
| 2025-12 | 1 | Inicialización |
| 2026-01 | 80 | Prototipo conversacional |
| 2026-02 | **170** | Construcción del catálogo |
| 2026-03 | 24 | Catálogos por modelo |
| 2026-04 | 2 | Pausa |
| 2026-05 | 21 | Cambio de plataforma |
| 2026-06 | 40 | Monetización |
| 2026-07 | 26 | Cierre comercial y cumplimiento |
| 2026-09 | 0 (sin commitear) | Industrialización |

Febrero concentra el 47 % del trabajo versionado y abril está vacío. Es un
perfil de ráfagas, no de ritmo sostenido: el proyecto se llevó en paralelo a
otra ocupación.

---

## Fase 0 — Inicialización (2025-12-10)

Un único commit: `f2839bc3`, «Initialized workspace with Firebase Studio»,
autoría de `Firebase Studio`. El proyecto nace dentro de un IDE asistido por IA,
sobre Next.js, y ese origen condiciona todo lo que viene después.

Un mes de silencio hasta el siguiente commit.

## Fase 1 — Prototipo conversacional (2026-01-14 → 2026-01-31, 80 commits)

`5bbcc69e` «Initial prototype» abre la fase. Lo característico es la **forma de
los mensajes de commit**: no describen el cambio, *son la instrucción que lo
provocó*, con el elemento de la interfaz señalado entre paréntesis.

```
5a43cafe  Cuando se le de clic redireccionalo a la pagina: /login (_for element <B…
354f2d07  Haz el filtro por imagenes, videos y all (_for element <Primitive.button…
0444ba90  Cambia el diseño de las imagenes y videos de la galeria a esta forma
1c8bb81e  Crea 6 videos mas de ejemplos (_for element <VideoExamples>_)
```

Esto convierte al historial de git en algo poco habitual: **el registro de la
conversación y el registro del cambio son el mismo objeto**. Cada commit lleva
la petición en lenguaje natural y el diff que la resolvió. Es exactamente la
secuencia «petición → acción → resultado», capturada sin haberla buscado.

Qué se levantó en esta fase: galería con filtros imagen/vídeo, pantalla de
detalle de prompt, menú con submenús (`Explore`, `My Library`), páginas
`/image-prompts` y `/video-prompts` con paginación, FAQ, pie de página, pantalla
de precios (`60b41ca9`).

Y los primeros fallos, también en el mensaje del commit:

```
2842ca04  soluciona este error: Console Error
e8c9e391  Try fixing this error: Console Error: ReactDOM.useFormState has been re…
d8389fb2  Try fixing this error: Console Error: A tree hydrated but some attribut…
```

El 15 de enero se toman dos decisiones de infraestructura: backend de Firebase
(`ed851c1e`) y autenticación con **Kinde** (`b18d7be6`, `e1ca922e`,
`4a2f3055`, `faf5c337`). La segunda se revertirá en mayo (traza
[T-01](02-trazas-de-decision.md#t-01--autenticación-kinde--clerk)).

En `4a2f3055` el mensaje de commit incluye un `KINDE_CLIENT_ID` literal. Primer
episodio de un patrón que reaparecerá en julio: credenciales dentro de material
versionado.

## Fase 2 — Construcción del catálogo (2026-02, 170 commits)

El mes de mayor densidad. Se pasa de prototipo a catálogo real.

- **Carga masiva de datos.** Series de commits idénticos en su enunciado
  (`agrega estos prompts a la lista…`, `Agrega estas url al placeholder-videos.json
  en este formato…`) que van llenando los JSON de imágenes y vídeos por lotes.
- **Semilla de base de datos** (`2e58a946` «add: seed») y su fallo inmediato:
  `d27d299d` lleva como mensaje el error completo,
  `{"message":"Error seeding database.","error":"7 PERMISSION_DENIED…"}`.
- **Corrección de indexabilidad** (`cd2d4757`, 2026-02-02): el mensaje describe
  un bloqueo por `robots.txt` detectado en Search Console. El diff añade cinco
  líneas a `public/robots.txt` y mueve `ads.txt` a `public/`.
- **Ciclo de errores de hidratación y de build**: `22068625`, `780d6e06`,
  `fd268e25`, `7c634c4b`, `1ab8c38c`, `7851b9ef`, `f054fadb`, todos con el texto
  del error en el mensaje.
- **Separación de vídeos e imágenes** en fuentes independientes, la única
  decisión de esta etapa que quedó documentada en su momento y por escrito, en
  [`MIGRATION_SUMMARY.md`](../MIGRATION_SUMMARY.md) (traza
  [T-03](02-trazas-de-decision.md#t-03--separación-de-vídeos-e-imágenes)).
- **Firebase Admin** entra en `package.json` el 7 de febrero (`9bd8a158`).

Los días 20 y 21 concentran una ráfaga de carga de vídeos seguida de cuatro
correcciones consecutivas (`bf5273cb`, `79b3146f`, `8802e6ca`, `33261260`,
`b27e4d5b`) y un `ReferenceError: dynamicVideoVideoTagsData…` (`10c610f4`). El
patrón —cargar datos en lote, romper el render, corregir— se repite lo bastante
como para ser la lección técnica de la fase: los datos del catálogo no estaban
validados en la entrada.

Dos veces la aplicación deja de arrancar: `b875530d` (13-feb) y `b3c50cbe`
(20-feb), ambos con el mensaje «The app isn't starting. Please investigate…».

## Fase 3 — Catálogos por modelo (2026-03, 24 commits)

El 4 de marzo, en un solo día, el producto cambia de eje: de «galería de
imágenes y vídeos» a **catálogo de prompts por modelo de IA**.

```
f5243738  crea una nueva pagina para prompts como la de /image prompts…
60288c79  agrega esta lista de modelos a la pagina de /prompts…
27b64f13  muestra los prompts de amp.yaml en /prompts/amp
2c0372e9  dividelos cuando se encuentre este simbolo # y un espacio…
6853397c  deben de ser 30 prompts validando el simbolo # o doble ##
bad8a381  agrega los prompts de amp.json a /prompts/amp
e8fc5d78  agrega los prompts de claide.json a /prompts/anthropic
103522a5  agrega claude-chrome.json a /prompts/anthropic
```

La subsecuencia `27b64f13 → 2c0372e9 → 6853397c` es un ciclo de refinamiento
completo en tres pasos: mostrar el contenido, partirlo por un delimitador,
corregir el delimitador porque hay dos variantes (`#` y `##`). Ese es el tipo de
traza que no aparece en el resultado final —el fichero JSON ya partido no dice
nada de esto— y que solo existe porque el historial lo conservó.

Cierra la fase un `Runtime TypeError` sobre un módulo importado (`26a902f3`) y
ajustes de tipografía y de disposición los días 4 y 6.

Después, **abril: dos commits** (`355a8da3`, `e4152ff4` «remover politicas»).
La pausa es real y no hace falta disimularla.

## Fase 4 — Cambio de plataforma (2026-05, 21 commits)

Mes de decisiones estructurales, condensadas en cuatro días.

| Fecha | Commit | Cambio |
|---|---|---|
| 2026-05-16 | `9a6f2cc8`…`e4a99785` | Carga de imágenes y de `webpages` en cinco lotes |
| 2026-05-17 | `e4a99785` | **Kinde sale, Clerk entra**; entra `next-intl` |
| 2026-05-18 | `c1606709` | Entra el SDK de **Stripe** |
| 2026-05-19 | `d2669ec8`, `ba3b0a65`, `989bbab8`, `ab574f99`, `0b85ff82`, `1794c7a4` | Precompresión `.gz`, mejoras, correcciones, claves de API |
| 2026-05-20 | `e1e2aa22` | Configuración de despliegue (`vercel.json`) |

Un solo commit (`e4a99785`) sustituye el proveedor de autenticación y añade
internacionalización. Es el commit de mayor riesgo del proyecto y su mensaje es
«web pages 5». Los tres commits que introducen las decisiones más costosas de
revertir —Clerk, `next-intl`, Stripe— tienen mensajes que no las mencionan.

## Fase 5 — Monetización (2026-06, 40 commits)

El orden en que se construyó el negocio se lee sin ambigüedad:

| Fecha | Hito |
|---|---|
| 2026-06-24 | Precios del programa de afiliados (`d647078b`), validación (`775ccd15`) |
| 2026-06-24 | Entra **Mongoose** en `package.json` (`3f9fadf4`) |
| 2026-06-25 → 28 | Carga de `web-pages.json` y `webpages` en cinco ficheros (`9b4ddb3f`…`ead82dd3`), minificación (`5ba16d69`) |
| 2026-06-29 | Programa de afiliados (`6bebc0b7`), comisiones (`74acb576`), URL de sitio (`b0b2194f`) |
| 2026-06-29 → 30 | Tres tandas de SEO (`9ded739b`, `30cb28f1`, `404e364b`) y logs (`b38f7360`) |
| 2026-07-01 | Precios (`b644c0fd`, `55e3069d`), validaciones de componentes (`245a04e7`) |

MongoDB llega **cinco meses después** de Firebase y en el mismo mes que los
afiliados: el detonante no fue la arquitectura, fue necesitar datos
transaccionales con relaciones (traza
[T-02](02-trazas-de-decision.md#t-02--datos-firestore--mongodb)).

## Fase 6 — Cierre comercial y cumplimiento (2026-07, 26 commits)

| Fecha | Hito |
|---|---|
| 2026-07-03 | **Stripe** operativo (`62a043d9`), minificación de `public/` (`5ff2cde4`), correos (`523c7a50`, `5847b577`), corrección de vídeos (`e7bf7578`) |
| 2026-07-03 | `2bf9a846` **«Remove production environment variables from example»** — 78 líneas fuera de `.env.example` |
| 2026-07-04 | Rediseño (`02b6ff69`), validaciones (`af28ca36`), botones (`82ed6faa`) |
| 2026-07-06 | Mejoras de precios (`4c80dd26`), correo (`9893ec07`) |
| 2026-07-07 → 10 | **AdSense** (`f2d63ad8`, `66ee4fa8`, `95fade52`, `ece36f8a`, `e9ceb08f`) |
| 2026-07-18 | **Planes de suscripción** (`a2c71a3f`) y **banner de cookies** (`b533bf1b`) |

Dos lecturas que el historial sostiene:

- El cumplimiento llegó **con** la monetización, no antes: el banner de cookies
  y los planes son del mismo día, y AdSense se activó ocho días antes del
  banner.
- La limpieza de secretos (`2bf9a846`) es del mismo día que la puesta en marcha
  de Stripe. Se revisó el material versionado justo al empezar a cobrar
  (traza [T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample)).

## Fase 7 — Industrialización (2026-09-04 → 2026-09-09, sin commitear)

Cincuenta días de silencio y luego una fase de seis días que **no está en el
historial de git**. Estado del árbol de trabajo a 9 de septiembre de 2026:

| Estado | Ficheros |
|---|---|
| Sin seguimiento (`??`) | 431 |
| Modificados (`M`) | 185 |
| Renombrados (`R`, `RM`, `RD`) | 86 |
| Borrados (`D`) | 72 |
| Diff acumulado sobre HEAD | 349 ficheros · +25 564 / −42 714 líneas |

Qué se hizo, por bloques:

- **Internacionalización real**: `src/app/[locale]/…`, `src/i18n/{config,request,detect-locale}.ts`,
  `messages/{en,es}.json`. `next-intl` aparece hoy en 84 ficheros.
- **Modelo de datos propio**: 35 modelos de Mongoose (`src/models/`), de
  `AICreditLedger` a `MarketplaceSale`. Mongoose está en 106 ficheros; Firebase
  quedó reducido a 5, y solo para analítica y la página de cookies.
- **Calidad como puerta**: 42 tests unitarios, 3 suites de Playwright, un test
  de integridad de catálogo, y un flujo de CI (`.github/workflows/quality.yml`)
  que ejecuta `test:ci` en cada pull request y los presupuestos de navegador en
  paralelo.
- **Seguridad como guardarraíl ejecutable**: `check-env-example.mjs`,
  `check-leaked-secrets.mjs`, `audit-cache-policies.mjs`,
  `audit-catalog-provenance.mjs`.
- **13 validadores de SEO** encadenados en `seo:validate-all`.
- **Documentación operativa**: 20 documentos en `docs/`, entre ellos los nueve
  de `docs/operaciones/` —SOPs, CRM, base de conocimiento, historial— escritos
  el 4 de septiembre entre las 15:11 y las 19:57, y `agentes.md`, `marketing.md`
  y `faq-precios-rescatada.md` el 8 de septiembre.

Esta fase es la que más valor documental generó y la que peor rastro dejó: al no
estar commiteada, no hay diffs intermedios, ni orden verificable dentro del día,
ni mensajes que expliquen cada cambio. La reconstrucción de arriba se apoya en
marcas de tiempo del sistema de ficheros, que son más frágiles que un commit.

**Consecuencia práctica**: si algún día este historial se presenta ante un
tercero, seis días de trabajo denso valen menos de lo que costaron por no
haberse versionado. Está anotado como riesgo en
[04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md).

---

## Cómo reproducir estos datos

```bash
git log --oneline | wc -l                                    # total de commits
git log --reverse --pretty='%h|%ad|%an|%s' --date=short      # cronología completa
git log --pretty=%ad --date=format:'%Y-%m' | sort | uniq -c  # ritmo mensual
git shortlog -sne                                            # autores
git log --pretty=%s | grep -Ei 'error|fix|corrig|soluciona'  # commits de fallo
git log -S'@clerk/nextjs' --pretty='%h|%ad|%s' --date=short -- package.json
git status --porcelain | awk '{print $1}' | sort | uniq -c    # estado del árbol
git diff --stat HEAD | tail -1                               # volumen no commiteado
```
